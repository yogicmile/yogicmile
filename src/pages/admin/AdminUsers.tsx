import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const AdminUsers: React.FC = () => {
  useEffect(() => {
    document.title = 'Admin • Users | Yogic Mile';
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage user accounts, status, wallets and profiles.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>Full user management table with filters and actions will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Navigation is wired. This placeholder prevents 404s while we build the module.</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;