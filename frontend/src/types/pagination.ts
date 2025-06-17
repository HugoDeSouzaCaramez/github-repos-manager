export type OnPageChange = (page: number) => void;
export type OnPerPageChange = (perPage: number) => void;

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  loading: boolean;
  onPageChange: OnPageChange;
  onItemsPerPageChange: OnPerPageChange;
  totalItems: number;
  indexOfFirstItem: number;
  indexOfLastItem: number;
}
