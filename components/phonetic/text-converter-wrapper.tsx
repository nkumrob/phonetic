'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { TextConverter } from './text-converter';

interface TextConverterWrapperProps {
  showHistory?: boolean;
}

export function TextConverterWrapper({ showHistory = true }: TextConverterWrapperProps) {
  const pathname = usePathname();
  const [key, setKey] = useState(0);

  useEffect(() => {
    // Force component remount on pathname change
    setKey(prev => prev + 1);
  }, [pathname]);

  useEffect(() => {
    // Listen for custom clear event
    const handleClear = () => {
      setKey(prev => prev + 1);
    };

    window.addEventListener('clear-text-converters', handleClear);
    return () => {
      window.removeEventListener('clear-text-converters', handleClear);
    };
  }, []);

  // Force new instance on each mount
  return <TextConverter key={key} showHistory={showHistory} />;
}