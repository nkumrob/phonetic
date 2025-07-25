import { searchPhoneticWords, getCommonMisspellings } from '../fuzzy-search';

describe('searchPhoneticWords', () => {
  it('returns empty array for empty query', () => {
    expect(searchPhoneticWords('')).toEqual([]);
    expect(searchPhoneticWords('   ')).toEqual([]);
  });

  it('finds exact matches with highest score', () => {
    const results = searchPhoneticWords('Alpha');
    expect(results[0]).toMatchObject({
      letter: 'A',
      codeWord: 'Alpha',
      score: 100,
      matchType: 'exact'
    });
  });

  it('finds case-insensitive exact matches', () => {
    const results = searchPhoneticWords('alpha');
    expect(results[0]).toMatchObject({
      letter: 'A',
      codeWord: 'Alpha',
      score: 100,
      matchType: 'exact'
    });
  });

  it('finds partial matches when query starts with', () => {
    const results = searchPhoneticWords('Cha');
    expect(results.find(r => r.codeWord === 'Charlie')).toMatchObject({
      letter: 'C',
      codeWord: 'Charlie',
      matchType: 'partial'
    });
  });

  it('finds partial matches when query is contained', () => {
    const results = searchPhoneticWords('otel');
    expect(results.find(r => r.codeWord === 'Hotel')).toMatchObject({
      letter: 'H',
      codeWord: 'Hotel',
      matchType: 'partial'
    });
  });

  it('finds fuzzy matches for typos', () => {
    const results = searchPhoneticWords('Aplha'); // Typo: Aplha instead of Alpha
    expect(results.find(r => r.codeWord === 'Alpha')).toBeDefined();
    expect(results.find(r => r.codeWord === 'Alpha')?.matchType).toBe('fuzzy');
  });

  it('ranks exact matches higher than partial matches', () => {
    const results = searchPhoneticWords('Echo');
    expect(results[0].codeWord).toBe('Echo');
    expect(results[0].matchType).toBe('exact');
  });

  it('returns multiple matches sorted by score', () => {
    const results = searchPhoneticWords('a');
    expect(results.length).toBeGreaterThan(1);
    // Check that scores are in descending order
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });
});

describe('getCommonMisspellings', () => {
  it('returns a mapping of common misspellings', () => {
    const misspellings = getCommonMisspellings();
    
    expect(misspellings['alfa']).toBe('Alpha');
    expect(misspellings['brabo']).toBe('Bravo');
    expect(misspellings['charli']).toBe('Charlie');
    expect(misspellings['ecko']).toBe('Echo');
    expect(misspellings['foxtrop']).toBe('Foxtrot');
  });

  it('includes phonetic variations', () => {
    const misspellings = getCommonMisspellings();
    
    expect(misspellings['whisky']).toBe('Whiskey');
    expect(misspellings['wisky']).toBe('Whiskey');
    expect(misspellings['xray']).toBe('X-ray');
    expect(misspellings['x ray']).toBe('X-ray');
  });

  it('includes common typos', () => {
    const misspellings = getCommonMisspellings();
    
    expect(misspellings['juliett']).toBe('Juliet');
    expect(misspellings['yankie']).toBe('Yankee');
    expect(misspellings['zoulou']).toBe('Zulu');
  });
});