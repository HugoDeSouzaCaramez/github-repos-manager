export interface Repo {
  id: number;
  name: string;
  owner: string;
  stars: number;
}

export type RepoFilterKey = 'owner' | 'name' | 'minStars';
export type RepoSortField = keyof Repo;
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: RepoSortField;
  direction: SortDirection;
}

export interface Filters {
  owner: string;
  name: string;
  minStars: string;
}

export interface Job {
  id: number;
  filePath: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}
