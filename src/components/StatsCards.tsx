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
      {/* Karma Points Earned Card */}
      <div className="stat-card">
        <div className="flex items-center justify-center w-14 h-14 bg-tier-gold/15 rounded-2xl mb-4 mx-auto shadow-sm">
          <span className="text-2xl">✨</span>
        </div>
        <p className="text-xs text-muted-foreground text-center mb-2 font-medium">Karma Points Today</p>
        <p className="text-2xl font-bold text-center text-tier-gold font-display">{coinsEarnedToday}</p>
      </div>

      {/* Wellness Rewards Card */}
      <div className="stat-card">
        <div className="flex items-center justify-center w-14 h-14 bg-tier-sage/15 rounded-2xl mb-4 mx-auto shadow-sm">
          <span className="text-2xl">🎁</span>
        </div>
        <p className="text-xs text-muted-foreground text-center mb-2 font-medium">Rewards Claimed</p>
        <p className="text-2xl font-bold text-center text-tier-sage font-display">{coinsRedeemedToday}</p>
      </div>
    </div>
  );
};