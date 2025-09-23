import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  TrendingUp, 
  Footprints, 
  DollarSign,
  Activity,
  AlertTriangle,
  RefreshCw,
  Plus,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AdminTestingQuickActions } from '@/components/admin/AdminTestingQuickActions';

interface DashboardStats {
  totalUsers: number;
  userGrowth: number;
  dailyActiveUsers: number;
  totalStepsToday: number;
  revenueToday: number;
  activeCampaigns: number;
}

interface SystemAlert {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    userGrowth: 0,
    dailyActiveUsers: 0,
    totalStepsToday: 0,
    revenueToday: 0,
    activeCampaigns: 0,
  });
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Fetch users from yesterday for growth calculation
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count: yesterdayUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', yesterday.toISOString());

      const userGrowth = yesterdayUsers ? 
        Math.round(((totalUsers || 0) - yesterdayUsers) / yesterdayUsers * 100) : 0;

      // Fetch today's active users (users with steps today)
      const today = new Date().toISOString().split('T')[0];
      const { count: dailyActiveUsers } = await supabase
        .from('step_logs')
        .select('user_id', { count: 'exact', head: true })
        .eq('date', today);

      // Fetch today's total steps
      const { data: stepData } = await supabase
        .from('step_logs')
        .select('steps')
        .eq('date', today);
      
      const totalStepsToday = stepData?.reduce((sum, log) => sum + (log.steps || 0), 0) || 0;

      // Fetch today's revenue (from transactions)
      const { data: revenueData } = await supabase
        .from('transactions')
        .select('amount')
        .gte('created_at', today + 'T00:00:00')
        .eq('type', 'earning');
      
      const revenueToday = revenueData?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;

      // Fetch active campaigns
      const { count: activeCampaigns } = await supabase
        .from('marketing_campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch recent system alerts
      const { data: alertData } = await supabase
        .from('system_alerts')
        .select('id, title, severity, created_at')
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalUsers: totalUsers || 0,
        userGrowth,
        dailyActiveUsers: dailyActiveUsers || 0,
        totalStepsToday,
        revenueToday: revenueToday / 100, // Convert paisa to rupees
        activeCampaigns: activeCampaigns || 0,
      });

      setAlerts((alertData || []).map(alert => ({
        ...alert,
        severity: alert.severity as 'low' | 'medium' | 'high' | 'critical'
      })));
      setLastUpdated(new Date());

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        variant: "destructive",
        title: "Error loading dashboard",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto refresh every 60 seconds
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to Yogic Mile admin panel. Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={fetchDashboardData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`${stats.userGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.userGrowth >= 0 ? '+' : ''}{stats.userGrowth}%
              </span>
              {' '}from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dailyActiveUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Users who logged steps today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Steps Today</CardTitle>
            <Footprints className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStepsToday.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Steps logged by all users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.revenueToday.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From step earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              Running marketing campaigns
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={() => navigate('/admin/users')}
            >
              <Users className="h-5 w-5 mb-2" />
              <span>Manage Users</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={() => navigate('/admin/ads')}
            >
              <Plus className="h-5 w-5 mb-2" />
              <span>Create Ad</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={() => navigate('/admin/rewards')}
            >
              <Plus className="h-5 w-5 mb-2" />
              <span>Add Reward</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={() => navigate('/admin/analytics')}
            >
              <Eye className="h-5 w-5 mb-2" />
              <span>View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Admin Testing Suite */}
      <AdminTestingQuickActions />

      {/* System Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              System Alerts
            </CardTitle>
            <CardDescription>Recent unresolved alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <span className="font-medium">{alert.title}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatTimeAgo(alert.created_at)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};