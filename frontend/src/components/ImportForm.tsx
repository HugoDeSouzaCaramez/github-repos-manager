import React, { useState, useEffect } from 'react';
import { importReposCSV, getJobStatus, Job } from '../services/api';
import io from 'socket.io-client';

type SocketType = ReturnType<typeof io>;

const ImportForm: React.FC = () => {
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
      
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:3000');
      
      newSocket.on('connect', () => {
        console.log('Connected to WebSocket');
      });
      
      newSocket.on('jobCompleted', (data: { jobId: number }) => {
        if (data.jobId === jobId) {
          setJobStatus('completed');
          newSocket.disconnect();
        }
      });
      
      newSocket.on('error', (err: any) => {
        console.error('WebSocket error:', err);
      });
      
      setSocket(newSocket);
      
      const pollJobStatus = async () => {
        try {
          const response = await getJobStatus(jobId);
          const { status } = response.data;
          setJobStatus(status);
          
          if (status === 'pending' || status === 'processing') {
            setTimeout(pollJobStatus, 3000);
          }
        } catch (err) {
          console.error('Error polling job status:', err);
        }
      };
      
      pollJobStatus();
      
    } catch (err) {
      setError('Import failed');
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
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange} 
        />
        <button 
          onClick={handleImport} 
          disabled={!file || loading}
        >
          {loading ? 'Importing...' : 'Import CSV'}
        </button>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      {jobId && (
        <div className="job-status">
          <h3>Import Status</h3>
          <p>Job ID: {jobId}</p>
          <p>Status: 
            <span className={`status-${jobStatus}`}>
              {jobStatus?.toUpperCase()}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default ImportForm;
