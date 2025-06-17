import React, { useState, useEffect } from 'react';
import ImportForm from '../components/ImportForm';
import RepoTable from '../components/common/RepoTable';
import { getRepos, importReposCSV, getJobStatus, createJobSocket } from '../services/api';
import { Repo } from '../types/repo';

const ImportPage: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [allRepos, setAllRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        setLoading(true);
        const data = await getRepos();
        setAllRepos(data);
      } catch (error) {
        console.error('Erro ao buscar repositórios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, [refreshTrigger]);

  const handleJobCompleted = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="page">
      <h1>Importar repositórios do GitHub</h1>
      <p>Importar repositórios de um arquivo CSV e visualizá-los no banco de dados</p>
      <ImportForm 
        onJobCompleted={handleJobCompleted}
        importApi={importReposCSV}
        jobStatusApi={getJobStatus}
        createSocket={createJobSocket}
      />
      <RepoTable 
        allRepos={allRepos} 
        loading={loading} 
      />
    </div>
  );
};

export default ImportPage;
