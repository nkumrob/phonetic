'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface XPGain {
  id: string;
  amount: number;
  x: number;
  y: number;
  multiplier?: number;
  reason?: string;
}

interface XPGainAnimationProps {
  gains: XPGain[];
  onComplete?: (totalXP: number) => void;
}

export function XPGainAnimation({ gains, onComplete }: XPGainAnimationProps) {
  // Render gains directly without additional state management
  // The parent component already manages the lifecycle
  return (
    <>
      {gains.map(gain => (
        <div
          key={gain.id}
          className="fixed pointer-events-none z-40"
          style={{ left: gain.x, top: gain.y }}
        >
          <div className={cn(
            "animate-float-up",
            "flex flex-col items-center gap-1"
          )}>
            <div className="flex items-center gap-1">
              <span className={cn(
                "font-bold text-2xl",
                gain.amount < 0 
                  ? "text-red-500"
                  : gain.multiplier && gain.multiplier > 1 
                    ? "text-yellow-500 drop-shadow-glow" 
                    : "text-green-500"
              )}>
                {gain.amount > 0 ? '+' : ''}{gain.amount}
              </span>
              <span className="text-sm font-medium text-white/80">XP</span>
            </div>
            
            {gain.multiplier && gain.multiplier > 1 && (
              <div className="text-xs text-yellow-400 font-bold">
                {gain.multiplier}x Bonus!
              </div>
            )}
            
            {gain.reason && (
              <div className="text-xs text-white/60 whitespace-nowrap">
                {gain.reason}
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
}

// Global XP animation state management
class XPAnimationManager {
  private gains: XPGain[] = [];
  private listeners: Set<(gains: XPGain[]) => void> = new Set();
  private idCounter = 0;
  private lastAnimationTime = 0;
  private activeAnimations = new Map<string, NodeJS.Timeout>();

  subscribe(listener: (gains: XPGain[]) => void) {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.gains);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.gains));
  }

  showXPGain(amount: number, options?: {
    x?: number;
    y?: number;
    multiplier?: number;
    reason?: string;
  }) {
    const { x = window.innerWidth / 2, y = window.innerHeight / 2, multiplier, reason } = options || {};
    
    // Debounce animations that are too close together
    const now = Date.now();
    if (now - this.lastAnimationTime < 50) {
      return;
    }
    this.lastAnimationTime = now;
    
    // Create unique ID
    const id = `xp-${now}-${++this.idCounter}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Cancel any existing animation at similar position
    this.gains.forEach(gain => {
      if (Math.abs(gain.x - x) < 10 && Math.abs(gain.y - y) < 10) {
        const existingTimeout = this.activeAnimations.get(gain.id);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
          this.activeAnimations.delete(gain.id);
        }
        this.gains = this.gains.filter(g => g.id !== gain.id);
      }
    });
    
    const newGain: XPGain = { id, amount, x, y, multiplier, reason };
    this.gains.push(newGain);
    this.notify();
    
    // Remove after animation
    const timeout = setTimeout(() => {
      this.gains = this.gains.filter(g => g.id !== id);
      this.activeAnimations.delete(id);
      this.notify();
    }, 2500);
    
    this.activeAnimations.set(id, timeout);
  }

  clear() {
    // Clear all timeouts
    this.activeAnimations.forEach(timeout => clearTimeout(timeout));
    this.activeAnimations.clear();
    this.gains = [];
    this.notify();
  }
}

// Single global instance
const xpAnimationManager = new XPAnimationManager();

export function useXPAnimation() {
  const [gains, setGains] = useState<XPGain[]>([]);

  useEffect(() => {
    // Subscribe to the global manager
    const unsubscribe = xpAnimationManager.subscribe(setGains);
    return unsubscribe;
  }, []);

  return {
    gains,
    showXPGain: (amount: number, options?: { x?: number; y?: number; multiplier?: number; reason?: string }) => xpAnimationManager.showXPGain(amount, options),
    clearGains: () => xpAnimationManager.clear(),
    XPGainDisplay: () => <XPGainAnimation gains={gains} onComplete={() => {}} />
  };
}

// Progress bar animation component
export function XPProgressBar({ 
  current, 
  max, 
  level,
  showNumbers = true,
  size = 'default' 
}: {
  current: number;
  max: number;
  level: number;
  showNumbers?: boolean;
  size?: 'small' | 'default' | 'large';
}) {
  const [displayedCurrent, setDisplayedCurrent] = useState(current);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (displayedCurrent !== current) {
      setIsAnimating(true);
      const diff = current - displayedCurrent;
      const steps = 20;
      const stepAmount = diff / steps;
      let step = 0;
      
      const interval = setInterval(() => {
        step++;
        if (step >= steps) {
          setDisplayedCurrent(current);
          setIsAnimating(false);
          clearInterval(interval);
        } else {
          setDisplayedCurrent(prev => prev + stepAmount);
        }
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [current, displayedCurrent]);
  
  const percentage = (displayedCurrent / max) * 100;
  const heights = {
    small: 'h-2',
    default: 'h-3',
    large: 'h-4'
  };
  
  return (
    <div className="space-y-2">
      {showNumbers && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Level {level}</span>
          <span className="text-sm text-muted-foreground">
            {Math.floor(displayedCurrent)} / {max} XP
          </span>
        </div>
      )}
      
      <div className={cn(
        "relative bg-muted rounded-full overflow-hidden",
        heights[size]
      )}>
        <div
          className={cn(
            "absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500",
            "transition-all duration-300 ease-out",
            isAnimating && "animate-pulse"
          )}
          style={{ width: `${percentage}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer" />
        </div>
        
        {/* Milestone markers */}
        {[25, 50, 75].map(milestone => (
          <div
            key={milestone}
            className="absolute top-0 bottom-0 w-px bg-white/20"
            style={{ left: `${milestone}%` }}
          />
        ))}
      </div>
    </div>
  );
}