'use client';

import React from 'react';
import { PhoneticTranslatorWidget } from './phonetic-translator-widget';

// Example 1: Simple embed in a blog post or article
export function BlogPostExample() {
  return (
    <article className="prose lg:prose-xl mx-auto p-6">
      <h1>Understanding NATO Phonetic Alphabet</h1>
      <p>
        The NATO phonetic alphabet is widely used in aviation, military, and 
        telecommunications to ensure clear communication...
      </p>
      
      <div className="not-prose my-8">
        <PhoneticTranslatorWidget 
          compact={true}
          showExample={false}
          placeholder="Try converting your name..."
        />
      </div>
      
      <p>
        As you can see above, each letter is replaced with a specific code word 
        that is easily distinguishable even in poor communication conditions...
      </p>
    </article>
  );
}

// Example 2: Sidebar widget
export function SidebarWidgetExample() {
  return (
    <aside className="w-80 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Quick Translator</h3>
      <PhoneticTranslatorWidget 
        compact={true}
        showExample={false}
        maxHeight="250px"
      />
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
        Use this tool to quickly convert any text to NATO phonetic alphabet.
      </p>
    </aside>
  );
}

// Example 3: Modal/Popup widget
export function ModalWidgetExample({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Phonetic Translator</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <PhoneticTranslatorWidget />
        </div>
      </div>
    </div>
  );
}

// Example 4: Form integration
export function FormIntegrationExample() {
  const [phoneticOutput, setPhoneticOutput] = React.useState('');
  
  return (
    <form className="max-w-lg mx-auto p-6 space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Your Name
        </label>
        <input 
          type="text" 
          id="name" 
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="John Doe"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Convert Message to Phonetic
        </label>
        <PhoneticTranslatorWidget 
          compact={true}
          showExample={false}
          onTranslate={(input, output) => setPhoneticOutput(output)}
        />
      </div>
      
      <div>
        <label htmlFor="phonetic-message" className="block text-sm font-medium mb-2">
          Phonetic Message (auto-filled)
        </label>
        <textarea 
          id="phonetic-message"
          value={phoneticOutput}
          readOnly
          className="w-full px-3 py-2 border rounded-lg bg-gray-50"
          rows={3}
        />
      </div>
      
      <button 
        type="submit"
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Submit
      </button>
    </form>
  );
}