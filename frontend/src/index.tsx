import ReactDOM from 'react-dom';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import ScrollTop from 'src/hooks/useScrollTop';

import 'nprogress/nprogress.css';
import { Provider } from 'react-redux';
import store from 'src/store';
import App from 'src/App';
import { SidebarProvider } from 'src/contexts/SidebarContext';
import { TitleProvider } from 'src/contexts/TitleContext';
import * as serviceWorker from 'src/serviceWorker';
import { CompanySettingsProvider } from 'src/contexts/CompanySettingsContext';
import { AuthProvider } from 'src/contexts/JWTAuthContext';
import { muiLicense, zendeskKey } from './config';
import { ZendeskProvider } from 'react-use-zendesk';
import { LicenseInfo } from '@mui/x-data-grid-pro';

// Polyfill for crypto.randomUUID for browser compatibility
// Note: This is a simplified version that only works if crypto.getRandomValues exists
// For browsers without crypto.getRandomValues, consider using a library like uuid

// Simple fallback for crypto.randomUUID that doesn't depend on complex operations
if (typeof window.crypto === 'undefined') {
  // Create a minimal crypto object if it doesn't exist
  // Use type assertion to avoid TypeScript errors
  console.log('Creating minimal crypto object');
  window.crypto = {
    getRandomValues: function(array) {
      // Simple fallback random number generator
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }
  } as any;
}

// Log the current state of crypto
console.log('Crypto availability check:', {
  hasCrypto: typeof window.crypto !== 'undefined',
  hasGetRandomValues: typeof window.crypto?.getRandomValues !== 'undefined',
  hasRandomUUID: typeof window.crypto?.randomUUID !== 'undefined',
  randomUUIDValue: window.crypto?.randomUUID
});

// Add randomUUID polyfill if it doesn't exist
if (!window.crypto.randomUUID) {
  // Store the original crypto object to prevent it from being overwritten
  const originalCrypto = window.crypto;
  
  window.crypto.randomUUID = function () {
    try {
      // Log when the polyfill is called to help debug browser extension issues
      console.log('crypto.randomUUID polyfill called');
      
      // Try the proper UUID v4 generation
      const bytes = new Uint8Array(16);
      originalCrypto.getRandomValues(bytes);
      
      // Set version (4) and variant (RFC 4122)
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      
      // Convert to hex string
      const hexParts = [];
      for (let i = 0; i < 16; i++) {
        hexParts.push(bytes[i].toString(16).padStart(2, '0'));
      }
      
      // Format as UUID: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuid = `${hexParts.slice(0, 4).join('')}-${hexParts.slice(4, 6).join('')}-${hexParts.slice(6, 8).join('')}-${hexParts.slice(8, 10).join('')}-${hexParts.slice(10).join('')}`;
      console.log('Generated UUID:', uuid);
      return uuid;
    } catch (error) {
      // Fallback to simple random ID if UUID generation fails
      console.warn('UUID generation failed, using fallback:', error);
      const fallbackId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      console.log('Generated fallback ID:', fallbackId);
      return fallbackId;
    }
  };
  
  console.log('Applied crypto.randomUUID polyfill');
  
  // Make the function read-only to prevent it from being overwritten
  Object.defineProperty(window.crypto, 'randomUUID', {
    value: window.crypto.randomUUID,
    writable: false,
    configurable: false,
    enumerable: true
  });
}

LicenseInfo.setLicenseKey(muiLicense);

ReactDOM.render(
  <HelmetProvider>
    <Provider store={store}>
      <SidebarProvider>
        <TitleProvider>
          <BrowserRouter>
            <ScrollTop />
            <ZendeskProvider apiKey={zendeskKey}>
              <AuthProvider>
                <App />
              </AuthProvider>
            </ZendeskProvider>
          </BrowserRouter>
        </TitleProvider>
      </SidebarProvider>
    </Provider>
  </HelmetProvider>,
  document.getElementById('root')
);

serviceWorker.unregister();
