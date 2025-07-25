'use client';

import React from 'react';
import { Button } from '@/components/ui';
import { useSoundEffects } from '@/lib/hooks/use-sound-effects';
import { useTheme } from '@/lib/hooks/use-theme';
import { Volume2, VolumeX, Moon, Sun, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function Settings() {
  const { soundEnabled, volume, setSoundEnabled, setVolume, playClick } = useSoundEffects();
  const { theme, setTheme } = useTheme();

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      playClick(); // Play a sound when enabling
    }
  };

  return (
    <div className="space-y-8">
      {/* Sound Settings */}
      <div className="card p-6 space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Volume2 className="w-6 h-6" />
          Sound Settings
        </h2>
        
        {/* Sound Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Sound Effects</p>
            <p className="text-sm text-muted-foreground">
              Play sounds for correct answers, achievements, and more
            </p>
          </div>
          <button
            onClick={toggleSound}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              soundEnabled ? "bg-primary" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                soundEnabled ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>
        
        {/* Volume Slider */}
        {soundEnabled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="volume" className="text-sm font-medium">
                Volume
              </label>
              <span className="text-sm text-muted-foreground">
                {Math.round(volume * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <VolumeX className="w-4 h-4 text-muted-foreground" />
              <input
                id="volume"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <Volume2 className="w-4 h-4 text-muted-foreground" />
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => playClick()}
              className="w-full sm:w-auto"
            >
              Test Sound
            </Button>
          </div>
        )}
      </div>

      {/* Theme Settings */}
      <div className="card p-6 space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          {theme === 'dark' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
          Appearance
        </h2>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose your preferred color theme
          </p>
          
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => {
                setTheme('light');
                playClick();
              }}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                theme === 'light' 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-muted-foreground"
              )}
            >
              <Sun className="w-8 h-8" />
              <span className="text-sm font-medium">Light</span>
            </button>
            
            <button
              onClick={() => {
                setTheme('dark');
                playClick();
              }}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                theme === 'dark' 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-muted-foreground"
              )}
            >
              <Moon className="w-8 h-8" />
              <span className="text-sm font-medium">Dark</span>
            </button>
            
            <button
              onClick={() => {
                setTheme('system');
                playClick();
              }}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                theme === 'system' 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-muted-foreground"
              )}
            >
              <Monitor className="w-8 h-8" />
              <span className="text-sm font-medium">System</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}