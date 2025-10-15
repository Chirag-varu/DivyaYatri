import React from 'react';
import { useScrollProgress, useParticleSystem } from '@/hooks/useAdvancedAnimations';

// Animated Background with Particles
export const AnimatedBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const particles = useParticleSystem(15);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Particle System */}
      <div className="particles">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/5 to-accent/5 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// Scroll Progress Indicator
export const ScrollProgressIndicator: React.FC = () => {
  const scrollProgress = useScrollProgress();

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-background/20 z-50 backdrop-blur-sm">
      <div
        className="progress-line h-full transition-all duration-300 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
};

// Enhanced Card with Advanced Animations
interface EnhancedCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'glass-strong' | 'glass-subtle';
  hoverEffect?: 'lift' | 'scale' | 'glow' | 'none';
  delay?: number;
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({ 
  children, 
  className = '', 
  variant = 'default',
  hoverEffect = 'lift',
  delay = 0
}) => {
  const variantClasses = {
    default: 'bg-card border border-border',
    glass: 'glass bg-amber-900/5 p-1 rounded-lg bg-card border border-border',
    'glass-strong': 'glass-strong bg-amber-900/5 p-1 rounded-lg ',
    'glass-subtle': 'glass-subtle bg-amber-900/5 p-1 rounded-lg'
  };

  const hoverClasses = {
    lift: 'hover-lift',
    scale: 'interactive-scale',
    glow: 'hover:shadow-2xl hover:shadow-primary/20',
    none: ''
  };

  return (
    <div
      className={`
        reveal-on-scroll
        ${variantClasses[variant]}
        ${hoverClasses[hoverEffect]}
        rounded-xl shadow-lg transition-all duration-500
        ${className}
      `}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
};

// Advanced Button with Ripple Effect
interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export const RippleButton: React.FC<RippleButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '', 
  ...props 
}) => {
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  return (
    <button
      className={`
        ripple relative
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        rounded-lg font-semibold
        transition-all duration-300
        transform hover:scale-105
        shadow-lg hover:shadow-xl
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

// Animated Counter Component
interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  end, 
  duration = 2000, 
  suffix = '', 
  className = '' 
}) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  return (
    <span className={`font-bold ${className}`}>
      {count.toLocaleString()}{suffix}
    </span>
  );
};

// Floating Action Element
interface FloatingElementProps {
  children: React.ReactNode;
  delay?: number;
  intensity?: 'subtle' | 'normal' | 'strong';
}

export const FloatingElement: React.FC<FloatingElementProps> = ({ 
  children, 
  delay = 0, 
  intensity = 'normal' 
}) => {
  const intensityClasses = {
    subtle: 'float',
    normal: 'float',
    strong: 'float'
  };

  return (
    <div 
      className={intensityClasses[intensity]}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
};

// Typewriter Text Effect
interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({ 
  text, 
  speed = 50, 
  className = '', 
  onComplete 
}) => {
  const [displayText, setDisplayText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

// Advanced Image with Loading State
interface AdvancedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
}

export const AdvancedImage: React.FC<AdvancedImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  fallback = '/placeholder.jpg' 
}) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {loading && !error && (
        <div className="absolute inset-0 skeleton rounded-lg" />
      )}
      
      <img
        src={error ? fallback : src}
        alt={alt}
        className={`
          w-full h-full object-cover transition-opacity duration-500
          ${loading ? 'opacity-0' : 'opacity-100'}
        `}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
      />
    </div>
  );
};