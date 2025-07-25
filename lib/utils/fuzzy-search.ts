import { NATO_ALPHABET } from '@/lib/constants/phonetic-alphabet';

export interface SearchResult {
  letter: string;
  codeWord: string;
  score: number;
  matchType: 'exact' | 'partial' | 'fuzzy';
}

// Calculate Levenshtein distance for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // deletion
          dp[i][j - 1] + 1,    // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}

export function searchPhoneticWords(query: string): SearchResult[] {
  if (!query || query.trim() === '') return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  const results: SearchResult[] = [];
  
  // Search through NATO alphabet
  for (const item of NATO_ALPHABET) {
    const codeWordLower = item.codeWord.toLowerCase();
    
    // Exact match
    if (codeWordLower === normalizedQuery) {
      results.push({
        letter: item.letter,
        codeWord: item.codeWord,
        score: 100,
        matchType: 'exact'
      });
      continue;
    }
    
    // Starts with query (partial match)
    if (codeWordLower.startsWith(normalizedQuery)) {
      results.push({
        letter: item.letter,
        codeWord: item.codeWord,
        score: 80 - (codeWordLower.length - normalizedQuery.length),
        matchType: 'partial'
      });
      continue;
    }
    
    // Contains query
    if (codeWordLower.includes(normalizedQuery)) {
      results.push({
        letter: item.letter,
        codeWord: item.codeWord,
        score: 60 - codeWordLower.indexOf(normalizedQuery),
        matchType: 'partial'
      });
      continue;
    }
    
    // Fuzzy match (allow for typos)
    const distance = levenshteinDistance(normalizedQuery, codeWordLower);
    const maxDistance = Math.max(normalizedQuery.length, codeWordLower.length);
    const similarity = ((maxDistance - distance) / maxDistance) * 100;
    
    if (similarity > 50) { // At least 50% similar
      results.push({
        letter: item.letter,
        codeWord: item.codeWord,
        score: similarity * 0.5, // Lower score for fuzzy matches
        matchType: 'fuzzy'
      });
    }
  }
  
  // Sort by score (highest first)
  return results.sort((a, b) => b.score - a.score);
}

// Get suggestions for common misspellings
export function getCommonMisspellings(): Record<string, string> {
  return {
    'alfa': 'Alpha',
    'brabo': 'Bravo',
    'charli': 'Charlie',
    'charlei': 'Charlie',
    'ecko': 'Echo',
    'ekko': 'Echo',
    'foxtrop': 'Foxtrot',
    'foxtrott': 'Foxtrot',
    'juliett': 'Juliet',
    'juliete': 'Juliet',
    'killo': 'Kilo',
    'kiloh': 'Kilo',
    'leema': 'Lima',
    'lema': 'Lima',
    'mic': 'Mike',
    'mick': 'Mike',
    'oskar': 'Oscar',
    'papah': 'Papa',
    'pappa': 'Papa',
    'quebeck': 'Quebec',
    'kebec': 'Quebec',
    'romio': 'Romeo',
    'siera': 'Sierra',
    'cierra': 'Sierra',
    'tongo': 'Tango',
    'wisky': 'Whiskey',
    'whisky': 'Whiskey',
    'x ray': 'X-ray',
    'xray': 'X-ray',
    'yankie': 'Yankee',
    'yanky': 'Yankee',
    'zoulou': 'Zulu',
    'zoolu': 'Zulu'
  };
}