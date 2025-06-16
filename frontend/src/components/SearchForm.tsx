import React from 'react';
import { useSearchRepos } from '../hooks/useSearchRepos';
import RepoTable from './RepoTable';

const SearchForm: React.FC = () => {
  const {
    username,
    setUsername,
    repos,
    loading,
    exporting,
    error,
    handleSearch,
    handleExport,
  } = useSearchRepos();

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
        <RepoTable 
          allRepos={repos} 
          loading={loading} 
          showFilters={{
            owner: false,
            name: true,
            stars: true
          }}
        />
      </div>
    </div>
  );
};

export default SearchForm;
