import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [
    RabbitMQModule.forRoot({
      exchanges: [{ name: 'imports', type: 'direct' }],
      uri: process.env.RABBITMQ_URL || 'amqp://user:password@rabbitmq:5672',
      connectionInitOptions: { wait: true, timeout: 30000 },
      connectionManagerOptions: {
        heartbeatIntervalInSeconds: 5,
        reconnectTimeInSeconds: 5,
      },
    }),
  ],
  exports: [RabbitMQModule],
})

export class RabbitMQConfigModule {}
