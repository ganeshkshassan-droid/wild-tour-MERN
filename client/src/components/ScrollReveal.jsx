import React, { useEffect, useRef, useState } from 'react';

/**
 * Reusable Scroll Reveal Component
 * 
 * Smoothly reveals content/sections with GPU-accelerated fade & translate
 * when entering the viewport.
 */
export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  threshold = 0.08,
  as: Component = 'div',
  ...rest
}) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // If user prefers reduced motion, reveal immediately without transition
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true);
      return;
    }

    // If IntersectionObserver is not supported, reveal immediately
    if (typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.unobserve(node);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
    };
  }, [threshold]);

  const transitionDelayStyle = delay && !revealed ? { transitionDelay: `${delay}ms` } : delay ? { transitionDelay: `${delay}ms` } : undefined;

  return (
    <Component
      ref={ref}
      className={`reveal-section ${revealed ? 'revealed' : ''} ${className}`.trim()}
      style={transitionDelayStyle}
      {...rest}
    >
      {children}
    </Component>
  );
}
