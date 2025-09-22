import React from 'react';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReferralTestPanel } from '@/components/ReferralTestPanel';
import { useNavigate } from 'react-router-dom';

export const ReferralTestPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Referral System Testing
              </h1>
              <p className="text-sm text-muted-foreground">
                Validate referral codes, bonuses, and social sharing functionality
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-20">
        {/* Test Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Test Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Code Generation</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Format: YM + last 4 mobile digits</li>
                  <li>• Unique code per user registration</li>
                  <li>• Automatic generation on signup</li>
                  <li>• Code persistence in profile</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Validation & Bonuses</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Valid code: Referrer +200, Referee +100 paisa</li>
                  <li>• Invalid code rejection with messages</li>
                  <li>• Self-referral prevention</li>
                  <li>• Already used code detection</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Social Sharing</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Instagram Stories with achievement cards</li>
                  <li>• WhatsApp Status with progress graphics</li>
                  <li>• Facebook milestone celebrations</li>
                  <li>• Share event logging and analytics</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Scenarios */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Test Scenarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Valid Referral Flow</h4>
                <div className="bg-success/10 rounded-lg p-3 space-y-2 text-sm">
                  <div><strong>User:</strong> +919876543210 → Code: YM3210</div>
                  <div><strong>New User:</strong> +918765432109 enters YM3210</div>
                  <div><strong>Result:</strong> Referrer gets +200 paisa, New user gets +100 paisa</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Error Scenarios</h4>
                <div className="bg-destructive/10 rounded-lg p-3 space-y-2 text-sm">
                  <div><strong>Invalid:</strong> YM0000, INVALID, empty field</div>
                  <div><strong>Self-referral:</strong> User enters own code</div>
                  <div><strong>Used code:</strong> Code already redeemed by another user</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Platforms */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Social Sharing Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-lg">
                <div className="text-3xl mb-2">📷</div>
                <div className="font-medium text-sm">Instagram Stories</div>
                <div className="text-xs text-muted-foreground">Custom stickers & cards</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg">
                <div className="text-3xl mb-2">💬</div>
                <div className="font-medium text-sm">WhatsApp Status</div>
                <div className="text-xs text-muted-foreground">Progress graphics</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-600/10 to-blue-700/10 rounded-lg">
                <div className="text-3xl mb-2">📘</div>
                <div className="font-medium text-sm">Facebook Post</div>
                <div className="text-xs text-muted-foreground">Milestone celebrations</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-sky-400/10 to-blue-500/10 rounded-lg">
                <div className="text-3xl mb-2">🐦</div>
                <div className="font-medium text-sm">Twitter Share</div>
                <div className="text-xs text-muted-foreground">Achievement posts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Panel */}
        <ReferralTestPanel />
      </div>
    </div>
  );
};