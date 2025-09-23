import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AccessibilityTestSuite } from '@/components/AccessibilityTestSuite';
import { AccessibleStatsDashboard, AccessibleForm } from '@/components/AccessibleComponents';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Accessibility, 
  TestTube, 
  Eye, 
  Ear, 
  Hand, 
  Brain,
  ArrowLeft,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AccessibilityTestPage() {
  const navigate = useNavigate();

  // Mock stats for accessibility demo
  const mockStats = {
    dailySteps: 8543,
    dailyGoal: 10000,
    coinsEarned: 34,
    streakDays: 5,
    achievements: 12
  };

  const handleFormSubmit = async (data: any) => {
    console.log('Form submitted with accessibility features:', data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <div className="min-h-screen bg-background" role="main" aria-label="Accessibility Testing Dashboard">
      {/* Skip Navigation Link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md"
      >
        Skip to main content
      </a>

      <div className="p-4 space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Accessibility className="h-6 w-6" />
                  Accessibility Testing & Compliance Dashboard
                </CardTitle>
                <p className="text-muted-foreground">
                  Comprehensive WCAG 2.1 Level AA compliance testing for Yogic Mile
                </p>
              </div>
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="min-h-[44px]"
                aria-label="Return to main dashboard"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Quick Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4" role="region" aria-label="Accessibility Status Overview">
          <Card tabIndex={0} role="article" aria-labelledby="visual-status">
            <CardContent className="p-4 text-center">
              <Eye className="h-8 w-8 mx-auto mb-2 text-blue-500" aria-hidden="true" />
              <h3 id="visual-status" className="font-semibold mb-1">Visual Access</h3>
              <Badge variant="outline" className="mb-2">70% Compliant</Badge>
              <p className="text-xs text-muted-foreground">Contrast & scaling support</p>
            </CardContent>
          </Card>

          <Card tabIndex={0} role="article" aria-labelledby="auditory-status">
            <CardContent className="p-4 text-center">
              <Ear className="h-8 w-8 mx-auto mb-2 text-green-500" aria-hidden="true" />
              <h3 id="auditory-status" className="font-semibold mb-1">Screen Readers</h3>
              <Badge variant="outline" className="mb-2">75% Compliant</Badge>
              <p className="text-xs text-muted-foreground">ARIA labels & semantics</p>
            </CardContent>
          </Card>

          <Card tabIndex={0} role="article" aria-labelledby="motor-status">
            <CardContent className="p-4 text-center">
              <Hand className="h-8 w-8 mx-auto mb-2 text-orange-500" aria-hidden="true" />
              <h3 id="motor-status" className="font-semibold mb-1">Motor Access</h3>
              <Badge variant="outline" className="mb-2">85% Compliant</Badge>
              <p className="text-xs text-muted-foreground">Touch targets & navigation</p>
            </CardContent>
          </Card>

          <Card tabIndex={0} role="article" aria-labelledby="cognitive-status">
            <CardContent className="p-4 text-center">
              <Brain className="h-8 w-8 mx-auto mb-2 text-purple-500" aria-hidden="true" />
              <h3 id="cognitive-status" className="font-semibold mb-1">Cognitive</h3>
              <Badge variant="outline" className="mb-2">90% Compliant</Badge>
              <p className="text-xs text-muted-foreground">Clear language & patterns</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <div id="main-content">
          <Tabs defaultValue="testing" className="w-full">
            <TabsList className="grid w-full grid-cols-4" role="tablist">
              <TabsTrigger value="testing" role="tab" aria-controls="testing-panel">
                <TestTube className="h-4 w-4 mr-2" />
                Testing Suite
              </TabsTrigger>
              <TabsTrigger value="components" role="tab" aria-controls="components-panel">
                <Eye className="h-4 w-4 mr-2" />
                Accessible Components
              </TabsTrigger>
              <TabsTrigger value="demo" role="tab" aria-controls="demo-panel">
                <Hand className="h-4 w-4 mr-2" />
                Live Demo
              </TabsTrigger>
              <TabsTrigger value="guidelines" role="tab" aria-controls="guidelines-panel">
                <Info className="h-4 w-4 mr-2" />
                Implementation
              </TabsTrigger>
            </TabsList>

            {/* Testing Suite Tab */}
            <TabsContent value="testing" id="testing-panel" role="tabpanel" aria-labelledby="testing-tab">
              <AccessibilityTestSuite />
            </TabsContent>

            {/* Accessible Components Tab */}
            <TabsContent value="components" id="components-panel" role="tabpanel" aria-labelledby="components-tab" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Accessible Form Example</CardTitle>
                  <p className="text-muted-foreground">
                    Demonstrates proper form accessibility with labels, error handling, and screen reader support
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <AccessibleForm onSubmit={handleFormSubmit} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Accessible Stats Dashboard</CardTitle>
                  <p className="text-muted-foreground">
                    Shows proper ARIA labeling, keyboard navigation, and screen reader announcements
                  </p>
                </CardHeader>
                <CardContent>
                  <AccessibleStatsDashboard stats={mockStats} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Live Demo Tab */}
            <TabsContent value="demo" id="demo-panel" role="tabpanel" aria-labelledby="demo-tab" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    Live Accessibility Testing
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Interactive testing scenarios for real-world accessibility validation
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Test Scenarios:</h4>
                      <ul className="space-y-2 text-sm" role="list">
                        <li className="flex items-center gap-2">
                          <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0 text-xs">1</Badge>
                          <span>Navigate using only Tab and Enter keys</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0 text-xs">2</Badge>
                          <span>Test with screen reader (VoiceOver/NVDA)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0 text-xs">3</Badge>
                          <span>Increase browser zoom to 200%</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0 text-xs">4</Badge>
                          <span>Enable high contrast mode</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0 text-xs">5</Badge>
                          <span>Test voice control (iOS/Android)</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold">Expected Results:</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground" role="list">
                        <li>✓ All interactive elements reachable via keyboard</li>
                        <li>✓ Clear focus indicators visible</li>
                        <li>✓ Screen reader announces all content</li>
                        <li>✓ Layout remains functional at high zoom</li>
                        <li>✓ High contrast themes work properly</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm">
                      <strong>Live Testing Instructions:</strong> Use the components above to test accessibility features. 
                      Try navigating with keyboard only, enable your device's screen reader, or adjust system accessibility settings.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Implementation Guidelines Tab */}
            <TabsContent value="guidelines" id="guidelines-panel" role="tabpanel" aria-labelledby="guidelines-tab" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Visual Accessibility Implementation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Color Contrast</h4>
                      <ul className="text-sm text-muted-foreground space-y-1" role="list">
                        <li>• Use 4.5:1 contrast ratio minimum</li>
                        <li>• Test with color blindness simulators</li>
                        <li>• Don't rely on color alone for meaning</li>
                        <li>• Provide high contrast mode option</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Text and Typography</h4>
                      <ul className="text-sm text-muted-foreground space-y-1" role="list">
                        <li>• Support 200% zoom without scrolling</li>
                        <li>• Use relative units (rem, em, %)</li>
                        <li>• Maintain readability at all sizes</li>
                        <li>• Provide text size controls</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ear className="h-5 w-5" />
                      Screen Reader Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">ARIA Labels</h4>
                      <ul className="text-sm text-muted-foreground space-y-1" role="list">
                        <li>• Add aria-label for unlabeled controls</li>
                        <li>• Use aria-describedby for context</li>
                        <li>• Implement aria-live regions</li>
                        <li>• Mark decorative images as aria-hidden</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Semantic HTML</h4>
                      <ul className="text-sm text-muted-foreground space-y-1" role="list">
                        <li>• Use proper heading hierarchy (h1-h6)</li>
                        <li>• Implement landmark roles</li>
                        <li>• Use lists for grouped content</li>
                        <li>• Associate labels with form controls</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Hand className="h-5 w-5" />
                      Motor Accessibility
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Touch Targets</h4>
                      <ul className="text-sm text-muted-foreground space-y-1" role="list">
                        <li>• Minimum 44px × 44px size</li>
                        <li>• Adequate spacing between targets</li>
                        <li>• Clear visual boundaries</li>
                        <li>• Consider thumb reach zones</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Keyboard Navigation</h4>
                      <ul className="text-sm text-muted-foreground space-y-1" role="list">
                        <li>• Logical tab order</li>
                        <li>• Visible focus indicators</li>
                        <li>• Skip navigation links</li>
                        <li>• Escape key functionality</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Cognitive Accessibility
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Clear Communication</h4>
                      <ul className="text-sm text-muted-foreground space-y-1" role="list">
                        <li>• Use simple, clear language</li>
                        <li>• Provide context and instructions</li>
                        <li>• Avoid jargon and acronyms</li>
                        <li>• Include error prevention</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">User Control</h4>
                      <ul className="text-sm text-muted-foreground space-y-1" role="list">
                        <li>• Pausable animations/videos</li>
                        <li>• Adjustable time limits</li>
                        <li>• Undo/redo functionality</li>
                        <li>• Confirmation for destructive actions</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}