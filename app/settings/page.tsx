'use client';

import { useSimpleAppState } from '@/lib/contexts/simple-app-context';
import { Button } from '@/components/ui';
import { Volume2, Moon, Sun, Monitor } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils/cn';

function SettingsContent() {
  const { state, updatePreferences } = useSimpleAppState();
  const [soundEnabled, setSoundEnabled] = useState(state.preferences.soundEnabled);
  const [soundVolume, setSoundVolume] = useState(state.preferences.soundVolume);
  const [theme, setTheme] = useState(state.preferences.theme);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updatePreferences({
      soundEnabled,
      soundVolume,
      theme,
    });
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const themes = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-headlines mb-8">Settings</h1>

      <div className="space-y-8">
        {/* Sound Settings */}
        <section className="bg-background border-2 border-border rounded-xl p-6 sm:p-8 space-y-4 hover:shadow-md transition-all duration-200">
          <h2 className="text-2xl sm:text-3xl font-black tracking-largeText flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Sound Settings
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="sound-enabled" className="text-sm font-medium">
                Enable Sound Effects
              </label>
              <button
                id="sound-enabled"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  soundEnabled ? "bg-coolBlue-500" : "bg-warmNeutral-300"
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

            {soundEnabled && (
              <div className="space-y-2">
                <label htmlFor="sound-volume" className="text-sm font-medium">
                  Volume: {Math.round(soundVolume * 100)}%
                </label>
                <input
                  id="sound-volume"
                  type="range"
                  min="0"
                  max="100"
                  value={soundVolume * 100}
                  onChange={(e) => setSoundVolume(Number(e.target.value) / 100)}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </section>

        {/* Theme Settings */}
        <section className="bg-background border-2 border-border rounded-xl p-6 sm:p-8 space-y-4 hover:shadow-md transition-all duration-200">
          <h2 className="text-2xl sm:text-3xl font-black tracking-largeText">Theme</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {themes.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all",
                    "hover:border-coolBlue-500 hover:shadow-md",
                    theme === t.value
                      ? "border-coolBlue-500 bg-coolBlue-50 dark:bg-coolBlue-900/20"
                      : "border-border"
                  )}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-sm font-medium">{t.label}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Data Management */}
        <section className="bg-background border-2 border-border rounded-xl p-6 sm:p-8 space-y-4 hover:shadow-md transition-all duration-200">
          <h2 className="text-2xl sm:text-3xl font-black tracking-largeText">Data Management</h2>
          
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Your progress is saved locally in your browser.
            </p>
            
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  const data = JSON.stringify(state, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `nato-phonetic-progress-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export Progress
              </Button>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saved}>
            {saved ? 'Settings Saved!' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SimpleSettingsPage() {
  return <SettingsContent />;
}