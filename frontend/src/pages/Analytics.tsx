import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const Analytics: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Analytics
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Analytics dashboard coming soon...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Analytics; 