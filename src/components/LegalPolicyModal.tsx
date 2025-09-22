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
    lastUpdated: "September 22, 2025",
    version: "3.0",
    sections: [
      {
        title: "Information We Collect",
        content: `We may collect the following types of information:

a) Personal Information (provided by you)
• Mobile number (mandatory, used as User ID, login, and referral ID)
• Name (optional, for personalization)
• Email ID (optional, for communication and backup login)
• Residential Address (optional, helps deliver local coupons, discounts, and location-based ads)
• Password or OTP (for secure login)

b) Activity Information (collected automatically)
• Daily step count and activity data from device sensors or APIs
• Coins earned, rewards redeemed, challenges joined, and progress status
• Login history and in-app actions

c) Technical & Device Information
• Device model, operating system version, browser type
• IP address and approximate geolocation
• Crash reports, error logs, and performance analytics
• Advertising identifiers (if applicable)`
      },
      {
        title: "Why We Collect Your Data",
        content: `We use your data for the following purposes:

1. Core App Features – To track steps, calculate rewards, and maintain your wallet.
2. Rewards & Redemptions – To process coin earnings, vouchers, and coupon redemptions.
3. Personalization – To deliver ads, offers, and coupons based on your region and preferences.
4. Account Management – To verify identity, manage referrals, and secure your account.
5. Communication – To send notifications about progress, offers, and achievements.
6. Safety & Security – To detect fraud, prevent fake step entries, and block misuse.
7. Analytics – To improve app performance, measure engagement, and plan new features.
8. Legal Compliance – To comply with Indian government or court requirements.`
      },
      {
        title: "Sharing of Information",
        content: `We do not sell your personal data. Information is shared only in limited circumstances:

• With service providers (e.g., SMS gateways, hosting, analytics, reward partners) under strict confidentiality.
• With advertisers and merchants (only aggregated, non-personal insights like "5,000 users in Hyderabad achieved 10,000 steps this week").
• With government authorities when legally required under the IT Act, 2000 or other applicable laws.
• With successor businesses in case of merger, acquisition, or restructuring (with prior notice to users).`
      },
      {
        title: "Data Storage & Security",
        content: `• Data is stored in secure, encrypted servers located in India or compliant jurisdictions.
• Passwords are hashed; sensitive information is encrypted both in transit and at rest.
• Access to personal data is limited to authorized employees and partners under NDAs.
• Regular security audits and penetration tests are performed.
• Despite our best efforts, no system is 100% secure. Users must also practice caution (e.g., don't share OTPs).`
      },
      {
        title: "User Rights & Controls",
        content: `As a user, you have rights:

• Access & Update – Edit your profile (mobile, name, email, address).
• Data Portability – Request a copy of your data in a readable format.
• Opt-Out – Stop receiving promotional notifications/ads.
• Delete Account – Request account deletion; your personal data will be removed within 90 days (except where legally required).
• Withdraw Consent – You may withdraw your consent to data use at any time by contacting support, though core app functions may stop working.`
      },
      {
        title: "Children's Privacy",
        content: `• Yogic Mile is not intended for children under 13.
• Users aged 13–17 must have parental or guardian consent.
• We do not knowingly collect data from minors without consent.`
      },
      {
        title: "Cookies & Tracking Technologies",
        content: `• We may use cookies, local storage, and tracking pixels to store preferences and measure app performance.
• Third-party analytics tools may also use such technologies, but only for legitimate app improvement.`
      },
      {
        title: "Data Retention",
        content: `• We retain your personal data as long as your account is active.
• Deleted accounts → Data erased within 90 days.
• Transactional data (e.g., redemptions, payments) may be kept longer for compliance.`
      },
      {
        title: "Third-Party Links & Services",
        content: `• Our app may show third-party ads, coupons, or links.
• Clicking such links takes you outside Yogic Mile; we are not responsible for their privacy practices.
• Users should read the privacy policies of those services separately.`
      },
      {
        title: "Legal Basis for Processing (India)",
        content: `We process your data under:

• Consent – By signing up, you consent to data collection.
• Contract – To provide rewards and step tracking services.
• Legal Obligation – To comply with IT Act, 2000 & SPDI Rules, 2011.
• Legitimate Interest – Fraud prevention, app improvement, analytics.`
      },
      {
        title: "Grievance Officer (As per IT Act, 2000)",
        content: `If you have privacy-related concerns, complaints, or queries, you may contact our Grievance Officer:

Name: [Appoint Official Name]
Email: [Insert Support Email]
Address: [Insert Registered Office Address]
Phone: [Insert Contact Number]`
      },
      {
        title: "Changes to this Policy",
        content: `We may update this Privacy Policy from time to time. Major changes will be notified via in-app alert, SMS, or email. Continued use after updates means acceptance of the revised terms.

Yogic Mile may update or revise this Privacy Policy from time to time to reflect changes in legal requirements, technology, or business practices. Any such updates will be published in the "Privacy Policy" section of the app.

Users are advised to check this section frequently. Continued use of the app after any modifications shall be deemed as acceptance of the updated policy.`
      }
    ]
  };

  const termsContent = {
    lastUpdated: "September 22, 2025",
    version: "3.0",
    sections: [
      {
        title: "Eligibility & Registration",
        content: `• You must be 18 years or older to sign up and redeem rewards.
• Minors aged 13–17 years may use the App under parental or guardian consent.
• Registration requires a valid Indian mobile number, which will serve as your unique user ID and referral code.
• You may optionally provide email ID and address, which helps us provide personalized coupons, local offers, and advertisements.
• Users must provide accurate, current, and complete information during registration. False or misleading information may result in suspension.`
      },
      {
        title: "Step Tracking & Reward System",
        content: `• Steps are recorded using your device's motion sensors or connected fitness APIs.
• The App applies a daily limit (e.g., 12,000 steps) to ensure fair usage.
• Steps must be naturally generated by walking, jogging, or running. Artificial manipulation (shaking devices, automated step tools, tampering) will result in immediate suspension and forfeiture of rewards.
• Rewards are credited in paise (₹0.01) or equivalent virtual points.
• Conversion rate: 25 steps = 1 paisa (subject to periodic review).
• Rewards are displayed in your in-app wallet and may vary depending on your activity phase, offers, or special campaigns.`
      },
      {
        title: "Wallet & Redemption",
        content: `• The in-app wallet reflects your earned rewards balance.
• Redemption can be requested once the wallet reaches the minimum threshold (e.g., ₹500).
• Redemptions may be processed via UPI, bank transfer, or other supported methods.
• Processing time for redemptions is typically 3–7 business days.
• Any fraudulent, duplicate, or suspicious activity may result in wallet balance cancellation.
• The wallet is not a substitute for a bank account and cannot be treated as legal tender.`
      },
      {
        title: "Referral Program",
        content: `• Each registered user has a unique referral ID (their mobile number).
• Referral rewards are credited only when the invited user registers successfully and remains active for a minimum period (e.g., 7 days).
• Referral misuse (creating fake accounts, multiple SIM registrations, or self-referrals) is strictly prohibited and may lead to termination of accounts.`
      },
      {
        title: "Discount Coupons & Local Offers",
        content: `• The App may provide discount coupons, deals, or promotional offers from local businesses and advertisers.
• Coupons are subject to expiry dates, redemption limits, and terms set by the respective merchants.
• The App is not responsible for the quality, availability, or fulfillment of any goods or services offered by third-party merchants.
• Users must verify coupon terms before use.`
      },
      {
        title: "Advertisements & Sponsored Content",
        content: `• The App displays ads and sponsored content based on your address, activity, and preferences.
• By using the App, you consent to receive targeted ads, notifications, and promotional messages.
• Clicking ads may redirect you to third-party websites or applications. The App is not responsible for content, policies, or transactions outside our platform.`
      },
      {
        title: "Data Privacy & Security",
        content: `• We collect personal details such as mobile number, address, device activity, and app usage data for functionality, rewards, and ad targeting.
• Your data is processed in accordance with the Information Technology Act, 2000, and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.
• We use secure systems to store and protect your information.
• We do not sell personal data to unauthorized third parties.
• Users may opt out of promotional messages, subject to certain limitations.`
      },
      {
        title: "User Responsibilities",
        content: `You agree to use the App for lawful purposes only. You must not:
• Manipulate steps using artificial methods.
• Misuse referral rewards.
• Attempt to hack, disrupt, or reverse-engineer the App.
• Post or share inappropriate or harmful content.

Violations may result in suspension or permanent ban.`
      },
      {
        title: "Limitation of Liability",
        content: `• The App relies on mobile sensors and internet connectivity; we do not guarantee 100% accuracy in step counting.
• Rewards are incentives, not guaranteed earnings.
• We are not responsible for:
  ◦ Network issues, technical failures, or system downtime.
  ◦ Merchant offers, discounts, or third-party service failures.
  ◦ Any indirect, incidental, or consequential damages.
• Our maximum liability is limited to the reward balance available in your wallet at the time of dispute.`
      },
      {
        title: "Termination & Suspension",
        content: `• We reserve the right to suspend, block, or terminate accounts involved in fraud, misuse, or violation of these Terms.
• Wallet balances from fraudulent activity will be forfeited without notice.`
      },
      {
        title: "Governing Law & Jurisdiction",
        content: `• These Terms are governed by the laws of India.
• Any disputes shall fall under the exclusive jurisdiction of courts in Hyderabad, Telangana.`
      },
      {
        title: "Amendments",
        content: `• The App reserves the right to update, modify, or amend these Terms & Conditions at any time.
• Users will be notified via in-app alerts, SMS, or email about major changes.
• Continued use of the App after updates implies acceptance of revised Terms.
• Yogic Mile reserves the right to modify, update, or change these Terms & Conditions at any time, without prior notice. Such changes will be effective immediately upon being posted in the "Terms & Conditions" section of the app.
• Users are encouraged to review the Terms regularly to stay informed of updates. Continued use of the app after any changes shall constitute acceptance of the revised Terms.`
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