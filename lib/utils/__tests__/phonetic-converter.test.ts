import { textToPhonetic, phoneticToText } from '../phonetic-converter';

describe('textToPhonetic', () => {
  it('converts letters to NATO phonetic alphabet', () => {
    expect(textToPhonetic('ABC')).toBe('Alpha Bravo Charlie');
    expect(textToPhonetic('xyz')).toBe('X-ray Yankee Zulu');
  });

  it('handles lowercase letters', () => {
    expect(textToPhonetic('hello')).toBe('Hotel Echo Lima Lima Oscar');
  });

  it('converts numbers to phonetic words', () => {
    expect(textToPhonetic('123')).toBe('One Two Three');
    expect(textToPhonetic('0')).toBe('Zero');
  });

  it('handles spaces', () => {
    expect(textToPhonetic('A B')).toBe('Alpha (space) Bravo');
  });

  it('converts special characters', () => {
    expect(textToPhonetic('.')).toBe('(period)');
    expect(textToPhonetic(',')).toBe('(comma)');
    expect(textToPhonetic('!')).toBe('(exclamation)');
    expect(textToPhonetic('?')).toBe('(question)');
    expect(textToPhonetic('@')).toBe('(at)');
    expect(textToPhonetic('#')).toBe('(hash)');
  });

  it('handles mixed content', () => {
    expect(textToPhonetic('Hello, World!')).toBe(
      'Hotel Echo Lima Lima Oscar (comma) (space) Whiskey Oscar Romeo Lima Delta (exclamation)'
    );
  });

  it('returns empty string for empty input', () => {
    expect(textToPhonetic('')).toBe('');
  });

  it('handles unknown characters', () => {
    expect(textToPhonetic('€')).toBe('(€)');
  });
});

describe('phoneticToText', () => {
  it('converts NATO phonetic words back to letters', () => {
    expect(phoneticToText('Alpha Bravo Charlie')).toBe('ABC');
    expect(phoneticToText('X-ray Yankee Zulu')).toBe('XYZ');
  });

  it('handles lowercase phonetic words', () => {
    expect(phoneticToText('alpha bravo charlie')).toBe('ABC');
  });

  it('converts number words back to digits', () => {
    expect(phoneticToText('One Two Three')).toBe('123');
    expect(phoneticToText('Zero')).toBe('0');
  });

  it('handles space markers', () => {
    expect(phoneticToText('Alpha (space) Bravo')).toBe('A B');
  });

  it('converts special character markers', () => {
    expect(phoneticToText('(period)')).toBe('.');
    expect(phoneticToText('(comma)')).toBe(',');
    expect(phoneticToText('(exclamation)')).toBe('!');
    expect(phoneticToText('(at)')).toBe('@');
  });

  it('handles mixed content', () => {
    expect(phoneticToText(
      'Hotel Echo Lima Lima Oscar (comma) (space) Whiskey Oscar Romeo Lima Delta (exclamation)'
    )).toBe('HELLO, WORLD!');
  });

  it('returns empty string for empty input', () => {
    expect(phoneticToText('')).toBe('');
  });

  it('handles unrecognized words', () => {
    expect(phoneticToText('Unknown Word')).toBe('Unknown Word');
  });

  it('preserves single characters in parentheses', () => {
    expect(phoneticToText('(€)')).toBe('€');
  });
});