import { Controller, Get, Param } from '@nestjs/common';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get(':id')
  async getJob(@Param('id') id: string) {
    return this.jobsService.getJob(parseInt(id));
  }
}
