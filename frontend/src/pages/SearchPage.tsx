import React from 'react';
import SearchForm from '../components/SearchForm';

const SearchPage: React.FC = () => {
  return (
    <div className="page">
      <h1>Pesquisa de repositório do GitHub</h1>
      <p>Procure um usuário do GitHub e exporte seus repositórios como CSV</p>
      <SearchForm />
    </div>
  );
};

export default SearchPage;
