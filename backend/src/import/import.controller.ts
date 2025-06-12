import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { ImportService } from './import.service';
import * as fs from 'fs';

@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('csv')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCSV(@UploadedFile() file: Express.Multer.File) {
    const filePath = `/tmp/${file.originalname}`;
    fs.writeFileSync(filePath, file.buffer);

    return { jobId: Date.now(), filePath };
  }

  @RabbitRPC({
    exchange: 'imports',
    routingKey: 'import-job',
    queue: 'import-queue',
  })
  async processImportJob(job: { filePath: string }) {
    await this.importService.processCSV(job.filePath);
    return { success: true };
  }
}
