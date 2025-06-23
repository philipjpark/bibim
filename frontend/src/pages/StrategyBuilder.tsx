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
import { strategyApi, llmApi } from '../services/api';
import SentimentAnalysis from '../components/strategy/SentimentAnalysis';
import TokenSelector from '../components/strategy/TokenSelector';
import TradingViewWidget from '../components/strategy/TradingViewWidget';
import BacktestResults from '../components/strategy/BacktestResults';
import TraditionalStrategySelector from '../components/strategy/TraditionalStrategySelector';
import StrategyStringBuilder from '../components/strategy/StrategyStringBuilder';
import PDFUploader from '../components/strategy/PDFUploader';
import geminiService from '../services/geminiService';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  PlayArrow as DeployIcon, 
  ContentCopy as ContentCopyIcon, 
  Code as CodeIcon
} from '@mui/icons-material';
import strategyService, { StrategyConfig } from '../services/strategyService';
import { SolanaToken } from '../services/solanaTokensService';
import { TraditionalStrategy } from '../services/traditionalFinanceStrategies';

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
    id: 'sol_momentum_v1',
    name: 'Solana Momentum V1',
    description: 'Momentum-based strategy that capitalizes on Solana\'s rapid price movements. Uses RSI and MACD for timing.',
    baseParameters: {
      coin: 'SOL',
      strategyType: 'momentum',
      breakoutCondition: 'price_increase',
      percentageIncrease: 5,
      timeframe: '15m',
      volumeCondition: 'above_average',
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
  }
];

const StrategyBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { connected, wallet } = useWallet();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [llmResponse, setLlmResponse] = useState<any>(null);
  
  // Add PDF research integration state
  const [pdfSummary, setPdfSummary] = useState<string | null>(null);
  const [storedPDF, setStoredPDF] = useState<File | null>(null);
  
  // Add skip functionality state
  const [skippedSteps, setSkippedSteps] = useState<Set<number>>(new Set());
  
  // Add traditional strategy state
  const [selectedTraditionalStrategy, setSelectedTraditionalStrategy] = useState<TraditionalStrategy | null>(null);
  const [sentimentAnalysis, setSentimentAnalysis] = useState<any>(null);
  const [modelType, setModelType] = useState<'gemini' | 'gpt' | 'claude'>('gemini');

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
  const [customModifications, setCustomModifications] = useState('');
  const [selectedToken, setSelectedToken] = useState<SolanaToken | null>(null);

  const steps = [
    'Select Token',
    'Foundational Strategy',
    'Market Sentiment',
    'Research Integration',
    'Define Parameters',
    'Risk Management',
    'Swap for Profit',
    'Strategy String',
    'Generated Strategy'
  ];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSkipStep = (stepIndex: number) => {
    setSkippedSteps(prev => {
      const newSet = new Set(prev);
      newSet.add(stepIndex);
      return newSet;
    });
    handleNext();
  };

  const handleUnskipStep = (stepIndex: number) => {
    setSkippedSteps(prev => {
      const newSet = new Set(prev);
      newSet.delete(stepIndex);
      return newSet;
    });
  };

  const isStepSkipped = (stepIndex: number) => skippedSteps.has(stepIndex);

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

  const handleTokenSelect = (token: SolanaToken) => {
    setSelectedToken(token);
    setParameters(prev => ({
      ...prev,
      coin: token.symbol
    }));
  };

  const handlePDFSummaryGenerated = (summary: string) => {
    setPdfSummary(summary);
  };

  const handlePDFStored = (file: File | null) => {
    setStoredPDF(file);
  };

  const handlePDFSkip = () => {
    handleSkipStep(3); // Skip the research integration step
  };

  const generateStrategyString = () => {
    // Build concatenated strategy string based on model type
    let strategyString = '';

    // Header based on model type
    switch (modelType) {
      case 'gemini':
        strategyString += `[CRYPTO TRADING STRATEGY GENERATION]

You are an expert crypto trading strategist with deep knowledge of traditional finance, technical analysis, and Solana ecosystem dynamics. Generate a comprehensive, actionable trading strategy based on the following inputs:

`;
        break;
      case 'gpt':
        strategyString += `[CRYPTO TRADING STRATEGY GENERATION]

You are a professional crypto trading advisor. Create a detailed trading strategy based on the provided information.

## Strategy Context
`;
        break;
      case 'claude':
        strategyString += `[CRYPTO TRADING STRATEGY GENERATION]

As an expert crypto trading strategist, I need you to analyze the following inputs and generate a comprehensive trading strategy.

## Input Analysis
`;
        break;
    }

    // Token Information (Step 0)
    if (!isStepSkipped(0) && selectedToken) {
      strategyString += `
## 1. ASSET SELECTION
Token: ${selectedToken.name} (${selectedToken.symbol})
Address: ${selectedToken.address}
Category: ${selectedToken.category}
Description: ${selectedToken.description}
Market Cap: ${selectedToken.marketCap ? `$${(selectedToken.marketCap / 1e6).toFixed(2)}M` : 'N/A'}
Price: ${selectedToken.price ? `$${selectedToken.price}` : 'N/A'}
Volume (24h): ${selectedToken.volume24h ? `$${(selectedToken.volume24h / 1e6).toFixed(2)}M` : 'N/A'}
`;
    }

    // Traditional Strategy Foundation (Step 1)
    if (!isStepSkipped(1) && selectedTraditionalStrategy) {
      strategyString += `
## 2. TRADITIONAL FINANCE STRATEGY FOUNDATION
Strategy: ${selectedTraditionalStrategy.name}
Category: ${selectedTraditionalStrategy.category}
Traditional Asset: ${selectedTraditionalStrategy.traditionalAsset}
Crypto Adaptation: ${selectedTraditionalStrategy.cryptoAdaptation}
Academic Basis: ${selectedTraditionalStrategy.academicBasis}
Complexity: ${selectedTraditionalStrategy.complexity}
Volatility: ${selectedTraditionalStrategy.volatility}

Key Indicators: ${selectedTraditionalStrategy.keyIndicators.join(', ')}

Entry Rules:
${selectedTraditionalStrategy.entryRules.map(rule => `- ${rule}`).join('\n')}

Exit Rules:
${selectedTraditionalStrategy.exitRules.map(rule => `- ${rule}`).join('\n')}

Risk Management:
- Stop Loss: ${selectedTraditionalStrategy.riskManagement.stopLoss}
- Take Profit: ${selectedTraditionalStrategy.riskManagement.takeProfit}
- Position Sizing: ${selectedTraditionalStrategy.riskManagement.positionSizing}
- Max Drawdown: ${selectedTraditionalStrategy.riskManagement.maxDrawdown}

Advantages: ${selectedTraditionalStrategy.advantages.join(', ')}
Disadvantages: ${selectedTraditionalStrategy.disadvantages.join(', ')}

Academic Papers:
${selectedTraditionalStrategy.papers.map(paper => `- ${paper}`).join('\n')}
`;
    }

    // Sentiment Analysis (Step 2)
    if (!isStepSkipped(2) && sentimentAnalysis) {
      strategyString += `
## 3. MARKET SENTIMENT ANALYSIS
Overall Sentiment: ${sentimentAnalysis.overallSentiment}
Sentiment Score: ${(sentimentAnalysis.sentimentScore * 100).toFixed(1)}%
Confidence: ${(sentimentAnalysis.confidence * 100).toFixed(1)}%

Trading Signal: ${sentimentAnalysis.tradingSignals.signal.toUpperCase()} (${sentimentAnalysis.tradingSignals.strength.toFixed(0)}% strength)
Reasoning: ${sentimentAnalysis.tradingSignals.reasoning}

Key Insights:
${sentimentAnalysis.keyInsights.map((insight: string) => `- ${insight}`).join('\n')}

Risk Factors:
${sentimentAnalysis.riskFactors.map((risk: string) => `- ${risk}`).join('\n')}
`;
    }

    // Research Integration (Step 3)
    if (!isStepSkipped(3) && pdfSummary) {
      strategyString += `
## 4. RESEARCH INTEGRATION
PDF Research Summary:
${pdfSummary}

Research Integration Notes:
- Research findings have been incorporated into strategy development
- Market context from research supports strategy direction
- Risk factors identified in research have been considered
`;
    }

    // Parameters (Step 4)
    if (!isStepSkipped(4)) {
      strategyString += `
## 5. STRATEGY PARAMETERS
Asset: ${parameters.coin}
Strategy Type: ${parameters.strategyType}
Breakout Condition: ${parameters.breakoutCondition}
Percentage Increase: ${parameters.percentageIncrease}%
Timeframe: ${parameters.timeframe}
Volume Condition: ${parameters.volumeCondition}
`;
    }

    // Risk Management (Step 5)
    if (!isStepSkipped(5)) {
      strategyString += `
## 6. RISK MANAGEMENT
Stop Loss: ${parameters.riskManagement.stopLoss}%
Take Profit: ${parameters.riskManagement.takeProfit}%
Position Size: ${parameters.riskManagement.positionSize}%
Risk-Reward Ratio: ${(parameters.riskManagement.takeProfit / parameters.riskManagement.stopLoss).toFixed(2)}:1
`;
    }

    // Instant Swap Settings (Step 6)
    if (!isStepSkipped(6)) {
      strategyString += `
## 7. INSTANT SWAP CONFIGURATION
Enabled: ${parameters.instantSwap.enabled ? 'Yes' : 'No'}
${parameters.instantSwap.enabled ? `
Stablecoin: ${parameters.instantSwap.stablecoin}
Minimum Profit Threshold: ${parameters.instantSwap.minProfitThreshold}%
Auto-Compound: ${parameters.instantSwap.autoCompound ? 'Yes' : 'No'}
` : ''}
`;
    }

    // Custom Modifications
    if (customModifications) {
      strategyString += `
## 8. CUSTOM MODIFICATIONS
${customModifications}
`;
    }

    // Footer based on model type
    switch (modelType) {
      case 'gemini':
        strategyString += `
## INSTRUCTION
Please analyze this comprehensive strategy configuration and provide:
1. A detailed breakdown of the strategy logic and execution plan
2. Specific entry and exit criteria with technical indicators
3. Risk management implementation details
4. Market condition analysis and adaptation strategies
5. Performance expectations and monitoring metrics
6. Implementation timeline and execution steps
7. Stablecoin swap execution strategy and liquidity considerations
8. Backtesting recommendations and historical performance analysis

Format the response as a professional trading strategy document with clear sections and actionable insights.`;
        break;
      case 'gpt':
        strategyString += `
## INSTRUCTION
Based on the provided information, create a comprehensive trading strategy that includes:
1. Strategy overview and objectives
2. Entry and exit criteria
3. Risk management rules
4. Technical analysis framework
5. Performance monitoring plan
6. Implementation guidelines`;
        break;
      case 'claude':
        strategyString += `
## INSTRUCTION
Please provide a detailed analysis and strategy recommendation based on the inputs above. Include:
1. Strategy synthesis and key insights
2. Implementation framework
3. Risk assessment and mitigation
4. Performance expectations
5. Execution guidelines`;
        break;
    }

    return strategyString;
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

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{
                fontFamily: '"Noto Sans KR", sans-serif',
                fontWeight: 700,
                color: '#2d3748',
                mb: 2
              }}
            >
              Select Token for Strategy
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                mb: 3,
                fontFamily: '"Noto Sans KR", sans-serif',
                fontSize: '1rem',
                lineHeight: 1.6
              }}
            >
              Choose the token you want to build a strategy for. This will be the primary asset in your trading strategy.
            </Typography>
            <TokenSelector 
              selectedToken={selectedToken}
              onTokenSelect={handleTokenSelect}
            />
            {selectedToken && (
              <Alert 
                severity="success" 
                sx={{ 
                  mt: 2,
                  borderRadius: 2,
                  fontFamily: '"Noto Sans KR", sans-serif'
                }}
              >
                Selected: {selectedToken.name} ({selectedToken.symbol})
              </Alert>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{
                fontFamily: '"Noto Sans KR", sans-serif',
                fontWeight: 700,
                color: '#2d3748',
                mb: 2
              }}
            >
              Choose Foundational Strategy
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                mb: 3,
                fontFamily: '"Noto Sans KR", sans-serif',
                fontSize: '1rem',
                lineHeight: 1.6
              }}
            >
              Select a traditional finance strategy as the foundation for your crypto trading approach.
            </Typography>
            <TraditionalStrategySelector
              selectedStrategy={selectedTraditionalStrategy}
              onStrategySelect={setSelectedTraditionalStrategy}
            />
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => handleSkipStep(1)}
                sx={{ 
                  mr: 2,
                  fontFamily: '"Noto Sans KR", sans-serif',
                  fontWeight: 600,
                  borderRadius: 2
                }}
              >
                Skip Traditional Strategy
              </Button>
              {isStepSkipped(1) && (
                <Button
                  variant="text"
                  onClick={() => handleUnskipStep(1)}
                  sx={{
                    fontFamily: '"Noto Sans KR", sans-serif',
                    fontWeight: 600,
                    color: '#667eea'
                  }}
                >
                  Use Traditional Strategy
                </Button>
              )}
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{
                fontFamily: '"Noto Sans KR", sans-serif',
                fontWeight: 700,
                color: '#2d3748',
                mb: 2
              }}
            >
              Market Sentiment Analysis
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                mb: 3,
                fontFamily: '"Noto Sans KR", sans-serif',
                fontSize: '1rem',
                lineHeight: 1.6
              }}
            >
              Analyze current market sentiment for your selected token to inform strategy decisions.
            </Typography>
            <SentimentAnalysis
              asset={selectedToken?.symbol || 'SOL'}
            />
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => handleSkipStep(2)}
                sx={{ 
                  mr: 2,
                  fontFamily: '"Noto Sans KR", sans-serif',
                  fontWeight: 600,
                  borderRadius: 2
                }}
              >
                Skip Sentiment Analysis
              </Button>
              {isStepSkipped(2) && (
                <Button
                  variant="text"
                  onClick={() => handleUnskipStep(2)}
                  sx={{
                    fontFamily: '"Noto Sans KR", sans-serif',
                    fontWeight: 600,
                    color: '#667eea'
                  }}
                >
                  Include Sentiment Analysis
                </Button>
              )}
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{
                fontFamily: '"Noto Sans KR", sans-serif',
                fontWeight: 700,
                color: '#2d3748',
                mb: 2
              }}
            >
              Research Integration
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                mb: 3,
                fontFamily: '"Noto Sans KR", sans-serif',
                fontSize: '1rem',
                lineHeight: 1.6
              }}
            >
              Upload research documents to enhance your strategy with additional market insights.
            </Typography>
            <PDFUploader
              onPDFStored={handlePDFStored}
              storedPDF={storedPDF}
              onSkip={handlePDFSkip}
            />
            {pdfSummary && (
              <Alert 
                severity="success" 
                sx={{ 
                  mt: 2,
                  borderRadius: 2,
                  fontFamily: '"Noto Sans KR", sans-serif'
                }}
              >
                Research summary generated successfully!
              </Alert>
            )}
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{
                fontFamily: '"Noto Sans KR", sans-serif',
                fontWeight: 700,
                color: '#2d3748',
                mb: 2
              }}
            >
              Define Strategy Parameters
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                mb: 3,
                fontFamily: '"Noto Sans KR", sans-serif',
                fontSize: '1rem',
                lineHeight: 1.6
              }}
            >
              Configure the core parameters for your trading strategy.
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}>Strategy Type</InputLabel>
                  <Select
                    value={parameters.strategyType}
                    label="Strategy Type"
                    onChange={(e) => handleParameterChange('strategyType', e.target.value)}
                    sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}
                  >
                    <MenuItem value="breakout">Breakout Strategy</MenuItem>
                    <MenuItem value="trend">Trend Following</MenuItem>
                    <MenuItem value="mean_reversion">Mean Reversion</MenuItem>
                    <MenuItem value="momentum">Momentum</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}>Breakout Condition</InputLabel>
                  <Select
                    value={parameters.breakoutCondition}
                    label="Breakout Condition"
                    onChange={(e) => handleParameterChange('breakoutCondition', e.target.value)}
                    sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}
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
                    endAdornment: <Typography sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}>%</Typography>
                  }}
                  sx={{ 
                    '& .MuiInputLabel-root': { fontFamily: '"Noto Sans KR", sans-serif' },
                    '& .MuiInputBase-input': { fontFamily: '"Noto Sans KR", sans-serif' }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}>Timeframe</InputLabel>
                  <Select
                    value={parameters.timeframe}
                    label="Timeframe"
                    onChange={(e) => handleParameterChange('timeframe', e.target.value)}
                    sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}
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
                  <InputLabel sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}>Volume Condition</InputLabel>
                  <Select
                    value={parameters.volumeCondition}
                    label="Volume Condition"
                    onChange={(e) => handleParameterChange('volumeCondition', e.target.value)}
                    sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}
                  >
                    <MenuItem value="above_average">Above Average</MenuItem>
                    <MenuItem value="double_average">Double Average</MenuItem>
                    <MenuItem value="triple_average">Triple Average</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 5:
        return (
          <Box>
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{
                fontFamily: '"Noto Sans KR", sans-serif',
                fontWeight: 700,
                color: '#2d3748',
                mb: 2
              }}
            >
              Risk Management Configuration
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                mb: 3,
                fontFamily: '"Noto Sans KR", sans-serif',
                fontSize: '1rem',
                lineHeight: 1.6
              }}
            >
              Set up your risk management parameters to protect your capital.
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Stop Loss"
                  type="number"
                  value={parameters.riskManagement.stopLoss}
                  onChange={(e) => handleRiskManagementChange('stopLoss', Number(e.target.value))}
                  InputProps={{
                    endAdornment: <Typography sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}>%</Typography>
                  }}
                  sx={{ 
                    '& .MuiInputLabel-root': { fontFamily: '"Noto Sans KR", sans-serif' },
                    '& .MuiInputBase-input': { fontFamily: '"Noto Sans KR", sans-serif' }
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
                    endAdornment: <Typography sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}>%</Typography>
                  }}
                  sx={{ 
                    '& .MuiInputLabel-root': { fontFamily: '"Noto Sans KR", sans-serif' },
                    '& .MuiInputBase-input': { fontFamily: '"Noto Sans KR", sans-serif' }
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
                    endAdornment: <Typography sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}>%</Typography>
                  }}
                  sx={{ 
                    '& .MuiInputLabel-root': { fontFamily: '"Noto Sans KR", sans-serif' },
                    '& .MuiInputBase-input': { fontFamily: '"Noto Sans KR", sans-serif' }
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 6:
        return (
          <Box>
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{
                fontFamily: '"Noto Sans KR", sans-serif',
                fontWeight: 700,
                color: '#2d3748',
                mb: 2
              }}
            >
              Instant Stablecoin Swap Settings
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                mb: 3,
                fontFamily: '"Noto Sans KR", sans-serif',
                fontSize: '1rem',
                lineHeight: 1.6
              }}
            >
              Configure automatic profit-taking through instant stablecoin swaps for immediate liquidity.
            </Typography>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
                border: '1px solid rgba(102, 126, 234, 0.1)'
              }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}>Enable Instant Swap</InputLabel>
                    <Select<string>
                      value={parameters.instantSwap.enabled ? 'true' : 'false'}
                      label="Enable Instant Swap"
                      onChange={(e) => handleParameterChange('instantSwap', {
                        ...parameters.instantSwap,
                        enabled: e.target.value
                      })}
                      sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}
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
                        <InputLabel sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}>Stablecoin</InputLabel>
                        <Select
                          value={parameters.instantSwap.stablecoin}
                          label="Stablecoin"
                          onChange={(e) => handleParameterChange('instantSwap', {
                            ...parameters.instantSwap,
                            stablecoin: e.target.value
                          })}
                          sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}
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
                          endAdornment: <Typography sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}>%</Typography>
                        }}
                        helperText="Minimum profit percentage to trigger swap"
                        sx={{ 
                          '& .MuiInputLabel-root': { fontFamily: '"Noto Sans KR", sans-serif' },
                          '& .MuiInputBase-input': { fontFamily: '"Noto Sans KR", sans-serif' },
                          '& .MuiFormHelperText-root': { fontFamily: '"Noto Sans KR", sans-serif' }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}>Auto-Compound Profits</InputLabel>
                        <Select<string>
                          value={parameters.instantSwap.autoCompound ? 'true' : 'false'}
                          label="Auto-Compound Profits"
                          onChange={(e) => handleParameterChange('instantSwap', {
                            ...parameters.instantSwap,
                            autoCompound: e.target.value
                          })}
                          sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}
                        >
                          <MenuItem value="true">Enabled</MenuItem>
                          <MenuItem value="false">Disabled</MenuItem>
                        </Select>
                      </FormControl>
                      <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ 
                          mt: 1, 
                          display: 'block',
                          fontFamily: '"Noto Sans KR", sans-serif'
                        }}
                      >
                        When enabled, stablecoin profits will be automatically reinvested into the strategy
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
          </Box>
        );

      case 7:
        return (
          <Box>
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{
                fontFamily: '"Noto Sans KR", sans-serif',
                fontWeight: 700,
                color: '#2d3748',
                mb: 2
              }}
            >
              Strategy String Builder
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                mb: 3,
                fontFamily: '"Noto Sans KR", sans-serif',
                fontSize: '1rem',
                lineHeight: 1.6
              }}
            >
              Review and customize the strategy string that will be sent to the AI for strategy generation.
            </Typography>
            <StrategyStringBuilder
              selectedToken={selectedToken}
              selectedStrategy={selectedTraditionalStrategy}
              sentimentAnalysis={sentimentAnalysis}
              pdfSummary={pdfSummary}
              parameters={parameters}
              riskManagement={parameters.riskManagement}
              instantSwap={parameters.instantSwap}
              customModifications={customModifications}
              modelType={modelType}
              skippedSteps={skippedSteps}
            />
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleGenerateStrategy}
                disabled={loading}
                sx={{ 
                  mr: 2,
                  fontFamily: '"Noto Sans KR", sans-serif',
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)'
                  }
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Generating Strategy...
                  </>
                ) : (
                  'Generate Strategy'
                )}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/backtest')}
                disabled={!llmResponse}
                sx={{
                  fontFamily: '"Noto Sans KR", sans-serif',
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  borderColor: '#667eea',
                  color: '#667eea',
                  '&:hover': {
                    borderColor: '#5a6fd8',
                    background: 'rgba(102, 126, 234, 0.05)'
                  }
                }}
              >
                Proceed to Backtest
              </Button>
            </Box>
          </Box>
        );

      case 8:
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
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    fontFamily: '"Noto Sans KR", sans-serif'
                  }}
                >
                  🎉 Strategy Generated Successfully!
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    opacity: 0.9,
                    fontFamily: '"Noto Sans KR", sans-serif'
                  }}
                >
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
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 'bold', 
                          mb: 0.5,
                          fontFamily: '"Noto Sans KR", sans-serif'
                        }}
                      >
                        AI-Generated Trading Strategy
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          opacity: 0.9,
                          fontFamily: '"Noto Sans KR", sans-serif'
                        }}
                      >
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
                    fontFamily: '"Noto Sans KR", sans-serif',
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
                    fontFamily: '"Noto Sans KR", sans-serif',
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
                    fontFamily: '"Noto Sans KR", sans-serif',
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
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 1, 
                        fontWeight: 'bold',
                        fontFamily: '"Noto Sans KR", sans-serif'
                      }}
                    >
                      Risk Level
                    </Typography>
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      📊
                    </Typography>
                    <Typography 
                      variant="body1"
                      sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}
                    >
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
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 1, 
                        fontWeight: 'bold',
                        fontFamily: '"Noto Sans KR", sans-serif'
                      }}
                    >
                      Target Profit
                    </Typography>
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      💰
                    </Typography>
                    <Typography 
                      variant="body1"
                      sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}
                    >
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
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 1, 
                        fontWeight: 'bold',
                        fontFamily: '"Noto Sans KR", sans-serif'
                      }}
                    >
                      Timeframe
                    </Typography>
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      ⏰
                    </Typography>
                    <Typography 
                      variant="body1"
                      sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}
                    >
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
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              fontFamily: '"Noto Sans KR", sans-serif',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center',
              mb: 4
            }}
          >
            Strategy Builder
          </Typography>

          <Paper
            elevation={8}
            sx={{
              p: 4,
              borderRadius: 4,
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(102, 126, 234, 0.1)',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.1)',
              overflow: 'hidden'
            }}
          >
            {/* Stepper Container */}
            <Box sx={{ mb: 4, p: 3, background: 'rgba(102, 126, 234, 0.05)', borderRadius: 3 }}>
              <Stepper 
                activeStep={activeStep} 
                sx={{ 
                  '& .MuiStepLabel-root': {
                    '& .MuiStepLabel-label': {
                      fontFamily: '"Noto Sans KR", sans-serif',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      color: '#2d3748'
                    },
                    '& .MuiStepLabel-label.Mui-active': {
                      color: '#667eea',
                      fontWeight: 700
                    },
                    '& .MuiStepLabel-label.Mui-completed': {
                      color: '#38a169',
                      fontWeight: 600
                    }
                  },
                  '& .MuiStepIcon-root': {
                    fontSize: '1.5rem',
                    '&.Mui-active': {
                      color: '#667eea'
                    },
                    '&.Mui-completed': {
                      color: '#38a169'
                    }
                  }
                }}
              >
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: '"Noto Sans KR", sans-serif',
                          fontWeight: isStepSkipped(index) ? 400 : 600,
                          color: isStepSkipped(index) ? '#a0aec0' : 'inherit'
                        }}
                      >
                        {label}
                        {isStepSkipped(index) && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              display: 'block',
                              color: '#a0aec0',
                              fontStyle: 'italic'
                            }}
                          >
                            (Skipped)
                          </Typography>
                        )}
                      </Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  fontFamily: '"Noto Sans KR", sans-serif'
                }}
              >
                {error}
              </Alert>
            )}

            {/* Step Content */}
            <Box sx={{ 
              minHeight: '400px',
              p: 3,
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 3,
              border: '1px solid rgba(102, 126, 234, 0.1)'
            }}>
              {renderStepContent(activeStep)}
            </Box>

            {/* Navigation Buttons */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mt: 4,
              pt: 3,
              borderTop: '1px solid rgba(102, 126, 234, 0.1)'
            }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
                sx={{
                  fontFamily: '"Noto Sans KR", sans-serif',
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  borderColor: '#667eea',
                  color: '#667eea',
                  '&:hover': {
                    borderColor: '#5a6fd8',
                    background: 'rgba(102, 126, 234, 0.05)'
                  }
                }}
              >
                ← Back
              </Button>
              {activeStep < steps.length - 1 && (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={loading}
                  sx={{
                    fontFamily: '"Noto Sans KR", sans-serif',
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)'
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Generating...
                    </>
                  ) : (
                    'Next →'
                  )}
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