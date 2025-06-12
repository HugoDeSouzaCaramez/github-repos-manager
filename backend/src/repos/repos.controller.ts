import { Controller, Get, Query } from '@nestjs/common';
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
  async getRepos(
    @Query('owner') owner?: string,
    @Query('minStars') minStars?: number,
  ): Promise<Repo[]> {
    const query = this.repoRepository.createQueryBuilder('repo');

    if (owner) {
      query.andWhere('repo.owner = :owner', { owner });
    }

    if (minStars) {
      query.andWhere('repo.stars >= :minStars', { minStars });
    }

    return query.getMany();
  }
}
