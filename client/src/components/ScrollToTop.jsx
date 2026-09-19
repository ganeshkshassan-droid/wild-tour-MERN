import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Global Route-Change Scroll Handler
 * 
 * Ensures that every route transition immediately resets the scroll
 * position to (0, 0) at the very top of the viewport.
 * 
 * Handles:
 * - React Router <Link> & <NavLink>
 * - Programmatic navigation via useNavigate()
 * - Navbar, Card, Footer, and Button navigations
 * - Browser forward/backward navigation
 * - Anchor hash scrolling when a valid target ID exists (#elementId)
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  // Set browser scrollRestoration to manual to prevent interference on push/pop
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useLayoutEffect(() => {
    // If a hash exists (e.g., #faq), attempt to scroll to the target element
    if (hash) {
      try {
        const targetElement = document.querySelector(hash);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      } catch (e) {
        // Fall back to top if selector was invalid
      }
    }

    // Immediately reset window, html, and body scroll offsets to 0
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });
    } catch (e) {
      window.scrollTo(0, 0);
    }

    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
      document.documentElement.scrollLeft = 0;
    }

    if (document.body) {
      document.body.scrollTop = 0;
      document.body.scrollLeft = 0;
    }
  }, [pathname, search, hash]);

  return null;
}
