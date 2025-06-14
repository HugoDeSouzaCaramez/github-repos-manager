import React, { useState } from 'react';
import ImportForm from '../components/ImportForm';
import RepoTable from '../components/RepoTable';

const ImportPage: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleJobCompleted = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="page">
      <h1>Importar repositórios do GitHub</h1>
      <p>Importar repositórios de um arquivo CSV e visualizá-los no banco de dados</p>
      <ImportForm onJobCompleted={handleJobCompleted} />
      <RepoTable refreshTrigger={refreshTrigger} />
    </div>
  );
};

export default ImportPage;
