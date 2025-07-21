'use client';

import { Button } from '@/components/ui';
import { NATO_ALPHABET } from '@/lib/constants/phonetic-alphabet';

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          NATO Phonetic Alphabet
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Learn, convert, and master the international radiotelephony spelling alphabet
          used by military, aviation, and emergency services worldwide.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg">Start Learning</Button>
          <Button variant="secondary" size="lg">
            Try Converter
          </Button>
        </div>
      </section>

      {/* Alphabet Preview Grid */}
      <section>
        <h2 className="text-3xl font-semibold text-center mb-8">
          The Complete Alphabet
        </h2>
        <div className="alphabet-grid">
          {NATO_ALPHABET.slice(0, 6).map((item) => (
            <div
              key={item.letter}
              className="phonetic-card"
            >
              <div className="text-3xl font-bold text-primary mb-2">
                {item.letter}
              </div>
              <div className="text-lg font-semibold mb-1">
                {item.codeWord}
              </div>
              <div className="text-sm text-muted-foreground">
                {item.pronunciation}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Button variant="secondary">View Full Alphabet</Button>
        </div>
      </section>
    </div>
  );
}