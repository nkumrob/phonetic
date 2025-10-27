'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';

interface SenjaWidgetProps {
  className?: string;
}

// Extend Window interface to include iFrameResize
declare global {
  interface Window {
    iFrameResize?: (options: { log: boolean; checkOrigin: boolean }, selector: string) => void;
  }
}

export function SenjaWidget({ className = '' }: SenjaWidgetProps) {
  useEffect(() => {
    // Initialize iframe resizer after component mounts
    const initResizer = () => {
      if (typeof window !== 'undefined' && window.iFrameResize) {
        window.iFrameResize(
          { log: false, checkOrigin: false },
          '#senja-collector-iframe'
        );
      }
    };

    // Try to initialize immediately if script is already loaded
    initResizer();

    // Also try after a short delay to ensure script is loaded
    const timer = setTimeout(initResizer, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={className}>
      {/* Load iframe resizer script */}
      <Script
        src="https://widget.senja.io/js/iframeResizer.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          // Initialize after script loads
          if (typeof window !== 'undefined' && window.iFrameResize) {
            window.iFrameResize(
              { log: false, checkOrigin: false },
              '#senja-collector-iframe'
            );
          }
        }}
      />

      {/* Senja iframe */}
      <iframe
        id="senja-collector-iframe"
        src="https://senja.io/p/nato-phonetic/r/au1ERG?mode=embed&nostyle=true"
        allow="camera;microphone"
        title="Senja review form"
        style={{
          border: 'none',
          width: '100%',
          minHeight: '700px',
        }}
        scrolling="no"
      />
    </div>
  );
}

