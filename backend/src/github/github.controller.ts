import { Controller, Get, Query, Res } from '@nestjs/common';
import { GitHubService } from './github.service';
import { Response } from 'express';
import { stringify } from 'csv-stringify';

@Controller('github')
export class GitHubController {
  constructor(private readonly gitHubService: GitHubService) {}

  @Get('repos')
  async getRepos(@Query('username') username: string, @Res() res: Response) {
    try {
      const repos = await this.gitHubService.getUserRepos(username);
      return res.json(repos);
    } catch (error) {
      this.handleErrorResponse(error, res);
    }
  }

  @Get('export')
  async exportCSV(@Query('username') username: string, @Res() res: Response) {
    try {
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
    } catch (error) {
      this.handleErrorResponse(error, res);
    }
  }

  private handleErrorResponse(error: Error, res: Response) {
    switch (error.message) {
      case 'User not found':
        return res.status(404).send(error.message);
      case 'GitHub API rate limit exceeded':
        return res.status(429).send(error.message);
      case 'Unauthorized: Invalid GitHub token':
        return res.status(401).send(error.message);
      case 'Forbidden: Check your token permissions':
        return res.status(403).send(error.message);
      default:
        return res
          .status(500)
          .send(
            error.message.includes('Failed to fetch')
              ? error.message
              : 'Internal Server Error',
          );
    }
  }
}
