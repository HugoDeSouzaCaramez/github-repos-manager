import React from 'react';
import { Repo } from '../../services/api';
import { useRepoTable } from '../../hooks/useRepoTable';
import Pagination from './Pagination';

interface RepoTableProps {
  allRepos: Repo[];
  loading: boolean;
  showFilters?: {
    owner?: boolean;
    name?: boolean;
    stars?: boolean;
  };
}

const RepoTable: React.FC<RepoTableProps> = ({ 
  allRepos, 
  loading,
  showFilters = {
    owner: true,
    name: true,
    stars: true
  }
}) => {
  const {
    filters,
    sortConfig,
    currentPage,
    reposPerPage,
    filteredRepos,
    totalPages,
    currentRepos,
    handleSort,
    handleFilterChange,
    handlePageChange,
    handleReposPerPageChange,
  } = useRepoTable(allRepos);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange(e.target.name as keyof typeof filters, e.target.value);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleReposPerPageChange(Number(e.target.value));
  };

  return (
    <div className="repo-table">
      <div className="filters">
        {showFilters.owner && (
          <input
            type="text"
            name="owner"
            placeholder="Filtrar pelo dono"
            value={filters.owner}
            onChange={handleInputChange}
            disabled={loading}
          />
        )}
        
        {showFilters.name && (
          <input
            type="text"
            name="name"
            placeholder="Filtrar por repositório"
            value={filters.name}
            onChange={handleInputChange}
            disabled={loading}
          />
        )}
        
        {showFilters.stars && (
          <input
            type="number"
            name="minStars"
            placeholder="Mínimo de estrelas"
            value={filters.minStars}
            onChange={handleInputChange}
            min="0"
            disabled={loading}
          />
        )}
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
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        reposPerPage={reposPerPage}
        loading={loading}
        onPageChange={handlePageChange}
        onReposPerPageChange={handleSelectChange}
        totalRepos={filteredRepos.length}
        indexOfFirstRepo={(currentPage - 1) * reposPerPage + 1}
        indexOfLastRepo={Math.min(currentPage * reposPerPage, filteredRepos.length)}
      />
    </div>
  );
};

export default RepoTable;
