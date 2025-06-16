import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { NotifyService } from './notify.service';

@Injectable()
export class NotifyConsumer implements OnModuleInit {
  constructor(private readonly notifyService: NotifyService) {}

  async onModuleInit() {
    if (process.env.APP_TYPE === 'worker') {
      console.log('NotifyConsumer desativado no worker');
      return;
    }
    await this.setupNotificationConsumer();
  }

  private async setupNotificationConsumer() {
    const rabbitMQUrl = process.env.RABBITMQ_URL || 'amqp://user:password@rabbitmq:5672';
    const connection = await amqp.connect(rabbitMQUrl);
    const channel = await connection.createChannel();
    
    const queueName = 'notify-queue';
    await channel.assertQueue(queueName, { durable: true });

    console.log('👂 NotifyConsumer aguardando mensagens...');

    channel.consume(queueName, (msg) => {
      if (!msg) return;
      
      try {
        const message = JSON.parse(msg.content.toString());
        
        if (message.type === 'jobCompleted') {
          this.notifyService.notifyJobCompletion(message.jobId);
          console.log(`🔔 Notificado job concluído: ${message.jobId}`);
        }
        else if (message.type === 'jobFailed') {
          console.log(`⚠️ Job falhou: ${message.jobId}`);
        }
        
        channel.ack(msg);
      } catch (error) {
        console.error('Erro ao processar notificação:', error);
        channel.nack(msg);
      }
    });
  }
}
