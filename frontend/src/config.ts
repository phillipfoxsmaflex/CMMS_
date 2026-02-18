const getRuntimeValue = (
  key: string,
  defaultValue = ''
): string | undefined => {
  const envValue = process.env[`REACT_APP_${key}`];
  const runtimeValue = window.__RUNTIME_CONFIG__?.[key]?.trim();
  return envValue || runtimeValue || defaultValue;
};

export const firebaseConfig = {
  apiKey: getRuntimeValue('API_KEY'),
  authDomain: getRuntimeValue('AUTH_DOMAIN'),
  databaseURL: getRuntimeValue('DATABASE_URL'),
  projectId: getRuntimeValue('PROJECT_ID'),
  storageBucket: getRuntimeValue('STORAGE_BUCKET'),
  messagingSenderId: getRuntimeValue('MESSAGING_SENDER_ID'),
  appId: getRuntimeValue('ID'),
  measurementId: getRuntimeValue('MEASUREMENT_ID')
};

export const googleMapsConfig = {
  apiKey: getRuntimeValue('GOOGLE_KEY')
};

// Funktion zum sicheren Abrufen der API-URL mit Fallback
const getApiUrl = (): string => {
  // Versuchen Sie zuerst, die URL aus der Runtime-Konfiguration zu erhalten
  const runtimeApiUrl = window.__RUNTIME_CONFIG__?.API_URL?.trim();
  
  // Debugging: Geben Sie die gefundene URL aus
  console.log('API URL Debug:', {
    runtimeConfigAvailable: !!window.__RUNTIME_CONFIG__,
    runtimeApiUrl: runtimeApiUrl,
    envApiUrl: process.env.REACT_APP_API_URL,
    willUseRuntime: !!runtimeApiUrl
  });
  
  // Wenn Runtime-Konfiguration verfügbar ist, verwenden Sie diese
  if (runtimeApiUrl) {
    const finalUrl = runtimeApiUrl.endsWith('/') ? runtimeApiUrl : runtimeApiUrl + '/';
    console.log('Using Runtime API URL:', finalUrl);
    return finalUrl;
  }
  
  // Fallback auf Umgebungsvariable (für Entwicklung)
  const envApiUrl = process.env.REACT_APP_API_URL?.trim();
  if (envApiUrl) {
    const finalUrl = envApiUrl.endsWith('/') ? envApiUrl : envApiUrl + '/';
    console.log('Using Env API URL:', finalUrl);
    return finalUrl;
  }
  
  // Letzter Fallback für lokale Entwicklung
  console.log('Using Fallback API URL: http://localhost:8080/');
  return 'http://localhost:8080/';
};

// Exportieren Sie eine Funktion statt einer Konstante, um sicherzustellen, dass wir immer den aktuellen Wert erhalten
export const getCurrentApiUrl = (): string => {
  return getApiUrl();
};

// Exportieren Sie die aktuelle API-URL für Kompatibilität
export const apiUrl = getCurrentApiUrl();

export const muiLicense = getRuntimeValue('MUI_X_LICENSE');

export const zendeskKey = '';

export const googleTrackingId = getRuntimeValue('GOOGLE_TRACKING_ID');
export const oauth2Provider = getRuntimeValue('OAUTH2_PROVIDER') as
  | 'GOOGLE'
  | 'MICROSOFT';

export const isEmailVerificationEnabled =
  getRuntimeValue('INVITATION_VIA_EMAIL') === 'true';

export const isCloudVersion = getRuntimeValue('CLOUD_VERSION') === 'true';

const apiHostName = new URL(apiUrl).hostname;
export const IS_LOCALHOST =
  apiHostName === 'localhost' || apiHostName === '127.0.0.1';

export const isSSOEnabled = getRuntimeValue('ENABLE_SSO') === 'true';

export const customLogoPaths: { white?: string; dark: string } = (() => {
  const logoPaths = getRuntimeValue('LOGO_PATHS');
  try {
    return logoPaths ? JSON.parse(logoPaths) : null;
  } catch (e) {
    console.warn('Invalid LOGO_PATHS configuration, using default');
    return null;
  }
})();
type ThemeColors = {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  black: string;
  white: string;
  primaryAlt: string;
};

export const customColors: ThemeColors = getRuntimeValue('CUSTOM_COLORS')
  ? JSON.parse(getRuntimeValue('CUSTOM_COLORS'))
  : null;

export interface BrandRawConfig {
  name: string;
  shortName: string;
  website: string;
  mail: string;
  addressStreet: string;
  phone: string;
  addressCity: string;
}
export const brandRawConfig: BrandRawConfig = getRuntimeValue('BRAND_CONFIG')
  ? JSON.parse(getRuntimeValue('BRAND_CONFIG'))
  : null;

export const demoLink: string = getRuntimeValue('DEMO_LINK');

export const isWhiteLabeled: boolean = !!(customLogoPaths || brandRawConfig);

export const IS_ORIGINAL_CLOUD = !isWhiteLabeled && isCloudVersion;
