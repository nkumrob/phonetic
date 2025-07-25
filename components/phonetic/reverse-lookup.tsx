'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input, LoadingSpinner } from '@/components/ui';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { searchPhoneticWords, getCommonMisspellings, type SearchResult } from '@/lib/utils/fuzzy-search';
import { cn } from '@/lib/utils/cn';
import { PHONETIC_MNEMONICS } from '@/lib/constants/mnemonics';
import { NATO_ALPHABET } from '@/lib/constants/phonetic-alphabet';
import { speechManager } from '@/lib/utils/speech-synthesis';
import { logger } from '@/lib/utils/logger';


export function ReverseLookup() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedLetter, setSelectedLetter] = useState<SearchResult & { mnemonic?: string; pronunciation?: string; ipa?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    // Check for common misspellings first
    const misspellings = getCommonMisspellings();
    const corrected = misspellings[debouncedQuery.toLowerCase()];
    
    if (corrected) {
      // If it's a known misspelling, search for the correct term
      const searchResults = searchPhoneticWords(corrected);
      setResults(searchResults);
    } else {
      // Otherwise, do a normal search
      const searchResults = searchPhoneticWords(debouncedQuery);
      setResults(searchResults);
    }
    
    setIsSearching(false);
    setSelectedIndex(-1);
  }, [debouncedQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelectResult(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setResults([]);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    // Find mnemonic for this letter
    const mnemonic = PHONETIC_MNEMONICS.find(m => m.letter === result.letter);
    // Find full details from NATO_ALPHABET
    const fullDetails = NATO_ALPHABET.find(item => item.letter === result.letter);
    
    const resultWithDetails = {
      ...result,
      mnemonic: mnemonic?.mnemonic,
      pronunciation: fullDetails?.pronunciation,
      ipa: fullDetails?.ipa
    };
    
    setSelectedLetter(resultWithDetails);
    setResults([]);
  };

  const handleCopyLetter = async () => {
    if (selectedLetter) {
      try {
        await navigator.clipboard.writeText(selectedLetter.letter);
        setCopied(true);
        
        // Clear any existing timer
        if (copyTimeoutRef.current) {
          clearTimeout(copyTimeoutRef.current);
        }
        
        copyTimeoutRef.current = setTimeout(() => {
          setCopied(false);
          copyTimeoutRef.current = null;
        }, 2000);
      } catch (err) {
        logger.error('Failed to copy:', err);
      }
    }
  };

  const handleSpeak = () => {
    if (selectedLetter) {
      speechManager.speak(`${selectedLetter.letter}, for ${selectedLetter.codeWord}`, { rate: 0.9 });
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedLetter(null);
    setResults([]);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="relative">
        <div className="relative">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for a phonetic word (e.g., Alpha, Bravo, Charlie...)"
            className="pr-10"
            aria-label="Search phonetic words"
            aria-autocomplete="list"
            aria-controls="search-results"
            aria-expanded={results.length > 0}
          />
          {/* Search icon or loading spinner */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {isSearching ? (
              <LoadingSpinner size="sm" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-muted-foreground"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Search Results Dropdown */}
        {results.length > 0 && (
          <div
            id="search-results"
            className="absolute z-10 w-full mt-2 bg-background border border-border rounded-md shadow-lg overflow-hidden"
            role="listbox"
          >
            <div className="max-h-60 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={`${result.letter}-${index}`}
                  className={cn(
                    'px-4 py-3 cursor-pointer transition-colors',
                    'hover:bg-muted',
                    selectedIndex === index && 'bg-muted',
                    result.matchType === 'fuzzy' && 'opacity-80'
                  )}
                  onClick={() => handleSelectResult(result)}
                  role="option"
                  aria-selected={selectedIndex === index}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-primary">
                        {result.letter}
                      </span>
                      <span className="text-lg font-medium">
                        {result.codeWord}
                      </span>
                    </div>
                    {result.matchType === 'fuzzy' && (
                      <span className="text-xs text-muted-foreground">
                        Did you mean?
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Letter Display */}
      {selectedLetter && (
        <div className="card p-8 space-y-6 animate-fade-in">
          <div className="text-center">
            <div className="text-8xl font-black text-gradient mb-4">
              {selectedLetter.letter}
            </div>
            <div className="text-3xl font-bold mb-2">
              {selectedLetter.codeWord}
            </div>
            <div className="text-xl text-secondary italic mb-4">
              {selectedLetter.pronunciation}
            </div>
            {selectedLetter.mnemonic && (
              <div className="mt-4 p-4 bg-muted rounded-lg max-w-md mx-auto">
                <p className="text-sm italic">{selectedLetter.mnemonic}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3">
            <button
              onClick={handleCopyLetter}
              className="btn btn-secondary"
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy Letter
                </>
              )}
            </button>
            
            <button
              onClick={handleSpeak}
              className="btn btn-secondary"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              Play Sound
            </button>
            
            <button
              onClick={handleClear}
              className="btn btn-secondary"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          </div>
        </div>
      )}

      {/* No results message */}
      {searchQuery && debouncedQuery && !isSearching && results.length === 0 && !selectedLetter && (
        <div className="text-center text-muted-foreground">
          <p>No phonetic words found for &quot;{debouncedQuery}&quot;</p>
          <p className="text-sm mt-1">Try searching for Alpha, Bravo, Charlie, etc.</p>
        </div>
      )}

      {/* Instructions */}
      {!searchQuery && !selectedLetter && (
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>Search for NATO phonetic code words to find their corresponding letters.</p>
          <p>Supports partial matches and common misspellings.</p>
          <p className="text-xs">Use ↑↓ arrow keys to navigate, Enter to select, Esc to close</p>
        </div>
      )}
    </div>
  );
}