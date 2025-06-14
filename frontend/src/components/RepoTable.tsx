import React, { useState, useEffect, useCallback } from 'react';
import { getRepos, Repo } from '../services/api';

interface Filters {
  owner: string;
  minStars: string;
}

interface RepoTableProps {
  refreshTrigger: number;
}

const RepoTable: React.FC<RepoTableProps> = ({ refreshTrigger }) => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [filters, setFilters] = useState<Filters>({
    owner: '',
    minStars: '',
  });
  const [loading, setLoading] = useState(false);

  const fetchRepos = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getRepos(
        filters.owner || undefined, 
        filters.minStars ? parseInt(filters.minStars) : undefined
      );
      setRepos(data);
    } catch (error) {
      console.error('Error fetching repos:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.owner, filters.minStars]);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos, refreshTrigger]);

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
        />
        <input
          type="number"
          name="minStars"
          placeholder="Mínimo de estrelas"
          value={filters.minStars}
          onChange={handleFilterChange}
          min="0"
        />
        <button onClick={fetchRepos} disabled={loading}>
          {loading ? 'Atualizando...' : 'Atualizar'}
        </button>
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
      {repos.length === 0 && !loading && <p>Nenhum repositório encontrado</p>}
    </div>
  );
};

export default RepoTable;
