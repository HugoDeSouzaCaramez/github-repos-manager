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
  
  const [currentPage, setCurrentPage] = useState(1);
  const [reposPerPage, setReposPerPage] = useState(10);

  const handleSearch = async () => {
    if (!username) return;
    
    setLoading(true);
    setError('');
    setRepos([]);
    setCurrentPage(1);
    
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
    setCurrentPage(1);
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

  const totalPages = Math.ceil(sortedRepos.length / reposPerPage);
  const indexOfLastRepo = currentPage * reposPerPage;
  const indexOfFirstRepo = indexOfLastRepo - reposPerPage;
  const currentRepos = sortedRepos.slice(indexOfFirstRepo, indexOfLastRepo);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleReposPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReposPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={currentPage === i ? 'active' : ''}
          disabled={currentPage === i || loading}
        >
          {i}
        </button>
      );
    }
    
    return buttons;
  };

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
                  {currentRepos.map((repo, index) => (
                    <tr key={index}>
                      <td className="breakable">{repo.owner}</td>
                      <td className="breakable">{repo.name}</td>
                      <td className="text-right">⭐ {repo.stars.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="pagination">
              <div className="pagination-controls">
                <button 
                  onClick={() => handlePageChange(1)} 
                  disabled={currentPage === 1 || loading}
                >
                  Primeira
                </button>
                <button 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1 || loading}
                >
                  Anterior
                </button>
                
                {renderPaginationButtons()}
                
                <button 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages || totalPages === 0 || loading}
                >
                  Próxima
                </button>
                <button 
                  onClick={() => handlePageChange(totalPages)} 
                  disabled={currentPage === totalPages || totalPages === 0 || loading}
                >
                  Última
                </button>
              </div>
              
              <div className="pagination-info">
                <span>
                  Exibindo {Math.min(indexOfFirstRepo + 1, sortedRepos.length)} - 
                  {Math.min(indexOfLastRepo, sortedRepos.length)} de 
                  {sortedRepos.length} repositórios
                </span>
                
                <div className="page-size-selector">
                  <span>Itens por página:</span>
                  <select 
                    value={reposPerPage} 
                    onChange={handleReposPerPageChange}
                    disabled={loading}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                    <option value="500">500</option>
                    <option value="1000">1000</option>
                  </select>
                </div>
              </div>
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
