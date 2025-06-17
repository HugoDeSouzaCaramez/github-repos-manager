import { useState, useCallback } from 'react';
import { Repo } from '../types/repo';

type SearchApi = (username: string) => Promise<Repo[]>;
type ExportApi = (username: string) => Promise<Blob>;

export const useSearchRepos = (
  searchApi: SearchApi,
  exportApi: ExportApi
) => {
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
    setExporting(false);
    
    try {
      const data = await searchApi(username);
      setRepos(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Usuário não encontrado ou erro na API');
    } finally {
      setLoading(false);
    }
  }, [username, searchApi]);

  const handleExport = useCallback(async () => {
    if (!username || repos.length === 0) return;
    
    try {
      setExporting(true);
      const blob = await exportApi(username);
      
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
    } finally {
      setExporting(false);
    }
  }, [username, repos, exportApi]);

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
