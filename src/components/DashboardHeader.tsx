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
    <header className="premium-glass border-b px-6 py-5" style={{ backgroundColor: 'hsl(76 47% 36%)', borderColor: 'hsl(76 47% 36% / 0.3)' }}>
      <div className="flex items-center justify-between">
        {/* Yogic Mile Brand & User */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-premium" style={{ background: 'linear-gradient(135deg, hsl(51 100% 50%), hsl(45 100% 48%))' }}>
            <span className="text-xl">🧘‍♀️</span>
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold text-white">Yogic Mile</h1>
            <p className="text-sm text-white/80">Hello, {userName}!</p>
          </div>
        </div>

        {/* Phase Badge */}
        <div className="px-4 py-2 rounded-full shadow-premium text-white" style={{ background: 'linear-gradient(135deg, hsl(76 47% 36%), hsl(51 100% 50%))' }}>
          <span className="font-bold text-sm">{phaseEmoji} {currentPhase}</span>
        </div>

        {/* User Avatar */}
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <span className="text-lg text-white">👤</span>
        </div>
      </div>
    </header>
  );
};