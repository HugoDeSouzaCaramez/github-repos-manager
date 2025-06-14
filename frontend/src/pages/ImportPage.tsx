import React from 'react';
import ImportForm from '../components/ImportForm';
import RepoTable from '../components/RepoTable';

const ImportPage: React.FC = () => {
  return (
    <div className="page">
      <h1>Importar repositórios do GitHub</h1>
      <p>Importar repositórios de um arquivo CSV e visualizá-los no banco de dados</p>
      <ImportForm />
      <RepoTable />
    </div>
  );
};

export default ImportPage;
