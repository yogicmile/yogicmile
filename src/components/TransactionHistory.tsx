import { useState } from 'react';
import { ChevronDown, Gift, Zap, Banknote, Plus, MoreHorizontal, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface Transaction {
  id: string;
  type: 'earning' | 'redemption' | 'referral' | 'spin';
  amount: number;
  date: string;
  description: string;
  icon: string;
  status: 'completed' | 'pending' | 'failed' | 'expired';
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export const TransactionHistory = ({ transactions }: TransactionHistoryProps) => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const getTransactionIcon = (transaction: Transaction) => {
    return <span className="text-2xl">{transaction.icon}</span>;
  };

  const getTransactionColor = (transaction: Transaction) => {
    if (transaction.amount > 0) return 'text-success';
    return 'text-muted-foreground';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-success/10 text-success">✅ Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-warning/10 text-warning">⏳ Pending</Badge>;
      case 'failed':
        return <Badge variant="secondary" className="bg-destructive/10 text-destructive">❌ Failed</Badge>;
      case 'expired':
        return <Badge variant="secondary" className="bg-muted/10 text-muted-foreground">⏰ Expired</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  return (
    <div className="space-y-4">
      {/* Transaction List */}
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🧘‍♀️</div>
            <h3 className="font-semibold mb-2">No transactions yet</h3>
            <p className="text-muted-foreground text-sm">
              Start walking to earn your first coins for redemption
            </p>
          </div>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center gap-4 p-4 bg-surface/50 rounded-xl border hover:bg-surface/80 transition-colors cursor-pointer"
              onClick={() => handleTransactionClick(transaction)}
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                {getTransactionIcon(transaction)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-sm truncate">
                    {transaction.description}
                  </h4>
                  <span className={cn("font-bold text-sm", getTransactionColor(transaction))}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount} paisa (₹{Math.abs(transaction.amount / 100).toFixed(2)})
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(transaction.status)}
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Transaction Detail Modal */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTransaction && getTransactionIcon(selectedTransaction)}
              Transaction Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-secondary/30 rounded-xl">
                <div className="text-2xl font-bold text-tier-1-paisa mb-1">
                  {selectedTransaction.amount > 0 ? '+' : ''}{selectedTransaction.amount} paisa (₹{Math.abs(selectedTransaction.amount / 100).toFixed(2)})
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedTransaction.description}
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Transaction ID</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{selectedTransaction.id}</span>
                    <Button variant="ghost" size="sm" className="p-1">
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date & Time</span>
                  <span className="text-sm">{formatDate(selectedTransaction.date)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {getStatusBadge(selectedTransaction.status)}
                </div>
                
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Receipt
                </Button>
                {selectedTransaction.status === 'failed' && (
                  <Button className="flex-1">
                    Retry Transaction
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};