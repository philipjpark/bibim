import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Box, Typography, Chip, Button } from '@mui/material';
import { motion } from 'framer-motion';

const WalletConnect: React.FC = () => {
  const { publicKey, connected } = useWallet();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {connected ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label="Connected" 
              color="success" 
              size="small"
              sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}
            />
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: '"Noto Sans KR", sans-serif',
                color: 'text.secondary'
              }}
            >
              {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
            </Typography>
          </Box>
        </motion.div>
      ) : (
        <Button
          variant="contained"
          sx={{
            borderRadius: '20px',
            fontFamily: '"Noto Sans KR", sans-serif',
            fontWeight: 600,
            padding: '8px 16px',
            '&:hover': {
              transform: 'translateY(-2px)'
            }
          }}
          onClick={() => {
            // Trigger wallet modal
            const walletButton = document.querySelector('.wallet-adapter-button');
            if (walletButton) {
              (walletButton as HTMLElement).click();
            }
          }}
        >
          Connect Wallet
        </Button>
      )}
    </Box>
  );
};

export default WalletConnect; 