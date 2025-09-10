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
    <header className="bg-surface border-b border-border/50 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* User Avatar & Greeting */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-tier-blue to-tier-purple flex items-center justify-center shadow-md">
            <span className="text-lg">👤</span>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Hi there!</p>
            <p className="font-semibold text-foreground">{userName}</p>
          </div>
        </div>

        {/* Phase Badge */}
        <div className="tier-badge tier-blue">
          <span>{phaseEmoji}</span>
          <span>{currentPhase}</span>
        </div>

        {/* Streak Counter */}
        <div className="flex items-center gap-1 bg-tier-green/10 px-3 py-2 rounded-full">
          <span className="text-lg">🔥</span>
          <span className="font-bold text-tier-green">{streakCount}</span>
        </div>
      </div>
    </header>
  );
};