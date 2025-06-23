import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { WalletContextProvider } from './contexts/WalletContext';
import theme from './styles/theme';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import StrategyBuilder from './pages/StrategyBuilder';
import TokenIncentivization from './components/incentives/TokenIncentivization';
import Backtest from './pages/Backtest';
import Dashboard from './pages/Dashboard';
import StrategyMarketplace from './components/strategy/StrategyMarketplace';
import StrategyCreator from './components/strategy/StrategyCreator';

const App: React.FC = () => {
  return (
    <WalletContextProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div style={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/strategy-builder" element={<StrategyBuilder />} />
              <Route path="/strategy-creator" element={<StrategyCreator />} />
              <Route path="/token-incentivization" element={<TokenIncentivization />} />
              <Route path="/backtest" element={<Backtest />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/strategy-marketplace" element={<StrategyMarketplace />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </WalletContextProvider>
  );
};

export default App; 