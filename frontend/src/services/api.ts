import axios, { AxiosResponse } from 'axios';

export interface Repo {
  id: number;
  name: string;
  owner: string;
  stars: number;
}

export interface Job {
  id: number;
  filePath: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
});

export const searchUserRepos = (username: string): Promise<AxiosResponse<Repo[]>> => {
  return api.get(`/github/repos?username=${username}`);
};

export const exportReposCSV = (username: string): Promise<AxiosResponse<Blob>> => {
  return api.get(`/github/export?username=${username}`, {
    responseType: 'blob',
  });
};

export const importReposCSV = (file: File): Promise<AxiosResponse<{ jobId: number; filePath: string }>> => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/import/csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getRepos = (
  owner?: string, 
  minStars?: number
): Promise<AxiosResponse<Repo[]>> => {
  return api.get('/repos', {
    params: { owner, minStars },
  });
};

export const getJobStatus = (jobId: number): Promise<AxiosResponse<Job>> => {
  return api.get(`/jobs/${jobId}`);
};

export default api;
