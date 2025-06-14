import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './job.entity';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
  ) {}

  async createJob(filePath: string): Promise<Job> {
    const job = this.jobRepository.create({ filePath });
    return this.jobRepository.save(job);
  }

  async updateJobStatus(id: number, status: Job['status']): Promise<Job> {
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) {
      throw new Error('Job not found');
    }
    job.status = status;
    return this.jobRepository.save(job);
  }

  async getJob(id: number): Promise<Job | null> {
    return this.jobRepository.findOne({ where: { id } });
  }
}
