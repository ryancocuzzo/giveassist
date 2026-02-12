import { useState, useEffect } from 'react';

/**
 * Returns whether the viewport matches the given media query.
 * Use for responsive behavior that can't be done in pure CSS (e.g. conditional rendering).
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/** Shorthand hooks for common breakpoints */
export const useIsMobile = () => useMediaQuery('(max-width: 499px)');
export const useIsSmallScreen = () => useMediaQuery('(max-width: 699px)');
export const useIsMediumScreen = () => useMediaQuery('(max-width: 899px)');
export const useIsLargeScreen = () => useMediaQuery('(min-width: 1100px)');
