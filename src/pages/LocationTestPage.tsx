import { LocationBasedTestPanel } from '@/components/LocationBasedTestPanel';
import { DashboardHeader } from '@/components/DashboardHeader';

export const LocationTestPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-light to-whitish-blue">
      <DashboardHeader 
        userName="Test User"
        currentPhase="Phase 1"
        phaseEmoji="🧘"
        streakCount={5}
      />
      <div className="container mx-auto px-4 py-8">
        <LocationBasedTestPanel />
      </div>
    </div>
  );
};