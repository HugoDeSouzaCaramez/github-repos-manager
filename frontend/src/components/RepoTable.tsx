import React, { useState, useMemo, useCallback } from 'react';
import { Repo } from '../services/api';

interface Filters {
  owner: string;
  name: string;
  minStars: string;
}

interface SortConfig {
  field: keyof Repo;
  direction: 'asc' | 'desc';
}

interface RepoTableProps {
  allRepos: Repo[];
  loading: boolean;
  refreshTrigger: number;
}

const RepoTable: React.FC<RepoTableProps> = ({ 
  allRepos, 
  loading,
  refreshTrigger 
}) => {
  const [filters, setFilters] = useState<Filters>({
    owner: '',
    name: '',
    minStars: '',
  });
  
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'owner',
    direction: 'asc'
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [reposPerPage, setReposPerPage] = useState(10);

  const filteredRepos = useMemo(() => {
    let result = [...allRepos];
    
    if (filters.owner) {
      result = result.filter(repo => 
        repo.owner.toLowerCase().includes(filters.owner.toLowerCase())
      );
    }
    if (filters.name) {
      result = result.filter(repo => 
        repo.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    if (filters.minStars) {
      const minStars = parseInt(filters.minStars);
      if (!isNaN(minStars)) {
        result = result.filter(repo => repo.stars >= minStars);
      }
    }
    
    return result.sort((a, b) => {
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
  }, [allRepos, filters, sortConfig]);

  const totalPages = Math.ceil(filteredRepos.length / reposPerPage);
  const indexOfLastRepo = currentPage * reposPerPage;
  const indexOfFirstRepo = indexOfLastRepo - reposPerPage;
  const currentRepos = filteredRepos.slice(indexOfFirstRepo, indexOfLastRepo);

  const handleSort = useCallback((field: keyof Repo) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

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
          disabled={currentPage === i}
        >
          {i}
        </button>
      );
    }
    
    return buttons;
  };

  return (
    <div className="repo-table">
      <div className="filters">
        <input
          type="text"
          name="owner"
          placeholder="Filtrar pelo dono"
          onChange={handleFilterChange}
          disabled={loading}
        />
        <input
          type="text"
          name="name"
          placeholder="Filtrar por repositório"
          onChange={handleFilterChange}
          disabled={loading}
        />
        <input
          type="number"
          name="minStars"
          placeholder="Mínimo de estrelas"
          onChange={handleFilterChange}
          min="0"
          disabled={loading}
        />
      </div>
      
      <div className="repo-table-container">
        <table>
          <thead>
            <tr>
              <th 
                onClick={() => handleSort('owner')}
                className={`sortable ${sortConfig.field === 'owner' ? 'sorted' : ''}`}
              >
                Dono(a)
                <span className="sort-icon">
                  {sortConfig.field === 'owner' && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                </span>
              </th>
              <th 
                onClick={() => handleSort('name')}
                className={`sortable ${sortConfig.field === 'name' ? 'sorted' : ''}`}
              >
                Repositório
                <span className="sort-icon">
                  {sortConfig.field === 'name' && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                </span>
              </th>
              <th 
                onClick={() => handleSort('stars')}
                className={`sortable ${sortConfig.field === 'stars' ? 'sorted' : ''}`}
              >
                Estrelas
                <span className="sort-icon">
                  {sortConfig.field === 'stars' && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {currentRepos.map((repo) => (
              <tr key={repo.id}>
                <td className="breakable">{repo.owner}</td>
                <td className="breakable">{repo.name}</td>
                <td className="text-right">{repo.stars.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredRepos.length === 0 && !loading && <p>Nenhum repositório encontrado</p>}
        
        {loading && (
          <div className="loading-indicator">
            Carregando repositórios...
          </div>
        )}
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
            Exibindo {Math.min(indexOfFirstRepo + 1, filteredRepos.length)} - {Math.min(indexOfLastRepo, filteredRepos.length)} de {filteredRepos.length} repositórios
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
  );
};

export default RepoTable;
