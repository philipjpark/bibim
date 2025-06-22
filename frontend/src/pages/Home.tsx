import React from 'react';
import { Box, Typography, Button, Container, Grid, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import TokenLaunch from '../components/TokenLaunch';
import CryptoShakers from '../components/common/CryptoShakers';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero Section with Korean-inspired gradient */}
      <Box
        sx={{
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          background: (theme) => `linear-gradient(135deg, 
            ${theme.palette.primary.main} 0%, 
            ${theme.palette.secondary.main} 50%,
            ${theme.palette.primary.light} 100%)`,
          padding: '4rem 0',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("/patterns/korean-pattern.png")',
            opacity: 0.1,
            zIndex: 0,
          }
        }}
      >
        <Container sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography 
                    variant="h1" 
                    gutterBottom
                    sx={{
                      fontFamily: '"Noto Sans KR", sans-serif',
                      fontWeight: 700,
                      color: 'white',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                    }}
                  >
                    Welcome to Bibim 🥘
                  </Typography>
                </motion.div>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: 'white',
                    mb: 4,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                  }} 
                  paragraph
                >
                  Your friendly AI-powered crypto trading companion. Mix your perfect strategy like bibimbap (a Korean rice dish that's a mix of rice, vegetables, and meat).
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/strategy-builder')}
                  sx={{ 
                    mt: 2,
                    backgroundColor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.9)',
                    },
                    borderRadius: '30px',
                    padding: '12px 32px',
                    fontSize: '1.1rem'
                  }}
                >
                  Start Mixing Your Strategy
                </Button>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: 400,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: 4,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 2
                  }}
                >
                  <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                    Chef Trader's Prep Station
                  </Typography>
                  <CryptoShakers />
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 8 }}>
        <Typography 
          variant="h2" 
          align="center" 
          gutterBottom
          sx={{
            fontFamily: '"Noto Sans KR", sans-serif',
            fontWeight: 700,
            color: 'primary.main',
            mb: 6
          }}
        >
          Why Choose Bibim?
        </Typography>
        <Grid container spacing={4}>
          {[
            {
              title: 'AI-Powered Strategy Chef',
              description: 'Our AI chef helps you create and optimize your trading strategies with precision.',
              icon: <PsychologyIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
              color: '#FF6B6B'
            },
            {
              title: 'Market Data Kitchen',
              description: 'Access real-time market data and analytics to make informed decisions.',
              icon: <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
              color: '#4CAF50'
            },
            {
              title: 'Sentiment Analysis Spice',
              description: 'Add market sentiment analysis to your strategy for that extra flavor.',
              icon: <SentimentSatisfiedAltIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
              color: '#FFB74D'
            },
          ].map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                whileHover={{ y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    p: 4,
                    height: '100%',
                    borderRadius: '20px',
                    background: 'white',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: 2
                    }}
                  >
                    {feature.icon}
                    <Typography 
                      variant="h5" 
                      gutterBottom
                      sx={{
                        fontFamily: '"Noto Sans KR", sans-serif',
                        fontWeight: 600,
                        color: 'primary.main'
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{ lineHeight: 1.6 }}
                    >
                      {feature.description}
                    </Typography>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Token Launch Section */}
      <TokenLaunch />

      {/* Footer */}
      <Box
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          py: 4,
          mt: 8
        }}
      >
        <Container>
          <Typography 
            variant="body2" 
            align="center"
            sx={{ opacity: 0.8 }}
          >
            Created by: philxdaegu 
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 