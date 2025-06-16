import { useState, useEffect } from 'react';
import { importReposCSV, getJobStatus, Job } from '../services/api';
import io from 'socket.io-client';

type SocketType = ReturnType<typeof io>;

export const useImportRepos = (onJobCompleted: () => void) => {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<number | null>(null);
  const [jobStatus, setJobStatus] = useState<Job['status'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState<SocketType | null>(null);

  const handleFileChange = (file: File | null) => {
    setFile(file);
  };

  const handleImport = async () => {
    if (!file) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await importReposCSV(file);
      const { jobId } = response.data;
      setJobId(jobId);
      setJobStatus('pending');
      
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:3000', {
        path: '/socket.io',
        transports: ['websocket'],
      });
      
      newSocket.on('jobCompleted', (data: { jobId: number }) => {
        if (data.jobId === jobId) {
          setJobStatus('completed');
          onJobCompleted();
          newSocket.disconnect();
        }
      });
      
      setSocket(newSocket);
      
      const pollJobStatus = async () => {
        try {
          const response = await getJobStatus(jobId);
          const { status } = response.data;
          setJobStatus(status);
          
          if (status === 'pending' || status === 'processing') {
            setTimeout(pollJobStatus, 3000);
          } else if (status === 'completed') {
            onJobCompleted();
          }
        } catch (err) {
          console.error('Erro ao verificar status:', err);
        }
      };
      
      pollJobStatus();
      
    } catch (err) {
      setError('Falha na importação');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      socket?.disconnect();
    };
  }, [socket]);

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
