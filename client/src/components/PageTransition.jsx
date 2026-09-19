import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Global Page Transition Wrapper
 * 
 * Provides a unified, hardware-accelerated entrance animation
 * for all routes across the application.
 */
export default function PageTransition({ children }) {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className="page-transition-wrapper animate-page-enter"
    >
      {children}
    </div>
  );
}
