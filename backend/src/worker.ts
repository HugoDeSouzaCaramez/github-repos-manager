import 'reflect-metadata';
import * as amqp from 'amqplib';
import { createConnection, getRepository } from 'typeorm';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { Repo } from './repos/repo.entity';

dotenv.config();

interface RepositoryData {
  id: number;
  name: string;
  owner: {
    login: string;
  };
  stargazers_count: number;
}

interface QueueMessage {
  userId: string;
  repositories: RepositoryData[];
}

async function bootstrapWorker() {
  const dbConnection = await createConnection({
    type: 'mysql',
    host: process.env.DATABASE_HOST || 'db',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    username: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || 'root',
    database: process.env.DATABASE_NAME || 'github_db',
    entities: [Repo],
    synchronize: true,
    logging: true,
  });

  const repositoryRepo = getRepository(Repo);

  const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq');
  const channel = await connection.createChannel();
  
  const queueName = process.env.QUEUE_NAME || 'import_queue';
  await channel.assertQueue(queueName, { durable: true });

  channel.consume(queueName, async (msg) => {
    if (msg) {
      try {
        const message: QueueMessage = JSON.parse(msg.content.toString());
        
        for (const repo of message.repositories) {
          const repoEntity = repositoryRepo.create({
            githubId: repo.id,
            name: repo.name,
            owner: repo.owner.login,
            stars: repo.stargazers_count,
          });
          await repositoryRepo.save(repoEntity);
        }

        await axios.post(
          `http://app:3000/api/notify/${message.userId}`,
          {
            status: 'completed',
            count: message.repositories.length
          }
        );

        channel.ack(msg);
      } catch (error) {
        console.error('Erro ao processar job:', error);
        channel.nack(msg);
      }
    }
  });
}

bootstrapWorker().catch(error => {
  console.error('Falha ao iniciar worker:', error);
  process.exit(1);
});
