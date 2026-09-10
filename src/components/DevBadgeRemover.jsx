'use client';
import { useEffect } from 'react';

/**
 * DevBadgeRemover proactively removes any Next.js 15 dev overlay badge or indicator
 * from both the light DOM and Shadow DOM if present during local development.
 */
export default function DevBadgeRemover() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const selectors = [
      'nextjs-portal',
      '[data-nextjs-dev-tools-button]',
      '[data-nextjs-dev-tools]',
      '#nextjs-dev-indicator',
      '[data-nextjs-toast]',
      'button[aria-label*="Next.js"]',
    ];

    const removeBadges = () => {
      // 1. Check top-level document
      selectors.forEach((selector) => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach((el) => {
            el.remove();
          });
        } catch (_) {}
      });

      // 2. Check within all shadow roots
      try {
        const allElements = document.querySelectorAll('*');
        allElements.forEach((el) => {
          if (el.shadowRoot) {
            selectors.forEach((selector) => {
              try {
                const shadowEls = el.shadowRoot.querySelectorAll(selector);
                shadowEls.forEach((child) => child.remove());
              } catch (_) {}
            });
          }
        });
      } catch (_) {}
    };

    removeBadges();
    const observer = new MutationObserver(removeBadges);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    // Lock mobile layout zoom (prevent pinch-to-zoom and gesture zoom)
    const preventGesture = (e) => {
      e.preventDefault();
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    };

    let lastTouchEnd = 0;
    const handleTouchEnd = (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        // Double-tap zoom prevention
        if (e.target && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
          e.preventDefault();
        }
      }
      lastTouchEnd = now;
    };

    document.addEventListener('gesturestart', preventGesture, { passive: false });
    document.addEventListener('gesturechange', preventGesture, { passive: false });
    document.addEventListener('gestureend', preventGesture, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      observer.disconnect();
      document.removeEventListener('gesturestart', preventGesture);
      document.removeEventListener('gesturechange', preventGesture);
      document.removeEventListener('gestureend', preventGesture);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return null;
}
