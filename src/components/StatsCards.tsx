interface StatsCardsProps {
  coinsEarnedToday: number;
  coinsRedeemedToday: number;
}

export const StatsCards = ({ 
  coinsEarnedToday, 
  coinsRedeemedToday 
}: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Coins Earned Card */}
      <div className="stat-card">
        <div className="flex items-center justify-center w-12 h-12 bg-tier-gold/10 rounded-full mb-3 mx-auto">
          <span className="text-2xl">🪙</span>
        </div>
        <p className="text-xs text-muted-foreground text-center mb-1">Coins Earned Today</p>
        <p className="text-2xl font-bold text-center text-tier-gold">{coinsEarnedToday}</p>
      </div>

      {/* Coins Redeemed Card */}
      <div className="stat-card">
        <div className="flex items-center justify-center w-12 h-12 bg-tier-green/10 rounded-full mb-3 mx-auto">
          <span className="text-2xl">✅</span>
        </div>
        <p className="text-xs text-muted-foreground text-center mb-1">Coins Redeemed Today</p>
        <p className="text-2xl font-bold text-center text-tier-green">{coinsRedeemedToday}</p>
      </div>
    </div>
  );
};