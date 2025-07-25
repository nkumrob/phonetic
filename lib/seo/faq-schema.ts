export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What does each letter stand for in the NATO phonetic alphabet?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The NATO phonetic alphabet assigns a code word to each letter A–Z to ensure clarity over voice channels (e.g., Alpha for A, Bravo for B, Charlie for C).'
      }
    },
    {
      '@type': 'Question',
      name: 'How do I pronounce the NATO phonetic alphabet correctly?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Each code word is pronounced with emphasis on its first syllable. Listen to our audio clips or follow our phonetic pronunciation guide for precise enunciation.'
      }
    },
    {
      '@type': 'Question',
      name: 'Where can I download a printable NATO phonetic alphabet PDF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Visit our Printable PDF & Download section or click the download button for a free, optimized PDF.'
      }
    },
    {
      '@type': 'Question',
      name: 'What is the difference between the NATO and military alphabets?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'While the NATO alphabet is used by ICAO and allied militaries, some nations and services historically used slightly different code words. See our comparison table for the full breakdown.'
      }
    },
    {
      '@type': 'Question',
      name: 'How do I use the NATO phonetic code in radio communications?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'In any voice transmission—aviation, maritime, or emergency services—spell out critical information one letter at a time using the NATO code words to reduce misunderstandings.'
      }
    },
    {
      '@type': 'Question',
      name: 'Is there an online NATO phonetic alphabet translator?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Try our interactive translator: type any message and see the instant phonetic conversion in real time.'
      }
    },
    {
      '@type': 'Question',
      name: 'Why is the NATO phonetic alphabet mandated in aviation?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ICAO standardized the alphabet globally to eliminate confusion in pilot-controller communications, especially under noisy or poor signal conditions.'
      }
    },
    {
      '@type': 'Question',
      name: 'Are there audio resources to learn the NATO alphabet?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We provide downloadable MP3 pronunciations for each letter—perfect for drills, training, or on-the-go learning.'
      }
    }
  ]
};

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'natophonetic.com',
  url: 'https://natophonetic.com',
  logo: 'https://natophonetic.com/logo.png',
  sameAs: [
    'https://twitter.com/phoneticalphabet'
  ]
};

export const breadcrumbSchema = (items: Array<{name: string, url: string}>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url
  }))
});

export const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Use the NATO Phonetic Alphabet',
  description: 'Learn how to properly use the NATO phonetic alphabet for clear communication',
  totalTime: 'PT5M',
  supply: [],
  tool: [],
  step: [
    {
      '@type': 'HowToStep',
      name: 'Learn the alphabet',
      text: 'Memorize the 26 code words from Alpha to Zulu',
      url: 'https://natophonetic.com/learn'
    },
    {
      '@type': 'HowToStep',
      name: 'Practice pronunciation',
      text: 'Use our audio guides to perfect your pronunciation',
      url: 'https://natophonetic.com/practice'
    },
    {
      '@type': 'HowToStep',
      name: 'Apply in communication',
      text: 'Spell out important information letter by letter using the code words',
      url: 'https://natophonetic.com/tools'
    }
  ]
};