import { Injectable } from '@nestjs/common';
import axios, { AxiosError, AxiosResponse } from 'axios';

interface GitHubRepo {
  name: string;
  owner: {
    login: string;
  };
  stargazers_count: number;
}

@Injectable()
export class GitHubService {
  async getUserRepos(username: string): Promise<any[]> {
    try {
      let repos: GitHubRepo[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response: AxiosResponse<GitHubRepo[]> = await axios.get(
          `https://api.github.com/users/${username}/repos`,
          {
            headers: {
              'User-Agent': 'GitHub-Repo-Exporter/1.0.0',
              ...(process.env.GITHUB_TOKEN && {
                Authorization: `token ${process.env.GITHUB_TOKEN}`,
              }),
            },
            params: {
              page,
              per_page: 100,
            },
            timeout: 10000,
            validateStatus: (status) => status < 500,
          },
        );

        repos = [...repos, ...response.data];

        const linkHeader = response.headers.link;
        hasMore = linkHeader?.includes('rel="next"');
        page++;
      }

      return repos.map((repo: GitHubRepo) => ({
        name: repo.name,
        owner: repo.owner.login,
        stars: repo.stargazers_count,
      }));
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        const status = axiosError.response.status;
        const headers = axiosError.response.headers;

        if (status === 404) {
          throw new Error('User not found');
        } else if (status === 403) {
          const rateLimitRemaining = headers['x-ratelimit-remaining'];
          const isRateLimit =
            rateLimitRemaining !== undefined &&
            parseInt(rateLimitRemaining) === 0;
          throw new Error(
            isRateLimit
              ? 'GitHub API rate limit exceeded'
              : 'Forbidden: Check your token permissions',
          );
        } else if (status === 401) {
          throw new Error('Unauthorized: Invalid GitHub token');
        }
      }

      throw new Error(`Failed to fetch repositories: ${axiosError.message}`);
    }
  }
}
