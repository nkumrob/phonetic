export interface PhoneticLetter {
  letter: string;
  codeWord: string;
  pronunciation: string;
  ipa: string;
}

export const NATO_ALPHABET: PhoneticLetter[] = [
  { letter: 'A', codeWord: 'Alpha', pronunciation: 'AL-fah', ipa: 'ˈælfə' },
  { letter: 'B', codeWord: 'Bravo', pronunciation: 'BRAH-voh', ipa: 'ˈbrɑːvoʊ' },
  { letter: 'C', codeWord: 'Charlie', pronunciation: 'CHAR-lee', ipa: 'ˈtʃɑːrli' },
  { letter: 'D', codeWord: 'Delta', pronunciation: 'DEL-tah', ipa: 'ˈdɛltə' },
  { letter: 'E', codeWord: 'Echo', pronunciation: 'ECK-oh', ipa: 'ˈɛkoʊ' },
  { letter: 'F', codeWord: 'Foxtrot', pronunciation: 'FOKS-trot', ipa: 'ˈfɒkstrɒt' },
  { letter: 'G', codeWord: 'Golf', pronunciation: 'GOLF', ipa: 'ɡɒlf' },
  { letter: 'H', codeWord: 'Hotel', pronunciation: 'hoh-TEL', ipa: 'hoʊˈtɛl' },
  { letter: 'I', codeWord: 'India', pronunciation: 'IN-dee-ah', ipa: 'ˈɪndiə' },
  { letter: 'J', codeWord: 'Juliet', pronunciation: 'JEW-lee-et', ipa: 'ˈdʒuːliɛt' },
  { letter: 'K', codeWord: 'Kilo', pronunciation: 'KEE-loh', ipa: 'ˈkiːloʊ' },
  { letter: 'L', codeWord: 'Lima', pronunciation: 'LEE-mah', ipa: 'ˈliːmə' },
  { letter: 'M', codeWord: 'Mike', pronunciation: 'MIKE', ipa: 'maɪk' },
  { letter: 'N', codeWord: 'November', pronunciation: 'no-VEM-ber', ipa: 'noʊˈvɛmbər' },
  { letter: 'O', codeWord: 'Oscar', pronunciation: 'OSS-car', ipa: 'ˈɒskər' },
  { letter: 'P', codeWord: 'Papa', pronunciation: 'pah-PAH', ipa: 'pəˈpɑː' },
  { letter: 'Q', codeWord: 'Quebec', pronunciation: 'keh-BECK', ipa: 'kɛˈbɛk' },
  { letter: 'R', codeWord: 'Romeo', pronunciation: 'ROW-me-oh', ipa: 'ˈroʊmiˌoʊ' },
  { letter: 'S', codeWord: 'Sierra', pronunciation: 'see-AIR-ah', ipa: 'siˈɛrə' },
  { letter: 'T', codeWord: 'Tango', pronunciation: 'TANG-go', ipa: 'ˈtæŋɡoʊ' },
  { letter: 'U', codeWord: 'Uniform', pronunciation: 'YOU-nee-form', ipa: 'ˈjuːnɪfɔːrm' },
  { letter: 'V', codeWord: 'Victor', pronunciation: 'VIK-tor', ipa: 'ˈvɪktər' },
  { letter: 'W', codeWord: 'Whiskey', pronunciation: 'WISS-key', ipa: 'ˈwɪski' },
  { letter: 'X', codeWord: 'X-ray', pronunciation: 'ECKS-ray', ipa: 'ˈɛksreɪ' },
  { letter: 'Y', codeWord: 'Yankee', pronunciation: 'YANG-key', ipa: 'ˈjæŋki' },
  { letter: 'Z', codeWord: 'Zulu', pronunciation: 'ZOO-loo', ipa: 'ˈzuːluː' },
];

export const NUMBERS_PHONETIC: Record<string, string> = {
  '0': 'Zero',
  '1': 'One',
  '2': 'Two',
  '3': 'Three',
  '4': 'Four',
  '5': 'Five',
  '6': 'Six',
  '7': 'Seven',
  '8': 'Eight',
  '9': 'Nine',
};

export function getPhoneticForLetter(letter: string): PhoneticLetter | undefined {
  return NATO_ALPHABET.find(item => item.letter === letter.toUpperCase());
}

export function getLetterForCodeWord(codeWord: string): string | undefined {
  const item = NATO_ALPHABET.find(
    item => item.codeWord.toLowerCase() === codeWord.toLowerCase()
  );
  return item?.letter;
}