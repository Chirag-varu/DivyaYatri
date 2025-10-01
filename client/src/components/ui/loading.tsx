import React from 'react';

// Advanced Loading Skeleton Components
export const TempleCardSkeleton: React.FC = () => (
  <div className="glass rounded-xl p-6 space-y-4 animate-pulse">
    <div className="skeleton h-48 rounded-lg"></div>
    <div className="space-y-2">
      <div className="skeleton h-6 w-3/4 rounded"></div>
      <div className="skeleton h-4 w-1/2 rounded"></div>
    </div>
    <div className="flex items-center space-x-2">
      <div className="skeleton h-4 w-4 rounded-full"></div>
      <div className="skeleton h-4 w-20 rounded"></div>
    </div>
  </div>
);

export const FeatureCardSkeleton: React.FC = () => (
  <div className="glass rounded-xl p-6 space-y-4 animate-pulse">
    <div className="skeleton w-16 h-16 rounded-2xl"></div>
    <div className="space-y-2">
      <div className="skeleton h-6 w-2/3 rounded"></div>
      <div className="skeleton h-4 w-full rounded"></div>
      <div className="skeleton h-4 w-4/5 rounded"></div>
    </div>
  </div>
);

export const StatCardSkeleton: React.FC = () => (
  <div className="glass rounded-xl p-6 space-y-2 animate-pulse text-center">
    <div className="skeleton h-12 w-16 mx-auto rounded"></div>
    <div className="skeleton h-4 w-20 mx-auto rounded"></div>
  </div>
);

// Page Loading Spinner
export const PageLoader: React.FC = () => (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="relative">
      {/* Spinning ring */}
      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      
      {/* Inner pulsing dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
      </div>
      
      {/* Loading text */}
      <div className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2">
        <p className="text-primary font-medium">Loading...</p>
      </div>
    </div>
  </div>
);

// Content Shimmer Effect
export const ContentShimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`skeleton ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
  </div>
);

// Progressive Image Loading Component
interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  placeholderSrc = '/placeholder.jpg' 
}) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [currentSrc, setCurrentSrc] = React.useState(placeholderSrc);

  React.useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setCurrentSrc(src);
      setLoading(false);
    };
    img.onerror = () => {
      setError(true);
      setLoading(false);
    };
    img.src = src;
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {loading && (
        <div className="absolute inset-0 skeleton">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        </div>
      )}
      
      <img
        src={currentSrc}
        alt={alt}
        className={`
          w-full h-full object-cover transition-all duration-700
          ${loading ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}
          ${error ? 'grayscale' : ''}
        `}
        style={{
          filter: loading ? 'blur(5px)' : 'blur(0px)',
        }}
      />
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <p className="text-muted-foreground text-sm">Failed to load image</p>
        </div>
      )}
    </div>
  );
};

// Loading Button State
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({ 
  loading = false, 
  children, 
  className = '',
  disabled,
  ...props 
}) => (
  <button
    className={`
      ripple relative overflow-hidden
      transition-all duration-300
      ${loading ? 'opacity-75 cursor-not-allowed' : ''}
      ${className}
    `}
    disabled={disabled || loading}
    {...props}
  >
    {loading && (
      <div className="absolute inset-0 flex items-center justify-center bg-current/10">
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      </div>
    )}
    
    <span className={loading ? 'opacity-0' : 'opacity-100'}>
      {children}
    </span>
  </button>
);

// Fade In Animation Component
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const FadeIn: React.FC<FadeInProps> = ({ 
  children, 
  delay = 0, 
  duration = 600,
  direction = 'up' 
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const getTransform = () => {
    switch (direction) {
      case 'up': return 'translateY(30px)';
      case 'down': return 'translateY(-30px)';
      case 'left': return 'translateX(30px)';
      case 'right': return 'translateX(-30px)';
      default: return 'translateY(30px)';
    }
  };

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate(0)' : getTransform(),
        transition: `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
      }}
    >
      {children}
    </div>
  );
};

// Content Loading Placeholder
export const ContentPlaceholder: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className = '' 
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="skeleton h-4 rounded"
        style={{
          width: `${Math.random() * 40 + 60}%`,
          animationDelay: `${i * 100}ms`,
        }}
      />
    ))}
  </div>
);

// Enhanced CSS for shimmer effect (add to index.css)
export const shimmerStyles = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
`;