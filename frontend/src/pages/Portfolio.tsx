import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const Portfolio: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Portfolio
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Portfolio management coming soon...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Portfolio; 