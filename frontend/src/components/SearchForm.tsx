import React, { useState } from 'react';
import { searchUserRepos, exportReposCSV, Repo } from '../services/api';

const SearchForm: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSearch = async () => {
    if (!username) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await searchUserRepos(username);
      setRepos(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'User not found or API error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!username || repos.length === 0) return;
    
    try {
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
      setError('Export failed');
      console.error(err);
    }
  };

  return (
    <div className="search-form">
      <div className="search-bar">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Digite o usuário GitHub"
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Procurando...' : 'Procurar'}
        </button>
        <button 
          onClick={handleExport} 
          disabled={repos.length === 0 || loading}
        >
          Exportar CSV
        </button>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      <div className="results">
        {repos.length > 0 ? (
          <ul>
            {repos.map((repo, index) => (
              <li key={index}>
                <strong>{repo.name}</strong> - {repo.owner} (⭐ {repo.stars})
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhum repositório encontrado</p>
        )}
      </div>
    </div>
  );
};

export default SearchForm;
