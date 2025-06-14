import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SearchPage from './pages/SearchPage';
import ImportPage from './pages/ImportPage';
import './index.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <nav>
          <ul>
            <li>
              <Link to="/">Pesquisar e Exportar</Link>
            </li>
            <li>
              <Link to="/import">Importar e visualizar</Link>
            </li>
          </ul>
        </nav>
        
        <main>
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/import" element={<ImportPage />} />
          </Routes>
        </main>
        
        <footer>
          <p>GitHub Repository Manager &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;
