import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  Divider,
} from '@mui/material';
import TranslationButton from './TranslationButton';
import AutoTranslate from './AutoTranslate';
import { useTranslate } from '../contexts/TranslationContext';

const TranslationExample: React.FC = () => {
  const { t, tAsync, currentLanguage, isTranslating } = useTranslate();
  const [customText, setCustomText] = useState('Hello, this is a custom text to translate!');
  const [translatedCustomText, setTranslatedCustomText] = useState('');

  const handleTranslateCustomText = async () => {
    try {
      const result = await tAsync(customText);
      setTranslatedCustomText(result);
    } catch (error) {
      console.error('Translation failed:', error);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Translation System Demo
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        This demo shows how to use the translation system with multiple free APIs.
        Current language: <strong>{currentLanguage}</strong>
      </Alert>

      <Grid container spacing={3}>
        {/* Translation Button Variants */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Translation Button Variants
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TranslationButton variant="button" />
              <TranslationButton variant="chip" />
              <TranslationButton variant="icon" />
            </Box>
          </Paper>
        </Grid>

        {/* Auto Translation Component */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Auto Translation Component
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              These texts are automatically translated when you change the language:
            </Typography>
            <Box sx={{ mt: 2 }}>
              <AutoTranslate 
                text="Welcome to our amazing crypto trading platform!"
                variant="h6"
                color="primary"
              />
              <AutoTranslate 
                text="Start building your trading strategies today."
                variant="body1"
                sx={{ mt: 1 }}
              />
              <AutoTranslate 
                text="Advanced AI-powered market analysis and risk management."
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Manual Translation */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Manual Translation
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Enter custom text and translate it manually:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Enter text to translate..."
              sx={{ mt: 1, mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={handleTranslateCustomText}
              disabled={isTranslating || !customText.trim()}
              sx={{ mb: 2 }}
            >
              {isTranslating ? 'Translating...' : 'Translate Text'}
            </Button>
            {translatedCustomText && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Translation Result:
                </Typography>
                <Typography variant="body1">
                  {translatedCustomText}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Synchronous Translation Examples */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Cached/Static Translations (Instant)
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              These use cached or pre-defined translations for instant results:
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">
                {t('Welcome to Bibim 🥘')}
              </Typography>
              <Typography variant="body1">
                {t('Strategy Builder 🥘')}
              </Typography>
              <Typography variant="body1">
                {t('Loading...')}
              </Typography>
              <Typography variant="body1">
                {t('Error')}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* API Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Translation APIs Used
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              1. MyMemory API (Free, No API Key Required)
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              • 1000 words/day free
              • No registration required
              • Good for basic translations
            </Typography>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              2. LibreTranslate (Free, Open Source)
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              • Free public instance available
              • Can self-host for unlimited usage
              • Privacy-focused
            </Typography>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              3. Google Translate API (Free Tier)
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              • 500,000 characters/month free
              • Requires API key
              • High quality translations
            </Typography>

            <Alert severity="warning" sx={{ mt: 2 }}>
              To use Google Translate API, add your API key to the .env file:
              <br />
              <code>REACT_APP_GOOGLE_TRANSLATE_API_KEY=your_key_here</code>
            </Alert>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TranslationExample; 