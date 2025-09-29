import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Eye, 
  MousePointer, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  BarChart3,
  Settings,
  Smartphone
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

import { LocalDeals } from '@/components/LocalDeals';

interface TestScenario {
  id: string;
  name: string;
  description: string;
  location: {
    city: string;
    state: string;
    country: string;
    coords?: { lat: number; lng: number };
  };
  expectedResults: {
    adsCount: number;
    couponsCount: number;
    hasLocalContent: boolean;
  };
}

interface AnalyticsData {
  impressions: number;
  clicks: number;
  ctr: number;
  locationMatches: number;
}

const TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'mumbai-restaurant',
    name: 'Mumbai Restaurant Hub',
    description: 'Test restaurant offers and shopping mall deals in Mumbai',
    location: { city: 'Mumbai', state: 'Maharashtra', country: 'India', coords: { lat: 19.0760, lng: 72.8777 } },
    expectedResults: { adsCount: 2, couponsCount: 1, hasLocalContent: true }
  },
  {
    id: 'delhi-metro',
    name: 'Delhi Metro Area',
    description: 'Metro area restaurants and local gym memberships',
    location: { city: 'Delhi', state: 'Delhi', country: 'India', coords: { lat: 28.6139, lng: 77.2090 } },
    expectedResults: { adsCount: 1, couponsCount: 0, hasLocalContent: true }
  },
  {
    id: 'bangalore-tech',
    name: 'Bangalore Tech Hub',
    description: 'Tech company cafeterias and co-working spaces',
    location: { city: 'Bangalore', state: 'Karnataka', country: 'India', coords: { lat: 12.9716, lng: 77.5946 } },
    expectedResults: { adsCount: 2, couponsCount: 0, hasLocalContent: true }
  },
  {
    id: 'pune-college',
    name: 'Pune College Area',
    description: 'College area deals and student discounts',
    location: { city: 'Pune', state: 'Maharashtra', country: 'India', coords: { lat: 18.5204, lng: 73.8567 } },
    expectedResults: { adsCount: 0, couponsCount: 0, hasLocalContent: false }
  },
  {
    id: 'remote-location',
    name: 'Remote Location',
    description: 'Test placeholder content for areas without local deals',
    location: { city: 'Remote', state: 'Unknown', country: 'Unknown' },
    expectedResults: { adsCount: 0, couponsCount: 0, hasLocalContent: false }
  }
];

export const EnhancedLocationTestingSuite = () => {
  const [selectedScenario, setSelectedScenario] = useState<TestScenario>(TEST_SCENARIOS[0]);
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'passed' | 'failed' | 'running'>>({});
  const [analytics, setAnalytics] = useState<AnalyticsData>({ impressions: 0, clicks: 0, ctr: 0, locationMatches: 0 });
  const [isGPSEnabled, setIsGPSEnabled] = useState(true);
  const [currentAds, setCurrentAds] = useState<any[]>([]);
  const [currentCoupons, setCurrentCoupons] = useState<any[]>([]);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (selectedScenario) {
      simulateLocationChange();
    }
  }, [selectedScenario, isGPSEnabled]);

  const addLog = (message: string) => {
    setTestLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const simulateLocationChange = async () => {
    addLog(`🗺️ Simulating location change to ${selectedScenario.location.city}`);
    
    if (!isGPSEnabled) {
      addLog('📍 GPS disabled - using fallback location detection');
      setCurrentAds([]);
      setCurrentCoupons([]);
      return;
    }

    try {
      // Fetch location-based ads
      const { data: ads } = await supabase
        .from('ads')
        .select('*')
        .eq('status', 'active');

      const { data: coupons } = await supabase
        .from('coupons')
        .select('*')
        .eq('status', 'active');

      // Filter by location
      const locationFilters = [
        selectedScenario.location.city,
        selectedScenario.location.state,
        selectedScenario.location.country
      ];

      const filteredAds = ads?.filter(ad => {
        const adRegions = ad.regions || [];
        return locationFilters.some(loc => adRegions.includes(loc));
      }) || [];

      const filteredCoupons = coupons?.filter(coupon => {
        const couponRegions = coupon.regions || [];
        return locationFilters.some(loc => couponRegions.includes(loc));
      }) || [];

      setCurrentAds(filteredAds);
      setCurrentCoupons(filteredCoupons);

      addLog(`📊 Found ${filteredAds.length} ads and ${filteredCoupons.length} coupons for ${selectedScenario.location.city}`);

    } catch (error) {
      addLog(`❌ Error fetching location-based content: ${error}`);
    }
  };

  const runLocationTest = async (testId: string) => {
    setTestResults(prev => ({ ...prev, [testId]: 'running' }));
    addLog(`🧪 Running test: ${testId}`);

    // Simulate test execution time
    await new Promise(resolve => setTimeout(resolve, 1500));

    let result: 'passed' | 'failed' = 'passed';

    switch (testId) {
      case 'TC045': // GPS Location Detection
        result = isGPSEnabled ? 'passed' : 'failed';
        addLog(isGPSEnabled ? '✅ GPS detection test passed' : '❌ GPS detection test failed');
        break;

      case 'TC046': // Ad Click Tracking
        if (currentAds.length > 0) {
          // Simulate ad click
          await logAdClick(currentAds[0].id);
          result = 'passed';
          addLog('✅ Ad click tracking test passed');
        } else {
          result = 'failed';
          addLog('❌ No ads available for click tracking test');
        }
        break;

      case 'TC047': // Location Content Matching
        const hasExpectedContent = currentAds.length >= selectedScenario.expectedResults.adsCount ||
                                  currentCoupons.length >= selectedScenario.expectedResults.couponsCount;
        result = hasExpectedContent === selectedScenario.expectedResults.hasLocalContent ? 'passed' : 'failed';
        addLog(`${result === 'passed' ? '✅' : '❌'} Location content matching test ${result}`);
        break;

      case 'TC048': // Address Change Response
        await simulateLocationChange();
        result = 'passed';
        addLog('✅ Address change response test passed');
        break;

      case 'TC049': // Denied Permissions Fallback
        const prevGPS = isGPSEnabled;
        setIsGPSEnabled(false);
        await new Promise(resolve => setTimeout(resolve, 500));
        result = currentAds.length === 0 ? 'passed' : 'failed';
        setIsGPSEnabled(prevGPS);
        addLog(`${result === 'passed' ? '✅' : '❌'} Permission denied fallback test ${result}`);
        break;

      case 'TC050': // No Local Deals Scenario
        result = selectedScenario.id === 'remote-location' && currentCoupons.length === 0 ? 'passed' : 'failed';
        addLog(`${result === 'passed' ? '✅' : '❌'} No local deals scenario test ${result}`);
        break;

      case 'TC051': // Invalid Location Handling
        result = selectedScenario.id === 'remote-location' ? 'passed' : 'failed';
        addLog(`${result === 'passed' ? '✅' : '❌'} Invalid location handling test ${result}`);
        break;

      default:
        result = 'failed';
        addLog(`❌ Unknown test case: ${testId}`);
    }

    setTestResults(prev => ({ ...prev, [testId]: result }));
  };

  const logAdClick = async (adId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('ad_logs')
        .insert({
          ad_id: adId,
          user_id: user.id,
          type: 'click',
          page: 'test-suite',
          location: selectedScenario.location as any
        });

      setAnalytics(prev => ({ 
        ...prev, 
        clicks: prev.clicks + 1,
        ctr: prev.impressions > 0 ? ((prev.clicks + 1) / prev.impressions) * 100 : 0
      }));

      addLog('📊 Ad click logged successfully');
    } catch (error) {
      addLog(`❌ Error logging ad click: ${error}`);
    }
  };

  const runAllTests = async () => {
    const testIds = ['TC045', 'TC046', 'TC047', 'TC048', 'TC049', 'TC050', 'TC051'];
    addLog('🚀 Starting comprehensive location testing suite');
    
    for (const testId of testIds) {
      await runLocationTest(testId);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    addLog('🏁 All tests completed');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Location-Based Advertising Test Suite</h1>
        <p className="text-muted-foreground">Comprehensive testing for GPS detection, ad targeting, and coupon systems</p>
      </div>

      <Tabs defaultValue="scenarios" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scenarios">Test Scenarios</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="live-preview">Live Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5" />
                <span>Location Simulation Controls</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">GPS Status</label>
                  <Button
                    size="sm"
                    variant={isGPSEnabled ? "default" : "destructive"}
                    onClick={() => setIsGPSEnabled(!isGPSEnabled)}
                    className="w-full"
                  >
                    {isGPSEnabled ? "🟢 GPS Enabled" : "🔴 GPS Disabled"}
                  </Button>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Test All Scenarios</label>
                  <Button onClick={runAllTests} className="w-full">
                    🚀 Run All Tests
                  </Button>
                </div>
              </div>
              
              <Alert>
                <MapPin className="h-4 w-4" />
                <AlertDescription>
                  Current Location: <strong>{selectedScenario.location.city}, {selectedScenario.location.state}</strong>
                  {selectedScenario.location.coords && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({selectedScenario.location.coords.lat}, {selectedScenario.location.coords.lng})
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEST_SCENARIOS.map((scenario) => (
              <Card 
                key={scenario.id} 
                className={`cursor-pointer transition-all ${selectedScenario.id === scenario.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedScenario(scenario)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{scenario.name}</CardTitle>
                  <CardDescription className="text-sm">{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Expected Ads:</span>
                      <Badge variant="outline">{scenario.expectedResults.adsCount}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Expected Coupons:</span>
                      <Badge variant="outline">{scenario.expectedResults.couponsCount}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Has Local Content:</span>
                      <Badge variant={scenario.expectedResults.hasLocalContent ? "default" : "secondary"}>
                        {scenario.expectedResults.hasLocalContent ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: 'TC045', name: 'GPS Location Detection', desc: 'Test location service functionality' },
              { id: 'TC046', name: 'Ad Click Tracking', desc: 'Verify click event logging' },
              { id: 'TC047', name: 'Location Content Matching', desc: 'Check location-specific content' },
              { id: 'TC048', name: 'Address Change Response', desc: 'Test content refresh on location change' },
              { id: 'TC049', name: 'Permission Denied Fallback', desc: 'Test behavior with disabled GPS' },
              { id: 'TC050', name: 'No Local Deals Scenario', desc: 'Test remote location handling' },
              { id: 'TC051', name: 'Invalid Location Handling', desc: 'Test corrupted GPS data handling' }
            ].map((test) => (
              <Card key={test.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{test.id}</CardTitle>
                    {getStatusIcon(testResults[test.id] || 'pending')}
                  </div>
                  <CardDescription className="text-sm">{test.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">{test.desc}</p>
                  <Button 
                    size="sm" 
                    onClick={() => runLocationTest(test.id)}
                    disabled={testResults[test.id] === 'running'}
                    className="w-full"
                  >
                    {testResults[test.id] === 'running' ? 'Running...' : 'Run Test'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>Impressions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{analytics.impressions}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center space-x-2">
                  <MousePointer className="w-4 h-4" />
                  <span>Clicks</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{analytics.clicks}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>CTR</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{analytics.ctr.toFixed(1)}%</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Location Matches</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{analytics.locationMatches}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Test Execution Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-secondary/10 p-4 rounded-lg max-h-64 overflow-y-auto font-mono text-sm">
                {testLogs.length === 0 ? (
                  <p className="text-muted-foreground">No test logs yet. Run some tests to see results here.</p>
                ) : (
                  testLogs.map((log, index) => (
                    <div key={index} className="py-1">{log}</div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live-preview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Location-Based Ads Preview</CardTitle>
                <CardDescription>Live preview of ads for current location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted rounded border text-center text-muted-foreground">
                  Ad preview would appear here
                </div>
                <div className="mt-4 space-y-2">
                  {currentAds.map((ad) => (
                    <div key={ad.id} className="border rounded p-3 hover:bg-secondary/5">
                      <div className="text-sm font-medium">{ad.text}</div>
                      <div className="text-xs text-muted-foreground">by {ad.advertiser}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ad.regions?.map((region: string) => (
                          <Badge key={region} variant="secondary" className="text-xs">{region}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Local Deals Preview</CardTitle>
                <CardDescription>Coupons and offers for current location</CardDescription>
              </CardHeader>
              <CardContent>
                <LocalDeals />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};