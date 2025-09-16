import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const AdminAdsCoupons: React.FC = () => {
  useEffect(() => {
    document.title = 'Admin • Ads & Coupons | Yogic Mile';
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ads & Coupons</h1>
        <p className="text-muted-foreground">Create and manage ad campaigns and coupons.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>Campaign and coupon management will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Placeholder page added to prevent 404s.</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAdsCoupons;