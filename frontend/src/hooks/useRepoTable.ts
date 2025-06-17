import { useState, useMemo, useCallback } from 'react';
import { Repo, Filters, SortConfig, RepoSortField } from '../types/repo';

export const useRepoTable = (allRepos: Repo[]) => {
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
      const minStars = Number(filters.minStars);
      if (!isNaN(minStars) && minStars >= 0) {
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

  const handleSort = useCallback((field: RepoSortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((name: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleReposPerPageChange = useCallback((value: number) => {
    setReposPerPage(value);
    setCurrentPage(1);
  }, []);

  return {
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
  };
};
