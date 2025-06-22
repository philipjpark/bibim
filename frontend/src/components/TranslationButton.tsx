import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Chip,
  Box,
  Tooltip,
} from '@mui/material';
import {
  Translate as TranslateIcon,
  Language as LanguageIcon,
  Check as CheckIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useTranslation, Language } from '../contexts/TranslationContext';

const languageNames: Record<Language, string> = {
  en: 'English',
  ko: '한국어',
  ja: '日本語',
  zh: '中文',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
};

const languageFlags: Record<Language, string> = {
  en: '🇺🇸',
  ko: '🇰🇷',
  ja: '🇯🇵',
  zh: '🇨🇳',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
};

interface TranslationButtonProps {
  variant?: 'button' | 'chip' | 'icon';
  size?: 'small' | 'medium' | 'large';
  showLanguageName?: boolean;
  showFlag?: boolean;
}

const TranslationButton: React.FC<TranslationButtonProps> = ({
  variant = 'button',
  size = 'medium',
  showLanguageName = true,
  showFlag = true,
}) => {
  const { currentLanguage, setLanguage, isTranslating, clearCache } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageSelect = (language: Language) => {
    setLanguage(language);
    handleClose();
  };

  const handleClearCache = () => {
    clearCache();
    handleClose();
  };

  const getCurrentLanguageDisplay = () => {
    const flag = showFlag ? languageFlags[currentLanguage] : '';
    const name = showLanguageName ? languageNames[currentLanguage] : '';
    return `${flag} ${name}`.trim();
  };

  // Convert size for Chip component (only supports 'small' | 'medium')
  const getChipSize = (size: 'small' | 'medium' | 'large'): 'small' | 'medium' => {
    return size === 'large' ? 'medium' : size;
  };

  if (variant === 'chip') {
    return (
      <Box>
        <Chip
          icon={isTranslating ? <CircularProgress size={16} /> : <LanguageIcon />}
          label={getCurrentLanguageDisplay()}
          onClick={handleClick}
          size={getChipSize(size)}
          variant="outlined"
          color="primary"
        />
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          {Object.entries(languageNames).map(([code, name]) => (
            <MenuItem
              key={code}
              onClick={() => handleLanguageSelect(code as Language)}
              selected={currentLanguage === code}
            >
              <ListItemIcon>
                {currentLanguage === code ? <CheckIcon /> : <span>{languageFlags[code as Language]}</span>}
              </ListItemIcon>
              <ListItemText primary={name} />
            </MenuItem>
          ))}
          <MenuItem onClick={handleClearCache}>
            <ListItemIcon>
              <RefreshIcon />
            </ListItemIcon>
            <ListItemText primary="Clear Translation Cache" />
          </MenuItem>
        </Menu>
      </Box>
    );
  }

  if (variant === 'icon') {
    return (
      <Box>
        <Tooltip title={`Current: ${getCurrentLanguageDisplay()}`}>
          <Button
            onClick={handleClick}
            size={size}
            variant="outlined"
            sx={{ minWidth: 'auto', p: 1 }}
            disabled={isTranslating}
          >
            {isTranslating ? (
              <CircularProgress size={20} />
            ) : (
              <span style={{ fontSize: '1.2em' }}>{languageFlags[currentLanguage]}</span>
            )}
          </Button>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          {Object.entries(languageNames).map(([code, name]) => (
            <MenuItem
              key={code}
              onClick={() => handleLanguageSelect(code as Language)}
              selected={currentLanguage === code}
            >
              <ListItemIcon>
                {currentLanguage === code ? <CheckIcon /> : <span>{languageFlags[code as Language]}</span>}
              </ListItemIcon>
              <ListItemText primary={name} />
            </MenuItem>
          ))}
          <MenuItem onClick={handleClearCache}>
            <ListItemIcon>
              <RefreshIcon />
            </ListItemIcon>
            <ListItemText primary="Clear Translation Cache" />
          </MenuItem>
        </Menu>
      </Box>
    );
  }

  // Default button variant
  return (
    <Box>
      <Button
        onClick={handleClick}
        startIcon={isTranslating ? <CircularProgress size={16} /> : <TranslateIcon />}
        variant="outlined"
        size={size}
        disabled={isTranslating}
      >
        {getCurrentLanguageDisplay()}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        {Object.entries(languageNames).map(([code, name]) => (
          <MenuItem
            key={code}
            onClick={() => handleLanguageSelect(code as Language)}
            selected={currentLanguage === code}
          >
            <ListItemIcon>
              {currentLanguage === code ? <CheckIcon /> : <span>{languageFlags[code as Language]}</span>}
            </ListItemIcon>
            <ListItemText primary={name} />
          </MenuItem>
        ))}
        <MenuItem onClick={handleClearCache}>
          <ListItemIcon>
            <RefreshIcon />
          </ListItemIcon>
          <ListItemText primary="Clear Translation Cache" />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TranslationButton; 