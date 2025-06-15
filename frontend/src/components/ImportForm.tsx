import React, { useState, useEffect } from 'react';
import { importReposCSV, getJobStatus, Job } from '../services/api';
import io from 'socket.io-client';

type SocketType = ReturnType<typeof io>;

type Props = {
  onJobCompleted: () => void;
};

const ImportForm: React.FC<Props> = ({ onJobCompleted }) => {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<number | null>(null);
  const [jobStatus, setJobStatus] = useState<Job['status'] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [socket, setSocket] = useState<SocketType | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
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
      
      newSocket.on('connect', () => {
        console.log('Conectado ao WebSocket');
      });
      
      newSocket.on('jobCompleted', (data: { jobId: number }) => {
        if (data.jobId === jobId) {
          setJobStatus('completed');
          onJobCompleted();
          newSocket.disconnect();
        }
      });
      
      newSocket.on('error', (err: any) => {
        console.error('Erro no WebSocket:', err);
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return (
    <div className="import-form">
      <div className="import-controls">
        <div className="file-input-container">
          <label className="file-input-label">
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange} 
            />
            <span>{file ? file.name : 'Nenhum arquivo escolhido'}</span>
          </label>
        </div>
        <button 
          onClick={handleImport} 
          disabled={!file || loading}
        >
          {loading ? 'Importando...' : 'Importar CSV'}
        </button>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      {jobId && (
        <div className="job-status">
          <h3>Status da Importação</h3>
          <p>ID do Job: {jobId}</p>
          <p>Status: 
            <span className={`status-${jobStatus}`}>
              {` ${jobStatus?.toUpperCase()}`}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default ImportForm;
