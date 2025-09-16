import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const AdminAnalytics: React.FC = () => {
  useEffect(() => {
    document.title = 'Admin • Analytics | Yogic Mile';
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Explore user, engagement and financial analytics.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>Analytics dashboards will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Placeholder page added to prevent 404s.</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;