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

    return () => observer.disconnect();
  }, []);

  return null;
}
