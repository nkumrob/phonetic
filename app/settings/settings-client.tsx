'use client';

import { Volume2, Moon, Sun, Monitor } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { useTheme } from '@/lib/hooks/use-theme';
import { useSoundEffects } from '@/lib/hooks/use-sound-effects';

export default function SettingsClient() {
  const { theme, setTheme } = useTheme();
  const { soundEnabled, volume, setSoundEnabled, setVolume, playSound } = useSoundEffects();
  const [showVolumeTest, setShowVolumeTest] = useState(false);
  const volumeTestTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const themes = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ];

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    // Play a test sound when volume changes
    playSound('correct');
    
    // Show volume test indicator
    setShowVolumeTest(true);
    
    // Clear any existing timer
    if (volumeTestTimeoutRef.current) {
      clearTimeout(volumeTestTimeoutRef.current);
    }
    
    // Hide indicator after 1 second
    volumeTestTimeoutRef.current = setTimeout(() => {
      setShowVolumeTest(false);
    }, 1000);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (volumeTestTimeoutRef.current) {
        clearTimeout(volumeTestTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-12">
        {/* Header */}
        <section className="text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-headlines mb-4">
            Settings
          </h1>
          <p className="text-lg text-secondary">
            Customize your learning experience
          </p>
        </section>

        {/* Theme Settings */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Appearance</h2>
          <div className="p-6 bg-warmNeutral-50 dark:bg-warmNeutral-900 rounded-xl border-2 border-border">
            <label className="block text-sm font-semibold mb-4">Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {themes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                    theme === value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Sound Settings */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Sound</h2>
          
          {/* Sound Toggle */}
          <div className="p-6 bg-warmNeutral-50 dark:bg-warmNeutral-900 rounded-xl border-2 border-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <label className="block text-sm font-semibold mb-1">Sound Effects</label>
                <p className="text-sm text-secondary">
                  Enable audio feedback and pronunciation
                </p>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={cn(
                  'relative w-14 h-8 rounded-full transition-colors',
                  soundEnabled ? 'bg-primary' : 'bg-warmNeutral-300 dark:bg-warmNeutral-700'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform',
                    soundEnabled && 'translate-x-6'
                  )}
                />
              </button>
            </div>

            {/* Volume Control */}
            {soundEnabled && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">Volume</label>
                  {showVolumeTest && (
                    <span className="text-xs text-primary animate-pulse">
                      Testing...
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <Volume2 className="w-5 h-5 text-secondary" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="flex-1 h-2 bg-warmNeutral-200 dark:bg-warmNeutral-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
                  />
                  <span className="text-sm font-medium w-12 text-right">{volume}%</span>
                </div>
                <button
                  onClick={() => playSound('correct')}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  Test Sound
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Info Section */}
        <section className="p-6 bg-warmNeutral-50 dark:bg-warmNeutral-900 rounded-xl border-2 border-border">
          <h3 className="text-xl font-bold mb-3">About Settings</h3>
          <div className="space-y-2 text-sm text-secondary">
            <p>
              <strong>Theme:</strong> Choose between light, dark, or system preference
            </p>
            <p>
              <strong>Sound Effects:</strong> Enable audio pronunciation and feedback sounds
            </p>
            <p>
              <strong>Volume:</strong> Adjust the volume of all audio in the app
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

