import React, { useState, useMemo } from 'react';
import { searchUserRepos, exportReposCSV, Repo } from '../services/api';

interface SortConfig {
  field: keyof Repo;
  direction: 'asc' | 'desc';
}

const SearchForm: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'name',
    direction: 'asc'
  });

  const handleSearch = async () => {
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
  };

  const handleExport = async () => {
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
  };

  const handleSort = (field: keyof Repo) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedRepos = useMemo(() => {
    return [...repos].sort((a, b) => {
      if (sortConfig.field === 'stars') {
        return sortConfig.direction === 'asc' 
          ? a.stars - b.stars 
          : b.stars - a.stars;
      }
      
      const aValue = a[sortConfig.field].toString().toLowerCase();
      const bValue = b[sortConfig.field].toString().toLowerCase();
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [repos, sortConfig]);

  const renderSortIcon = (field: keyof Repo) => {
    if (sortConfig.field === field) {
      return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    }
    return null;
  };

  return (
    <div className="search-form">
      <div className="search-bar">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Digite o usuário GitHub"
          disabled={loading}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} disabled={loading || !username}>
          {loading ? (
            <>
              <span className="spinner"></span>
              Procurando...
            </>
          ) : 'Procurar'}
        </button>
        <button 
          onClick={handleExport} 
          disabled={repos.length === 0 || loading || exporting}
        >
          {exporting ? 'Exportando...' : 'Exportar CSV'}
        </button>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      <div className="results">
        {repos.length > 0 ? (
          <div className="repo-table">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th 
                      onClick={() => handleSort('owner')}
                      className={`sortable ${sortConfig.field === 'owner' ? 'sorted' : ''}`}
                    >
                      Dono(a) {renderSortIcon('owner')}
                    </th>
                    <th 
                      onClick={() => handleSort('name')}
                      className={`sortable ${sortConfig.field === 'name' ? 'sorted' : ''}`}
                    >
                      Repositório {renderSortIcon('name')}
                    </th>
                    <th 
                      onClick={() => handleSort('stars')}
                      className={`sortable ${sortConfig.field === 'stars' ? 'sorted' : ''}`}
                    >
                      Estrelas {renderSortIcon('stars')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRepos.map((repo, index) => (
                    <tr key={index}>
                      <td className="breakable">{repo.owner}</td>
                      <td className="breakable">{repo.name}</td>
                      <td className="text-right">⭐ {repo.stars.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          !loading && <p>Nenhum repositório encontrado</p>
        )}
        
        {loading && (
          <div className="loading-indicator">
            Carregando repositórios...
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchForm;
