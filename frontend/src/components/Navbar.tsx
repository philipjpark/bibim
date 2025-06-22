import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  useTheme,
  Divider,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import TranslationButton from './TranslationButton';
import { useTranslation } from '../contexts/TranslationContext';
import bibimLogo from '../assets/images/bibim.png';

const Navbar: React.FC = () => {
  const theme = useTheme();
  const { translateSync } = useTranslation();

  return (
    <AppBar 
      position="static"
      sx={{
        background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
        boxShadow: 'none'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontFamily: '"Noto Sans KR", sans-serif',
              fontWeight: 700,
            }}
          >
          Bibim 🥘
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              component={RouterLink}
              to="/dashboard"
              color="inherit"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {translateSync('Dashboard')}
            </Button>
            <Button
              component={RouterLink}
              to="/strategy-builder"
              color="inherit"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {translateSync('Strategy Builder')}
            </Button>
            <Button
              component={RouterLink}
              to="/backtest"
              color="inherit"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {translateSync('Backtest')}
            </Button>
            <Button
              component={RouterLink}
              to="/crypto-glossary"
              color="inherit"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {translateSync('Crypto Guide')}
            </Button>
            <Button
              component={RouterLink}
              to="/research-corpus"
              color="inherit"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {translateSync('Research Corpus Manager')}
            </Button>
            
            {/* Divider between nav items and translation button */}
            <Divider 
              orientation="vertical" 
              flexItem 
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                mx: 1,
                height: '24px',
                alignSelf: 'center'
              }} 
            />
            
            {/* Translation Button */}
            <Box 
              sx={{ 
                ml: 1,
                '& .MuiChip-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  },
                  '& .MuiChip-icon': {
                    color: 'white',
                  }
                },
                '& .MuiMenu-paper': {
                  backgroundColor: 'white',
                  '& .MuiMenuItem-root': {
                    color: theme.palette.text.primary,
                  }
                }
              }}
            >
              <TranslationButton 
                variant="chip" 
                size="small"
                showLanguageName={false}
                showFlag={true}
              />
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 