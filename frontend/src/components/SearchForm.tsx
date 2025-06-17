import React from 'react';
import { useSearchRepos } from '../hooks/useSearchRepos';
import RepoTable from './common/RepoTable';
import { Repo } from '../types/repo';

interface SearchFormProps {
  searchApi: (username: string) => Promise<Repo[]>;
  exportApi: (username: string) => Promise<Blob>;
}

const SearchForm: React.FC<SearchFormProps> = ({ searchApi, exportApi }) => {
  const {
    username,
    setUsername,
    repos,
    loading,
    exporting,
    error,
    handleSearch,
    handleExport,
  } = useSearchRepos(searchApi, exportApi);

  return (
    <div className="search-form">
      <div className="search-bar">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Usuário GitHub"
          disabled={loading}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
          <button onClick={handleSearch} disabled={loading || !username}>
            {loading ? (<>Procurando...</>) : 'Procurar'}
          </button>
          <button 
            onClick={handleExport} 
            disabled={repos.length === 0 || loading || exporting}
          >
            {exporting ? 'Exportando...' : 'Exportar'}
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
