import { useState, useCallback } from 'react';
import { searchUserRepos, exportReposCSV, Repo } from '../services/api';

export const useSearchRepos = () => {
  const [username, setUsername] = useState<string>('');
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSearch = useCallback(async () => {
    if (!username) return;
    
    setLoading(true);
    setError('');
    setRepos([]);
    
    try {
      const response = await searchUserRepos(username);
      setRepos(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Usuário não encontrado ou erro na API');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [username]);

  const handleExport = useCallback(async () => {
    if (!username || repos.length === 0) return;
    
    try {
      setExporting(true);
      const response = await exportReposCSV(username);
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${username}_repos.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Falha na exportação');
      console.error(err);
    } finally {
      setExporting(false);
    }
  }, [username, repos]);

  return {
    username,
    setUsername,
    repos,
    loading,
    exporting,
    error,
    handleSearch,
    handleExport,
  };
};
