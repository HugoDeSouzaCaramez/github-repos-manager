import { useState } from 'react';
import { Job } from '../types/repo';

type ImportApi = (file: File) => Promise<{ jobId: number; filePath: string }>;
type JobStatusApi = (jobId: number) => Promise<Job>;
type SocketFactory = () => WebSocket;

export const useImportRepos = (
  onJobCompleted: () => void,
  importApi: ImportApi,
  jobStatusApi: JobStatusApi,
  createSocket: SocketFactory
) => {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<number | null>(null);
  const [jobStatus, setJobStatus] = useState<Job['status'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (file: File | null) => {
    setFile(file);
  };

  const handleImport = async () => {
    if (!file) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await importApi(file);
      const { jobId } = response;
      setJobId(jobId);
      setJobStatus('pending');
      
      const socket = createSocket();
      
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.jobId === jobId) {
          setJobStatus(data.status);
          if (data.status === 'completed') {
            onJobCompleted();
            socket.close();
          }
        }
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        pollJobStatus(jobId);
      };
      
    } catch (err) {
      setError('Falha na importação');
      setLoading(false);
    }
  };

  const pollJobStatus = async (jobId: number) => {
    try {
      const response = await jobStatusApi(jobId);
      const { status } = response;
      setJobStatus(status);
      
      if (status === 'pending' || status === 'processing') {
        setTimeout(() => pollJobStatus(jobId), 3000);
      } else if (status === 'completed') {
        onJobCompleted();
        setLoading(false);
      }
    } catch (err) {
      console.error('Erro ao verificar status:', err);
      setTimeout(() => pollJobStatus(jobId), 3000);
    }
  };

  return {
    file,
    jobId,
    jobStatus,
    loading,
    error,
    handleFileChange,
    handleImport,
  };
};
