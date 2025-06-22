import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  AccountBalanceWallet,
  ShowChart,
  AttachMoney,
  PieChart,
  Refresh,
  Visibility,
  Close,
  SwapHoriz,
  Timeline
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import VaultManager from '../components/VaultManager';

interface Holding {
  symbol: string;
  name: string;
  amount: number;
  value: number;
  change24h: number;
  allocation: number;
}

interface PortfolioMetrics {
  totalValue: number;
  totalChange24h: number;
  totalChangePercent: number;
  totalPnL: number;
  bestPerformer: string;
  worstPerformer: string;
}

// Mock price history data generator
const generatePriceHistory = (symbol: string) => {
  const data = [];
  let basePrice = symbol === 'BTC' ? 43000 : symbol === 'ETH' ? 2400 : 102;
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    basePrice += (Math.random() - 0.5) * basePrice * 0.05;
    data.push({
      date: date.toISOString().split('T')[0],
      price: basePrice,
      volume: Math.random() * 1000000
    });
  }
  return data;
};

const Dashboard: React.FC = () => {
  const [holdings, setHoldings] = useState<Holding[]>([
    { symbol: 'SOL', name: 'Solana', amount: 125.5, value: 12840.50, change24h: 5.23, allocation: 35.2 },
    { symbol: 'BTC', name: 'Bitcoin', amount: 0.75, value: 32250.00, change24h: -2.15, allocation: 40.8 },
    { symbol: 'ETH', name: 'Ethereum', amount: 8.2, value: 19680.00, change24h: 3.47, allocation: 24.0 }
  ]);

  const [portfolioMetrics, setPortfolioMetrics] = useState<PortfolioMetrics>({
    totalValue: 64770.50,
    totalChange24h: 1247.82,
    totalChangePercent: 1.96,
    totalPnL: 8450.30,
    bestPerformer: 'SOL',
    worstPerformer: 'BTC'
  });

  const [isLoading, setIsLoading] = useState(false);
  
  // Modal states
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Holding | null>(null);
  
  // Trade form states
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradePrice, setTradePrice] = useState('');

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update with mock data
    setHoldings(prev => prev.map(holding => ({
      ...holding,
      change24h: holding.change24h + (Math.random() - 0.5) * 2,
      value: holding.value * (1 + (Math.random() - 0.5) * 0.05)
    })));
    
    setIsLoading(false);
  };

  // Handle View Details
  const handleViewDetails = (holding: Holding) => {
    setSelectedAsset(holding);
    setDetailsOpen(true);
  };

  // Handle Trade
  const handleTrade = (holding: Holding) => {
    setSelectedAsset(holding);
    setTradePrice((holding.value / holding.amount).toFixed(2));
    setTradeOpen(true);
  };

  // Execute trade (mock)
  const executeTrade = () => {
    if (!selectedAsset || !tradeAmount) return;
    
    const amount = parseFloat(tradeAmount);
    const price = parseFloat(tradePrice);
    
    // Mock trade execution
    console.log(`Executing ${tradeType} order:`, {
      symbol: selectedAsset.symbol,
      amount: amount,
      price: price,
      total: amount * price
    });
    
    // Update holdings (mock)
    if (tradeType === 'buy') {
      setHoldings(prev => prev.map(h => 
        h.symbol === selectedAsset.symbol 
          ? { ...h, amount: h.amount + amount, value: h.value + (amount * price) }
          : h
      ));
    } else {
      setHoldings(prev => prev.map(h => 
        h.symbol === selectedAsset.symbol 
          ? { ...h, amount: h.amount - amount, value: h.value - (amount * price) }
          : h
      ));
    }
    
    setTradeOpen(false);
    setTradeAmount('');
  };

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: (theme) => `linear-gradient(135deg, 
          ${theme.palette.background.default} 0%, 
          ${theme.palette.primary.light}20 100%)`,
        py: 4
      }}
    >
      <Container maxWidth="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography 
                variant="h3" 
                gutterBottom 
                sx={{ 
                  fontFamily: '"Noto Sans KR", sans-serif',
                  fontWeight: 700,
                  color: 'primary.main',
                  mb: 1
                }}
              >
                Portfolio Dashboard
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'text.secondary'
                }}
              >
                Track your crypto holdings and performance
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={refreshData}
              disabled={isLoading}
              sx={{ 
                borderRadius: '20px',
                px: 3
              }}
            >
              Refresh
            </Button>
          </Box>
        </motion.div>

        {/* Vault Management Section */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <VaultManager />
          </Grid>
        </Grid>

        {/* Portfolio Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}
            >
              <Typography variant="h6" gutterBottom>
                Total Portfolio Value
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {formatCurrency(portfolioMetrics.totalValue)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                {formatPercent(portfolioMetrics.totalChangePercent)} (24h)
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white'
              }}
            >
              <Typography variant="h6" gutterBottom>
                24h Change
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {formatCurrency(portfolioMetrics.totalChange24h)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                {formatPercent(portfolioMetrics.totalChangePercent)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white'
              }}
            >
              <Typography variant="h6" gutterBottom>
                Total P&L
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {formatCurrency(portfolioMetrics.totalPnL)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                All time
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                color: 'white'
              }}
            >
              <Typography variant="h6" gutterBottom>
                Assets
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {holdings.length}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                Holdings
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Holdings Table */}
        <Paper
          elevation={2}
          sx={{
            borderRadius: '16px',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Your Holdings
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Asset</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Value</TableCell>
                  <TableCell align="right">24h Change</TableCell>
                  <TableCell align="right">Allocation</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {holdings.map((holding) => (
                  <TableRow key={holding.symbol} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${holding.symbol === 'BTC' ? '#f7931a' : holding.symbol === 'ETH' ? '#627eea' : '#14f195'}, ${holding.symbol === 'BTC' ? '#ff9500' : holding.symbol === 'ETH' ? '#764ba2' : '#00d4aa'})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.9rem'
                          }}
                        >
                          {holding.symbol}
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {holding.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {holding.symbol}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {holding.amount.toFixed(4)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(holding.value)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: holding.change24h >= 0 ? 'success.main' : 'error.main',
                          fontWeight: 600
                        }}
                      >
                        {formatPercent(holding.change24h)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {holding.allocation.toFixed(1)}%
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" title="View Details" onClick={() => handleViewDetails(holding)}>
                        <Visibility />
                      </IconButton>
                      <IconButton size="small" title="Trade" onClick={() => handleTrade(holding)}>
                        <SwapHoriz />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      {/* Asset Details Modal */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Asset Details
        </DialogTitle>
        <DialogContent>
          {selectedAsset && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    {selectedAsset.name} ({selectedAsset.symbol})
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Current Price: {formatCurrency(selectedAsset.value / selectedAsset.amount)}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Holdings: {selectedAsset.amount.toFixed(4)} {selectedAsset.symbol}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Total Value: {formatCurrency(selectedAsset.value)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={generatePriceHistory(selectedAsset.symbol)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.3} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Trade Modal */}
      <Dialog
        open={tradeOpen}
        onClose={() => setTradeOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Trade {selectedAsset?.symbol}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Trade Type</InputLabel>
              <Select
                value={tradeType}
                onChange={(e) => setTradeType(e.target.value as 'buy' | 'sell')}
              >
                <MenuItem value="buy">Buy</MenuItem>
                <MenuItem value="sell">Sell</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={tradeAmount}
              onChange={(e) => setTradeAmount(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Price per unit"
              type="number"
              value={tradePrice}
              onChange={(e) => setTradePrice(e.target.value)}
              sx={{ mb: 2 }}
            />
            {tradeAmount && tradePrice && (
              <Typography variant="body2" color="text.secondary">
                Total: {formatCurrency(parseFloat(tradeAmount) * parseFloat(tradePrice))}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTradeOpen(false)}>Cancel</Button>
          <Button 
            onClick={executeTrade} 
            variant="contained"
            disabled={!tradeAmount || !tradePrice}
          >
            Execute Trade
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard; 