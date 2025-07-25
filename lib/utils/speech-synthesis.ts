import { logger } from '@/lib/utils/logger';
/**
 * Centralized speech synthesis utility that respects global sound settings
 */

interface SpeechOptions {
  rate?: number;
  pitch?: number;
  voice?: SpeechSynthesisVoice | null;
  onEnd?: () => void;
}

class SpeechManager {
  private static instance: SpeechManager;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  
  private constructor() {
    // Stop all speech on page unload/refresh
    if (typeof window !== 'undefined') {
      // Cancel any ongoing speech immediately on initialization
      window.speechSynthesis.cancel();
      
      // Stop on page unload/refresh
      window.addEventListener('beforeunload', () => {
        this.cancel();
      });
      
      // Stop when page visibility changes (tab loses focus)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.cancel();
        }
      });
    }
  }
  
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
    
    // Cancel any ongoing speech BEFORE creating new utterance
    this.cancel();
    
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
      
      // Store reference for potential cancellation
      this.currentUtterance = utterance;
      
      // Clear reference when done
      utterance.onend = () => {
        this.currentUtterance = null;
        if (options.onEnd) {
          options.onEnd();
        }
      };
      
      utterance.onerror = () => {
        this.currentUtterance = null;
        if (options.onEnd) {
          options.onEnd();
        }
      };
      
      window.speechSynthesis.speak(utterance);
    }, 50);
  }
  
  cancel() {
    logger.info('SpeechManager cancel called');
    if ('speechSynthesis' in window) {
      logger.info('Cancelling speech synthesis', {
        context: 'speech-synthesis',
        metadata: {
          speaking: window.speechSynthesis.speaking,
          pending: window.speechSynthesis.pending
        }
      });
      
      // Cancel multiple times to ensure it stops
      window.speechSynthesis.cancel();
      window.speechSynthesis.cancel();
      window.speechSynthesis.cancel();
      
      // Also pause if still speaking
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.cancel();
      }
      
      this.currentUtterance = null;
    }
  }
  
  stop() {
    // Alias for cancel for clarity
    this.cancel();
  }
  
  isSpeaking(): boolean {
    if ('speechSynthesis' in window) {
      return window.speechSynthesis.speaking;
    }
    return false;
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