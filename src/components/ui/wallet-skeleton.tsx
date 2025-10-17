import { Skeleton } from "@/components/ui/skeleton";

export const WalletPageSkeleton = () => (
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

export const ProfilePageSkeleton = () => (
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
