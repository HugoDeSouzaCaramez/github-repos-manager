import React, { useState, useEffect, useCallback } from 'react';
import { getRepos, Repo } from '../services/api';

interface Filters {
  owner: string;
  minStars: string;
}

const RepoTable: React.FC = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [filters, setFilters] = useState<Filters>({
    owner: '',
    minStars: '',
  });

  const fetchRepos = useCallback(async () => {
    try {
      const { data } = await getRepos(
        filters.owner || undefined, 
        filters.minStars ? parseInt(filters.minStars) : undefined
      );
      setRepos(data);
    } catch (error) {
      console.error('Error fetching repos:', error);
    }
  }, [filters.owner, filters.minStars]);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

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
          placeholder="Filter by owner"
          value={filters.owner}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          name="minStars"
          placeholder="Min stars"
          value={filters.minStars}
          onChange={handleFilterChange}
          min="0"
        />
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Dono(a)</th>
            <th>Estrelas</th>
          </tr>
        </thead>
        <tbody>
          {repos.map((repo) => (
            <tr key={repo.id}>
              <td>{repo.name}</td>
              <td>{repo.owner}</td>
              <td>{repo.stars}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RepoTable;
