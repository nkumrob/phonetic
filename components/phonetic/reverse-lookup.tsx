'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { searchPhoneticWords, getCommonMisspellings, type SearchResult } from '@/lib/utils/fuzzy-search';
import { cn } from '@/lib/utils/cn';

export function ReverseLookup() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
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
          setSearchQuery(results[selectedIndex].codeWord);
          setResults([]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setResults([]);
        setSelectedIndex(-1);
        break;
    }
  };

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
          {/* Search icon */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
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
                  onClick={() => {
                    setSearchQuery(result.codeWord);
                    setResults([]);
                  }}
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

      {/* No results message */}
      {searchQuery && debouncedQuery && !isSearching && results.length === 0 && (
        <div className="text-center text-muted-foreground">
          <p>No phonetic words found for "{debouncedQuery}"</p>
          <p className="text-sm mt-1">Try searching for Alpha, Bravo, Charlie, etc.</p>
        </div>
      )}

      {/* Instructions */}
      {!searchQuery && (
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>Search for NATO phonetic code words to find their corresponding letters.</p>
          <p>Supports partial matches and common misspellings.</p>
          <p className="text-xs">Use ↑↓ arrow keys to navigate, Enter to select, Esc to close</p>
        </div>
      )}
    </div>
  );
}