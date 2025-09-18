import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  Star, 
  Upload, 
  Send, 
  CheckCircle,
  AlertCircle,
  Info,
  Smartphone,
  Monitor
} from 'lucide-react';

interface FeedbackFormData {
  type: 'bug' | 'feature' | 'general' | 'ui_ux';
  title: string;
  description: string;
  rating: number;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  deviceInfo: string;
  userEmail: string;
  screenshot?: File;
}

export function BetaFeedbackSystem() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<FeedbackFormData>({
    type: 'general',
    title: '',
    description: '',
    rating: 5,
    category: 'app_performance',
    priority: 'medium',
    deviceInfo: getDeviceInfo(),
    userEmail: '',
    screenshot: undefined
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { toast } = useToast();

  // Get device information for bug reporting
  function getDeviceInfo() {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const screenSize = `${screen.width}x${screen.height}`;
    
    return `${platform} | ${userAgent} | ${language} | ${screenSize}`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call to submit feedback
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real implementation, this would submit to your feedback API
      console.log('Beta Feedback Submitted:', {
        ...formData,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });

      setIsSubmitted(true);
      toast({
        title: "Feedback Submitted! 🎉",
        description: "Thank you for helping us improve Yogic Mile. We'll review your feedback soon.",
      });

      // Reset form after success
      setTimeout(() => {
        setIsSubmitted(false);
        setIsOpen(false);
        setFormData({
          type: 'general',
          title: '',
          description: '',
          rating: 5,
          category: 'app_performance',
          priority: 'medium',
          deviceInfo: getDeviceInfo(),
          userEmail: '',
          screenshot: undefined
        });
      }, 2000);

    } catch (error) {
      toast({
        title: "Submission Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
      setFormData(prev => ({ ...prev, screenshot: file }));
    } else {
      toast({
        title: "File Too Large",
        description: "Screenshot must be under 5MB.",
        variant: "destructive"
      });
    }
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-md mx-auto animate-in slide-in-from-bottom duration-300">
        <CardContent className="p-6 text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-success mx-auto animate-pulse" />
          <h3 className="text-xl font-bold text-success">Feedback Received!</h3>
          <p className="text-muted-foreground">
            Your feedback helps make Yogic Mile better for everyone. Thank you for being a beta tester!
          </p>
          <Badge variant="secondary" className="bg-success/10 text-success">
            Beta Tester ⭐
          </Badge>
        </CardContent>
      </Card>
    );
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-20 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-4 shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-105"
          size="lg"
        >
          <MessageSquare className="w-6 h-6 mr-2" />
          Beta Feedback
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Beta Tester Feedback
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Help us improve Yogic Mile by sharing your experience
          </p>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Feedback Type */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Feedback Type</Label>
              <RadioGroup 
                value={formData.type} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="bug" id="bug" />
                  <Label htmlFor="bug" className="flex items-center gap-2 cursor-pointer">
                    <Bug className="w-4 h-4 text-destructive" />
                    Bug Report
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="feature" id="feature" />
                  <Label htmlFor="feature" className="flex items-center gap-2 cursor-pointer">
                    <Lightbulb className="w-4 h-4 text-warning" />
                    Feature Request
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="ui_ux" id="ui_ux" />
                  <Label htmlFor="ui_ux" className="flex items-center gap-2 cursor-pointer">
                    <Monitor className="w-4 h-4 text-primary" />
                    UI/UX Feedback
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="general" id="general" />
                  <Label htmlFor="general" className="flex items-center gap-2 cursor-pointer">
                    <Info className="w-4 h-4 text-secondary" />
                    General Feedback
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-semibold">Title</Label>
              <Input
                id="title"
                placeholder="Brief summary of your feedback"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold">Description</Label>
              <Textarea
                id="description"
                placeholder="Please provide detailed feedback. For bugs, include steps to reproduce..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/1000 characters
              </p>
            </div>

            {/* Rating */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Overall Experience Rating</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                    className="transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-8 h-8 ${
                        star <= formData.rating 
                          ? 'text-warning fill-warning' 
                          : 'text-muted-foreground'
                      }`} 
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {formData.rating}/5 stars
                </span>
              </div>
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="app_performance">App Performance</SelectItem>
                    <SelectItem value="step_tracking">Step Tracking</SelectItem>
                    <SelectItem value="wallet_rewards">Wallet & Rewards</SelectItem>
                    <SelectItem value="social_features">Social Features</SelectItem>
                    <SelectItem value="ui_design">UI & Design</SelectItem>
                    <SelectItem value="notifications">Notifications</SelectItem>
                    <SelectItem value="account_profile">Account & Profile</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Low</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="high">🟠 High</SelectItem>
                    <SelectItem value="critical">🔴 Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Screenshot Upload */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Screenshot (Optional)</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="screenshot-upload"
                />
                <label htmlFor="screenshot-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload screenshot (max 5MB)
                  </p>
                </label>
                {formData.screenshot && (
                  <Badge variant="secondary" className="mt-2">
                    {formData.screenshot.name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Email (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold">
                Email (Optional) 
                <span className="text-xs text-muted-foreground ml-1">- for follow-up</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.userEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, userEmail: e.target.value }))}
              />
            </div>

            {/* Device Info Display */}
            <div className="space-y-2">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Device Information
              </Label>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground font-mono">
                  {formData.deviceInfo}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.title || !formData.description}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}