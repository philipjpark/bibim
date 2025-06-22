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
import WalletConnect from './WalletConnect';
import bibimLogo from '../assets/images/bibim.png';

const Navbar: React.FC = () => {
  const theme = useTheme();

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
              Dashboard
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
              Strategy Builder
            </Button>
            
            {/* Divider between nav items and wallet */}
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
            
            {/* Wallet Connect */}
            <WalletConnect />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 