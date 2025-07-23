'use client';

import { useState } from 'react';
import { pronunciationData } from '@/lib/audio/pronunciation-data';
import { PronunciationPlayer } from '@/components/audio/pronunciation-player';
import { cn } from '@/lib/utils/cn';

export function AudioAlphabetTable() {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {pronunciationData.map((item) => (
          <div
            key={item.letter}
            className={cn(
              "relative group cursor-pointer transition-all duration-200",
              "border-2 border-border rounded-lg p-4",
              "hover:border-primary hover:shadow-lg",
              selectedLetter === item.letter && "border-primary shadow-lg bg-blue-50 dark:bg-blue-900/10"
            )}
            onClick={() => setSelectedLetter(item.letter === selectedLetter ? null : item.letter)}
          >
            <div className="text-center">
              <div className="text-3xl font-black text-primary mb-1">{item.letter}</div>
              <div className="font-semibold text-lg mb-1">{item.code}</div>
              <div className="text-sm text-secondary mb-2">{item.ipa}</div>
              <div className="text-xs text-tertiary">{item.pronunciation}</div>
            </div>
            
            {selectedLetter === item.letter && (
              <div className="mt-3 pt-3 border-t border-border">
                <PronunciationPlayer 
                  text={item.letter} 
                  code={item.code}
                  autoPlay={true}
                  className="w-full justify-center"
                />
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center text-sm text-secondary">
        <p>Click on any letter to hear its pronunciation</p>
      </div>
    </div>
  );
}