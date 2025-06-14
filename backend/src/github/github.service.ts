import { Injectable } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

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
      const response = await axios.get<GitHubRepo[]>(
        `https://api.github.com/users/${username}/repos`,
        {
          headers: {
            'User-Agent': 'GitHub-Repo-Exporter/1.0.0',
            ...(process.env.GITHUB_TOKEN && {
              Authorization: `token ${process.env.GITHUB_TOKEN}`,
            }),
          },
        },
      );
      
      return response.data.map((repo: GitHubRepo) => ({
        name: repo.name,
        owner: repo.owner.login,
        stars: repo.stargazers_count,
      }));
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        throw new Error('User not found');
      }
      throw new Error('Failed to fetch repositories from GitHub');
    }
  }
}
