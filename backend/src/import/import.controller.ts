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

@Controller('import')
export class ImportController {
  constructor(
    private readonly importService: ImportService,
    @Inject('RABBITMQ_SERVICE') private readonly rabbitMQClient: ClientProxy,
  ) {}

  @Post('csv')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCSV(@UploadedFile() file: Express.Multer.File) {
    const filePath = `/tmp/${file.originalname}`;
    fs.writeFileSync(filePath, file.buffer);

    this.rabbitMQClient.emit('import-job', { filePath });
    
    return { jobId: Date.now(), filePath };
  }
}
