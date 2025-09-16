import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Coins, ArrowRight } from 'lucide-react';

interface DailyRedeemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  todaysEarnings: number;
  onConfirm: () => void;
}

export const DailyRedeemModal = ({ 
  open, 
  onOpenChange, 
  todaysEarnings, 
  onConfirm 
}: DailyRedeemModalProps) => {
  const earningsInRupees = (todaysEarnings / 100).toFixed(2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">Redeem Today's Coins</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Earnings Display */}
          <Card className="p-4 bg-gradient-to-r from-tier-1-paisa/10 to-tier-2-rupaya/10 border-tier-1-paisa/20">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coins className="w-6 h-6 text-tier-1-paisa" />
                <span className="text-2xl font-bold text-tier-1-paisa">
                  {todaysEarnings} paisa
                </span>
              </div>
              <div className="text-lg font-semibold text-foreground">
                ₹{earningsInRupees}
              </div>
              <div className="text-sm text-muted-foreground">Today's Earnings</div>
            </div>
          </Card>

          {/* Flow Visualization */}
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl">⏰</span>
              </div>
              <div className="text-xs text-muted-foreground">Daily Coins</div>
            </div>
            
            <ArrowRight className="w-6 h-6 text-tier-1-paisa" />
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl">💰</span>
              </div>
              <div className="text-xs text-muted-foreground">Permanent Wallet</div>
            </div>
          </div>

          {/* Description */}
          <div className="text-center text-sm text-muted-foreground">
            Add today's earnings to your permanent wallet balance. 
            Unredeemed coins will expire at midnight.
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-tier-1-paisa to-tier-2-rupaya hover:from-tier-2-rupaya hover:to-tier-1-paisa"
              onClick={onConfirm}
            >
              Confirm Redeem
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};