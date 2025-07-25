'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* 404 in phonetic */}
        <div className="space-y-2">
          <h1 className="text-7xl sm:text-8xl lg:text-9xl font-black tracking-headlines text-coolBlue-500">404</h1>
          <p className="text-2xl sm:text-3xl font-bold tracking-largeText">
            Four - Zero - Four
          </p>
          <p className="text-base sm:text-lg text-secondary">
            Foxtrot Oscar Uniform Romeo - Zero - Foxtrot Oscar Uniform Romeo
          </p>
        </div>
        
        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black tracking-largeText">
            Page Not Found
          </h2>
          <p className="text-secondary">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button size="lg">
              Return Home
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
        
        {/* Helpful links */}
        <div className="pt-6 text-sm text-secondary">
          <p>Looking for something specific?</p>
          <div className="flex gap-4 justify-center mt-2">
            <Link href="/#alphabet" className="hover:text-coolBlue-500 transition-colors">
              Alphabet Grid
            </Link>
            <Link href="/#converter" className="hover:text-coolBlue-500 transition-colors">
              Text Converter
            </Link>
            <Link href="/#lookup" className="hover:text-coolBlue-500 transition-colors">
              Reverse Lookup
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}