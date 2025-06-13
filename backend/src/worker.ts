import 'reflect-metadata';
import * as amqp from 'amqplib';
import { createConnection } from 'typeorm';
import { Repo } from './repos/repo.entity';
import * as dotenv from 'dotenv';
import * as csv from 'csv-parser';
import * as fs from 'fs';

dotenv.config();

const connectRabbitMQ = async (): Promise<amqp.Channel> => {
  while (true) {
    try {
      const rabbitMQUrl =
        process.env.RABBITMQ_URL || 'amqp://user:password@rabbitmq:5672';
      const connection = await amqp.connect(rabbitMQUrl);
      console.log('✅ Conectado ao RabbitMQ');

      connection.on('close', (err) => {
        console.error(
          '❌ Conexão com RabbitMQ fechada. Tentando reconectar...',
          err?.message,
        );
        setTimeout(() => connectRabbitMQ(), 5000);
      });

      connection.on('error', (err) => {
        console.error('⚠️ Erro na conexão com RabbitMQ:', err.message);
      });

      const channel = await connection.createChannel();
      return channel;
    } catch (error) {
      console.error(
        '⏳ Falha ao conectar ao RabbitMQ. Tentando novamente em 5 segundos...',
        error.message,
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

async function bootstrapWorker() {
  try {
    const dbConnection = await createConnection({
      type: 'mysql',
      host: process.env.DATABASE_HOST || 'db',
      port: parseInt(process.env.DATABASE_PORT || '3306'),
      username: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || 'root',
      database: process.env.DATABASE_NAME || 'github_db',
      entities: [Repo],
      synchronize: true,
    });

    const repoRepository = dbConnection.getRepository(Repo);
    console.log('✅ Conectado ao banco de dados');

    const channel = await connectRabbitMQ();
    const queueName = 'import-queue';
    await channel.assertQueue(queueName, { durable: true });
    console.log('⏳ Worker aguardando mensagens...');

    channel.consume(queueName, async (msg) => {
      if (!msg) return;

      try {
        const message = JSON.parse(msg.content.toString());

        const filePath = message.data.filePath;

        if (!filePath) {
          throw new Error(`Invalid filePath: ${filePath}`);
        }

        console.log(`📁 Processando arquivo: ${filePath}`);

        await new Promise<void>((resolve, reject) => {
          fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', async (data) => {
              try {
                const repo = repoRepository.create({
                  githubId: data.id ? parseInt(data.id) : undefined,
                  name: data.name,
                  owner: data.owner,
                  stars: parseInt(data.stars),
                });
                await repoRepository.save(repo);
              } catch (error) {
                console.error('Erro ao salvar repositório:', error);
              }
            })
            .on('end', () => {
              console.log(`✅ Arquivo processado: ${filePath}`);
              resolve();
            })
            .on('error', (error) => {
              console.error('❌ Erro ao ler arquivo CSV:', error);
              reject(error);
            });
        });

        channel.ack(msg);
      } catch (error) {
        console.error('⚠️ Erro no processamento da mensagem:', error);
        channel.nack(msg);
      }
    });
  } catch (error) {
    console.error('🚨 Falha crítica no worker:', error);
    setTimeout(bootstrapWorker, 5000);
  }
}

bootstrapWorker().catch((error) => {
  console.error('🔥 Falha na inicialização do worker:', error);
  process.exit(1);
});
