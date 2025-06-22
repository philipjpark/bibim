import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { strategyApi, llmApi } from '../../services/api';
import SentimentAnalysis from './SentimentAnalysis';
import geminiService from '../../services/geminiService';

interface StrategyParameters {
  coin: string;
  strategyType: string;
  breakoutCondition: string;
  percentageIncrease: number;
  timeframe: string;
  volumeCondition: string;
  riskManagement: {
    stopLoss: number;
    takeProfit: number;
    positionSize: number;
  };
  instantSwap: {
    enabled: boolean;
    stablecoin: string;
    minProfitThreshold: number;
    autoCompound: boolean;
  };
}

interface ProvenStrategy {
  id: string;
  name: string;
  description: string;
  baseParameters: StrategyParameters;
}

const provenStrategies: ProvenStrategy[] = [
  {
    id: 'sol_breakout_v1',
    name: 'Solana Breakout V1',
    description: 'A proven breakout strategy optimized for Solana\'s volatility patterns. Uses volume confirmation and dynamic stop-loss.',
    baseParameters: {
      coin: 'SOL',
      strategyType: 'breakout',
      breakoutCondition: 'price_increase',
      percentageIncrease: 3,
      timeframe: '15m',
      volumeCondition: 'above_average',
      riskManagement: {
        stopLoss: 2,
        takeProfit: 6,
        positionSize: 100
      },
      instantSwap: {
        enabled: false,
        stablecoin: 'USDC',
        minProfitThreshold: 1.5,
        autoCompound: false
      }
    }
  },
  {
    id: 'btc_trend_v1',
    name: 'Bitcoin Trend Following V1',
    description: 'A trend-following strategy designed for Bitcoin\'s longer-term movements. Incorporates moving averages and volume analysis.',
    baseParameters: {
      coin: 'BTC',
      strategyType: 'trend',
      breakoutCondition: 'price_increase',
      percentageIncrease: 5,
      timeframe: '4h',
      volumeCondition: 'double_average',
      riskManagement: {
        stopLoss: 3,
        takeProfit: 9,
        positionSize: 80
      },
      instantSwap: {
        enabled: false,
        stablecoin: 'USDC',
        minProfitThreshold: 1.5,
        autoCompound: false
      }
    }
  },
  {
    id: 'eth_mean_rev_v1',
    name: 'Ethereum Mean Reversion V1',
    description: 'A mean reversion strategy optimized for Ethereum\'s price patterns. Uses RSI and Bollinger Bands for entry/exit signals.',
    baseParameters: {
      coin: 'ETH',
      strategyType: 'mean_reversion',
      breakoutCondition: 'pattern_breakout',
      percentageIncrease: 2,
      timeframe: '1h',
      volumeCondition: 'triple_average',
      riskManagement: {
        stopLoss: 1.5,
        takeProfit: 4.5,
        positionSize: 120
      },
      instantSwap: {
        enabled: false,
        stablecoin: 'USDC',
        minProfitThreshold: 1.5,
        autoCompound: false
      }
    }
  }
];

const StrategyBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [llmResponse, setLlmResponse] = useState<any>(null);
  
  // Add API test state
  const [apiTestResult, setApiTestResult] = useState<string | null>(null);
  const [apiTesting, setApiTesting] = useState(false);

  const [parameters, setParameters] = useState<StrategyParameters>({
    coin: 'SOL',
    strategyType: 'breakout',
    breakoutCondition: 'price_increase',
    percentageIncrease: 3,
    timeframe: '15m',
    volumeCondition: 'above_average',
    riskManagement: {
      stopLoss: 2,
      takeProfit: 6,
      positionSize: 100
    },
    instantSwap: {
      enabled: false,
      stablecoin: 'USDC',
      minProfitThreshold: 1.5,
      autoCompound: false
    }
  });
  const [selectedProvenStrategy, setSelectedProvenStrategy] = useState<string>('');
  const [customModifications, setCustomModifications] = useState<string>('');

  const steps = [
    'Select Asset & Strategy',
    'Define Parameters',
    'Risk Management',
    'Instant Swap Settings',
    'Review & Generate',
    'Generated Strategy'
  ];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleParameterChange = (field: string, value: any) => {
    if (field === 'coin') {
      // Reset selected proven strategy when coin changes
      setSelectedProvenStrategy('');
      setParameters(prev => ({
        ...prev,
        [field]: value
      }));
    } else if (field === 'instantSwap') {
      // Convert string values back to boolean for instantSwap settings
      const updatedValue = {
        ...parameters.instantSwap,
        ...value,
        enabled: value.enabled === 'true',
        autoCompound: value.autoCompound === 'true'
      };
      setParameters(prev => ({
        ...prev,
        instantSwap: updatedValue
      }));
    } else {
      setParameters(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleRiskManagementChange = (field: string, value: number) => {
    setParameters((prev) => ({
      ...prev,
      riskManagement: {
        ...prev.riskManagement,
        [field]: value
      }
    }));
  };

  const handleProvenStrategySelect = (strategyId: string) => {
    const strategy = provenStrategies.find(s => s.id === strategyId);
    if (strategy) {
      setParameters(strategy.baseParameters);
      setSelectedProvenStrategy(strategyId);
    }
  };

  const generateStrategyString = () => {
    const baseStrategy = selectedProvenStrategy 
      ? provenStrategies.find(s => s.id === selectedProvenStrategy)?.description || 'Custom Strategy'
      : `This is my trading strategy: Coin=${parameters.coin} Strategy=${parameters.strategyType} Breakout=${parameters.percentageIncrease}% TimeFrame=${parameters.timeframe} Volume=${parameters.volumeCondition} StopLoss=${parameters.riskManagement.stopLoss}% TakeProfit=${parameters.riskManagement.takeProfit}% PositionSize=${parameters.riskManagement.positionSize}%`;
    
    const llmPrompt = `[STRATEGY CONFIGURATION]
Base Strategy: ${baseStrategy}

[PARAMETERS]
Asset: ${parameters.coin}
Strategy Type: ${parameters.strategyType}
Breakout Condition: ${parameters.breakoutCondition}
Percentage Increase: ${parameters.percentageIncrease}%
Timeframe: ${parameters.timeframe}
Volume Condition: ${parameters.volumeCondition}

[RISK MANAGEMENT]
Stop Loss: ${parameters.riskManagement.stopLoss}%
Take Profit: ${parameters.riskManagement.takeProfit}%
Position Size: ${parameters.riskManagement.positionSize}%

[INSTANT SWAP SETTINGS]
Enabled: ${parameters.instantSwap.enabled}
Stablecoin: ${parameters.instantSwap.stablecoin}
Minimum Profit Threshold: ${parameters.instantSwap.minProfitThreshold}%
Auto-Compound: ${parameters.instantSwap.autoCompound}

${customModifications ? `[CUSTOM MODIFICATIONS]
${customModifications}` : ''}

[INSTRUCTION]
Please analyze this strategy configuration and provide:
1. A detailed breakdown of the strategy logic
2. Potential risks and mitigations
3. Suggested optimizations based on historical data
4. Implementation recommendations
5. Stablecoin swap execution strategy and liquidity considerations`;

    return llmPrompt;
  };

  const handleGenerateStrategy = async () => {
    setLoading(true);
    setError('');

    try {
      const strategyString = generateStrategyString();
      console.log('🚀 Generating strategy with Gemini service...');
      console.log('Strategy input:', strategyString);
      
      // Use Gemini service directly instead of llmApi
      const response = await geminiService.generateStrategy(strategyString);
      console.log('✅ Strategy generated successfully:', response);
      
      setLlmResponse({ message: response });
      handleNext();
    } catch (err: any) {
      console.error('❌ Strategy generation failed:', err);
      setError(err.message || 'Failed to generate strategy');
    } finally {
      setLoading(false);
    }
  };

  // Add API test function
  const testApiConnection = async () => {
    console.log('🧪 TEST API BUTTON CLICKED!');
    setApiTesting(true);
    setApiTestResult(null);
    
    try {
      const result = await geminiService.testConnection();
      if (result) {
        setApiTestResult('✅ API connection successful! Gemini is working correctly.');
      } else {
        setApiTestResult('❌ API connection failed. Check console for details.');
      }
    } catch (error) {
      console.error('API test failed:', error);
      setApiTestResult('❌ API connection failed. Check console for details.');
    } finally {
      setApiTesting(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Select Asset</InputLabel>
                <Select
                  value={parameters.coin}
                  label="Select Asset"
                  onChange={(e) => handleParameterChange('coin', e.target.value)}
                >
                  <MenuItem value="SOL">Solana (SOL)</MenuItem>
                  <MenuItem value="BTC">Bitcoin (BTC)</MenuItem>
                  <MenuItem value="ETH">Ethereum (ETH)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Strategy Type</InputLabel>
                <Select
                  value={parameters.strategyType}
                  label="Strategy Type"
                  onChange={(e) => handleParameterChange('strategyType', e.target.value)}
                >
                  <MenuItem value="breakout">Breakout Strategy</MenuItem>
                  <MenuItem value="trend">Trend Following</MenuItem>
                  <MenuItem value="mean_reversion">Mean Reversion</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Breakout Condition</InputLabel>
                <Select
                  value={parameters.breakoutCondition}
                  label="Breakout Condition"
                  onChange={(e) => handleParameterChange('breakoutCondition', e.target.value)}
                >
                  <MenuItem value="price_increase">Price Increase</MenuItem>
                  <MenuItem value="volume_spike">Volume Spike</MenuItem>
                  <MenuItem value="pattern_breakout">Pattern Breakout</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Percentage Increase"
                type="number"
                value={parameters.percentageIncrease}
                onChange={(e) => handleParameterChange('percentageIncrease', Number(e.target.value))}
                InputProps={{
                  endAdornment: <Typography>%</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Timeframe</InputLabel>
                <Select
                  value={parameters.timeframe}
                  label="Timeframe"
                  onChange={(e) => handleParameterChange('timeframe', e.target.value)}
                >
                  <MenuItem value="5m">5 Minutes</MenuItem>
                  <MenuItem value="15m">15 Minutes</MenuItem>
                  <MenuItem value="1h">1 Hour</MenuItem>
                  <MenuItem value="4h">4 Hours</MenuItem>
                  <MenuItem value="1d">1 Day</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Volume Condition</InputLabel>
                <Select
                  value={parameters.volumeCondition}
                  label="Volume Condition"
                  onChange={(e) => handleParameterChange('volumeCondition', e.target.value)}
                >
                  <MenuItem value="above_average">Above Average</MenuItem>
                  <MenuItem value="double_average">Double Average</MenuItem>
                  <MenuItem value="triple_average">Triple Average</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Stop Loss"
                type="number"
                value={parameters.riskManagement.stopLoss}
                onChange={(e) => handleRiskManagementChange('stopLoss', Number(e.target.value))}
                InputProps={{
                  endAdornment: <Typography>%</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Take Profit"
                type="number"
                value={parameters.riskManagement.takeProfit}
                onChange={(e) => handleRiskManagementChange('takeProfit', Number(e.target.value))}
                InputProps={{
                  endAdornment: <Typography>%</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Position Size"
                type="number"
                value={parameters.riskManagement.positionSize}
                onChange={(e) => handleRiskManagementChange('positionSize', Number(e.target.value))}
                InputProps={{
                  endAdornment: <Typography>%</Typography>
                }}
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Instant Stablecoin Swap Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Configure automatic profit-taking through instant stablecoin swaps. This feature allows you to
                  automatically convert trading profits to stablecoins for immediate liquidity.
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Enable Instant Swap</InputLabel>
                      <Select<string>
                        value={parameters.instantSwap.enabled ? 'true' : 'false'}
                        label="Enable Instant Swap"
                        onChange={(e) => handleParameterChange('instantSwap', {
                          ...parameters.instantSwap,
                          enabled: e.target.value
                        })}
                      >
                        <MenuItem value="true">Enabled</MenuItem>
                        <MenuItem value="false">Disabled</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {parameters.instantSwap.enabled && (
                    <>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Stablecoin</InputLabel>
                          <Select
                            value={parameters.instantSwap.stablecoin}
                            label="Stablecoin"
                            onChange={(e) => handleParameterChange('instantSwap', {
                              ...parameters.instantSwap,
                              stablecoin: e.target.value
                            })}
                          >
                            <MenuItem value="USDC">USDC</MenuItem>
                            <MenuItem value="USDT">USDT</MenuItem>
                            <MenuItem value="DAI">DAI</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Minimum Profit Threshold"
                          type="number"
                          value={parameters.instantSwap.minProfitThreshold}
                          onChange={(e) => handleParameterChange('instantSwap', {
                            ...parameters.instantSwap,
                            minProfitThreshold: Number(e.target.value)
                          })}
                          InputProps={{
                            endAdornment: <Typography>%</Typography>
                          }}
                          helperText="Minimum profit percentage to trigger swap"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Auto-Compound Profits</InputLabel>
                          <Select<string>
                            value={parameters.instantSwap.autoCompound ? 'true' : 'false'}
                            label="Auto-Compound Profits"
                            onChange={(e) => handleParameterChange('instantSwap', {
                              ...parameters.instantSwap,
                              autoCompound: e.target.value
                            })}
                          >
                            <MenuItem value="true">Enabled</MenuItem>
                            <MenuItem value="false">Disabled</MenuItem>
                          </Select>
                        </FormControl>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          When enabled, stablecoin profits will be automatically reinvested into the strategy
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Strategy Review & Generation
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    Select a Proven Strategy (Optional)
                  </Typography>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Proven Strategy</InputLabel>
                    <Select
                      value={selectedProvenStrategy}
                      label="Proven Strategy"
                      onChange={(e) => handleProvenStrategySelect(e.target.value)}
                    >
                      <MenuItem value="">
                        <em>None (Custom Strategy)</em>
                      </MenuItem>
                      {provenStrategies
                        .filter(strategy => strategy.baseParameters.coin === parameters.coin)
                        .map((strategy) => (
                          <MenuItem key={strategy.id} value={strategy.id}>
                            {strategy.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>

                  {selectedProvenStrategy && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        {provenStrategies.find(s => s.id === selectedProvenStrategy)?.description}
                      </Typography>
                    </Box>
                  )}

                  {parameters.coin && provenStrategies.filter(s => s.baseParameters.coin === parameters.coin).length === 0 && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      No proven strategies available for {parameters.coin}. You can create a custom strategy instead.
                    </Alert>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    Custom Modifications
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Add your own modifications or preferences to the strategy. For example:
                    "I want to be more conservative with stop losses" or "I prefer to enter on higher volume"
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={customModifications}
                    onChange={(e) => setCustomModifications(e.target.value)}
                    placeholder="Enter your custom modifications here..."
                    variant="outlined"
                  />
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    LLM/RAG Input Preview
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    This is the exact string that will be sent to the LLM/RAG system for strategy generation:
                  </Typography>
                  <Card 
                    sx={{ 
                      mb: 3,
                      background: '#f5f5f5',
                      '& pre': {
                        margin: 0,
                        padding: 2,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        lineHeight: 1.5,
                      }
                    }}
                  >
                    <CardContent>
                      <pre>{generateStrategyString()}</pre>
                    </CardContent>
                  </Card>
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}
                  <Button
                    variant="contained"
                    onClick={handleGenerateStrategy}
                    disabled={loading}
                    sx={{ mr: 2 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Generate Strategy'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/backtest')}
                    disabled={!llmResponse}
                  >
                    Proceed to Backtest
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      case 5:
        return (
          <Box>
            {/* Success Header with Animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Box
                sx={{
                  textAlign: 'center',
                  mb: 4,
                  p: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 3,
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                  }}
                />
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold', 
                    mb: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  🎉 Strategy Generated Successfully!
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Your AI-powered {parameters.coin} trading strategy is ready
                </Typography>
              </Box>
            </motion.div>

            {/* Strategy Content with Beautiful Styling */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Paper
                elevation={6}
                sx={{
                  mb: 4,
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                }}
              >
                {/* Strategy Header */}
                <Box
                  sx={{
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    p: 3,
                    color: 'white'
                  }}
                >
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px'
                        }}
                      >
                        🧠
                      </Box>
                    </Grid>
                    <Grid item xs>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        AI-Generated Trading Strategy
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        {parameters.coin} • {parameters.strategyType} • {parameters.timeframe}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Strategy Content */}
                <Box sx={{ p: 4 }}>
                  <Box
                    sx={{
                      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                      borderRadius: 3,
                      p: 3,
                      border: '2px solid #e3e8f0',
                      '& pre': {
                        margin: 0,
                        padding: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
                        fontSize: '0.95rem',
                        lineHeight: 1.6,
                        color: '#2d3748',
                        background: 'transparent'
                      }
                    }}
                  >
                    <pre>{llmResponse?.message}</pre>
                  </Box>
                </Box>
              </Paper>
            </motion.div>

            {/* Action Buttons with Enhanced Styling */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/backtest')}
                  disabled={!llmResponse}
                  sx={{
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                      boxShadow: '0 6px 25px rgba(102, 126, 234, 0.6)',
                    }
                  }}
                >
                  🚀 Start Backtesting
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => {
                    navigator.clipboard.writeText(llmResponse?.message || '');
                    // You could add a toast notification here
                  }}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    borderColor: '#667eea',
                    color: '#667eea',
                    '&:hover': {
                      borderColor: '#5a6fd8',
                      background: 'rgba(102, 126, 234, 0.05)',
                    }
                  }}
                >
                  📋 Copy Strategy
                </Button>

                <Button
                  variant="text"
                  size="large"
                  onClick={() => setActiveStep(0)}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    color: '#6b7280',
                    border: '2px solid #d1d5db',
                    '&:hover': {
                      background: 'rgba(107, 114, 128, 0.1)',
                      borderColor: '#9ca3af',
                    }
                  }}
                >
                  🔄 Create New Strategy
                </Button>
              </Box>
            </motion.div>

            {/* Additional Info Cards */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Grid container spacing={3} sx={{ mt: 4 }}>
                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      borderRadius: 3
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                      Risk Level
                    </Typography>
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      📊
                    </Typography>
                    <Typography variant="body1">
                      {parameters.riskManagement.stopLoss}% Stop Loss
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                      color: 'white',
                      borderRadius: 3
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                      Target Profit
                    </Typography>
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      💰
                    </Typography>
                    <Typography variant="body1">
                      {parameters.riskManagement.takeProfit}% Take Profit
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      borderRadius: 3
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                      Timeframe
                    </Typography>
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      ⏰
                    </Typography>
                    <Typography variant="body1">
                      {parameters.timeframe}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </motion.div>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontFamily: '"Noto Sans KR", sans-serif',
              fontWeight: 700,
              color: 'primary.main',
            }}
          >
            Strategy Builder
          </Typography>

          {/* Add Test API Button */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={testApiConnection}
              disabled={apiTesting}
              size="large"
              sx={{ fontWeight: 'bold', px: 4 }}
            >
              {apiTesting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Testing...
                </>
              ) : (
                '🧪 Test Gemini API'
              )}
            </Button>
          </Box>

          {/* API Test Result */}
          {apiTestResult && (
            <Alert 
              severity={apiTestResult.includes('✅') ? 'success' : 'error'} 
              sx={{ mb: 3 }}
              onClose={() => setApiTestResult(null)}
            >
              {apiTestResult}
            </Alert>
          )}

          {parameters.coin && (
            <SentimentAnalysis asset={parameters.coin} />
          )}

          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Back
              </Button>
              {activeStep < steps.length - 1 && (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={loading}
                >
                  Next
                </Button>
              )}
            </Box>
          </Paper>
        </Box>
      </motion.div>
    </Container>
  );
};

export default StrategyBuilder; 