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
      setError(err.response?.data?.message || 'Usuário não encontrado ou erro na API');
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
      setError('Falha na exportação');
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
          disabled={loading}
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
                <strong>{repo.name}</strong> - {repo.owner}
                <span className="stars">⭐ {repo.stars}</span>
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
