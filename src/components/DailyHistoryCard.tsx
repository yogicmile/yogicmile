import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Footprints, 
  Coins, 
  CheckCircle, 
  Clock, 
  XCircle,
  ChevronDown,
  ChevronUp,
  Share
} from 'lucide-react';

interface CoinHistoryEntry {
  id: string;
  date: Date;
  steps: number;
  coinsEarned: number;
  rupeeValue: number;
  status: 'redeemed' | 'expired' | 'pending';
  redeemedAt?: Date;
  tier: string;
  bonusCoins?: number;
}

interface DailyHistoryCardProps {
  entry: CoinHistoryEntry;
}

const DailyHistoryCard: React.FC<DailyHistoryCardProps> = ({ entry }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDateLabel = (date: Date) => {
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'redeemed':
        return {
          icon: CheckCircle,
          text: 'Redeemed',
          className: 'bg-green-100 text-green-800 border-green-200',
          iconColor: 'text-green-600'
        };
      case 'expired':
        return {
          icon: XCircle,
          text: 'Expired',
          className: 'bg-red-100 text-red-800 border-red-200',
          iconColor: 'text-red-600'
        };
      case 'pending':
        return {
          icon: Clock,
          text: 'Pending',
          className: 'bg-orange-100 text-orange-800 border-orange-200',
          iconColor: 'text-orange-600'
        };
      default:
        return {
          icon: Clock,
          text: 'Unknown',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          iconColor: 'text-gray-600'
        };
    }
  };

  const statusConfig = getStatusConfig(entry.status);
  const StatusIcon = statusConfig.icon;

  const getTimestamp = () => {
    if (entry.status === 'redeemed' && entry.redeemedAt) {
      return `Redeemed at ${entry.redeemedAt.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })}`;
    }
    if (entry.status === 'expired') {
      return 'Expired at 12:00 AM';
    }
    return 'Available until midnight';
  };

  const handleShare = () => {
    const shareText = `🚶‍♀️ Walked ${entry.steps.toLocaleString()} steps today and earned ${entry.coinsEarned} coins! 🪙 #YogicMile #MindfulWalking`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Yogic Mile Achievement',
        text: shareText,
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareText);
    }
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Date */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="font-medium text-foreground">
                {getDateLabel(entry.date)}
              </div>
              <div className="text-xs text-muted-foreground">
                {entry.date.toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Right Section - Status */}
          <div className="text-right">
            <Badge className={`${statusConfig.className} mb-1`}>
              <StatusIcon className={`w-3 h-3 mr-1 ${statusConfig.iconColor}`} />
              {statusConfig.text}
            </Badge>
            <div className="text-xs text-muted-foreground">
              {getTimestamp()}
            </div>
          </div>
        </div>

        {/* Center Section - Steps and Coins */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Footprints className="w-4 h-4 text-primary" />
              <span className="font-medium">{entry.steps.toLocaleString()} steps</span>
            </div>
            <div className="flex items-center gap-1">
              <Coins className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-yellow-700">{entry.coinsEarned} coins</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-medium text-primary">
              ₹{entry.rupeeValue.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              = {entry.coinsEarned} coins
            </div>
          </div>
        </div>

        {/* Expandable Details */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs"
          >
            Details
            {isExpanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center gap-1 text-xs"
          >
            <Share className="w-3 h-3" />
            Share
          </Button>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-border animate-fade-in">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Tier Level</div>
                <div className="font-medium">{entry.tier}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Base Rate</div>
                <div className="font-medium">0.01 coins/step</div>
              </div>
              {entry.bonusCoins && (
                <>
                  <div>
                    <div className="text-muted-foreground">Bonus Coins</div>
                    <div className="font-medium text-green-600">+{entry.bonusCoins}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Walking Time</div>
                    <div className="font-medium">45 min</div>
                  </div>
                </>
              )}
            </div>
            
            {entry.status === 'pending' && (
              <Button className="w-full mt-3" size="sm">
                Redeem Now
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyHistoryCard;