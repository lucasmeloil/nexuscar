import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * 
 * Automatically scrolls the window to the top whenever the route changes.
 * This provides a standard behavior expected in SPAs.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // We use a small delay relative to the transition/animation to ensure 
    // the scroll happens after the browser starts rendering the new view.
    // scrollTo(0, 0) is standard, but we can also use scrollTo({ top: 0, behavior: 'smooth' })
    // if a smooth transition is preferred.
    
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth' // 'auto' for instant, 'smooth' for smooth
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
