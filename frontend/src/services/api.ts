import axios, { AxiosResponse } from 'axios';
import { Repo, Job } from '../types/repo';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
});

export const searchUserRepos = (username: string): Promise<Repo[]> => {
  return api.get(`/github/repos?username=${username}`)
    .then((response: AxiosResponse<Repo[]>) => response.data);
};

export const exportReposCSV = (username: string): Promise<Blob> => {
  return api.get(`/github/export?username=${username}`, {
    responseType: 'blob',
  }).then(response => response.data);
};

export const importReposCSV = (file: File): Promise<{ jobId: number; filePath: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/import/csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(response => response.data);
};

export const getRepos = (): Promise<Repo[]> => {
  return api.get('/repos').then(response => response.data);
};

export const getJobStatus = (jobId: number): Promise<Job> => {
  return api.get(`/jobs/${jobId}`).then(response => response.data);
};

export const createJobSocket = () => {
  const url = process.env.REACT_APP_WS_URL || 'ws://localhost:3000';
  return new WebSocket(url);
};

export default api;
