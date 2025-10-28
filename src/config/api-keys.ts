/**
 * API Keys Configuration
 * Add your API keys to .env file
 */

export const API_KEYS = {
  // Mapbox for GPS/Map features
  MAPBOX_TOKEN: import.meta.env.VITE_MAPBOX_TOKEN || '',
  
  // Google Maps (alternative)
  GOOGLE_MAPS_KEY: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
  
  // Firebase (if needed)
  FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || '',
  
  // WhatsApp Business API (for OTP)
  WHATSAPP_API_KEY: import.meta.env.VITE_WHATSAPP_API_KEY || '',
};

/**
 * Check if required API keys are configured
 */
export function checkApiKeys() {
  const missing: string[] = [];
  
  if (!API_KEYS.MAPBOX_TOKEN) {
    console.warn('⚠️ MAPBOX_TOKEN not configured. GPS features may not work.');
    missing.push('MAPBOX_TOKEN');
  }
  
  return {
    isValid: missing.length === 0,
    missing,
  };
}

/**
 * Initialize API keys check on app start
 */
export function initializeApiKeys() {
  const { isValid, missing } = checkApiKeys();
  
  if (!isValid) {
    console.log(`
      🔑 Missing API Keys: ${missing.join(', ')}
      
      To enable all features, add these to your .env file:
      ${missing.map(key => `VITE_${key}=your_${key.toLowerCase()}_here`).join('\n      ')}
    `);
  }
  
  return isValid;
}
