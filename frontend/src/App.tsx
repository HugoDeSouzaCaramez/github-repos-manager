import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import SearchPage from './pages/SearchPage';
import ImportPage from './pages/ImportPage';
import './index.css';

const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav>
      <ul>
        <li>
          <Link 
            to="/" 
            className={location.pathname === "/" ? "active" : ""}
          >
            Pesquisar e Exportar
          </Link>
        </li>
        <li>
          <Link 
            to="/import" 
            className={location.pathname === "/import" ? "active" : ""}
          >
            Importar e Visualizar
          </Link>
        </li>
      </ul>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <header>
          <div className="container">
            <Navigation />
          </div>
        </header>
        
        <main className="container">
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/import" element={<ImportPage />} />
          </Routes>
        </main>
        
        <footer>
          <div className="container">
            <p>GitHub Repository Manager © {new Date().getFullYear()}</p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
