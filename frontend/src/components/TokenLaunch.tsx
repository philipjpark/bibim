import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Button,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import TokenIcon from '@mui/icons-material/Token';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LaunchIcon from '@mui/icons-material/Launch';
import { useTranslation } from '../contexts/TranslationContext';

const TokenLaunch: React.FC = () => {
  const theme = useTheme();
  const { translateSync } = useTranslation();

  const tokenFeatures = [
    {
      icon: <TokenIcon sx={{ fontSize: 40 }} />,
      title: translateSync('Governance Rights'),
      description: translateSync('BBM token holders can participate in platform governance and strategy voting.')
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: translateSync('Strategy Access'),
      description: translateSync('Access to premium AI-powered trading strategies and backtesting tools.')
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      title: translateSync('Revenue Sharing'),
      description: translateSync('Earn a share of platform fees and strategy performance rewards.')
    }
  ];

  return (
    <Box
      sx={{
        py: 8,
        background: (theme) => `linear-gradient(135deg, 
          ${theme.palette.background.default} 0%, 
          ${theme.palette.secondary.light}15 100%)`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontFamily: '"Noto Sans KR", sans-serif',
                fontWeight: 700,
                color: 'primary.main',
                mb: 2
              }}
            >
              {translateSync('BBM Token Launch')}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'text.secondary',
                maxWidth: '800px',
                mx: 'auto',
                mb: 4
              }}
            >
              {translateSync('Join the future of AI-powered crypto trading with Bibim\'s native token')}
            </Typography>
          </Box>

          <Grid container spacing={4} sx={{ mb: 6 }}>
            {tokenFeatures.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      p: 3,
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <Box
                      sx={{
                        color: 'primary.main',
                        mb: 2,
                        p: 2,
                        borderRadius: '50%',
                        background: 'rgba(76, 175, 80, 0.1)'
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          <Box
            sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: 4,
              p: 4,
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
              {translateSync('Token Sale Details')}
            </Typography>
            <Grid container spacing={4} sx={{ mt: 2 }}>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>{translateSync('Total Supply')}</Typography>
                <Typography variant="h4" color="primary.main">1,000,000,000 BBM</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>{translateSync('Initial Price')}</Typography>
                <Typography variant="h4" color="primary.main">$0.10</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>{translateSync('Launch Date')}</Typography>
                <Typography variant="h4" color="primary.main">Q2 2026</Typography>
              </Grid>
            </Grid>
            <Button
              variant="contained"
              size="large"
              endIcon={<LaunchIcon />}
              sx={{
                mt: 4,
                px: 4,
                py: 1.5,
                borderRadius: 30,
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
                }
              }}
            >
              {translateSync('Join Waitlist')}
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default TokenLaunch; 