interface DashboardHeaderProps {
  userName: string;
  currentPhase: string;
  phaseEmoji: string;
  streakCount: number;
}

export const DashboardHeader = ({ 
  userName, 
  currentPhase, 
  phaseEmoji, 
  streakCount 
}: DashboardHeaderProps) => {
  return (
    <header className="premium-glass border-b border-border/30 px-6 py-5">
      <div className="flex items-center justify-between">
        {/* Yogic Mile Brand & User */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center shadow-premium">
            <span className="text-xl">🧘‍♂️</span>
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold text-primary">Yogic Mile</h1>
            <p className="text-sm text-muted-foreground">Namaste, {userName}!</p>
          </div>
        </div>

        {/* Phase Badge */}
        <div className="dashboard-card bg-gradient-to-r from-tier-1-paisa via-tier-1-paisa/90 to-tier-2-coin/80 text-tier-1-paisa-foreground px-4 py-2 rounded-full shadow-premium">
          <span className="font-bold text-sm">{phaseEmoji} {currentPhase}</span>
        </div>

        {/* Streak Counter */}
        <div className="flex items-center gap-2 bg-tier-1-paisa/15 px-4 py-2 rounded-full shadow-sm">
          <span className="text-lg">🔥</span>
          <span className="font-bold text-tier-1-paisa">{streakCount}</span>
        </div>
      </div>
    </header>
  );
};