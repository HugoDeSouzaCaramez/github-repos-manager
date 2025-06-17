import React from 'react';
import { Repo, RepoFilterKey, RepoSortField } from '../../types/repo';
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
  filterComponents?: {
    owner?: React.ReactNode;
    name?: React.ReactNode;
    stars?: React.ReactNode;
  };
}

const RepoTable: React.FC<RepoTableProps> = ({ 
  allRepos, 
  loading,
  showFilters = {
    owner: true,
    name: true,
    stars: true
  },
  filterComponents
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
    handleFilterChange(e.target.name as RepoFilterKey, e.target.value);
  };

  const renderHeader = (field: RepoSortField, label: string) => (
    <th 
      onClick={() => handleSort(field)}
      className={`sortable ${sortConfig.field === field ? 'sorted' : ''}`}
    >
      {label}
      <span className="sort-icon">
        {sortConfig.field === field && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
      </span>
    </th>
  );

  return (
    <div className="repo-table">
      <div className="filters">
        {showFilters.owner && (
          filterComponents?.owner || (
            <input
              type="text"
              name="owner"
              placeholder="Filtrar pelo dono"
              value={filters.owner}
              onChange={handleInputChange}
              disabled={loading}
            />
          )
        )}
        
        {showFilters.name && (
          filterComponents?.name || (
            <input
              type="text"
              name="name"
              placeholder="Filtrar por repositório"
              value={filters.name}
              onChange={handleInputChange}
              disabled={loading}
            />
          )
        )}
        
        {showFilters.stars && (
          filterComponents?.stars || (
            <input
              type="number"
              name="minStars"
              placeholder="Mínimo de estrelas"
              value={filters.minStars}
              onChange={handleInputChange}
              min="0"
              disabled={loading}
            />
          )
        )}
      </div>
      
      <div className="repo-table-container">
        <table>
          <thead>
            <tr>
              {renderHeader('owner', 'Dono(a)')}
              {renderHeader('name', 'Repositório')}
              {renderHeader('stars', 'Estrelas')}
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
        itemsPerPage={reposPerPage}
        loading={loading}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleReposPerPageChange}
        totalItems={filteredRepos.length}
        indexOfFirstItem={(currentPage - 1) * reposPerPage + 1}
        indexOfLastItem={Math.min(currentPage * reposPerPage, filteredRepos.length)}
      />
    </div>
  );
};

export default RepoTable;
