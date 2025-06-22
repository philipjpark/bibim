import React, { useState } from 'react';
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  Paper,
  TextField,
  Button,
  Alert,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Assessment as AssessmentIcon,
  Send as SendIcon,
  Code as CodeIcon,
  ContentCopy as ContentCopyIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from '../contexts/TranslationContext';
import geminiService, { StrategyAnalysis } from '../services/geminiService';

const StrategyBuilder: React.FC = () => {
  const { translateSync } = useTranslation();
  
  // Gemini API States
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<string | null>(null);
  const [generatedStrategy, setGeneratedStrategy] = useState<string>('');
  const [strategyAnalysis, setStrategyAnalysis] = useState<StrategyAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [backtestCode, setBacktestCode] = useState('');
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);

  // Add a state for debug overlay
  const [showDebugOverlay, setShowDebugOverlay] = useState(true);

  // DEBUG: Log when component loads (after state declarations)
  console.log('🚀🚀🚀 STRATEGY BUILDER COMPONENT IS LOADING! 🚀🚀🚀');
  console.log('🔍 If you see this message, the component is working!');
  console.log('📊 Current state:', { 
    userInput: userInput.length, 
    isLoading, 
    error,
    apiTestResult,
    generatedStrategy: generatedStrategy ? 'Generated' : 'None',
    currentTab: 0 
  });

  // Quick prompt suggestions
  const quickPrompts = [
    "Create a momentum-based strategy for SOL/USDC",
    "Design a DCA strategy with technical indicators", 
    "Build a mean reversion strategy for volatile altcoins",
    "Develop a breakout strategy for Bitcoin",
    "Create a grid trading strategy for sideways markets",
    "Design a multi-timeframe analysis strategy"
  ];
  
  const testApiConnection = async () => {
    console.log('🧪 TEST API BUTTON CLICKED!');
    setIsLoading(true);
    setError(null);
    setApiTestResult(null);
    
    try {
      console.log('🧪 Testing Gemini API connection...');
      const isWorking = await geminiService.testConnection();
      if (isWorking) {
        setApiTestResult('✅ API connection successful! Gemini is working correctly.');
      } else {
        setApiTestResult('❌ API connection failed. Check console for details.');
      }
    } catch (err) {
      console.error('API test error:', err);
      setApiTestResult(`❌ API test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateStrategy = async (prompt?: string) => {
    const inputText = prompt || userInput.trim();
    if (!inputText) return;

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🎯 Generating strategy for:', inputText);
      
      // Generate strategy
      const strategy = await geminiService.generateStrategy(inputText);
      console.log('✅ Strategy generated:', strategy);
      
      // Analyze strategy
      const analysis = await geminiService.analyzeStrategy(strategy);
      console.log('📊 Analysis complete:', analysis);
      
      setGeneratedStrategy(strategy);
      setStrategyAnalysis(analysis);
      setUserInput('');
      
    } catch (err) {
      console.error('❌ Strategy generation failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate strategy';
      setError(errorMessage);
      
      // Provide fallback strategy
      const fallbackStrategy = `
**Fallback Strategy: Simple Moving Average Crossover**

I'm having trouble connecting to the AI service, but here's a proven strategy:

**Strategy Overview:**
This classic trend-following strategy uses two moving averages to identify entry and exit points.

**Technical Setup:**
- Short MA: 20-period Simple Moving Average
- Long MA: 50-period Simple Moving Average  
- RSI: 14-period for confirmation

**Entry Rules:**
- Buy: 20-MA crosses above 50-MA AND RSI > 50
- Sell: 20-MA crosses below 50-MA OR RSI < 30

**Risk Management:**
- Position Size: 2-3% of portfolio per trade
- Stop Loss: 5% below entry
- Take Profit: 10% above entry (2:1 ratio)

**Expected Performance:**
- Win Rate: 45-55%
- Monthly Target: 5-15%
- Max Drawdown: <10%

**Error:** ${errorMessage}
      `;
      
      setGeneratedStrategy(fallbackStrategy);
      setStrategyAnalysis({
        strategy: "Simple MA Crossover (Fallback)",
        riskLevel: "Medium",
        timeframe: "1h",
        expectedReturn: "5-15% monthly",
        keyMetrics: ["Win Rate: 45-55%", "Risk-Reward: 1:2", "Max Drawdown: <10%"],
        implementation: [
          "Set up 20-period and 50-period moving averages",
          "Add RSI indicator for confirmation",
          "Define clear entry and exit rules",
          "Implement proper risk management"
        ],
        warnings: [
          "This is a fallback strategy due to API connection issues",
          "Always test strategies thoroughly before live trading",
          "Market conditions can significantly affect performance"
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateBacktestCode = async () => {
    if (!generatedStrategy) return;
    
    setIsLoading(true);
    try {
      const code = await geminiService.generateBacktestCode(generatedStrategy);
      setBacktestCode(code);
      setCodeDialogOpen(true);
    } catch (err) {
      setError('Failed to generate backtest code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'success';
      case 'Medium': return 'warning'; 
      case 'High': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: (theme) => `linear-gradient(135deg, 
          ${theme.palette.background.default} 0%, 
          ${theme.palette.primary.light} 100%)`,
        py: 4,
        position: 'relative'
      }}
    >
      {/* UNMISSABLE DEBUG OVERLAY */}
      {showDebugOverlay && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 0, 0, 0.9)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 3,
            color: 'white',
            textAlign: 'center'
          }}
          onClick={() => setShowDebugOverlay(false)}
        >
          <Typography variant="h2" sx={{ fontWeight: 'bold' }}>
            🚨 STRATEGY BUILDER LOADED! 🚨
          </Typography>
          <Typography variant="h4">
            Click anywhere to continue
          </Typography>
          <Typography variant="h6">
            If you see this, the component is working perfectly!
          </Typography>
        </Box>
      )}
      
      {/* SUPER OBVIOUS DEBUG BANNER - Cannot miss this! */}
      <Box sx={{ 
        bgcolor: 'red', 
        color: 'white', 
        p: 3, 
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        position: 'sticky',
        top: 0,
        zIndex: 9999,
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
      }}>
        🚨🚨🚨 NEW STRATEGY BUILDER IS WORKING! 🚨🚨🚨
        <br />
        If you can see this red banner, the component loaded successfully!
      </Box>
      
      <Container maxWidth="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography 
            variant="h3" 
            gutterBottom 
            sx={{ 
              fontFamily: '"Noto Sans KR", sans-serif',
              fontWeight: 700,
              color: 'primary.main',
              mb: 4,
              textAlign: 'center'
            }}
          >
            {translateSync('Strategy Builder 🥘')} - AI Powered
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {/* AI Strategy Generator Section */}
          <Grid item xs={12} lg={8}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: '20px' }}>
              {/* Header with Test Button */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  🤖 AI Strategy Generator
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={testApiConnection}
                  disabled={isLoading}
                  startIcon={<AssessmentIcon />}
                  sx={{ fontWeight: 'bold' }}
                >
                  🧪 Test Gemini API
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

              {/* Error Display */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {/* Quick Prompts */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Quick Strategy Ideas:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {quickPrompts.map((prompt, index) => (
                    <Chip
                      key={index}
                      label={prompt}
                      clickable
                      onClick={() => generateStrategy(prompt)}
                      sx={{ mb: 1 }}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>

              {/* Strategy Input */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  placeholder="Describe your trading strategy idea... (e.g., 'Create a momentum strategy for Bitcoin using RSI and MACD')"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => generateStrategy()}
                  disabled={isLoading || !userInput.trim()}
                  startIcon={isLoading ? <CircularProgress size={20} /> : <SendIcon />}
                  sx={{ minWidth: '200px' }}
                >
                  {isLoading ? 'Generating...' : 'Generate Strategy'}
                </Button>
              </Box>

              {/* Generated Strategy Display */}
              {generatedStrategy && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Generated Strategy
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            startIcon={<ContentCopyIcon />}
                            onClick={() => copyToClipboard(generatedStrategy)}
                          >
                            Copy
                          </Button>
                          <Button
                            size="small"
                            startIcon={<CodeIcon />}
                            onClick={generateBacktestCode}
                            disabled={isLoading}
                          >
                            Generate Code
                          </Button>
                        </Box>
                      </Box>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.6,
                          fontFamily: 'monospace',
                          fontSize: '0.9rem'
                        }}
                      >
                        {generatedStrategy}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </Paper>
          </Grid>

          {/* Strategy Analysis Section */}
          <Grid item xs={12} lg={4}>
            {strategyAnalysis ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Paper elevation={3} sx={{ p: 3, borderRadius: '20px' }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
                    📊 Strategy Analysis
                  </Typography>

                  {/* Strategy Overview */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                      Overview
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Chip 
                        label={strategyAnalysis.strategy} 
                        color="primary" 
                        icon={<TrendingUpIcon />}
                        size="small"
                      />
                      <Chip 
                        label={`Risk: ${strategyAnalysis.riskLevel}`} 
                        color={getRiskColor(strategyAnalysis.riskLevel) as any}
                        icon={<SecurityIcon />}
                        size="small"
                      />
                      <Chip 
                        label={strategyAnalysis.timeframe} 
                        color="secondary"
                        icon={<TimelineIcon />}
                        size="small"
                      />
                      <Chip 
                        label={strategyAnalysis.expectedReturn} 
                        color="success"
                        icon={<SpeedIcon />}
                        size="small"
                      />
                    </Box>
                  </Box>

                  {/* Key Metrics */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Key Metrics
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        {strategyAnalysis.keyMetrics.map((metric, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={metric} />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>

                  {/* Implementation */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Implementation Steps
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        {strategyAnalysis.implementation.map((step, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={`${index + 1}. ${step}`} />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>

                  {/* Warnings */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Important Warnings
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Alert severity="warning">
                        <List dense>
                          {strategyAnalysis.warnings.map((warning, index) => (
                            <ListItem key={index}>
                              <ListItemText primary={warning} />
                            </ListItem>
                          ))}
                        </List>
                      </Alert>
                    </AccordionDetails>
                  </Accordion>
                </Paper>
              </motion.div>
            ) : (
              <Paper elevation={3} sx={{ p: 3, borderRadius: '20px', textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  🎯 Generate a strategy to see analysis
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Use the AI generator on the left to create and analyze trading strategies
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>

        {/* Backtest Code Dialog */}
        <Dialog 
          open={codeDialogOpen} 
          onClose={() => setCodeDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            Generated Backtest Code
          </DialogTitle>
          <DialogContent>
            <Box sx={{ position: 'relative' }}>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: '16px', 
                borderRadius: '8px',
                overflow: 'auto',
                maxHeight: '400px',
                fontSize: '14px'
              }}>
                {backtestCode}
              </pre>
              <Button
                sx={{ position: 'absolute', top: 8, right: 8 }}
                startIcon={<ContentCopyIcon />}
                onClick={() => copyToClipboard(backtestCode)}
                size="small"
              >
                Copy
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCodeDialogOpen(false)}>
              Close
            </Button>
            <Button 
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => {
                const blob = new Blob([backtestCode], { type: 'text/python' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'strategy_backtest.py';
                a.click();
              }}
            >
              Download
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default StrategyBuilder; 