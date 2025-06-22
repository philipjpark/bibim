// Translation Service with multiple providers
interface TranslationProvider {
  translate(text: string, targetLang: string, sourceLang?: string): Promise<string>;
}

// Google Translate API implementation
class GoogleTranslateProvider implements TranslationProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async translate(text: string, targetLang: string, sourceLang: string = 'en'): Promise<string> {
    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: sourceLang,
            target: targetLang,
            format: 'text'
          })
        }
      );

      const data = await response.json();
      return data.data.translations[0].translatedText;
    } catch (error) {
      console.error('Google Translate error:', error);
      throw error;
    }
  }
}

// LibreTranslate (Free, self-hosted or public instance)
class LibreTranslateProvider implements TranslationProvider {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string = 'https://libretranslate.de', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async translate(text: string, targetLang: string, sourceLang: string = 'en'): Promise<string> {
    try {
      const body: any = {
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text'
      };

      if (this.apiKey) {
        body.api_key = this.apiKey;
      }

      const response = await fetch(`${this.baseUrl}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      return data.translatedText;
    } catch (error) {
      console.error('LibreTranslate error:', error);
      throw error;
    }
  }
}

// MyMemory Translation API (Free, no API key required)
class MyMemoryProvider implements TranslationProvider {
  async translate(text: string, targetLang: string, sourceLang: string = 'en'): Promise<string> {
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
      );

      const data = await response.json();
      return data.responseData.translatedText;
    } catch (error) {
      console.error('MyMemory error:', error);
      throw error;
    }
  }
}

// Translation Service Manager
class TranslationService {
  private providers: TranslationProvider[] = [];
  private cache: Map<string, string> = new Map();

  constructor() {
    // Initialize providers (you can add API keys via environment variables)
    if (process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY) {
      this.providers.push(new GoogleTranslateProvider(process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY));
    }
    
    // LibreTranslate (free public instance)
    this.providers.push(new LibreTranslateProvider());
    
    // MyMemory (completely free, no API key)
    this.providers.push(new MyMemoryProvider());
  }

  private getCacheKey(text: string, targetLang: string, sourceLang: string): string {
    return `${sourceLang}-${targetLang}-${text}`;
  }

  async translate(text: string, targetLang: string, sourceLang: string = 'en'): Promise<string> {
    // Check cache first
    const cacheKey = this.getCacheKey(text, targetLang, sourceLang);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Try providers in order
    for (const provider of this.providers) {
      try {
        const translation = await provider.translate(text, targetLang, sourceLang);
        
        // Cache the result
        this.cache.set(cacheKey, translation);
        
        return translation;
      } catch (error) {
        console.warn(`Provider failed, trying next:`, error);
        continue;
      }
    }

    // If all providers fail, return original text
    console.error('All translation providers failed');
    return text;
  }

  // Batch translation for better performance
  async translateBatch(texts: string[], targetLang: string, sourceLang: string = 'en'): Promise<string[]> {
    const promises = texts.map(text => this.translate(text, targetLang, sourceLang));
    return Promise.all(promises);
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
}

export const translationService = new TranslationService();
export default translationService; 