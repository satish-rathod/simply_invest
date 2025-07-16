// Internationalization utility
import enTranslations from '../i18n/en.json';
import esTranslations from '../i18n/es.json';
import frTranslations from '../i18n/fr.json';

const translations = {
  en: enTranslations,
  es: esTranslations,
  fr: frTranslations
};

// Default language
let currentLanguage = 'en';

// Get saved language from localStorage
if (typeof window !== 'undefined') {
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage && translations[savedLanguage]) {
    currentLanguage = savedLanguage;
  } else {
    // Try to detect browser language
    const browserLanguage = navigator.language || navigator.userLanguage;
    const languageCode = browserLanguage.split('-')[0];
    if (translations[languageCode]) {
      currentLanguage = languageCode;
    }
  }
}

// Translation function
export const t = (key, interpolations = {}) => {
  try {
    const keys = key.split('.');
    let value = translations[currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && value[k] !== undefined) {
        value = value[k];
      } else {
        // Fallback to English if key not found
        value = translations['en'];
        for (const k2 of keys) {
          if (value && typeof value === 'object' && value[k2] !== undefined) {
            value = value[k2];
          } else {
            console.warn(`Translation key "${key}" not found in ${currentLanguage} or English`);
            return key;
          }
        }
        break;
      }
    }
    
    // Handle interpolations
    if (typeof value === 'string' && Object.keys(interpolations).length > 0) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return interpolations[key] !== undefined ? interpolations[key] : match;
      });
    }
    
    return value;
  } catch (error) {
    console.error('Translation error:', error);
    return key;
  }
};

// Get current language
export const getCurrentLanguage = () => currentLanguage;

// Set language
export const setLanguage = (language) => {
  if (translations[language]) {
    currentLanguage = language;
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language);
    }
    
    // Dispatch custom event for language change
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('languageChange', { detail: { language } }));
    }
    
    return true;
  }
  return false;
};

// Get available languages
export const getAvailableLanguages = () => {
  return Object.keys(translations).map(code => ({
    code,
    name: getLanguageName(code),
    nativeName: getNativeLanguageName(code)
  }));
};

// Get language name in English
export const getLanguageName = (code) => {
  const names = {
    en: 'English',
    es: 'Spanish',
    fr: 'French'
  };
  return names[code] || code;
};

// Get language name in native language
export const getNativeLanguageName = (code) => {
  const names = {
    en: 'English',
    es: 'Español',
    fr: 'Français'
  };
  return names[code] || code;
};

// Format currency based on language
export const formatCurrency = (amount, currency = 'USD') => {
  const locale = getLocaleFromLanguage(currentLanguage);
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    console.error('Currency formatting error:', error);
    return `${currency} ${amount.toFixed(2)}`;
  }
};

// Format number based on language
export const formatNumber = (number, options = {}) => {
  const locale = getLocaleFromLanguage(currentLanguage);
  
  try {
    return new Intl.NumberFormat(locale, options).format(number);
  } catch (error) {
    console.error('Number formatting error:', error);
    return number.toString();
  }
};

// Format date based on language
export const formatDate = (date, options = {}) => {
  const locale = getLocaleFromLanguage(currentLanguage);
  
  try {
    return new Intl.DateTimeFormat(locale, options).format(new Date(date));
  } catch (error) {
    console.error('Date formatting error:', error);
    return new Date(date).toLocaleDateString();
  }
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
  const locale = getLocaleFromLanguage(currentLanguage);
  
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    const now = new Date();
    const targetDate = new Date(date);
    const diffInSeconds = Math.floor((targetDate - now) / 1000);
    
    if (Math.abs(diffInSeconds) < 60) {
      return rtf.format(diffInSeconds, 'second');
    } else if (Math.abs(diffInSeconds) < 3600) {
      return rtf.format(Math.floor(diffInSeconds / 60), 'minute');
    } else if (Math.abs(diffInSeconds) < 86400) {
      return rtf.format(Math.floor(diffInSeconds / 3600), 'hour');
    } else if (Math.abs(diffInSeconds) < 2592000) {
      return rtf.format(Math.floor(diffInSeconds / 86400), 'day');
    } else if (Math.abs(diffInSeconds) < 31536000) {
      return rtf.format(Math.floor(diffInSeconds / 2592000), 'month');
    } else {
      return rtf.format(Math.floor(diffInSeconds / 31536000), 'year');
    }
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return formatDate(date, { dateStyle: 'medium' });
  }
};

// Get locale from language code
const getLocaleFromLanguage = (language) => {
  const locales = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR'
  };
  return locales[language] || 'en-US';
};

// Pluralization helper
export const pluralize = (key, count, interpolations = {}) => {
  const pluralKey = count === 1 ? key : `${key}_plural`;
  return t(pluralKey, { ...interpolations, count });
};

// RTL (Right-to-Left) support
export const isRTL = () => {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(currentLanguage);
};

// Get text direction
export const getTextDirection = () => {
  return isRTL() ? 'rtl' : 'ltr';
};

// React hook for translations
export const useTranslation = () => {
  const [, setForceUpdate] = React.useState({});
  
  React.useEffect(() => {
    const handleLanguageChange = () => {
      setForceUpdate({});
    };
    
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);
  
  return {
    t,
    currentLanguage,
    setLanguage,
    getAvailableLanguages,
    formatCurrency,
    formatNumber,
    formatDate,
    formatRelativeTime,
    pluralize,
    isRTL: isRTL(),
    textDirection: getTextDirection()
  };
};

// Default export
export default {
  t,
  getCurrentLanguage,
  setLanguage,
  getAvailableLanguages,
  formatCurrency,
  formatNumber,
  formatDate,
  formatRelativeTime,
  pluralize,
  isRTL,
  getTextDirection,
  useTranslation
};