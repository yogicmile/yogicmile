import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div
    className={cn(
      "animate-pulse rounded-md bg-muted/50",
      className
    )}
  />
);

// Home page skeleton
export const HomePageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-background p-4 space-y-6">
    {/* Header skeleton */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Skeleton className="w-14 h-14 rounded-full" />
        <div>
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-8 w-24 rounded-full" />
    </div>

    {/* Step counter skeleton */}
    <div className="bg-surface/50 rounded-2xl p-6 space-y-4">
      <Skeleton className="h-6 w-48 mx-auto" />
      <Skeleton className="h-16 w-32 mx-auto" />
      <Skeleton className="h-4 w-64 mx-auto" />
    </div>

    {/* Phase progress skeleton */}
    <div className="bg-surface/50 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-3 w-full rounded-full" />
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-12 mx-auto" />
          <Skeleton className="h-3 w-16 mx-auto" />
        </div>
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-12 mx-auto" />
          <Skeleton className="h-3 w-16 mx-auto" />
        </div>
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-12 mx-auto" />
          <Skeleton className="h-3 w-16 mx-auto" />
        </div>
      </div>
    </div>

    {/* Navigation cards skeleton */}
    <div className="space-y-4">
      <Skeleton className="h-6 w-40" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface/50 rounded-2xl p-4 space-y-3">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Wallet page skeleton
export const WalletPageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-background p-4 space-y-6">
    {/* Header */}
    <div className="flex items-center gap-4">
      <Skeleton className="h-6 w-6" />
      <Skeleton className="h-7 w-32" />
    </div>

    {/* Balance card skeleton */}
    <div className="bg-surface/50 rounded-2xl p-6 space-y-4">
      <Skeleton className="h-6 w-32 mx-auto" />
      <Skeleton className="h-12 w-40 mx-auto" />
      <div className="flex justify-center gap-4">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    </div>

    {/* Transaction history skeleton */}
    <div className="space-y-4">
      <Skeleton className="h-6 w-48" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-surface/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  </div>
);

// Rewards page skeleton
export const RewardsPageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-background p-4 space-y-6">
    {/* Header */}
    <div className="flex items-center gap-4">
      <Skeleton className="h-6 w-6" />
      <Skeleton className="h-7 w-28" />
    </div>

    {/* Tabs skeleton */}
    <div className="flex space-x-1 bg-surface/50 p-1 rounded-lg">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-8 w-24 rounded-md" />
      ))}
    </div>

    {/* Rewards grid skeleton */}
    <div className="grid grid-cols-2 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-surface/50 rounded-lg p-4 space-y-3">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Profile page skeleton
export const ProfilePageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-background p-4 space-y-6">
    {/* Profile header skeleton */}
    <div className="text-center space-y-4">
      <Skeleton className="h-20 w-20 rounded-full mx-auto" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-32 mx-auto" />
        <Skeleton className="h-4 w-24 mx-auto" />
      </div>
    </div>

    {/* Stats grid skeleton */}
    <div className="grid grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-surface/50 rounded-lg p-4 space-y-2 text-center">
          <Skeleton className="h-8 w-16 mx-auto" />
          <Skeleton className="h-3 w-20 mx-auto" />
        </div>
      ))}
    </div>

    {/* Menu items skeleton */}
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 bg-surface/50 rounded-lg">
          <Skeleton className="h-5 w-5" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-4 w-4" />
        </div>
      ))}
    </div>
  </div>
);

// Generic loading skeleton for lists
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div className="space-y-3">
    {[...Array(items)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 bg-surface/50 rounded-lg">
        <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-6 w-6" />
      </div>
    ))}
  </div>
);

// Card grid skeleton
export const CardGridSkeleton: React.FC<{ columns?: number; items?: number }> = ({ 
  columns = 2, 
  items = 6 
}) => (
  <div className={`grid grid-cols-${columns} gap-4`}>
    {[...Array(items)].map((_, i) => (
      <div key={i} className="bg-surface/50 rounded-lg p-4 space-y-3">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    ))}
  </div>
);

// Loading component with spinner
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn(
      "animate-spin rounded-full border-2 border-muted-foreground/20 border-t-primary",
      sizeClasses[size],
      className
    )} />
  );
};

// Full page loading with message
export const FullPageLoading: React.FC<{ message?: string }> = ({ 
  message = "Loading..." 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  </div>
);