import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const AdminModeration: React.FC = () => {
  useEffect(() => {
    document.title = 'Admin • Moderation | Yogic Mile';
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Moderation</h1>
        <p className="text-muted-foreground">Review flags, complaints and suspicious activity.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>Moderation queue will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Placeholder page added to prevent 404s.</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminModeration;