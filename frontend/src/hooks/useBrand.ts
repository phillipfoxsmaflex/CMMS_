import {
  apiUrl,
  BrandRawConfig,
  brandRawConfig,
  customLogoPaths
} from '../config';
// License check removed - useSelector not needed anymore

const DEFAULT_WHITE_LOGO = '/static/images/logo/logo-white.png';
const DEFAULT_DARK_LOGO = '/static/images/logo/logo.png';
const CUSTOM_DARK_LOGO = `${apiUrl}images/custom-logo.png`;
const CUSTOM_WHITE_LOGO = `${apiUrl}images/custom-logo-white.png`;

interface BrandConfig extends BrandRawConfig {
  logo: { white: string; dark: string };
}
export function useBrand(): BrandConfig {
  const defaultBrand: Omit<BrandConfig, 'logo'> = {
    name: 'Maintenance Management System',
    shortName: 'MMS',
    website: '',
    mail: '',
    phone: '',
    addressStreet: '',
    addressCity: ''
  };
  // LICENSE CHECK REMOVED - Always allow custom branding
  
  // Determine logo URLs - no license check
  const getLogoUrl = (isWhite: boolean): string | null => {
    // Use custom logo paths if configured
    if (customLogoPaths) {
      return (isWhite ? customLogoPaths.white : customLogoPaths.dark) || (isWhite ? CUSTOM_WHITE_LOGO : CUSTOM_DARK_LOGO);
    }
    
    // Default logos
    return isWhite ? DEFAULT_WHITE_LOGO : DEFAULT_DARK_LOGO;
  };
  
  return {
    logo: {
      white: getLogoUrl(true),
      dark: getLogoUrl(false)
    },
    // Always use brand config if available
    ...(brandRawConfig ? brandRawConfig : defaultBrand)
  };
}
