import React from 'react';
import SearchForm from '../components/SearchForm';
import { searchUserRepos, exportReposCSV } from '../services/api';

const SearchPage: React.FC = () => {
  return (
    <div className="page">
      <h1>Pesquisa de repositório do GitHub</h1>
      <p>Procure um usuário do GitHub e exporte seus repositórios como CSV</p>
      <SearchForm 
        searchApi={searchUserRepos}
        exportApi={exportReposCSV}
      />
    </div>
  );
};

export default SearchPage;
