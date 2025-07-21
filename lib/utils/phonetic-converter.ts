import { NATO_ALPHABET, NUMBERS_PHONETIC } from '@/lib/constants/phonetic-alphabet';

export function textToPhonetic(text: string): string {
  if (!text) return '';
  
  return text
    .toUpperCase()
    .split('')
    .map(char => {
      // Handle letters
      const phoneticLetter = NATO_ALPHABET.find(item => item.letter === char);
      if (phoneticLetter) {
        return phoneticLetter.codeWord;
      }
      
      // Handle numbers
      if (NUMBERS_PHONETIC[char]) {
        return NUMBERS_PHONETIC[char];
      }
      
      // Handle spaces
      if (char === ' ') {
        return '(space)';
      }
      
      // Handle special characters
      switch (char) {
        case '.': return '(period)';
        case ',': return '(comma)';
        case '!': return '(exclamation)';
        case '?': return '(question)';
        case '-': return '(dash)';
        case '/': return '(slash)';
        case '@': return '(at)';
        case '#': return '(hash)';
        case '$': return '(dollar)';
        case '%': return '(percent)';
        case '&': return '(and)';
        case '*': return '(star)';
        case '+': return '(plus)';
        case '=': return '(equals)';
        case '(': return '(left paren)';
        case ')': return '(right paren)';
        case '[': return '(left bracket)';
        case ']': return '(right bracket)';
        case '{': return '(left brace)';
        case '}': return '(right brace)';
        case '<': return '(less than)';
        case '>': return '(greater than)';
        case ':': return '(colon)';
        case ';': return '(semicolon)';
        case '"': return '(quote)';
        case "'": return '(apostrophe)';
        case '\\': return '(backslash)';
        case '|': return '(pipe)';
        case '_': return '(underscore)';
        case '~': return '(tilde)';
        case '`': return '(backtick)';
        case '^': return '(caret)';
        default: return `(${char})`;
      }
    })
    .join(' ');
}

export function phoneticToText(phonetic: string): string {
  if (!phonetic) return '';
  
  const words = phonetic.split(' ');
  let result = '';
  
  for (const word of words) {
    // Skip empty strings
    if (!word) continue;
    
    // Handle special markers
    if (word === '(space)') {
      result += ' ';
      continue;
    }
    
    // Remove parentheses for special characters
    if (word.startsWith('(') && word.endsWith(')')) {
      const special = word.slice(1, -1);
      switch (special) {
        case 'period': result += '.'; break;
        case 'comma': result += ','; break;
        case 'exclamation': result += '!'; break;
        case 'question': result += '?'; break;
        case 'dash': result += '-'; break;
        case 'slash': result += '/'; break;
        case 'at': result += '@'; break;
        case 'hash': result += '#'; break;
        case 'dollar': result += '$'; break;
        case 'percent': result += '%'; break;
        case 'and': result += '&'; break;
        case 'star': result += '*'; break;
        case 'plus': result += '+'; break;
        case 'equals': result += '='; break;
        case 'left paren': result += '('; break;
        case 'right paren': result += ')'; break;
        case 'left bracket': result += '['; break;
        case 'right bracket': result += ']'; break;
        case 'left brace': result += '{'; break;
        case 'right brace': result += '}'; break;
        case 'less than': result += '<'; break;
        case 'greater than': result += '>'; break;
        case 'colon': result += ':'; break;
        case 'semicolon': result += ';'; break;
        case 'quote': result += '"'; break;
        case 'apostrophe': result += "'"; break;
        case 'backslash': result += '\\'; break;
        case 'pipe': result += '|'; break;
        case 'underscore': result += '_'; break;
        case 'tilde': result += '~'; break;
        case 'backtick': result += '`'; break;
        case 'caret': result += '^'; break;
        default: 
          // Single character in parentheses
          if (special.length === 1) {
            result += special;
          }
      }
      continue;
    }
    
    // Check for NATO alphabet words
    const letter = NATO_ALPHABET.find(
      item => item.codeWord.toLowerCase() === word.toLowerCase()
    );
    if (letter) {
      result += letter.letter;
      continue;
    }
    
    // Check for number words
    const numberEntry = Object.entries(NUMBERS_PHONETIC).find(
      ([_, phonetic]) => phonetic.toLowerCase() === word.toLowerCase()
    );
    if (numberEntry) {
      result += numberEntry[0];
      continue;
    }
    
    // If not recognized, keep the word as is
    result += word + ' ';
  }
  
  return result.trim();
}