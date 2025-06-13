import { Module } from '@nestjs/common';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { Repo } from '../repos/repo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Repo]),
    RabbitMQModule,
  ],
  controllers: [ImportController],
  providers: [ImportService],
})
export class ImportModule {}
