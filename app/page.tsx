import { Button } from '@/components/ui';
import { AlphabetGrid } from '@/components/phonetic/alphabet-grid';

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          NATO Phonetic Alphabet
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Learn, convert, and master the international radiotelephony spelling alphabet
          used by military, aviation, and emergency services worldwide.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button size="lg" onClick={() => document.getElementById('alphabet')?.scrollIntoView({ behavior: 'smooth' })}>
            Start Learning
          </Button>
          <Button variant="secondary" size="lg" onClick={() => document.getElementById('converter')?.scrollIntoView({ behavior: 'smooth' })}>
            Try Converter
          </Button>
        </div>
      </section>

      {/* Full Alphabet Grid */}
      <section id="alphabet" className="scroll-mt-20">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold mb-2">
            The Complete NATO Alphabet
          </h2>
          <p className="text-muted-foreground">
            Click any letter to highlight it. Click the speaker icon to hear pronunciation.
          </p>
        </div>
        <AlphabetGrid />
      </section>

      {/* Converter Section Placeholder */}
      <section id="converter" className="scroll-mt-20">
        <div className="text-center">
          <h2 className="text-3xl font-semibold mb-8">
            Text to Phonetic Converter
          </h2>
          <p className="text-muted-foreground">
            Converter coming soon...
          </p>
        </div>
      </section>
    </div>
  );
}