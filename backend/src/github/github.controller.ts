import { Controller, Get, Query, Res } from '@nestjs/common';
import { GitHubService } from './github.service';
import { Response } from 'express';
import { stringify } from 'csv-stringify';

@Controller('github')
export class GitHubController {
  constructor(private readonly gitHubService: GitHubService) {}

  @Get('repos')
  async getRepos(@Query('username') username: string) {
    return this.gitHubService.getUserRepos(username);
  }

  @Get('export')
  async exportCSV(@Query('username') username: string, @Res() res: Response) {
    const repos = await this.gitHubService.getUserRepos(username);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${username}_repos.csv`,
    );

    stringify(
      repos,
      {
        header: true,
        columns: ['name', 'owner', 'stars']
      },
      (err, output) => {
        if (err) {
          res.status(500).send('Erro ao gerar CSV');
          return;
        }

        res.send(output);
      },
    );
  }
}
