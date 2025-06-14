import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportService } from './import.service';
import * as fs from 'fs';
import { ClientProxy } from '@nestjs/microservices';
import { JobsService } from '../jobs/jobs.service';

@Controller('import')
export class ImportController {
  constructor(
    private readonly importService: ImportService,
    @Inject('RABBITMQ_SERVICE') private readonly rabbitMQClient: ClientProxy,
    private readonly jobsService: JobsService,
  ) {}

  @Post('csv')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCSV(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    
    if (!file.originalname.endsWith('.csv')) {
      throw new Error('Invalid file format. Only CSV files are allowed');
    }

    const filePath = `/tmp/${file.originalname}`;
    fs.writeFileSync(filePath, file.buffer);

    const job = await this.jobsService.createJob(filePath);

    this.rabbitMQClient.emit('import-queue', { 
      filePath, 
      jobId: job.id 
    });

    return { jobId: job.id };
  }
}
