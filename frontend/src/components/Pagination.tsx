import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  reposPerPage: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onReposPerPageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  totalRepos: number;
  indexOfFirstRepo: number;
  indexOfLastRepo: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  reposPerPage,
  loading,
  onPageChange,
  onReposPerPageChange,
  totalRepos,
  indexOfFirstRepo,
  indexOfLastRepo,
}) => {
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
          onClick={() => onPageChange(i)}
          className={currentPage === i ? 'active' : ''}
          disabled={currentPage === i || loading}
        >
          {i}
        </button>
      );
    }
    
    return buttons;
  };

  return (
    <div className="pagination">
      <div className="pagination-controls">
        <button 
          onClick={() => onPageChange(1)} 
          disabled={currentPage === 1 || loading}
        >
          Primeira
        </button>
        <button 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1 || loading}
        >
          Anterior
        </button>
        
        {renderPaginationButtons()}
        
        <button 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages || totalPages === 0 || loading}
        >
          Próxima
        </button>
        <button 
          onClick={() => onPageChange(totalPages)} 
          disabled={currentPage === totalPages || totalPages === 0 || loading}
        >
          Última
        </button>
      </div>
      
      <div className="pagination-info">
        <span>
          Exibindo {indexOfFirstRepo} - {indexOfLastRepo} de {totalRepos} repositórios
        </span>
        
        <div className="page-size-selector">
          <span>Itens por página:</span>
          <select 
            value={reposPerPage} 
            onChange={onReposPerPageChange}
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
  );
};

export default Pagination;
