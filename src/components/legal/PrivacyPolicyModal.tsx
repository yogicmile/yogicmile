import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  Eye, 
  Lock, 
  Globe, 
  Download, 
  Trash2, 
  Settings,
  CheckCircle,
  Info,
  Clock,
  Users,
  Database
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PRIVACY_SECTIONS = {
  overview: {
    title: 'Privacy Overview',
    icon: Shield,
    content: {
      intro: 'At Yogic Mile, your privacy is our priority. We believe in transparency about what data we collect, how we use it, and your rights regarding your personal information.',
      principles: [
        'Minimal Data Collection: We only collect data necessary for app functionality',
        'User Control: You have full control over your privacy settings',
        'Transparency: Clear explanations of all data practices',
        'Security: Enterprise-grade protection for your information',
        'Rights Respected: Full GDPR and privacy law compliance'
      ],
      lastUpdated: '2024-09-18'
    }
  },
  
  collection: {
    title: 'Data We Collect',
    icon: Database,
    content: {
      categories: [
        {
          name: 'Health & Fitness Data',
          required: true,
          data: ['Step count', 'Walking distance', 'Activity duration', 'Health app integration data'],
          purpose: 'To track your progress and calculate earnings',
          retention: '2 years or until account deletion'
        },
        {
          name: 'Account Information',
          required: true,
          data: ['Email address (optional)', 'Profile name', 'Authentication data'],
          purpose: 'Account management and security',
          retention: 'Until account deletion'
        },
        {
          name: 'App Usage Analytics',
          required: false,
          data: ['Feature usage', 'Session duration', 'Performance metrics'],
          purpose: 'Improve app experience and fix bugs',
          retention: '1 year (anonymized after 90 days)'
        },
        {
          name: 'Device Information',
          required: true,
          data: ['Device type', 'OS version', 'App version'],
          purpose: 'Technical support and compatibility',
          retention: '6 months'
        }
      ]
    }
  },

  usage: {
    title: 'How We Use Data',
    icon: Settings,
    content: {
      purposes: [
        {
          category: 'Core App Functionality',
          uses: [
            'Track your daily steps and calculate earnings',
            'Sync data across your devices',
            'Provide personalized health insights',
            'Enable social features (if you choose)'
          ]
        },
        {
          category: 'Account & Security',
          uses: [
            'Authenticate your account securely',
            'Prevent fraud and abuse',
            'Comply with legal requirements',
            'Provide customer support'
          ]
        },
        {
          category: 'Improvement & Analytics',
          uses: [
            'Analyze app performance and fix bugs',
            'Understand feature usage patterns',
            'Develop new features you might like',
            'Optimize user experience'
          ]
        }
      ]
    }
  },

  sharing: {
    title: 'Data Sharing',
    icon: Users,
    content: {
      policy: 'We do not sell your personal data. Period.',
      limitations: [
        {
          category: 'With Your Consent',
          description: 'Social features, leaderboards, or challenges you explicitly join',
          control: 'Fully controlled by your privacy settings'
        },
        {
          category: 'Service Providers',
          description: 'Trusted partners who help us operate the app (cloud storage, analytics)',
          control: 'Contractually bound to protect your data'
        },
        {
          category: 'Legal Requirements', 
          description: 'If required by law or to protect rights and safety',
          control: 'Only when legally mandated'
        },
        {
          category: 'Business Transfer',
          description: 'In case of company acquisition (you\'ll be notified)',
          control: 'Option to delete account before transfer'
        }
      ]
    }
  },

  rights: {
    title: 'Your Rights',
    icon: Lock,
    content: {
      rights: [
        {
          right: 'Access Your Data',
          description: 'Request a copy of all data we have about you',
          action: 'Use the "Export Data" feature in Profile → Privacy'
        },
        {
          right: 'Correct Your Data',
          description: 'Update or fix any incorrect information',
          action: 'Edit directly in your Profile settings'
        },
        {
          right: 'Delete Your Data',
          description: 'Request complete deletion of your account and data',
          action: 'Use "Delete Account" in Profile → Privacy (30-day grace period)'
        },
        {
          right: 'Data Portability',
          description: 'Take your data to another service',
          action: 'Export feature provides industry-standard formats'
        },
        {
          right: 'Opt-Out of Analytics',
          description: 'Disable optional data collection',
          action: 'Toggle analytics in Profile → Privacy Settings'
        },
        {
          right: 'Object to Processing',
          description: 'Object to specific uses of your data',
          action: 'Contact our privacy team at privacy@yogicmile.com'
        }
      ]
    }
  },

  security: {
    title: 'Data Security',
    icon: Shield,
    content: {
      measures: [
        'End-to-end encryption for sensitive health data',
        'Secure authentication with industry standards',
        'Regular security audits and penetration testing',
        'Minimal access principle for our team',
        'Automatic security monitoring and alerting',
        'GDPR-compliant data processing procedures'
      ],
      breach: {
        promise: 'In the unlikely event of a data breach:',
        actions: [
          'We\'ll notify you within 72 hours',
          'Provide clear information about what happened',
          'Explain what data was affected',
          'Detail our response and prevention measures',
          'Offer free identity monitoring if needed'
        ]
      }
    }
  }
};

export function PrivacyPolicyModal({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState('overview');

  const handleExportData = () => {
    // In real implementation, this would trigger data export
    console.log('Data export requested');
    onClose();
  };

  const handleDeleteAccount = () => {
    // In real implementation, this would show delete account flow
    console.log('Account deletion requested');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Privacy Policy & Your Rights
          </DialogTitle>
          <DialogDescription>
            Transparent information about how Yogic Mile protects and handles your data
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            {Object.entries(PRIVACY_SECTIONS).map(([key, section]) => (
              <TabsTrigger 
                key={key} 
                value={key} 
                className="flex items-center gap-1 text-xs"
              >
                <section.icon className="w-3 h-3" />
                <span className="hidden sm:inline">{section.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="h-[60vh] mt-4">
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Privacy at Yogic Mile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {PRIVACY_SECTIONS.overview.content.intro}
                  </p>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Our Privacy Principles:</h4>
                    <ul className="space-y-2">
                      {PRIVACY_SECTIONS.overview.content.principles.map((principle, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{principle}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Last updated: {PRIVACY_SECTIONS.overview.content.lastUpdated}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Data Collection Tab */}
            <TabsContent value="collection" className="space-y-4">
              {PRIVACY_SECTIONS.collection.content.categories.map((category, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{category.name}</span>
                      <Badge variant={category.required ? 'default' : 'secondary'}>
                        {category.required ? 'Required' : 'Optional'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h5 className="font-medium mb-2">Data Types:</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {category.data.map((item, idx) => (
                          <li key={idx}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium">Purpose:</h5>
                      <p className="text-sm text-muted-foreground">{category.purpose}</p>
                    </div>
                    <div>
                      <h5 className="font-medium">Retention:</h5>
                      <p className="text-sm text-muted-foreground">{category.retention}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Usage Tab */}
            <TabsContent value="usage" className="space-y-4">
              {PRIVACY_SECTIONS.usage.content.purposes.map((purpose, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{purpose.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {purpose.uses.map((use, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{use}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Sharing Tab */}
            <TabsContent value="sharing" className="space-y-4">
              <Card className="bg-success/5 border-success/20">
                <CardContent className="p-4">
                  <p className="font-semibold text-success">
                    {PRIVACY_SECTIONS.sharing.content.policy}
                  </p>
                </CardContent>
              </Card>

              {PRIVACY_SECTIONS.sharing.content.limitations.map((limitation, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{limitation.category}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">{limitation.description}</p>
                    <Badge variant="outline">{limitation.control}</Badge>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Rights Tab */}
            <TabsContent value="rights" className="space-y-4">
              {PRIVACY_SECTIONS.rights.content.rights.map((right, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      {right.right}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">{right.description}</p>
                    <Badge variant="secondary">{right.action}</Badge>
                  </CardContent>
                </Card>
              ))}

              <div className="flex gap-2 pt-4">
                <Button onClick={handleExportData} variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Export My Data
                </Button>
                <Button onClick={handleDeleteAccount} variant="destructive" className="flex-1">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Security Measures
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {PRIVACY_SECTIONS.security.content.measures.map((measure, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{measure}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-warning/5 border-warning/20">
                <CardHeader>
                  <CardTitle className="text-warning">Data Breach Response</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{PRIVACY_SECTIONS.security.content.breach.promise}</p>
                  <ul className="space-y-2">
                    {PRIVACY_SECTIONS.security.content.breach.actions.map((action, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{action}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Questions? Contact us at <span className="text-primary">privacy@yogicmile.com</span>
          </p>
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}