import { useState } from 'react';
import { ChevronDown, Gift, Zap, Banknote, Plus, MoreHorizontal, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface Transaction {
  type: string;
  amount: number;
  date: string;
  source?: string;
  item?: string;
  steps?: number;
  status?: 'completed' | 'processing' | 'failed' | 'ready';
  id?: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  searchTerm?: string;
  compact?: boolean;
}

export const TransactionHistory = ({ 
  transactions, 
  searchTerm = '', 
  compact = false 
}: TransactionHistoryProps) => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<'all' | 'vouchers' | 'bills' | 'cash'>('all');

  // Filter transactions based on search and filter
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchTerm === '' || 
      (transaction.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       transaction.item?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filter === 'all') return matchesSearch;
    
    const matchesFilter = 
      (filter === 'vouchers' && (transaction.item?.includes('Voucher') || transaction.item?.includes('Coupon'))) ||
      (filter === 'bills' && transaction.source?.includes('Bill')) ||
      (filter === 'cash' && transaction.source?.includes('Bank'));
    
    return matchesSearch && matchesFilter;
  });

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.type === 'redeemed') {
      if (transaction.item?.includes('Voucher') || transaction.item?.includes('Coupon')) {
        return <Gift className="w-5 h-5 text-blue-500" />;
      }
      if (transaction.source?.includes('Bill')) {
        return <Zap className="w-5 h-5 text-green-500" />;
      }
      return <Banknote className="w-5 h-5 text-tier-1-paisa" />;
    }
    if (transaction.type === 'bonus') {
      return <Plus className="w-5 h-5 text-purple-500" />;
    }
    return <Plus className="w-5 h-5 text-success" />;
  };

  const getTransactionColor = (transaction: Transaction) => {
    if (transaction.amount > 0) return 'text-success';
    return 'text-muted-foreground';
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-success/10 text-success">✅ Completed</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="bg-warning/10 text-warning">⏳ Processing</Badge>;
      case 'failed':
        return <Badge variant="secondary" className="bg-destructive/10 text-destructive">❌ Failed</Badge>;
      case 'ready':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">🎁 Ready to use</Badge>;
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
    const enhancedTransaction = {
      ...transaction,
      id: `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: transaction.status || 'completed'
    };
    setSelectedTransaction(enhancedTransaction);
  };

  return (
    <div className="space-y-4">
      {/* Filter buttons - only show if not compact */}
      {!compact && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'vouchers', 'bills', 'cash'].map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterType as typeof filter)}
              className="whitespace-nowrap capitalize"
            >
              {filterType === 'all' ? 'All Transactions' : filterType}
            </Button>
          ))}
        </div>
      )}

      {/* Transaction List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🧘‍♀️</div>
            <h3 className="font-semibold mb-2">No transactions yet</h3>
            <p className="text-muted-foreground text-sm">
              Start walking to earn your first coins for redemption
            </p>
          </div>
        ) : (
          filteredTransactions.slice(0, compact ? 3 : undefined).map((transaction, index) => (
            <div
              key={index}
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
                    {transaction.item || transaction.source || 'Daily Steps'}
                  </h4>
                  <span className={cn("font-bold text-sm", getTransactionColor(transaction))}>
                    {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {formatDate(transaction.date)}
                    </p>
                    {transaction.steps && (
                      <p className="text-xs text-muted-foreground">
                        From {transaction.steps.toLocaleString()} steps
                      </p>
                    )}
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

      {/* Show more button for compact view */}
      {compact && filteredTransactions.length > 3 && (
        <Button variant="ghost" className="w-full">
          <ChevronDown className="w-4 h-4 mr-2" />
          View {filteredTransactions.length - 3} More Transactions
        </Button>
      )}

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
                  {selectedTransaction.amount > 0 ? '+' : ''}₹{Math.abs(selectedTransaction.amount)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedTransaction.item || selectedTransaction.source}
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
                
                {selectedTransaction.steps && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Steps Taken</span>
                    <span className="text-sm">{selectedTransaction.steps.toLocaleString()}</span>
                  </div>
                )}
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