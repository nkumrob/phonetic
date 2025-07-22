import { Metadata } from 'next';
import { AlphabetGrid } from '@/components/phonetic/alphabet-grid';
import { DownloadChart } from '@/components/phonetic/download-chart';
import { ErrorBoundary } from '@/components/error-boundary';
import { generateMetadata as baseGenerateMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = baseGenerateMetadata(
  'Learn NATO Phonetic Alphabet',
  'Interactive guide to learn the NATO phonetic alphabet with audio pronunciation and visual aids',
  '/learn'
);

export default function LearnPage() {
  return (
    <div className="container mx-auto px-4 space-y-16 py-8">
      {/* Hero Section - Mobile Optimized */}
      <section className="space-y-4">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-headlines leading-none">
          Learn the NATO Alphabet
        </h1>
        <p className="text-lg sm:text-xl text-secondary max-w-2xl">
          Master each letter with interactive cards, audio pronunciation, and helpful mnemonics
        </p>
      </section>

      {/* Alphabet Grid */}
      <section>
        <ErrorBoundary>
          <AlphabetGrid />
        </ErrorBoundary>
      </section>

      {/* Download Section - Mobile Friendly */}
      <section className="text-center no-print space-y-4">
        <h2 className="text-3xl sm:text-4xl font-black tracking-largeText">
          Take It With You
        </h2>
        <p className="text-base sm:text-lg text-secondary max-w-md mx-auto">
          Download or print a reference chart for offline use
        </p>
        <ErrorBoundary>
          <DownloadChart />
        </ErrorBoundary>
      </section>

      {/* Print-only section with static content */}
      <section className="hidden print:block">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            .print-container {
              max-width: 1200px !important;
              margin: 0 auto !important;
              padding: 20px !important;
            }
            .print-header {
              text-align: center !important;
              margin-bottom: 30px !important;
            }
            .print-title {
              font-size: 32pt !important;
              font-weight: bold !important;
              color: #000 !important;
              margin-bottom: 10px !important;
            }
            .print-subtitle {
              font-size: 14pt !important;
              color: #333 !important;
              margin-bottom: 5px !important;
            }
            .print-grid {
              display: grid !important;
              grid-template-columns: repeat(4, 1fr) !important;
              gap: 15px !important;
              margin: 30px 0 !important;
            }
            .print-card {
              border: 2px solid #e5e5e5 !important;
              border-radius: 12px !important;
              padding: 20px !important;
              text-align: center !important;
              page-break-inside: avoid !important;
              background: #fafafa !important;
              min-height: 120px !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: center !important;
              align-items: center !important;
            }
            .print-letter {
              font-size: 36pt !important;
              font-weight: 900 !important;
              color: #0EA5E9 !important;
              margin-bottom: 8px !important;
              line-height: 1 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print-word {
              font-size: 18pt !important;
              font-weight: 700 !important;
              color: #000 !important;
              margin-bottom: 4px !important;
            }
            .print-pronunciation {
              font-size: 12pt !important;
              color: #666 !important;
              font-style: italic !important;
            }
            @page {
              size: A4;
              margin: 1.5cm;
            }
          }
        `}} />
        <div className="print-container">
          <div className="print-header">
            <h1 className="print-title">NATO Phonetic Alphabet</h1>
            <p className="print-subtitle">International Radiotelephony Spelling Alphabet</p>
            <p className="print-subtitle">Used by Military, Aviation, and Emergency Services Worldwide</p>
          </div>
          <div className="print-grid">
          <div className="print-card">
            <div className="print-letter">A</div>
            <div className="print-word">Alpha</div>
            <div className="print-pronunciation">AL-fah</div>
          </div>
          <div className="print-card">
            <div className="print-letter">B</div>
            <div className="print-word">Bravo</div>
            <div className="print-pronunciation">BRAH-voh</div>
          </div>
          <div className="print-card">
            <div className="print-letter">C</div>
            <div className="print-word">Charlie</div>
            <div className="print-pronunciation">CHAR-lee</div>
          </div>
          <div className="print-card">
            <div className="print-letter">D</div>
            <div className="print-word">Delta</div>
            <div className="print-pronunciation">DEL-tah</div>
          </div>
          <div className="print-card">
            <div className="print-letter">E</div>
            <div className="print-word">Echo</div>
            <div className="print-pronunciation">ECK-oh</div>
          </div>
          <div className="print-card">
            <div className="print-letter">F</div>
            <div className="print-word">Foxtrot</div>
            <div className="print-pronunciation">FOKS-trot</div>
          </div>
          <div className="print-card">
            <div className="print-letter">G</div>
            <div className="print-word">Golf</div>
            <div className="print-pronunciation">GOLF</div>
          </div>
          <div className="print-card">
            <div className="print-letter">H</div>
            <div className="print-word">Hotel</div>
            <div className="print-pronunciation">hoh-TEL</div>
          </div>
          <div className="print-card">
            <div className="print-letter">I</div>
            <div className="print-word">India</div>
            <div className="print-pronunciation">IN-dee-ah</div>
          </div>
          <div className="print-card">
            <div className="print-letter">J</div>
            <div className="print-word">Juliet</div>
            <div className="print-pronunciation">JEW-lee-et</div>
          </div>
          <div className="print-card">
            <div className="print-letter">K</div>
            <div className="print-word">Kilo</div>
            <div className="print-pronunciation">KEE-loh</div>
          </div>
          <div className="print-card">
            <div className="print-letter">L</div>
            <div className="print-word">Lima</div>
            <div className="print-pronunciation">LEE-mah</div>
          </div>
          <div className="print-card">
            <div className="print-letter">M</div>
            <div className="print-word">Mike</div>
            <div className="print-pronunciation">MIKE</div>
          </div>
          <div className="print-card">
            <div className="print-letter">N</div>
            <div className="print-word">November</div>
            <div className="print-pronunciation">no-VEM-ber</div>
          </div>
          <div className="print-card">
            <div className="print-letter">O</div>
            <div className="print-word">Oscar</div>
            <div className="print-pronunciation">OSS-car</div>
          </div>
          <div className="print-card">
            <div className="print-letter">P</div>
            <div className="print-word">Papa</div>
            <div className="print-pronunciation">pah-PAH</div>
          </div>
          <div className="print-card">
            <div className="print-letter">Q</div>
            <div className="print-word">Quebec</div>
            <div className="print-pronunciation">keh-BECK</div>
          </div>
          <div className="print-card">
            <div className="print-letter">R</div>
            <div className="print-word">Romeo</div>
            <div className="print-pronunciation">ROW-me-oh</div>
          </div>
          <div className="print-card">
            <div className="print-letter">S</div>
            <div className="print-word">Sierra</div>
            <div className="print-pronunciation">see-AIR-ah</div>
          </div>
          <div className="print-card">
            <div className="print-letter">T</div>
            <div className="print-word">Tango</div>
            <div className="print-pronunciation">TANG-go</div>
          </div>
          <div className="print-card">
            <div className="print-letter">U</div>
            <div className="print-word">Uniform</div>
            <div className="print-pronunciation">YOU-nee-form</div>
          </div>
          <div className="print-card">
            <div className="print-letter">V</div>
            <div className="print-word">Victor</div>
            <div className="print-pronunciation">VIK-tor</div>
          </div>
          <div className="print-card">
            <div className="print-letter">W</div>
            <div className="print-word">Whiskey</div>
            <div className="print-pronunciation">WISS-key</div>
          </div>
          <div className="print-card">
            <div className="print-letter">X</div>
            <div className="print-word">X-ray</div>
            <div className="print-pronunciation">ECKS-ray</div>
          </div>
          <div className="print-card">
            <div className="print-letter">Y</div>
            <div className="print-word">Yankee</div>
            <div className="print-pronunciation">YANG-key</div>
          </div>
          <div className="print-card">
            <div className="print-letter">Z</div>
            <div className="print-word">Zulu</div>
            <div className="print-pronunciation">ZOO-loo</div>
          </div>
          </div>
        </div>
      </section>
    </div>
  );
}