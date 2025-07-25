'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          NATO Phonetic Alphabet
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Master the international radiotelephony spelling alphabet used by military, 
          aviation, and emergency services worldwide
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/learn">
            <Button size="lg" className="text-lg px-8">
              Start Learning
            </Button>
          </Link>
          <Link href="/practice">
            <Button variant="secondary" size="lg" className="text-lg px-8">
              Practice Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-8">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need to Master the Phonetic Alphabet
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Learn Card */}
          <Link href="/learn" className="group">
            <div className="card h-full p-8 transition-all hover:shadow-xl hover:scale-105">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors">
                Interactive Learning
              </h3>
              <p className="text-muted-foreground mb-4">
                Explore all 26 letters with audio pronunciation, visual aids, and helpful memory tricks
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Click to hear pronunciation</li>
                <li>✓ IPA phonetic notation</li>
                <li>✓ Keyboard navigation</li>
                <li>✓ Downloadable PDF chart</li>
              </ul>
            </div>
          </Link>

          {/* Practice Card */}
          <Link href="/practice" className="group">
            <div className="card h-full p-8 transition-all hover:shadow-xl hover:scale-105">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors">
                Practice & Quiz
              </h3>
              <p className="text-muted-foreground mb-4">
                Test your knowledge with interactive quizzes and flashcards at multiple difficulty levels
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ 3 difficulty levels</li>
                <li>✓ Audio recognition mode</li>
                <li>✓ 3D flashcards with mnemonics</li>
                <li>✓ Progress tracking</li>
              </ul>
            </div>
          </Link>

          {/* Tools Card */}
          <Link href="/tools" className="group">
            <div className="card h-full p-8 transition-all hover:shadow-xl hover:scale-105">
              <div className="text-4xl mb-4">🛠️</div>
              <h3 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors">
                Conversion Tools
              </h3>
              <p className="text-muted-foreground mb-4">
                Convert text to phonetic alphabet and lookup code words with our powerful tools
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Real-time text converter</li>
                <li>✓ Reverse lookup with fuzzy search</li>
                <li>✓ Copy & share functionality</li>
                <li>✓ Conversion history</li>
              </ul>
            </div>
          </Link>
        </div>
      </section>

      {/* Quick Reference */}
      <section className="py-8 bg-muted/50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          Quick Reference
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
          {['A-Alpha', 'B-Bravo', 'C-Charlie', 'D-Delta', 'E-Echo', 'F-Foxtrot'].map((item) => (
            <div key={item} className="bg-background rounded p-3 shadow-sm">
              <span className="font-mono text-sm">{item}</span>
            </div>
          ))}
          <Link href="/learn" className="bg-primary/10 rounded p-3 shadow-sm hover:bg-primary/20 transition-colors col-span-2 md:col-span-4 lg:col-span-6">
            <span className="text-sm font-medium text-primary">View All 26 Letters →</span>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Start?
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of pilots, radio operators, and professionals who have mastered 
          the NATO phonetic alphabet
        </p>
        <Link href="/learn">
          <Button size="lg" className="text-lg px-8">
            Begin Learning Now
          </Button>
        </Link>
      </section>

      {/* Use Cases */}
      <section className="py-8">
        <h2 className="text-2xl font-bold text-center mb-8">
          Who Uses the NATO Phonetic Alphabet?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="space-y-2">
            <div className="text-3xl">✈️</div>
            <h3 className="font-semibold">Aviation</h3>
            <p className="text-sm text-muted-foreground">
              Pilots and air traffic controllers
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">🚢</div>
            <h3 className="font-semibold">Maritime</h3>
            <p className="text-sm text-muted-foreground">
              Ship crews and coast guard
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">🚔</div>
            <h3 className="font-semibold">Emergency</h3>
            <p className="text-sm text-muted-foreground">
              Police, fire, and medical services
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">📡</div>
            <h3 className="font-semibold">Military</h3>
            <p className="text-sm text-muted-foreground">
              Armed forces communications
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}