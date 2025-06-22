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
import { useTranslation } from '../contexts/TranslationContext';
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
  const { translateSync } = useTranslation();
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
                {translateSync('Portfolio Dashboard')}
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'text.secondary'
                }}
              >
                {translateSync('Track your crypto holdings and performance')}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={refreshData}
              disabled={isLoading}
            >
              {translateSync('Refresh')}
            </Button>
          </Box>
        </motion.div>

        {/* Portfolio Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccountBalanceWallet sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="body2" color="text.secondary">
                      {translateSync('Total Portfolio Value')}
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="primary.main" sx={{ mb: 1 }}>
                    {formatCurrency(portfolioMetrics.totalValue)}
                  </Typography>
                  {isLoading && <LinearProgress sx={{ height: 4, borderRadius: 2 }} />}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {portfolioMetrics.totalChange24h >= 0 ? 
                      <TrendingUp sx={{ mr: 2, color: 'success.main' }} /> :
                      <TrendingDown sx={{ mr: 2, color: 'error.main' }} />
                    }
                    <Typography variant="body2" color="text.secondary">
                      {translateSync('24h Change')}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="h4" 
                    color={portfolioMetrics.totalChange24h >= 0 ? 'success.main' : 'error.main'}
                    sx={{ mb: 1 }}
                  >
                    {formatCurrency(Math.abs(portfolioMetrics.totalChange24h))}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color={portfolioMetrics.totalChange24h >= 0 ? 'success.main' : 'error.main'}
                  >
                    {formatPercent(portfolioMetrics.totalChangePercent)}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AttachMoney sx={{ mr: 2, color: 'secondary.main' }} />
                    <Typography variant="body2" color="text.secondary">
                      {translateSync('Total P&L')}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="h4" 
                    color={portfolioMetrics.totalPnL >= 0 ? 'success.main' : 'error.main'}
                    sx={{ mb: 1 }}
                  >
                    {portfolioMetrics.totalPnL >= 0 ? '+' : ''}{formatCurrency(portfolioMetrics.totalPnL)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {translateSync('All time')}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PieChart sx={{ mr: 2, color: 'warning.main' }} />
                    <Typography variant="body2" color="text.secondary">
                      {translateSync('Assets')}
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="warning.main" sx={{ mb: 1 }}>
                    {holdings.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {translateSync('Holdings')}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Holdings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Paper sx={{ borderRadius: 2 }}>
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h5" fontWeight="bold">
                {translateSync('Your Holdings')}
              </Typography>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{translateSync('Asset')}</TableCell>
                    <TableCell align="right">{translateSync('Amount')}</TableCell>
                    <TableCell align="right">{translateSync('Value')}</TableCell>
                    <TableCell align="right">{translateSync('24h Change')}</TableCell>
                    <TableCell align="right">{translateSync('Allocation')}</TableCell>
                    <TableCell align="right">{translateSync('Actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {holdings.map((holding) => (
                    <TableRow key={holding.symbol} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ ml: 2 }}>
                            <Typography variant="body1" fontWeight="medium">
                              {holding.symbol}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {holding.name}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1">
                          {holding.amount.toFixed(4)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" fontWeight="medium">
                          {formatCurrency(holding.value)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body1" 
                          color={holding.change24h >= 0 ? 'success.main' : 'error.main'}
                          fontWeight="medium"
                        >
                          {formatPercent(holding.change24h)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {holding.allocation.toFixed(1)}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={holding.allocation} 
                            sx={{ width: 60, height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" title={translateSync('View Details')} onClick={() => handleViewDetails(holding)}>
                          <Visibility />
                        </IconButton>
                        <IconButton size="small" title={translateSync('Trade')} onClick={() => handleTrade(holding)}>
                          <ShowChart />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </motion.div>
      </Container>

      {/* Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Timeline sx={{ color: 'primary.main' }} />
              <Box>
                <Typography variant="h6">
                  {selectedAsset?.symbol} - {selectedAsset?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {translateSync('Asset Details')}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setDetailsOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAsset && (
            <Box sx={{ mt: 2 }}>
              {/* Asset Overview Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                  <Card sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Current Price
                    </Typography>
                    <Typography variant="h5" color="primary.main">
                      {formatCurrency(selectedAsset.value / selectedAsset.amount)}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      24h Change
                    </Typography>
                    <Typography 
                      variant="h5" 
                      color={selectedAsset.change24h >= 0 ? 'success.main' : 'error.main'}
                    >
                      {formatPercent(selectedAsset.change24h)}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Your Holdings
                    </Typography>
                    <Typography variant="h5">
                      {selectedAsset.amount.toFixed(4)}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Value
                    </Typography>
                    <Typography variant="h5" color="secondary.main">
                      {formatCurrency(selectedAsset.value)}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>

              {/* Price Chart */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  30-Day Price History
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={generatePriceHistory(selectedAsset.symbol)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis 
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), 'Price']}
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#8884d8" 
                        fill="url(#colorPrice)" 
                      />
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>

              {/* Additional Metrics */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Portfolio Allocation
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body1" sx={{ mr: 2 }}>
                        {selectedAsset.allocation.toFixed(1)}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={selectedAsset.allocation} 
                        sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Percentage of total portfolio value
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Performance Metrics
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">7-day change:</Typography>
                      <Typography variant="body2" color="success.main">
                        +{(selectedAsset.change24h * 1.2).toFixed(2)}%
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">30-day change:</Typography>
                      <Typography variant="body2" color="primary.main">
                        +{(selectedAsset.change24h * 2.1).toFixed(2)}%
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Market cap rank:</Typography>
                      <Typography variant="body2">
                        #{selectedAsset.symbol === 'BTC' ? '1' : selectedAsset.symbol === 'ETH' ? '2' : '5'}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)} startIcon={<Close />}>
            {translateSync('Close')}
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setDetailsOpen(false);
              if (selectedAsset) handleTrade(selectedAsset);
            }}
            startIcon={<SwapHoriz />}
          >
            {translateSync('Trade')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Trade Dialog */}
      <Dialog 
        open={tradeOpen} 
        onClose={() => setTradeOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <SwapHoriz sx={{ color: 'primary.main' }} />
              <Box>
                <Typography variant="h6">
                  {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedAsset?.symbol}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Execute a {tradeType} order
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setTradeOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAsset && (
            <Box sx={{ mt: 2 }}>
              {/* Current Asset Info */}
              <Card sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Current Price
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency(selectedAsset.value / selectedAsset.amount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Available Balance
                    </Typography>
                    <Typography variant="h6">
                      {tradeType === 'sell' 
                        ? `${selectedAsset.amount.toFixed(4)} ${selectedAsset.symbol}`
                        : formatCurrency(10000) // Mock USD balance
                      }
                    </Typography>
                  </Grid>
                </Grid>
              </Card>

              {/* Trade Form */}
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="trade-type-label">Order Type</InputLabel>
                  <Select
                    labelId="trade-type-label"
                    value={tradeType}
                    label="Order Type"
                    onChange={(e) => setTradeType(e.target.value as 'buy' | 'sell')}
                  >
                    <MenuItem value="buy">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUp sx={{ color: 'success.main', fontSize: 20 }} />
                        Buy {selectedAsset.symbol}
                      </Box>
                    </MenuItem>
                    <MenuItem value="sell">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingDown sx={{ color: 'error.main', fontSize: 20 }} />
                        Sell {selectedAsset.symbol}
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label={`Amount (${selectedAsset.symbol})`}
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  fullWidth
                  margin="normal"
                  helperText={
                    tradeType === 'sell' 
                      ? `Max: ${selectedAsset.amount.toFixed(4)} ${selectedAsset.symbol}`
                      : 'Enter the amount you want to buy'
                  }
                />

                <TextField
                  label="Price per unit (USD)"
                  type="number"
                  value={tradePrice}
                  onChange={(e) => setTradePrice(e.target.value)}
                  fullWidth
                  margin="normal"
                  helperText="Current market price (adjustable)"
                />
              </Box>

              {/* Order Summary */}
              {tradeAmount && tradePrice && (
                <Card sx={{ p: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <Typography variant="h6" gutterBottom>
                    Order Summary
                  </Typography>
                  <Divider sx={{ my: 2, bgcolor: 'primary.contrastText' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Order Type:</Typography>
                    <Typography fontWeight="bold">
                      {tradeType.toUpperCase()} {selectedAsset.symbol}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Amount:</Typography>
                    <Typography fontWeight="bold">
                      {parseFloat(tradeAmount).toFixed(4)} {selectedAsset.symbol}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Price:</Typography>
                    <Typography fontWeight="bold">
                      {formatCurrency(parseFloat(tradePrice))}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2, bgcolor: 'primary.contrastText' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatCurrency(parseFloat(tradeAmount) * parseFloat(tradePrice))}
                    </Typography>
                  </Box>
                </Card>
              )}

              {/* Warning for large trades */}
              {tradeAmount && parseFloat(tradeAmount) > selectedAsset.amount * 0.5 && tradeType === 'sell' && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  You're selling more than 50% of your holdings. This may significantly impact your portfolio allocation.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setTradeOpen(false)} startIcon={<Close />}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={executeTrade}
            disabled={!tradeAmount || !tradePrice || parseFloat(tradeAmount) <= 0}
            startIcon={<SwapHoriz />}
            color={tradeType === 'buy' ? 'success' : 'error'}
          >
            {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedAsset?.symbol}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard; 