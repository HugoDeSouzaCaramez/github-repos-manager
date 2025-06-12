import { Injectable } from '@nestjs/common';
import axios from 'axios';

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
    const response = await axios.get<GitHubRepo[]>(
      `https://api.github.com/users/${username}/repos`,
    );
    
    return response.data.map((repo: GitHubRepo) => ({
      name: repo.name,
      owner: repo.owner.login,
      stars: repo.stargazers_count,
    }));
  }
}
