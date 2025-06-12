import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Repo } from '../repos/repo.entity';
import * as csv from 'csv-parser';
import * as fs from 'fs';

@Injectable()
export class ImportService {
  constructor(
    @InjectRepository(Repo)
    private repoRepository: Repository<Repo>,
  ) {}

  async processCSV(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', async (data) => {
          const repo = this.repoRepository.create({
            name: data.name,
            owner: data.owner,
            stars: parseInt(data.stars),
          });
          await this.repoRepository.save(repo);
        })
        .on('end', () => resolve())
        .on('error', (error) => reject(error));
    });
  }
}
