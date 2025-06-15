import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getRepos, Repo } from '../services/api';

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
  refreshTrigger: number;
}

const RepoTable: React.FC<RepoTableProps> = ({ refreshTrigger }) => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [filters, setFilters] = useState<Filters>({
    owner: '',
    name: '',
    minStars: '',
  });
  
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'owner',
    direction: 'asc'
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRepos();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [filters, refreshTrigger]);

  const fetchRepos = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getRepos(
        filters.owner || undefined,
        filters.minStars ? parseInt(filters.minStars) : undefined,
        filters.name || undefined
      );
      setRepos(data);
    } catch (error) {
      console.error('Erro ao buscar repositórios:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.owner, filters.minStars, filters.name]);

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

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="repo-table">
      <div className="filters">
        <input
          type="text"
          name="owner"
          placeholder="Filtrar pelo dono"
          value={filters.owner}
          onChange={handleFilterChange}
          disabled={loading}
        />
        <input
          type="text"
          name="name"
          placeholder="Filtrar por repositório"
          value={filters.name}
          onChange={handleFilterChange}
          disabled={loading}
        />
        <input
          type="number"
          name="minStars"
          placeholder="Mínimo de estrelas"
          value={filters.minStars}
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
            {sortedRepos.map((repo) => (
              <tr key={repo.id}>
                <td className="breakable">{repo.owner}</td>
                <td className="breakable">{repo.name}</td>
                <td className="text-right">{repo.stars.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedRepos.length === 0 && !loading && <p>Nenhum repositório encontrado</p>}
        {loading && (
          <div className="loading-indicator">
            Carregando repositórios...
          </div>
        )}
      </div>
    </div>
  );
};

export default RepoTable;
