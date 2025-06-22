# Translation System Setup Guide

This guide explains how to set up and use the free translation API system in your React application.

## 🌍 Supported Languages

- English (en) 🇺🇸
- Korean (ko) 🇰🇷  
- Japanese (ja) 🇯🇵
- Chinese (zh) 🇨🇳
- Spanish (es) 🇪🇸
- French (fr) 🇫🇷
- German (de) 🇩🇪

## 🔧 Setup Instructions

### 1. Install Dependencies

No additional packages are required! The system uses the built-in `fetch` API.

### 2. Environment Configuration (Optional)

Copy the example environment file:
```bash
cp .env.example .env
```

Add your API keys (all optional):
```env
# Google Translate API (500K characters/month free)
REACT_APP_GOOGLE_TRANSLATE_API_KEY=your_google_api_key

# LibreTranslate API Key (optional for public instance)
REACT_APP_LIBRETRANSLATE_API_KEY=your_libretranslate_key

# Custom LibreTranslate instance URL
REACT_APP_LIBRETRANSLATE_URL=https://libretranslate.de
```

### 3. Get API Keys (Optional)

#### Google Translate API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Cloud Translation API
4. Create credentials (API Key)
5. Add the key to your `.env` file

#### LibreTranslate
1. Visit [LibreTranslate.com](https://libretranslate.com/)
2. Sign up for an API key (optional, public instance works without key)
3. Add the key to your `.env` file

## 🚀 Usage Examples

### Basic Translation Button

```tsx
import TranslationButton from './components/TranslationButton';

// Different variants
<TranslationButton variant="button" />
<TranslationButton variant="chip" />
<TranslationButton variant="icon" />
```

### Auto-Translating Components

```tsx
import AutoTranslate from './components/AutoTranslate';

<AutoTranslate 
  text="Welcome to our platform!"
  component={Typography}
  variant="h4"
/>
```

### Manual Translation

```tsx
import { useTranslate } from './contexts/TranslationContext';

const MyComponent = () => {
  const { t, tAsync } = useTranslate();
  
  // Synchronous (cached/static)
  const title = t('Welcome to Bibim 🥘');
  
  // Asynchronous (API)
  const translateText = async () => {
    const result = await tAsync('Custom text to translate');
    console.log(result);
  };
};
```

### Translation Context

```tsx
import { useTranslation } from './contexts/TranslationContext';

const MyComponent = () => {
  const { 
    currentLanguage, 
    setLanguage, 
    translate, 
    translateSync,
    isTranslating,
    clearCache 
  } = useTranslation();
  
  // Change language
  setLanguage('ko');
  
  // Clear translation cache
  clearCache();
};
```

## 🔄 Translation Flow

1. **Static Translations**: Pre-defined translations for common UI elements (instant)
2. **Cache Check**: Previously translated text from cache (instant)
3. **API Fallback**: Multiple free APIs in order of preference:
   - Google Translate (if API key provided)
   - LibreTranslate (free public instance)
   - MyMemory (completely free, no key required)

## 📊 API Limits & Features

### MyMemory API
- ✅ **Free**: 1000 words/day
- ✅ **No API Key**: Works immediately
- ✅ **No Registration**: Just use it
- ⚠️ **Quality**: Good for basic translations

### LibreTranslate
- ✅ **Free**: Public instance available
- ✅ **Privacy**: Open source, privacy-focused
- ✅ **Self-hostable**: Unlimited usage if self-hosted
- ✅ **Quality**: Good translation quality

### Google Translate
- ✅ **Free Tier**: 500,000 characters/month
- ✅ **High Quality**: Best translation accuracy
- ❌ **API Key Required**: Need Google Cloud account
- ❌ **Usage Limits**: After free tier, paid usage

## 🎯 Best Practices

### 1. Use Static Translations for Common UI
```tsx
// Add to staticTranslations in TranslationContext.tsx
const staticTranslations = {
  ko: {
    'Save': '저장',
    'Cancel': '취소',
    'Loading...': '로딩 중...'
  }
};
```

### 2. Cache Management
```tsx
// Clear cache when needed
const { clearCache } = useTranslation();
clearCache(); // Clears both local and service cache
```

### 3. Error Handling
```tsx
<AutoTranslate 
  text="Some text"
  fallback={<span>Translation failed</span>}
  loadingComponent={<Skeleton />}
/>
```

### 4. Batch Translations
```tsx
import translationService from './services/translationService';

const texts = ['Hello', 'World', 'How are you?'];
const translations = await translationService.translateBatch(texts, 'ko');
```

## 🔍 Troubleshooting

### Translation Not Working
1. Check browser console for errors
2. Verify API keys in `.env` file
3. Check network connectivity
4. Try clearing translation cache

### API Rate Limits
1. MyMemory: 1000 words/day limit
2. LibreTranslate: May have rate limits on public instance
3. Google: 500K characters/month free

### CORS Issues
- MyMemory: No CORS issues
- LibreTranslate: Public instance allows CORS
- Google: Requires proper API key setup

## 🛠️ Development

### Adding New Languages
1. Add language code to `Language` type in `TranslationContext.tsx`
2. Add language name and flag to `TranslationButton.tsx`
3. Add static translations for common UI elements

### Adding New Translation Providers
1. Implement `TranslationProvider` interface in `translationService.ts`
2. Add provider to `TranslationService` constructor
3. Test with different languages

### Testing Translations
Use the `TranslationExample` component to test all features:
```tsx
import TranslationExample from './components/TranslationExample';

// Add to your routes for testing
<Route path="/translation-demo" element={<TranslationExample />} />
```

## 📝 Notes

- Translations are cached in memory and localStorage
- Static translations take priority over API translations
- System gracefully falls back to original text if all APIs fail
- Language preference is saved in localStorage
- All APIs are called client-side (no backend required) 