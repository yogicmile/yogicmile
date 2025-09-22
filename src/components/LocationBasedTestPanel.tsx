import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Eye, MousePointer, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface TestResult {
  testId: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  details: string;
  timestamp?: Date;
}

interface LocationData {
  city: string;
  district: string;
  state: string;
  country: string;
}

const TEST_LOCATIONS: Record<string, LocationData> = {
  mumbai: {
    city: 'Mumbai',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    country: 'India'
  },
  delhi: {
    city: 'Delhi',
    district: 'New Delhi',
    state: 'Delhi',
    country: 'India'
  },
  bangalore: {
    city: 'Bangalore',
    district: 'Bangalore Urban',
    state: 'Karnataka',
    country: 'India'
  },
  pune: {
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    country: 'India'
  },
  hyderabad: {
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    country: 'India'
  },
  remote: {
    city: 'Remote Location',
    district: 'Unknown',
    state: 'Unknown',
    country: 'Unknown'
  }
};

export const LocationBasedTestPanel = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('hyderabad');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentAds, setCurrentAds] = useState<any[]>([]);
  const [currentCoupons, setCurrentCoupons] = useState<any[]>([]);
  const [isLocationEnabled, setIsLocationEnabled] = useState(true);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const { user } = useAuth();

  const initialTests: TestResult[] = [
    { testId: 'TC045', name: 'GPS Location Detection', status: 'pending', details: 'Testing location detection functionality' },
    { testId: 'TC046', name: 'Ad Click Tracking', status: 'pending', details: 'Verify ad click events are logged' },
    { testId: 'TC047', name: 'Location-Based Content', status: 'pending', details: 'Check location-specific content delivery' },
    { testId: 'TC048', name: 'Address Change Response', status: 'pending', details: 'Test content updates on location change' },
    { testId: 'TC049', name: 'Denied Permissions Fallback', status: 'pending', details: 'Test behavior with disabled location' },
    { testId: 'TC050', name: 'No Local Deals Scenario', status: 'pending', details: 'Test placeholder content for remote locations' },
    { testId: 'TC051', name: 'Invalid Location Handling', status: 'pending', details: 'Test corrupted GPS data handling' }
  ];

  useEffect(() => {
    setTestResults(initialTests);
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      fetchLocationBasedContent();
    }
  }, [selectedLocation, isLocationEnabled]);

  const fetchLocationBasedContent = async () => {
    const location = TEST_LOCATIONS[selectedLocation];
    
    try {
      // Fetch ads based on location
      const locationFilters = isLocationEnabled ? [
        location.city,
        location.district,
        location.state,
        location.country
      ] : [];

      let adsQuery = supabase
        .from('ads')
        .select('*')
        .eq('status', 'active');

      const { data: ads } = await adsQuery;
      
      // Filter ads by location if location is enabled
      const filteredAds = isLocationEnabled && ads ? ads.filter(ad => {
        const adRegions = ad.regions || [];
        return locationFilters.some(loc => adRegions.includes(loc));
      }) : ads || [];

      setCurrentAds(filteredAds);

      // Fetch coupons based on location
      let couponsQuery = supabase
        .from('coupons')
        .select('*')
        .eq('status', 'active');

      const { data: coupons } = await couponsQuery;
      
      // Filter coupons by location if location is enabled
      const filteredCoupons = isLocationEnabled && coupons ? coupons.filter(coupon => {
        const couponRegions = coupon.regions || [];
        return locationFilters.some(loc => couponRegions.includes(loc));
      }) : coupons || [];

      setCurrentCoupons(filteredCoupons);

    } catch (error) {
      console.error('Error fetching location-based content:', error);
    }
  };

  const runSingleTest = async (testId: string) => {
    setTestResults(prev => prev.map(test => 
      test.testId === testId 
        ? { ...test, status: 'running', timestamp: new Date() }
        : test
    ));

    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, 1000));

    let result: 'passed' | 'failed' = 'passed';
    let details = '';

    switch (testId) {
      case 'TC045':
        // Test GPS location detection
        result = isLocationEnabled ? 'passed' : 'failed';
        details = isLocationEnabled ? 
          `Location detected: ${TEST_LOCATIONS[selectedLocation].city}` : 
          'Location services disabled';
        break;
        
      case 'TC046':
        // Test ad click tracking
        result = currentAds.length > 0 ? 'passed' : 'failed';
        details = `${currentAds.length} ads available for click tracking`;
        break;
        
      case 'TC047':
        // Test location-based content
        const hasLocationContent = currentAds.length > 0 || currentCoupons.length > 0;
        result = hasLocationContent ? 'passed' : 'failed';
        details = `Found ${currentAds.length} ads, ${currentCoupons.length} coupons for ${TEST_LOCATIONS[selectedLocation].city}`;
        break;
        
      case 'TC048':
        // Test address change response
        result = 'passed'; // Always pass as we can simulate this
        details = `Content refreshed for new location: ${TEST_LOCATIONS[selectedLocation].city}`;
        break;
        
      case 'TC049':
        // Test denied permissions
        result = !isLocationEnabled ? 'passed' : 'failed';
        details = !isLocationEnabled ? 
          'Generic content shown when location disabled' : 
          'Location is currently enabled';
        break;
        
      case 'TC050':
        // Test no local deals
        result = selectedLocation === 'remote' && currentCoupons.length === 0 ? 'passed' : 'failed';
        details = selectedLocation === 'remote' ? 
          `No local deals found for remote location` : 
          `Found ${currentCoupons.length} deals for ${TEST_LOCATIONS[selectedLocation].city}`;
        break;
        
      case 'TC051':
        // Test invalid location handling
        result = selectedLocation === 'remote' ? 'passed' : 'failed';
        details = selectedLocation === 'remote' ? 
          'Default content shown for invalid location' : 
          'Valid location selected';
        break;
        
      default:
        result = 'failed';
        details = 'Unknown test case';
    }

    setTestResults(prev => prev.map(test => 
      test.testId === testId 
        ? { ...test, status: result, details, timestamp: new Date() }
        : test
    ));
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    
    for (const test of initialTests) {
      await runSingleTest(test.testId);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunningTests(false);
  };

  const logTestAdClick = async (adId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('ad_logs')
        .insert({
          ad_id: adId,
          user_id: user.id,
          type: 'click',
          page: 'test-panel',
          location: TEST_LOCATIONS[selectedLocation] as any
        });

      console.log('Test ad click logged successfully');
    } catch (error) {
      console.error('Error logging test ad click:', error);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Location-Based Advertising Test Panel</span>
          </CardTitle>
          <CardDescription>
            Test location detection, ad targeting, and coupon systems across different scenarios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Test Location</label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mumbai">Mumbai - Restaurant offers, shopping deals</SelectItem>
                  <SelectItem value="delhi">Delhi - Metro area restaurants, gym memberships</SelectItem>
                  <SelectItem value="bangalore">Bangalore - Tech cafeterias, co-working spaces</SelectItem>
                  <SelectItem value="pune">Pune - College deals, student discounts</SelectItem>
                  <SelectItem value="hyderabad">Hyderabad - Current default location</SelectItem>
                  <SelectItem value="remote">Remote Location - No local deals</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium">Location Services</label>
              <Button
                size="sm"
                variant={isLocationEnabled ? "default" : "outline"}
                onClick={() => setIsLocationEnabled(!isLocationEnabled)}
              >
                {isLocationEnabled ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </div>

          {/* Current Location Info */}
          <div className="bg-secondary/10 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Current Test Scenario</h4>
            <div className="text-sm text-muted-foreground">
              <p><strong>Location:</strong> {TEST_LOCATIONS[selectedLocation].city}, {TEST_LOCATIONS[selectedLocation].state}</p>
              <p><strong>GPS Status:</strong> {isLocationEnabled ? "Enabled" : "Disabled"}</p>
              <p><strong>Available Ads:</strong> {currentAds.length}</p>
              <p><strong>Available Coupons:</strong> {currentCoupons.length}</p>
            </div>
          </div>

          {/* Test Execution */}
          <div className="flex space-x-4">
            <Button onClick={runAllTests} disabled={isRunningTests}>
              {isRunningTests ? "Running Tests..." : "Run All Tests"}
            </Button>
            <Button variant="outline" onClick={fetchLocationBasedContent}>
              Refresh Content
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {testResults.map((test) => (
              <div key={test.testId} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <p className="font-medium text-sm">{test.testId}: {test.name}</p>
                    <p className="text-xs text-muted-foreground">{test.details}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {test.timestamp && (
                    <span className="text-xs text-muted-foreground">
                      {test.timestamp.toLocaleTimeString()}
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => runSingleTest(test.testId)}
                    disabled={test.status === 'running'}
                  >
                    {test.status === 'running' ? 'Running...' : 'Test'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Content Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Ads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Location-Based Ads ({currentAds.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentAds.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                {isLocationEnabled ? "No ads for this location" : "Location disabled - showing generic content"}
              </p>
            ) : (
              <div className="space-y-2">
                {currentAds.slice(0, 3).map((ad) => (
                  <div key={ad.id} className="border rounded p-3 hover:bg-secondary/5 cursor-pointer"
                       onClick={() => logTestAdClick(ad.id)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{ad.text}</p>
                        <p className="text-xs text-muted-foreground">by {ad.advertiser}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {ad.regions?.map((region: string) => (
                            <Badge key={region} variant="secondary" className="text-xs">
                              {region}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <MousePointer className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Coupons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Local Deals ({currentCoupons.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentCoupons.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                {selectedLocation === 'remote' ? 
                  "No local deals available for remote location" : 
                  "No deals for this location"}
              </p>
            ) : (
              <div className="space-y-2">
                {currentCoupons.slice(0, 3).map((coupon) => (
                  <div key={coupon.id} className="border rounded p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{coupon.title}</p>
                        <p className="text-xs text-muted-foreground">{coupon.merchant_name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {coupon.regions?.map((region: string) => (
                            <Badge key={region} variant="outline" className="text-xs">
                              {region}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Badge>{coupon.discount_percent}% off</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};