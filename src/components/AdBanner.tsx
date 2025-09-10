interface AdBannerProps {
  type: 'header' | 'inline';
}

export const AdBanner = ({ type }: AdBannerProps) => {
  const isHeader = type === 'header';
  
  return (
    <div className={`mx-6 my-4 ad-banner ${isHeader ? 'h-12' : 'h-24'}`}>
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center gap-3">
          <div className={`${isHeader ? 'w-8 h-8' : 'w-12 h-12'} bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center`}>
            <span className={`${isHeader ? 'text-sm' : 'text-lg'}`}>📱</span>
          </div>
          <div>
            <p className={`font-semibold text-foreground ${isHeader ? 'text-xs' : 'text-sm'}`}>
              Sponsored Content
            </p>
            {!isHeader && (
              <p className="text-xs text-muted-foreground">
                Discover amazing apps & offers
              </p>
            )}
          </div>
        </div>
        <div className={`px-3 py-1 bg-primary/10 rounded-full ${isHeader ? 'text-xs' : 'text-sm'}`}>
          <span className="text-primary font-medium">Ad</span>
        </div>
      </div>
    </div>
  );
};