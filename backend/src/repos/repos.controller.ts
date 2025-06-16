import { Controller, Get } from '@nestjs/common';
import { Repo } from './repo.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('repos')
export class ReposController {
  constructor(
    @InjectRepository(Repo)
    private repoRepository: Repository<Repo>,
  ) {}

  @Get()
  async getRepos(): Promise<Repo[]> {
    return this.repoRepository.find();
  }
}
