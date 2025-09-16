import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const AdminRewards: React.FC = () => {
  useEffect(() => {
    document.title = 'Admin • Rewards | Yogic Mile';
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rewards</h1>
        <p className="text-muted-foreground">Manage rewards catalog, pricing and stock.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>Rewards management UI will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Placeholder page added to prevent 404s.</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRewards;