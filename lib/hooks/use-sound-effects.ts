/**
 * Sound effects system for gamification
 * Uses Web Audio API for low-latency, high-quality sound playback
 */

interface SoundConfig {
  volume?: number;
  pitch?: number;
  delay?: number;
}

class SoundEffectsManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private enabled: boolean = true;
  private masterVolume: number = 0.5;

  constructor() {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.audioContext = new AudioContext();
      this.preloadSounds();
    }
  }

  private async preloadSounds() {
    // Using generated sounds instead of external files for better performance
    const soundDefinitions = {
      correct: this.generateCorrectSound(),
      incorrect: this.generateIncorrectSound(),
      streak: this.generateStreakSound(),
      levelUp: this.generateLevelUpSound(),
      achievement: this.generateAchievementSound(),
      coin: this.generateCoinSound(),
      click: this.generateClickSound(),
    };

    // Store all sounds
    for (const [name, buffer] of Object.entries(soundDefinitions)) {
      this.sounds.set(name, buffer);
    }
  }

  private generateCorrectSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const duration = 0.2;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate a pleasant "ding" sound (C5 note)
    const frequency = 523.25; // C5
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // Sine wave with exponential decay
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 10);
      // Add harmonics for richness
      data[i] += Math.sin(2 * Math.PI * frequency * 2 * t) * 0.3 * Math.exp(-t * 15);
      data[i] += Math.sin(2 * Math.PI * frequency * 3 * t) * 0.1 * Math.exp(-t * 20);
    }

    return buffer;
  }

  private generateIncorrectSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const duration = 0.3;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate a soft "whomp" sound
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // Low frequency with quick decay
      data[i] = Math.sin(2 * Math.PI * 150 * t) * Math.exp(-t * 8);
      // Add some noise for texture
      data[i] += (Math.random() - 0.5) * 0.1 * Math.exp(-t * 20);
    }

    return buffer;
  }

  private generateStreakSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const duration = 0.4;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate an ascending arpeggio
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const freqIndex = Math.floor(t * frequencies.length / duration);
      if (freqIndex < frequencies.length) {
        const localT = (t - freqIndex * duration / frequencies.length) * frequencies.length / duration;
        data[i] = Math.sin(2 * Math.PI * frequencies[freqIndex] * t) * 
                  Math.exp(-localT * 5) * 0.5;
      }
    }

    return buffer;
  }

  private generateLevelUpSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const duration = 1.0;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate a triumphant fanfare
    const frequencies = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      // Play all notes with staggered timing
      frequencies.forEach((freq, index) => {
        const delay = index * 0.1;
        if (t > delay) {
          const localT = t - delay;
          sample += Math.sin(2 * Math.PI * freq * localT) * 
                    Math.exp(-localT * 2) * 0.3;
        }
      });
      
      data[i] = sample;
    }

    return buffer;
  }

  private generateAchievementSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const duration = 0.6;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate a sparkly achievement sound
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // Multiple high frequencies for sparkle effect
      data[i] = Math.sin(2 * Math.PI * 2093 * t) * 0.2 * Math.exp(-t * 5) +
                Math.sin(2 * Math.PI * 2637 * t) * 0.15 * Math.exp(-t * 7) +
                Math.sin(2 * Math.PI * 3136 * t) * 0.1 * Math.exp(-t * 10);
      
      // Add some randomness for sparkle
      if (Math.random() > 0.95) {
        data[i] += (Math.random() - 0.5) * 0.3 * Math.exp(-t * 20);
      }
    }

    return buffer;
  }

  private generateCoinSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const duration = 0.3;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate a coin collection sound
    const frequency = 988; // B5
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // Quick attack, quick decay
      data[i] = Math.sin(2 * Math.PI * frequency * t) * 
                Math.exp(-t * 15) * (1 - t / duration);
      // Add metallic overtone
      data[i] += Math.sin(2 * Math.PI * frequency * 2.7 * t) * 
                 0.2 * Math.exp(-t * 25);
    }

    return buffer;
  }

  private generateClickSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const duration = 0.05;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate a short click
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      data[i] = (Math.random() - 0.5) * Math.exp(-t * 100);
    }

    return buffer;
  }

  play(soundName: string, config?: SoundConfig) {
    if (!this.enabled || !this.audioContext) return;

    const buffer = this.sounds.get(soundName);
    if (!buffer) {
      console.warn(`Sound "${soundName}" not found`);
      return;
    }

    // Resume audio context if suspended (due to autoplay policies)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Apply volume
    const volume = (config?.volume ?? 1) * this.masterVolume;
    gainNode.gain.value = volume;

    // Apply pitch
    if (config?.pitch) {
      source.playbackRate.value = config.pitch;
    }

    // Schedule playback
    const delay = config?.delay ?? 0;
    source.start(this.audioContext.currentTime + delay);
  }

  playWithPitch(soundName: string, pitchMultiplier: number) {
    this.play(soundName, { pitch: pitchMultiplier });
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }
}

// Create singleton instance
let soundManager: SoundEffectsManager | null = null;

export function useSoundEffects() {
  // Initialize on first use
  if (!soundManager && typeof window !== 'undefined') {
    soundManager = new SoundEffectsManager();
  }

  const playSound = (soundName: string, config?: SoundConfig) => {
    soundManager?.play(soundName, config);
  };

  const playCorrect = (streak: number = 0) => {
    // Increase pitch with streak
    const pitch = 1 + Math.min(streak * 0.05, 0.5);
    soundManager?.playWithPitch('correct', pitch);
  };

  const playIncorrect = () => {
    soundManager?.play('incorrect', { volume: 0.3 });
  };

  const playStreak = (streakCount: number) => {
    if (streakCount % 5 === 0) {
      soundManager?.play('streak', { volume: 0.6 });
    }
  };

  const playLevelUp = () => {
    soundManager?.play('levelUp', { volume: 0.8 });
  };

  const playAchievement = () => {
    soundManager?.play('achievement', { volume: 0.7 });
  };

  const playCoin = () => {
    soundManager?.play('coin', { volume: 0.4 });
  };

  const playClick = () => {
    soundManager?.play('click', { volume: 0.2 });
  };

  const setSoundEnabled = (enabled: boolean) => {
    soundManager?.setEnabled(enabled);
    // Save preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundEnabled', enabled.toString());
    }
  };

  const setVolume = (volume: number) => {
    soundManager?.setMasterVolume(volume);
    // Save preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundVolume', volume.toString());
    }
  };

  return {
    playSound,
    playCorrect,
    playIncorrect,
    playStreak,
    playLevelUp,
    playAchievement,
    playCoin,
    playClick,
    setSoundEnabled,
    setVolume,
  };
}