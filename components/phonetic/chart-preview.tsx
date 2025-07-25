'use client';

import { NATO_ALPHABET } from '@/lib/constants/phonetic-alphabet';

export function ChartPreview() {
  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 text-center">
          <h3 className="text-2xl font-bold">NATO Phonetic Alphabet Reference Chart</h3>
          <p className="text-blue-100 mt-2">Professional reference guide for clear communication</p>
        </div>
        
        {/* Chart Grid */}
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {NATO_ALPHABET.slice(0, 8).map((item) => (
              <div key={item.letter} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                <div className="text-2xl font-black text-blue-500 w-8">{item.letter}</div>
                <div>
                  <div className="font-semibold text-sm">{item.codeWord}</div>
                  <div className="text-xs text-gray-500 italic">{item.pronunciation}</div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Fade out effect */}
          <div className="relative mt-4">
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none" />
            <div className="text-center text-gray-400 pt-8">
              <p className="text-sm">... and 18 more letters</p>
            </div>
          </div>
        </div>
        
        {/* Features */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>A4 Print Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Clear Pronunciation</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Professional Design</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}