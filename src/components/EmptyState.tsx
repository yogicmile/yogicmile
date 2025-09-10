import React from 'react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      {icon && (
        <div className="mb-4 flex justify-center">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        {description}
      </p>
      
      {action && (
        <Button 
          onClick={action.onClick}
          className="btn-secondary"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

// Predefined empty states for common scenarios
export const NoStepsEmptyState: React.FC<{ onStartWalking: () => void }> = ({ onStartWalking }) => (
  <EmptyState
    icon={<div className="text-6xl">👟</div>}
    title="Start Your Journey"
    description="Take your first steps towards wellness. Every journey begins with a single step!"
    action={{
      label: "Start Walking",
      onClick: onStartWalking
    }}
  />
);

export const NoTransactionsEmptyState: React.FC = () => (
  <EmptyState
    icon={<div className="text-6xl">💰</div>}
    title="No Transactions Yet"
    description="Start earning coins by taking steps! Your transaction history will appear here."
  />
);

export const NoRewardsEmptyState: React.FC<{ onBrowseStore: () => void }> = ({ onBrowseStore }) => (
  <EmptyState
    icon={<div className="text-6xl">🎁</div>}
    title="No Rewards Available"
    description="Check back later for new rewards, or earn more coins to unlock exclusive offers!"
    action={{
      label: "Browse Store",
      onClick: onBrowseStore
    }}
  />
);