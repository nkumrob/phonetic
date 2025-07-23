import { logger } from '@/lib/utils/logger';
/**
 * Centralized speech synthesis utility that respects global sound settings
 */

interface SpeechOptions {
  rate?: number;
  pitch?: number;
  voice?: SpeechSynthesisVoice | null;
}

class SpeechManager {
  private static instance: SpeechManager;
  
  private constructor() {}
  
  static getInstance(): SpeechManager {
    if (!SpeechManager.instance) {
      SpeechManager.instance = new SpeechManager();
    }
    return SpeechManager.instance;
  }
  
  speak(text: string, options: SpeechOptions = {}) {
    // Check if speech synthesis is available
    if (!('speechSynthesis' in window)) {
      logger.warn('Speech synthesis not available');
      return;
    }
    
    // Get sound settings from localStorage
    const soundEnabled = localStorage.getItem('soundEnabled');
    const soundVolume = localStorage.getItem('soundVolume');
    
    // Check if sound is disabled
    if (soundEnabled === 'false') {
      return;
    }
    
    // Parse volume (default to 0.5 if not set)
    const volume = soundVolume ? parseFloat(soundVolume) : 0.5;
    
    // Chrome workaround: speak empty string first
    const dummy = new SpeechSynthesisUtterance('');
    window.speechSynthesis.speak(dummy);
    
    // Create utterance with settings
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate ?? 0.9;
      utterance.pitch = options.pitch ?? 1;
      utterance.volume = volume;
      
      if (options.voice) {
        utterance.voice = options.voice;
      }
      
      window.speechSynthesis.speak(utterance);
    }, 50);
  }
  
  cancel() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
  
  getVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve([]);
        return;
      }
      
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          resolve(window.speechSynthesis.getVoices());
        };
      }
    });
  }
}

export const speechManager = SpeechManager.getInstance();