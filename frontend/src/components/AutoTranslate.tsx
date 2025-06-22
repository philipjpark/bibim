import React, { useState, useEffect } from 'react';
import { CircularProgress, Skeleton, Typography } from '@mui/material';
import { useTranslation } from '../contexts/TranslationContext';

interface AutoTranslateProps {
  text: string;
  component?: React.ElementType;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  enableCache?: boolean;
  [key: string]: any; // For passing through other props to the component
}

const AutoTranslate: React.FC<AutoTranslateProps> = ({
  text,
  component: Component = Typography,
  fallback,
  loadingComponent,
  enableCache = true,
  ...otherProps
}) => {
  const { translate, translateSync, currentLanguage, isTranslating } = useTranslation();
  const [translatedText, setTranslatedText] = useState<string>(text);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const translateText = async () => {
      if (currentLanguage === 'en') {
        setTranslatedText(text);
        return;
      }

      // Try synchronous translation first (cache/static)
      const syncTranslation = translateSync(text);
      if (syncTranslation !== text) {
        setTranslatedText(syncTranslation);
        return;
      }

      // If no cached translation, use API
      setIsLoading(true);
      setError(null);
      
      try {
        const apiTranslation = await translate(text);
        setTranslatedText(apiTranslation);
      } catch (err) {
        setError('Translation failed');
        setTranslatedText(text); // Fallback to original text
      } finally {
        setIsLoading(false);
      }
    };

    translateText();
  }, [text, currentLanguage, translate, translateSync]);

  if (error && fallback) {
    return <>{fallback}</>;
  }

  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    
    // Default loading component based on the target component
    if (Component === Typography) {
      return <Skeleton variant="text" width="80%" />;
    }
    
    return (
      <Component {...otherProps}>
        <CircularProgress size={16} sx={{ mr: 1 }} />
        {text}
      </Component>
    );
  }

  return (
    <Component {...otherProps}>
      {translatedText}
    </Component>
  );
};

export default AutoTranslate; 