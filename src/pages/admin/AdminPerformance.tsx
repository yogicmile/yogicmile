import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Activity, 
  Zap, 
  Database, 
  Smartphone, 
  Globe,
  BarChart3,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Download,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface CrashData {
  date: string;
  crash_count: number;
  affected_users: number;
  top_errors: Array<{ error: string; count: number }>;
  device_breakdown: Record<string, number>;
  os_breakdown: Record<string, number>;
}

interface LoadTimeData {
  page_name: string;
  avg_load_time: number;
  user_count: number;
  device_type: string;
}

interface PerformanceMetric {
  date: string;
  page_name: string;
  average_load_time: number;
  error_rate: number;
  bounce_rate: number;
  user_count: number;
}

export const AdminPerformance: React.FC = () => {
  const [crashData, setCrashData] = useState<CrashData[]>([]);
  const [loadTimeData, setLoadTimeData] = useState<LoadTimeData[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState('7d');

  useEffect(() => {
    loadPerformanceData();
  }, [selectedDateRange]);

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      // Load crash analytics
      const { data: crashes } = await supabase
        .from('crash_analytics')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      setCrashData((crashes || []).map(item => ({
        ...item,
        top_errors: Array.isArray(item.top_errors) ? item.top_errors : [],
        device_breakdown: typeof item.device_breakdown === 'object' ? item.device_breakdown as Record<string, number> : {},
        os_breakdown: typeof item.os_breakdown === 'object' ? item.os_breakdown as Record<string, number> : {}
      })));

      // Load load time analytics
      const { data: loadTimes } = await supabase
        .from('load_time_analytics')
        .select('page_name, load_time_ms, device_type, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Aggregate load time data
      const aggregatedLoadTimes = loadTimes?.reduce((acc: any, item) => {
        const key = `${item.page_name}-${item.device_type}`;
        if (!acc[key]) {
          acc[key] = {
            page_name: item.page_name,
            device_type: item.device_type,
            total_time: 0,
            count: 0
          };
        }
        acc[key].total_time += item.load_time_ms;
        acc[key].count += 1;
        return acc;
      }, {});

      const processedLoadTimes = Object.values(aggregatedLoadTimes || {}).map((item: any) => ({
        page_name: item.page_name,
        avg_load_time: Math.round(item.total_time / item.count),
        user_count: item.count,
        device_type: item.device_type
      }));

      setLoadTimeData(processedLoadTimes);

      // Load performance metrics
      const { data: metrics } = await supabase
        .from('performance_metrics')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      setPerformanceMetrics(metrics || []);

    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalCrashes = () => {
    return crashData.reduce((sum, day) => sum + day.crash_count, 0);
  };

  const getAverageLoadTime = () => {
    const total = loadTimeData.reduce((sum, item) => sum + item.avg_load_time * item.user_count, 0);
    const totalUsers = loadTimeData.reduce((sum, item) => sum + item.user_count, 0);
    return totalUsers > 0 ? Math.round(total / totalUsers) : 0;
  };

  const getCrashTrend = () => {
    if (crashData.length < 2) return 0;
    const recent = crashData.slice(0, 3).reduce((sum, day) => sum + day.crash_count, 0);
    const previous = crashData.slice(3, 6).reduce((sum, day) => sum + day.crash_count, 0);
    return previous > 0 ? ((recent - previous) / previous) * 100 : 0;
  };

  const exportData = async (type: string) => {
    // Implementation for exporting data as CSV/PDF
    console.log('Exporting', type, 'data...');
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        Loading performance data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Performance Monitor</h1>
          <p className="text-muted-foreground">App performance, crashes, and optimization insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportData('csv')}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={loadPerformanceData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Crashes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalCrashes()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getCrashTrend() > 0 ? (
                <TrendingUp className="w-3 h-3 mr-1 text-red-500" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1 text-green-500" />
              )}
              {Math.abs(getCrashTrend()).toFixed(1)}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Load Time</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageLoadTime()}ms</div>
            <div className="text-xs text-muted-foreground">
              {getAverageLoadTime() < 1000 ? (
                <span className="text-green-500">Excellent</span>
              ) : getAverageLoadTime() < 2000 ? (
                <span className="text-yellow-500">Good</span>
              ) : (
                <span className="text-red-500">Needs Improvement</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceMetrics.length > 0 
                ? (performanceMetrics.reduce((sum, m) => sum + m.error_rate, 0) / performanceMetrics.length).toFixed(2) 
                : '0.00'}%
            </div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceMetrics.reduce((sum, m) => sum + m.user_count, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total interactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="crashes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="crashes">Crash Reports</TabsTrigger>
          <TabsTrigger value="performance">Load Times</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="battery">Battery</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
        </TabsList>

        <TabsContent value="crashes" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Crash Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Crash Trend (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={crashData.slice(0, 30).reverse()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="crash_count" stroke="#ff4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="affected_users" stroke="#ffa500" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Errors */}
            <Card>
              <CardHeader>
                <CardTitle>Most Common Errors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {crashData[0]?.top_errors?.slice(0, 5).map((error, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm font-medium truncate">{error.error}</span>
                    <Badge variant="destructive">{error.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Device Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Crashes by Device</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={Object.entries(crashData[0]?.device_breakdown || {}).map(([device, count]) => ({
                        name: device,
                        value: count
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {Object.entries(crashData[0]?.device_breakdown || {}).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* OS Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Crashes by OS</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={Object.entries(crashData[0]?.os_breakdown || {}).map(([os, count]) => ({
                    os,
                    count
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="os" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ff4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Load Times by Page */}
            <Card>
              <CardHeader>
                <CardTitle>Load Times by Page</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={loadTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="page_name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avg_load_time" fill="#4ade80" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Score */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Score by Page</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadTimeData.slice(0, 8).map((page, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{page.page_name}</span>
                      <span className={`font-semibold ${
                        page.avg_load_time < 1000 ? 'text-green-500' :
                        page.avg_load_time < 2000 ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {page.avg_load_time}ms
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          page.avg_load_time < 1000 ? 'bg-green-500' :
                          page.avg_load_time < 2000 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((3000 - page.avg_load_time) / 30, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Smartphone className="w-12 h-12 mx-auto mb-4" />
                <p>Device-specific performance metrics will be displayed here.</p>
                <p className="text-sm">Data is being collected from user devices.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="battery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Battery Usage Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4" />
                <p>Battery usage patterns and optimization metrics.</p>
                <p className="text-sm">Sync intervals and background activity analysis.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Globe className="w-12 h-12 mx-auto mb-4" />
                <p>Network quality impact on app performance.</p>
                <p className="text-sm">Connection types and sync efficiency analysis.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};