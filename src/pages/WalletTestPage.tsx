import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WalletTestPanel } from '@/components/WalletTestPanel';

export const WalletTestPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface/80 backdrop-blur-md border-b sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="p-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="text-xs text-tier-1-paisa font-medium">Development Tool</div>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold font-display flex items-center justify-center gap-2">
              🧪 Wallet Testing Suite
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Test Cases TC028-TC035: Comprehensive wallet system validation
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto py-6">
        <WalletTestPanel />
      </div>

      {/* Test Case Reference */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-surface/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg max-w-xs">
          <h3 className="text-sm font-medium mb-2">Test Coverage</h3>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div>• TC028: Earnings Update</div>
            <div>• TC029: Transaction History</div>
            <div>• TC030: Balance Accuracy</div>
            <div>• TC031: Bonus Earnings</div>
            <div>• TC032: Security Prevention</div>
            <div>• TC033: Invalid Transactions</div>
            <div>• TC034: Concurrent Operations</div>
            <div>• TC035: Midnight Calculations</div>
          </div>
        </div>
      </div>
    </div>
  );
};