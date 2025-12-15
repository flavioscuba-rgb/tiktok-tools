/**
 * Extracts a clean TikTok video URL from a raw input string.
 * It handles the 'redirect_url' parameter often found in login redirects.
 */
export const cleanTikTokUrl = (rawInput: string): string | null => {
  if (!rawInput || rawInput.trim() === '') return null;

  try {
    const url = new URL(rawInput);
    
    // Check for redirect_url parameter (common in the scenario provided)
    const redirectUrl = url.searchParams.get('redirect_url');
    if (redirectUrl) {
      // Recursively clean in case the redirect URL is also wrapped (unlikely but safe)
      return decodeURIComponent(redirectUrl).split('?')[0]; 
    }

    // If it's a direct tiktok link, clean query params
    if (url.hostname.includes('tiktok.com')) {
      // TikTok video links usually look like: https://www.tiktok.com/@user/video/123456789
      // We want to keep the path but remove query params like ?lang=en&enter_method=...
      return `${url.origin}${url.pathname}`;
    }

    return rawInput;
  } catch (e) {
    // If invalid URL provided, return null or handle appropriately
    return null;
  }
};

/**
 * Validates if a string looks like a valid TikTok video URL
 */
export const isValidTikTokUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes('tiktok.com') && parsed.pathname.includes('/video/');
  } catch {
    return false;
  }
};
