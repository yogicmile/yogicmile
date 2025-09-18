import React, { useState } from 'react';
import { X, Shield, FileText, CheckCircle2, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface LegalPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms';
}

export const LegalPolicyModal: React.FC<LegalPolicyModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy'
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const privacyPolicyContent = {
    lastUpdated: "September 18, 2025",
    version: "2.0",
    sections: [
      {
        title: "Information We Collect",
        content: `We collect information you provide directly to us, such as:
        • Mobile phone number for authentication
        • Optional email address for account recovery
        • Physical address for location-based services and advertisements
        • Step count data from your device's sensors
        • Transaction history for wallet management
        • Referral network information`
      },
      {
        title: "How We Use Your Information",
        content: `We use your information to:
        • Provide and maintain the Yogic Mile service
        • Process step tracking and reward calculations
        • Send location-based advertisements and offers
        • Detect and prevent fraudulent activities
        • Communicate with you about your account
        • Improve our services through analytics`
      },
      {
        title: "Information Sharing",
        content: `We may share your information with:
        • Trusted partners for reward fulfillment
        • Advertisers for relevant local deals (anonymized data only)
        • Law enforcement when required by law
        • Service providers who assist in our operations
        
        We never sell your personal information to third parties.`
      },
      {
        title: "Data Security",
        content: `We implement strong security measures:
        • End-to-end encryption for sensitive data
        • Secure OTP authentication system
        • Advanced fraud detection algorithms
        • Regular security audits and monitoring
        • Secure data storage with backup protection`
      },
      {
        title: "Your Rights",
        content: `Under GDPR, you have the right to:
        • Access your personal data
        • Correct inaccurate information
        • Delete your account and data
        • Export your data in a machine-readable format
        • Withdraw consent for data processing
        • File complaints with data protection authorities`
      },
      {
        title: "Data Retention",
        content: `We retain your data as follows:
        • Active account data: While your account is active
        • Transaction records: 7 years for legal compliance
        • Security logs: 3 years for fraud prevention
        • Deleted account data: Permanently removed within 90 days
        • Anonymous analytics: Indefinitely for service improvement`
      },
      {
        title: "Contact Information",
        content: `For privacy-related inquiries:
        • Email: privacy@yogicmile.com
        • Data Protection Officer: dpo@yogicmile.com
        • Postal Address: [Your Company Address]
        • Response time: Within 30 days as required by law`
      }
    ]
  };

  const termsContent = {
    lastUpdated: "September 18, 2025",
    version: "2.0",
    sections: [
      {
        title: "Service Description",
        content: `Yogic Mile is a wellness application that:
        • Tracks your daily walking steps
        • Converts steps into digital currency (paisa)
        • Provides local deals and advertisements
        • Offers rewards and redemption opportunities
        • Connects users through referral programs`
      },
      {
        title: "User Responsibilities",
        content: `As a user, you agree to:
        • Provide accurate registration information
        • Use the app honestly without fraud or manipulation
        • Respect other users and community guidelines
        • Comply with all applicable laws and regulations
        • Report suspicious activities or security issues
        • Maintain the security of your account`
      },
      {
        title: "Step Tracking and Rewards",
        content: `Our step tracking system:
        • Uses device sensors for step counting
        • Applies daily limits and validation rules
        • Converts steps to paisa based on current rates
        • May adjust rates based on user phases
        • Reserves the right to investigate unusual patterns
        • Can suspend accounts for suspected fraud`
      },
      {
        title: "Wallet and Transactions",
        content: `Regarding your digital wallet:
        • Paisa has no monetary value outside the app
        • Rewards can be redeemed for approved offers only
        • Transaction history is maintained for your records
        • We are not responsible for third-party service failures
        • Unused balances may expire based on activity`
      },
      {
        title: "Prohibited Activities",
        content: `The following activities are strictly prohibited:
        • GPS spoofing or location manipulation
        • Using automated step generation devices
        • Creating multiple accounts for the same person
        • Attempting to hack or exploit the system
        • Sharing accounts or login credentials
        • Engaging in any form of fraud or abuse`
      },
      {
        title: "Limitation of Liability",
        content: `Yogic Mile's liability is limited as follows:
        • We provide the service "as is" without warranties
        • We are not liable for indirect or consequential damages
        • Our maximum liability is limited to your account balance
        • We are not responsible for third-party services or products
        • Force majeure events are excluded from liability`
      },
      {
        title: "Termination",
        content: `Account termination may occur:
        • At your request through account deletion
        • For violation of these terms
        • For suspected fraudulent activity
        • For extended periods of inactivity
        • For legal or regulatory compliance
        
        Upon termination, all rights and obligations cease immediately.`
      },
      {
        title: "Dispute Resolution",
        content: `For disputes:
        • First contact our support team for resolution
        • Mediation services are available for unresolved issues
        • Governing law: [Your Jurisdiction]
        • Arbitration may be required for certain disputes
        • Class action lawsuits are waived where legally permitted`
      }
    ]
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] bg-surface/95 backdrop-blur border-border/50">
        <DialogHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Legal & Privacy Center
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'privacy' | 'terms')} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy Policy
            </TabsTrigger>
            <TabsTrigger value="terms" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Terms & Conditions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="privacy" className="flex-1 mt-0">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Privacy Policy</h2>
                <p className="text-sm text-muted-foreground">
                  Last updated: {privacyPolicyContent.lastUpdated} • Version {privacyPolicyContent.version}
                </p>
              </div>
              <Badge variant="outline" className="text-primary border-primary/50">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                GDPR Compliant
              </Badge>
            </div>

            <ScrollArea className="h-[calc(90vh-200px)]">
              <div className="space-y-6 pr-4">
                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                  <p className="text-sm text-foreground">
                    <strong>Your Privacy Matters:</strong> This policy explains how Yogic Mile collects, uses, 
                    and protects your personal information. We are committed to transparency and your right to 
                    control your data.
                  </p>
                </div>

                {privacyPolicyContent.sections.map((section, index) => (
                  <div key={index} className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <span className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      {section.title}
                    </h3>
                    <div className="pl-8">
                      <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                    {index < privacyPolicyContent.sections.length - 1 && <Separator />}
                  </div>
                ))}

                <div className="mt-8 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Questions or Concerns?</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    If you have any questions about this privacy policy or how we handle your data, 
                    please don't hesitate to contact us.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Contact Support
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-3 w-3 mr-1" />
                      Export My Data
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="terms" className="flex-1 mt-0">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Terms & Conditions</h2>
                <p className="text-sm text-muted-foreground">
                  Last updated: {termsContent.lastUpdated} • Version {termsContent.version}
                </p>
              </div>
              <Badge variant="outline" className="text-secondary border-secondary/50">
                <FileText className="h-3 w-3 mr-1" />
                Legal Agreement
              </Badge>
            </div>

            <ScrollArea className="h-[calc(90vh-200px)]">
              <div className="space-y-6 pr-4">
                <div className="bg-secondary/10 p-4 rounded-lg border border-secondary/20">
                  <p className="text-sm text-foreground">
                    <strong>Important:</strong> By using Yogic Mile, you agree to these terms and conditions. 
                    Please read them carefully as they contain important information about your rights and 
                    responsibilities.
                  </p>
                </div>

                {termsContent.sections.map((section, index) => (
                  <div key={index} className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <span className="w-6 h-6 bg-secondary/20 text-secondary rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      {section.title}
                    </h3>
                    <div className="pl-8">
                      <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                    {index < termsContent.sections.length - 1 && <Separator />}
                  </div>
                ))}

                <div className="mt-8 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Need Help Understanding These Terms?</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Our support team is available to answer any questions about these terms and conditions.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Contact Legal Team
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-3 w-3 mr-1" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};