import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GitHubService } from './github/github.service';
import { ImportService } from './import/import.service';
import { Repo } from './repos/repo.entity';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { GitHubController } from './github/github.controller';
import { ImportController } from './import/import.controller';
import { ReposController } from './repos/repos.controller';
import { JobsService } from './jobs/jobs.service';
import { Job } from './jobs/job.entity';
import { JobsController } from './jobs/jobs.controller';
import { NotifyGateway } from './notify/notify.gateway';
import { NotifyService } from './notify/notify.service';
import { NotifyConsumer } from './notify/notify.consumer';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: process.env.DB_HOST || 'db',
      port: 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'github_db',
      entities: [Repo, Job],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Repo, Job]),
    RabbitMQModule,
  ],
  controllers: [
    GitHubController,
    ImportController,
    ReposController,
    JobsController,
  ],
  providers: [
    GitHubService,
    ImportService,
    JobsService,
    NotifyGateway,
    NotifyService,
    NotifyConsumer,
  ],
})
export class AppModule {}
