import React from 'react';
import { PhoneticTranslatorWidget } from '@/components/phonetic/phonetic-translator-widget';

export default function WidgetDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Phonetic Translator Widget
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            A customizable widget for converting text to NATO phonetic alphabet
          </p>
        </div>

        <div className="space-y-12">
          {/* Default Widget */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Default Widget
            </h2>
            <div className="max-w-2xl mx-auto">
              <PhoneticTranslatorWidget />
            </div>
          </section>

          {/* Compact Widget */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Compact Version
            </h2>
            <div className="max-w-md mx-auto">
              <PhoneticTranslatorWidget 
                compact={true}
                showExample={false}
                placeholder="Enter text..."
              />
            </div>
          </section>

          {/* Multiple Widgets Side by Side */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Side by Side Layout
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <PhoneticTranslatorWidget 
                placeholder="Type your message..."
                onTranslate={(input, output) => {
                  console.log('Widget 1:', { input, output });
                }}
              />
              <PhoneticTranslatorWidget 
                placeholder="Enter code words..."
                onTranslate={(input, output) => {
                  console.log('Widget 2:', { input, output });
                }}
              />
            </div>
          </section>

          {/* Customized Widget */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Customized Styling
            </h2>
            <div className="max-w-2xl mx-auto">
              <PhoneticTranslatorWidget 
                className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-200 dark:border-blue-800"
                maxHeight="300px"
                placeholder="Try typing something special..."
              />
            </div>
          </section>

          {/* Integration Example */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Integration Example
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                This widget can be easily integrated into any part of your application. 
                It provides a callback function that triggers whenever text is translated.
              </p>
              <PhoneticTranslatorWidget 
                onTranslate={(input, output) => {
                  if (input && output) {
                    console.log('Translation event:', {
                      originalText: input,
                      phoneticText: output,
                      timestamp: new Date().toISOString()
                    });
                  }
                }}
              />
            </div>
          </section>

          {/* Code Example */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Usage Example
            </h2>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-6 overflow-x-auto">
              <pre className="text-sm">
                <code>{`import { PhoneticTranslatorWidget } from '@/components/phonetic/phonetic-translator-widget';

// Basic usage
<PhoneticTranslatorWidget />

// Compact version
<PhoneticTranslatorWidget 
  compact={true}
  showExample={false}
/>

// With callback
<PhoneticTranslatorWidget 
  onTranslate={(input, output) => {
    console.log('Translated:', input, '->', output);
  }}
/>

// Custom styling
<PhoneticTranslatorWidget 
  className="custom-widget-styles"
  maxHeight="500px"
  placeholder="Custom placeholder..."
/>`}</code>
              </pre>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}