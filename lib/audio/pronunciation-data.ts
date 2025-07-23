export interface PronunciationData {
  letter: string;
  code: string;
  ipa: string;
  pronunciation: string;
  audioUrl?: string;
}

export const pronunciationData: PronunciationData[] = [
  { letter: 'A', code: 'Alpha', ipa: '/ˈælfə/', pronunciation: 'AL-fah' },
  { letter: 'B', code: 'Bravo', ipa: '/ˈbrɑːvoʊ/', pronunciation: 'BRAH-voh' },
  { letter: 'C', code: 'Charlie', ipa: '/ˈtʃɑːrli/', pronunciation: 'CHAR-lee' },
  { letter: 'D', code: 'Delta', ipa: '/ˈdɛltə/', pronunciation: 'DELL-tah' },
  { letter: 'E', code: 'Echo', ipa: '/ˈɛkoʊ/', pronunciation: 'ECK-oh' },
  { letter: 'F', code: 'Foxtrot', ipa: '/ˈfɒkstrɒt/', pronunciation: 'FOKS-trot' },
  { letter: 'G', code: 'Golf', ipa: '/ɡɒlf/', pronunciation: 'GOLF' },
  { letter: 'H', code: 'Hotel', ipa: '/hoʊˈtɛl/', pronunciation: 'hoh-TELL' },
  { letter: 'I', code: 'India', ipa: '/ˈɪndiə/', pronunciation: 'IN-dee-ah' },
  { letter: 'J', code: 'Juliet', ipa: '/ˈdʒuːliɛt/', pronunciation: 'JEW-lee-ett' },
  { letter: 'K', code: 'Kilo', ipa: '/ˈkiːloʊ/', pronunciation: 'KEY-loh' },
  { letter: 'L', code: 'Lima', ipa: '/ˈliːmə/', pronunciation: 'LEE-mah' },
  { letter: 'M', code: 'Mike', ipa: '/maɪk/', pronunciation: 'MIKE' },
  { letter: 'N', code: 'November', ipa: '/noʊˈvɛmbər/', pronunciation: 'no-VEM-ber' },
  { letter: 'O', code: 'Oscar', ipa: '/ˈɒskər/', pronunciation: 'OSS-car' },
  { letter: 'P', code: 'Papa', ipa: '/ˈpɑːpə/', pronunciation: 'PAH-pah' },
  { letter: 'Q', code: 'Quebec', ipa: '/kɛˈbɛk/', pronunciation: 'keh-BECK' },
  { letter: 'R', code: 'Romeo', ipa: '/ˈroʊmioʊ/', pronunciation: 'ROW-me-oh' },
  { letter: 'S', code: 'Sierra', ipa: '/siˈɛrə/', pronunciation: 'see-AIR-rah' },
  { letter: 'T', code: 'Tango', ipa: '/ˈtæŋɡoʊ/', pronunciation: 'TANG-go' },
  { letter: 'U', code: 'Uniform', ipa: '/ˈjuːnɪfɔːrm/', pronunciation: 'YOO-nee-form' },
  { letter: 'V', code: 'Victor', ipa: '/ˈvɪktər/', pronunciation: 'VIK-tor' },
  { letter: 'W', code: 'Whiskey', ipa: '/ˈwɪski/', pronunciation: 'WISS-key' },
  { letter: 'X', code: 'X-ray', ipa: '/ˈɛksreɪ/', pronunciation: 'ECKS-ray' },
  { letter: 'Y', code: 'Yankee', ipa: '/ˈjæŋki/', pronunciation: 'YANG-key' },
  { letter: 'Z', code: 'Zulu', ipa: '/ˈzuːluː/', pronunciation: 'ZOO-loo' },
];