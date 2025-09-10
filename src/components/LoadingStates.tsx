import React from 'react';

// Skeleton components for loading states
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`skeleton-card ${className}`} />
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className 
}) => (
  <div className={className}>
    {Array.from({ length: lines }, (_, i) => (
      <div 
        key={i} 
        className={`skeleton-text ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} 
      />
    ))}
  </div>
);

export const SkeletonAvatar: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`skeleton-avatar ${className}`} />
);

export const SkeletonProgressRing: React.FC = () => (
  <div className="flex flex-col items-center py-6">
    <div className="relative w-52 h-52 mb-4">
      <div className="skeleton w-full h-full rounded-full" />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="skeleton-text w-24 mb-2" />
        <div className="skeleton-text w-16 mb-2" />
        <div className="skeleton-text w-20" />
      </div>
    </div>
    <div className="text-center">
      <div className="skeleton-text w-16 mb-2" />
      <div className="skeleton-text w-32" />
    </div>
  </div>
);

export const SkeletonStatsCards: React.FC = () => (
  <div className="grid grid-cols-2 gap-4">
    <div className="skeleton-card h-24" />
    <div className="skeleton-card h-24" />
  </div>
);

export const SkeletonNavigationCards: React.FC = () => (
  <div>
    <div className="skeleton-text w-32 mb-6" />
    <div className="grid grid-cols-2 gap-5">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="dashboard-card text-center">
          <div className="skeleton w-16 h-16 rounded-2xl mx-auto mb-4" />
          <div className="skeleton-text w-20 mx-auto mb-2" />
          <div className="skeleton-text w-16 mx-auto" />
        </div>
      ))}
    </div>
  </div>
);

// Loading spinner component
export const LoadingSpinner: React.FC<{ 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <div 
      className={`animate-spin rounded-full border-2 border-primary border-t-transparent ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Full page loading component
export const PageLoading: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <LoadingSpinner size="lg" className="mx-auto mb-4" />
      <p className="text-muted-foreground">Loading your Yogic Mile journey...</p>
    </div>
  </div>
);