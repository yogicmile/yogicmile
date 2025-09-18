import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle2, AlertCircle, FileText, BarChart3, Mail, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LegalPolicyModal } from './LegalPolicyModal';

interface ConsentItem {
  type: 'terms_conditions' | 'data_processing' | 'marketing' | 'analytics';
  label: string;
  description: string;
  required: boolean;
  icon: React.ReactNode;
  granted: boolean;
}

interface ConsentManagerProps {
  onConsentComplete?: () => void;
  mode?: 'signup' | 'settings';
  className?: string;
}

export const ConsentManager: React.FC<ConsentManagerProps> = ({
  onConsentComplete,
  mode = 'signup',
  className = ''
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [consents, setConsents] = useState<ConsentItem[]>([
    {
      type: 'terms_conditions',
      label: 'Terms & Conditions',
      description: 'I agree to the Terms & Conditions and understand my rights and responsibilities',
      required: true,
      icon: <FileText className="h-4 w-4" />,
      granted: false
    },
    {
      type: 'data_processing',
      label: 'Essential Data Processing',
      description: 'I consent to data processing necessary for app functionality (step tracking, wallet management)',
      required: true,
      icon: <Shield className="h-4 w-4" />,
      granted: false
    },
    {
      type: 'marketing',
      label: 'Marketing Communications',
      description: 'I agree to receive promotional emails, deals, and special offers',
      required: false,
      icon: <Mail className="h-4 w-4" />,
      granted: false
    },
    {
      type: 'analytics',
      label: 'Analytics & Improvement',
      description: 'I consent to anonymous data collection for app improvement and feature development',
      required: false,
      icon: <BarChart3 className="h-4 w-4" />,
      granted: false
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [privacyModalTab, setPrivacyModalTab] = useState<'privacy' | 'terms'>('privacy');

  // Load existing consents in settings mode
  useEffect(() => {
    if (mode === 'settings' && user) {
      loadExistingConsents();
    }
  }, [mode, user]);

  const loadExistingConsents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_consent')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        setConsents(prev => prev.map(consent => {
          const existingConsent = data.find(d => d.consent_type === consent.type);
          return {
            ...consent,
            granted: existingConsent ? existingConsent.granted : false
          };
        }));
      }
    } catch (error) {
      console.error('Error loading consents:', error);
    }
  };

  const handleConsentChange = (type: string, granted: boolean) => {
    setConsents(prev => prev.map(consent => 
      consent.type === type ? { ...consent, granted } : consent
    ));
  };

  const saveConsents = async () => {
    if (!user) return false;

    setIsLoading(true);
    try {
      const consentRecords = consents.map(consent => ({
        user_id: user.id,
        consent_type: consent.type,
        granted: consent.granted,
        consent_version: '2.0',
        ip_address: null, // Will be captured by database if needed
        user_agent: navigator.userAgent
      }));

      // Use upsert to handle both new and existing consents
      const { error } = await supabase
        .from('user_consent')
        .upsert(consentRecords, {
          onConflict: 'user_id,consent_type'
        });

      if (error) throw error;

      toast({
        title: "Consent Saved",
        description: "Your privacy preferences have been updated successfully",
        variant: "default"
      });

      if (onConsentComplete) {
        onConsentComplete();
      }

      return true;
    } catch (error) {
      console.error('Error saving consents:', error);
      toast({
        title: "Error",
        description: "Failed to save consent preferences",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const openPolicyModal = (tab: 'privacy' | 'terms') => {
    setPrivacyModalTab(tab);
    setShowPrivacyModal(true);
  };

  const requiredConsentsGranted = consents
    .filter(consent => consent.required)
    .every(consent => consent.granted);

  const canProceed = mode === 'signup' ? requiredConsentsGranted : true;

  return (
    <>
      <Card className={`border-border/50 bg-surface/80 backdrop-blur ${className}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">
              {mode === 'signup' ? 'Privacy & Consent' : 'Manage Consent Preferences'}
            </CardTitle>
          </div>
          <CardDescription>
            {mode === 'signup' 
              ? 'Please review and accept our privacy terms to continue'
              : 'Update your consent preferences and privacy settings'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Required Notice */}
          {mode === 'signup' && (
            <Alert className="border-primary/50 bg-primary/5">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertDescription className="text-primary">
                <strong>Required:</strong> Some consents are mandatory for the app to function properly. 
                Optional consents can be modified later in your privacy settings.
              </AlertDescription>
            </Alert>
          )}

          {/* Consent Items */}
          <div className="space-y-4">
            {consents.map((consent) => (
              <div key={consent.type} className="space-y-3">
                <div className="flex items-start space-x-3 p-4 border border-border/50 rounded-lg bg-surface/50">
                  <Checkbox
                    id={consent.type}
                    checked={consent.granted}
                    onCheckedChange={(checked) => handleConsentChange(consent.type, checked as boolean)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {consent.icon}
                      <label 
                        htmlFor={consent.type} 
                        className="text-sm font-medium text-foreground cursor-pointer"
                      >
                        {consent.label}
                      </label>
                      {consent.required && (
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {consent.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Policy Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Review Our Policies</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openPolicyModal('privacy')}
                className="text-primary border-primary/50 hover:bg-primary/10"
              >
                <Shield className="h-3 w-3 mr-1" />
                Privacy Policy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openPolicyModal('terms')}
                className="text-secondary border-secondary/50 hover:bg-secondary/10"
              >
                <FileText className="h-3 w-3 mr-1" />
                Terms & Conditions
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={saveConsents}
              disabled={!canProceed || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {mode === 'signup' ? 'Accept & Continue' : 'Save Preferences'}
                </>
              )}
            </Button>
            
            {mode === 'settings' && (
              <Button variant="outline" onClick={loadExistingConsents}>
                Reset to Saved
              </Button>
            )}
          </div>

          {/* Consent Status Summary */}
          {mode === 'settings' && (
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <h4 className="text-sm font-medium text-foreground mb-2">Consent Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Required Consents:</span>
                  <div className="flex items-center gap-1 mt-1">
                    {requiredConsentsGranted ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-destructive" />
                    )}
                    <span className={requiredConsentsGranted ? 'text-green-600' : 'text-destructive'}>
                      {requiredConsentsGranted ? 'Complete' : 'Incomplete'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Optional Consents:</span>
                  <div className="mt-1">
                    <span className="text-foreground">
                      {consents.filter(c => !c.required && c.granted).length} of{' '}
                      {consents.filter(c => !c.required).length} granted
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <LegalPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        initialTab={privacyModalTab}
      />
    </>
  );
};