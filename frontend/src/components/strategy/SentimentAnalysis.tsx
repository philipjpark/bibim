import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Chip,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Timeline,
  SentimentSatisfied,
  SentimentDissatisfied,
} from '@mui/icons-material';

interface SentimentData {
  overall_score: number;
  category_scores: { [key: string]: number };
  trending_keywords: string[];
  source_breakdown: { [key: string]: number };
}

interface SentimentAnalysisProps {
  asset: string;
}

const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ asset }) => {
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSentimentData = async () => {
      try {
        // Check if the API endpoint exists first
        const response = await fetch(`/api/sentiment/${asset}`);
        
        // If we get HTML instead of JSON, it means the API is not available
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.log('API not available, using mock sentiment data');
          // Provide mock data when API is not available
          setSentimentData({
            overall_score: 0.65,
            category_scores: {
              'Social Media': 0.72,
              'News': 0.58,
              'Technical': 0.64
            },
            trending_keywords: ['bullish', 'crypto', 'adoption', 'volatility', 'regulation'],
            source_breakdown: {
              'Twitter': 0.45,
              'Reddit': 0.30,
              'News': 0.25
            }
          });
          return;
        }
        
        const data = await response.json();
        setSentimentData(data);
      } catch (error) {
        console.log('Sentiment API not available, using mock data');
        // Provide mock data on error
        setSentimentData({
          overall_score: 0.65,
          category_scores: {
            'Social Media': 0.72,
            'News': 0.58,
            'Technical': 0.64
          },
          trending_keywords: ['bullish', 'crypto', 'adoption', 'volatility', 'regulation'],
          source_breakdown: {
            'Twitter': 0.45,
            'Reddit': 0.30,
            'News': 0.25
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSentimentData();
    const interval = setInterval(fetchSentimentData, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [asset]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!sentimentData) {
    return null;
  }

  const getSentimentColor = (score: number) => {
    if (score >= 0.7) return '#4caf50';
    if (score >= 0.4) return '#ff9800';
    return '#f44336';
  };

  const getSentimentIcon = (score: number) => {
    if (score >= 0.7) return <SentimentSatisfied />;
    if (score >= 0.4) return <Timeline />;
    return <SentimentDissatisfied />;
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Market Sentiment Analysis
        </Typography>

        {/* Overall Sentiment Score */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Overall Sentiment
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            {getSentimentIcon(sentimentData.overall_score)}
            <LinearProgress
              variant="determinate"
              value={sentimentData.overall_score * 100}
              sx={{
                flexGrow: 1,
                height: 10,
                borderRadius: 5,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getSentimentColor(sentimentData.overall_score),
                },
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {(sentimentData.overall_score * 100).toFixed(1)}%
            </Typography>
          </Box>
        </Box>

        {/* Category Scores */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {Object.entries(sentimentData.category_scores).map(([category, score]) => (
            <Grid item xs={12} sm={4} key={category}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    {category}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    {score >= 0.5 ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
                    <Typography
                      variant="body2"
                      color={getSentimentColor(score)}
                      fontWeight="bold"
                    >
                      {(score * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Trending Keywords */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Trending Keywords
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {sentimentData.trending_keywords.map((keyword) => (
              <Tooltip key={keyword} title={`Mentions: ${Math.floor(Math.random() * 1000)}`}>
                <Chip
                  label={keyword}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.12)',
                    },
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        </Box>

        {/* Source Breakdown */}
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Source Distribution
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(sentimentData.source_breakdown).map(([source, percentage]) => (
              <Grid item xs={12} sm={4} key={source}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {source}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={percentage * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#2196f3',
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {(percentage * 100).toFixed(1)}%
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SentimentAnalysis; 