'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { User, Save } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// Avatar options - using simple emojis to avoid hydration issues
const AVATAR_OPTIONS = [
  '✈️', '🚁', '🦅', '🎯', '📡', '🗺️',
  '⚡', '🌟', '🚀', '🛡️', '📻', '🎖️'
];

export function ProfileCustomization() {
  const [userName, setUserName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('✈️');
  const [isSaving, setIsSaving] = useState(false);

  // Load saved profile data
  useEffect(() => {
    const savedName = localStorage.getItem('userName') || '';
    const savedAvatar = localStorage.getItem('userAvatar') || '✈️';
    setUserName(savedName);
    setSelectedAvatar(savedAvatar);
  }, []);

  const handleSaveProfile = () => {
    setIsSaving(true);
    
    // Save to localStorage
    localStorage.setItem('userName', userName);
    localStorage.setItem('userAvatar', selectedAvatar);
    
    // Show save feedback
    setTimeout(() => {
      setIsSaving(false);
      // Reload the page to update the header
      window.location.reload();
    }, 500);
  };

  return (
    <div className="card p-6 space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <User className="w-6 h-6" />
        Customize Profile
      </h2>
      
      {/* Avatar Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Choose Your Avatar</label>
        <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
          {AVATAR_OPTIONS.map((avatar) => (
            <button
              key={avatar}
              onClick={() => setSelectedAvatar(avatar)}
              className={cn(
                "text-3xl p-2 rounded-lg transition-all",
                "hover:scale-110 hover:bg-muted",
                selectedAvatar === avatar && "bg-primary/20 ring-2 ring-primary"
              )}
            >
              {avatar}
            </button>
          ))}
        </div>
      </div>
      
      {/* Name Input */}
      <div className="space-y-2">
        <label htmlFor="userName" className="text-sm font-medium">
          Your Name
        </label>
        <input
          id="userName"
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Enter your name"
          className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          maxLength={20}
        />
        <p className="text-xs text-muted-foreground">
          This name will be displayed throughout the app
        </p>
      </div>
      
      <Button
        onClick={handleSaveProfile}
        disabled={isSaving}
        className="w-full sm:w-auto"
      >
        <Save className="w-4 h-4 mr-2" />
        {isSaving ? 'Saving...' : 'Save Profile'}
      </Button>
    </div>
  );
}