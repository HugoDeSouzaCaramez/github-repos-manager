import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GitHubService } from './github/github.service';
import { ImportService } from './import/import.service';
import { Repo } from './repos/repo.entity';
import { RabbitMQConfigModule } from './rabbitmq/rabbitmq.module';
import { GitHubController } from './github/github.controller';
import { ImportController } from './import/import.controller';
import { ReposController } from './repos/repos.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: process.env.DB_HOST || 'mariadb',
      port: 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'github_repos',
      entities: [Repo],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Repo]),
    RabbitMQConfigModule,
  ],
  controllers: [
    AppController,
    GitHubController,
    ImportController,
    ReposController
  ],
  providers: [
    AppService,
    GitHubService,
    ImportService,
  ],
})

export class AppModule {}
