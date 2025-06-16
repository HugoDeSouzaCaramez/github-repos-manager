import 'reflect-metadata';
import * as amqp from 'amqplib';
import { createConnection } from 'typeorm';
import { Repo } from './repos/repo.entity';
import * as dotenv from 'dotenv';
import { JobsService } from './jobs/jobs.service';
import { Job } from './jobs/job.entity';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ImportService } from './import/import.service';

dotenv.config();

process.env.APP_TYPE = 'worker';

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
    const app = await NestFactory.createApplicationContext(AppModule);
    const jobsService = app.get(JobsService);
    const importService = app.get(ImportService);

    await createConnection({
      type: 'mariadb',
      host: process.env.DATABASE_HOST || 'db',
      port: parseInt(process.env.DATABASE_PORT || '3306'),
      username: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || 'root',
      database: process.env.DATABASE_NAME || 'github_db',
      entities: [Repo, Job],
      synchronize: true,
    });
    console.log('✅ Conectado ao banco de dados');

    const channel = await connectRabbitMQ();
    const importQueue = 'import-queue';
    const notifyQueue = 'notify-queue';
    
    await channel.assertQueue(importQueue, { durable: true });
    await channel.assertQueue(notifyQueue, { durable: true });
    
    console.log('⏳ Worker aguardando mensagens...');

    channel.consume(importQueue, async (msg) => {
      if (!msg) return;

      let message;
      
      try {
        message = JSON.parse(msg.content.toString());
        const { filePath, jobId } = message.data;

        if (!filePath || !jobId) {
          throw new Error(`Invalid message: ${msg.content.toString()}`);
        }

        await jobsService.updateJobStatus(jobId, 'processing');
        console.log(`📁 Processando arquivo: ${filePath} (Job ID: ${jobId})`);

        await importService.processCSV(filePath);
        
        await jobsService.updateJobStatus(jobId, 'completed');
        console.log(`✅ Arquivo processado: ${filePath} (Job ID: ${jobId})`);
        
        channel.sendToQueue(
          notifyQueue,
          Buffer.from(JSON.stringify({ 
            type: 'jobCompleted',
            jobId
          })),
          { persistent: true }
        );
        
        channel.ack(msg);
      } catch (error) {
        console.error('⚠️ Erro no processamento da mensagem:', error);
        
        const jobId = message?.jobId;
        if (jobId) {
          await jobsService.updateJobStatus(jobId, 'failed');
          
          channel.sendToQueue(
            notifyQueue,
            Buffer.from(JSON.stringify({ 
              type: 'jobFailed',
              jobId
            })),
            { persistent: true }
          );
        }
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
