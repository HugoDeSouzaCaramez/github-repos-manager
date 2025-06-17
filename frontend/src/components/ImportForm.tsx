import React from 'react';
import { useImportRepos } from '../hooks/useImportRepos';
import { Job } from '../types/repo';

interface ImportFormProps {
  onJobCompleted: () => void;
  importApi: (file: File) => Promise<{ jobId: number; filePath: string }>;
  jobStatusApi: (jobId: number) => Promise<Job>;
  createSocket: () => WebSocket;
}

const ImportForm: React.FC<ImportFormProps> = ({ 
  onJobCompleted,
  importApi,
  jobStatusApi,
  createSocket
}) => {
  const {
    file,
    jobId,
    jobStatus,
    loading,
    error,
    handleFileChange,
    handleImport,
  } = useImportRepos(onJobCompleted, importApi, jobStatusApi, createSocket);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files?.[0] || null);
  };

  return (
    <div className="import-form">
      <div className="import-controls">
        <div className="file-input-container">
          <label className="file-input-label">
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileInputChange} 
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
