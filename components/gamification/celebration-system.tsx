'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface CelebrationConfig {
  type: 'sparkle' | 'stars' | 'confetti' | 'fireworks' | 'rainbow';
  duration: number;
  intensity: 'light' | 'medium' | 'heavy';
  color?: string;
  message?: string;
  sound?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  opacity: number;
}

export function CelebrationSystem({ config, onComplete }: { 
  config: CelebrationConfig | null; 
  onComplete?: () => void;
}) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!config) return;

    setIsActive(true);
    const particleCount = 
      config.intensity === 'light' ? 20 :
      config.intensity === 'medium' ? 50 :
      100;

    // Generate particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push(createParticle(i, config));
    }
    setParticles(newParticles);

    // Animate particles
    const startTime = Date.now();
    const animationFrame = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > config.duration) {
        setIsActive(false);
        setParticles([]);
        onComplete?.();
        return;
      }

      setParticles(prev => prev.map(particle => updateParticle(particle, elapsed / 1000)));
      requestAnimationFrame(animationFrame);
    };
    requestAnimationFrame(animationFrame);

    // Play sound if configured
    if (config.sound && typeof window !== 'undefined' && 'Audio' in window) {
      const audio = new Audio(config.sound);
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Ignore audio errors (autoplay policies)
      });
    }
  }, [config, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Particles */}
      <svg className="absolute inset-0 w-full h-full">
        {particles.map(particle => (
          <g key={particle.id} opacity={particle.opacity}>
            {renderParticle(particle, config!.type)}
          </g>
        ))}
      </svg>

      {/* Message */}
      {config?.message && (
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className={cn(
            "text-4xl md:text-6xl font-black animate-bounce-in",
            "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500",
            "drop-shadow-lg"
          )}>
            {config.message}
          </h2>
        </div>
      )}
    </div>
  );
}

function createParticle(id: number, config: CelebrationConfig): Particle {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  
  switch (config.type) {
    case 'confetti':
      return {
        id,
        x: Math.random() * window.innerWidth,
        y: -50,
        vx: (Math.random() - 0.5) * 200,
        vy: Math.random() * 200 + 200,
        size: Math.random() * 10 + 5,
        color: getRandomColor(),
        rotation: Math.random() * 360,
        opacity: 1,
      };
      
    case 'fireworks':
      const angle = (Math.PI * 2 * id) / 100;
      const velocity = Math.random() * 300 + 200;
      return {
        id,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size: Math.random() * 4 + 2,
        color: config.color || getRandomColor(),
        rotation: 0,
        opacity: 1,
      };
      
    case 'sparkle':
    case 'stars':
    default:
      return {
        id,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 50,
        vy: (Math.random() - 0.5) * 50,
        size: Math.random() * 15 + 5,
        color: config.color || '#FFD700',
        rotation: 0,
        opacity: Math.random(),
      };
  }
}

function updateParticle(particle: Particle, deltaTime: number): Particle {
  return {
    ...particle,
    x: particle.x + particle.vx * deltaTime,
    y: particle.y + particle.vy * deltaTime,
    vy: particle.vy + 500 * deltaTime, // gravity
    rotation: particle.rotation + 180 * deltaTime,
    opacity: Math.max(0, particle.opacity - deltaTime * 0.5),
  };
}

function renderParticle(particle: Particle, type: string) {
  const transform = `translate(${particle.x}, ${particle.y}) rotate(${particle.rotation})`;
  
  switch (type) {
    case 'confetti':
      return (
        <rect
          transform={transform}
          x={-particle.size / 2}
          y={-particle.size / 2}
          width={particle.size}
          height={particle.size * 2}
          fill={particle.color}
          rx={1}
        />
      );
      
    case 'stars':
      return (
        <path
          transform={transform}
          d={createStarPath(particle.size)}
          fill={particle.color}
        />
      );
      
    case 'sparkle':
      return (
        <circle
          transform={transform}
          r={particle.size}
          fill={particle.color}
          filter="url(#glow)"
        >
          <animate
            attributeName="r"
            values={`${particle.size};${particle.size * 1.5};${particle.size}`}
            dur="0.5s"
            repeatCount="indefinite"
          />
        </circle>
      );
      
    default:
      return (
        <circle
          cx={particle.x}
          cy={particle.y}
          r={particle.size}
          fill={particle.color}
        />
      );
  }
}

function createStarPath(size: number): string {
  const outerRadius = size;
  const innerRadius = size * 0.4;
  const points = 5;
  let path = 'M';
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI * i) / points;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    path += `${x},${y} `;
  }
  
  return path + 'Z';
}

function getRandomColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#FF69B4', '#FFD700', '#FF8C00', '#32CD32'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Celebration presets
export const CELEBRATION_PRESETS = {
  correctAnswer: {
    type: 'sparkle' as const,
    duration: 1000,
    intensity: 'light' as const,
    color: '#4ECDC4',
  },
  
  streak5: {
    type: 'stars' as const,
    duration: 1500,
    intensity: 'medium' as const,
    color: '#FFD700',
    message: 'Nice Streak!',
  },
  
  streak10: {
    type: 'confetti' as const,
    duration: 2000,
    intensity: 'medium' as const,
    message: 'Amazing!',
  },
  
  streak20: {
    type: 'fireworks' as const,
    duration: 3000,
    intensity: 'heavy' as const,
    message: 'LEGENDARY!',
  },
  
  levelUp: {
    type: 'fireworks' as const,
    duration: 4000,
    intensity: 'heavy' as const,
    message: 'LEVEL UP!',
  },
  
  perfectScore: {
    type: 'rainbow' as const,
    duration: 3000,
    intensity: 'heavy' as const,
    message: 'PERFECT!',
  },
};