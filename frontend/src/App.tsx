import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import theme from './styles/theme';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import StrategyBuilder from './components/strategy/StrategyBuilder';
import Backtest from './pages/Backtest';
import Dashboard from './pages/Dashboard';
import CryptoGlossary from './pages/CryptoGlossary';
import ResearchCorpusPage from './pages/ResearchCorpusPage';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div style={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/strategy-builder" element={<StrategyBuilder />} />
            <Route path="/backtest" element={<Backtest />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/crypto-glossary" element={<CryptoGlossary />} />
            <Route path="/research-corpus" element={<ResearchCorpusPage />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App; 