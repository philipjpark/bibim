import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from '../contexts/TranslationContext';
import ResearchCorpus from '../components/ResearchCorpus';

const ResearchCorpusPage: React.FC = () => {
  const { translateSync } = useTranslation();

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
          <Typography 
            variant="h3" 
            gutterBottom 
            sx={{ 
              fontFamily: '"Noto Sans KR", sans-serif',
              fontWeight: 700,
              color: 'primary.main',
              mb: 2
            }}
          >
            {translateSync('Research Corpus Manager')}
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'text.secondary',
              mb: 4
            }}
          >
            {translateSync('Organize your research materials, PDFs, URLs, and notes to build a comprehensive knowledge base for your trading strategies.')}
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ResearchCorpus />
        </motion.div>
      </Container>
    </Box>
  );
};

export default ResearchCorpusPage; 