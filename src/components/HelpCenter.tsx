import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  MessageCircle, 
  FileText, 
  PlayCircle, 
  Search, 
  Phone,
  Mail,
  ArrowLeft,
  Home
} from 'lucide-react';
import { FAQSection } from './support/FAQSection';
import { SupportChat } from './support/SupportChat';
import { TicketingSystem } from './support/TicketingSystem';
import { VideoTutorials } from './support/VideoTutorials';

export type SupportSection = 'home' | 'faq' | 'chat' | 'tickets' | 'tutorials';

export const HelpCenter: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SupportSection>('home');
  const [searchQuery, setSearchQuery] = useState('');

  const supportOptions = [
    {
      id: 'faq' as SupportSection,
      title: 'FAQ',
      subtitle: 'Quick Answers',
      description: 'Common questions and instant solutions',
      icon: HelpCircle,
      color: 'from-blue-500 to-blue-600',
      badge: 'Popular'
    },
    {
      id: 'chat' as SupportSection,
      title: 'Live Chat',
      subtitle: 'Get Help Now',
      description: 'Chat with our support team',
      icon: MessageCircle,
      color: 'from-green-500 to-green-600',
      badge: 'Online'
    },
    {
      id: 'tickets' as SupportSection,
      title: 'Support Tickets',
      subtitle: 'Report Issues',
      description: 'Create and track support requests',
      icon: FileText,
      color: 'from-orange-500 to-orange-600',
    },
    {
      id: 'tutorials' as SupportSection,
      title: 'Video Tutorials',
      subtitle: 'Learn More',
      description: 'Step-by-step video guides',
      icon: PlayCircle,
      color: 'from-purple-500 to-purple-600',
      badge: 'New'
    }
  ];

  const popularArticles = [
    'How do I earn coins from walking?',
    'Setting up health app permissions',
    'Understanding wallet and phases',
    'Redeeming rewards and coupons',
    'Troubleshooting step tracking issues'
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'faq':
        return <FAQSection />;
      case 'chat':
        return <SupportChat />;
      case 'tickets':
        return <TicketingSystem />;
      case 'tutorials':
        return <VideoTutorials />;
      default:
        return renderHome();
    }
  };

  const renderHome = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-8 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl">
        <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
          <HelpCircle className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">How can we help you?</h1>
        <p className="text-muted-foreground">
          Find answers, get support, and learn more about Step Rewards
        </p>
      </div>

      {/* Quick Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder="Search for help articles, tutorials, or common issues..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      {/* Support Options Grid */}
      <div className="grid grid-cols-2 gap-4">
        {supportOptions.map((option) => (
          <Card 
            key={option.id}
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => setActiveSection(option.id)}
          >
            <CardContent className="p-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center mb-3 relative`}>
                <option.icon className="w-6 h-6 text-white" />
                {option.badge && (
                  <Badge className="absolute -top-1 -right-1 text-xs px-1.5 py-0.5 bg-accent text-accent-foreground">
                    {option.badge}
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-foreground mb-1">{option.title}</h3>
              <p className="text-xs text-primary font-medium mb-2">{option.subtitle}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{option.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Popular Articles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Popular Articles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {popularArticles.map((article, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start h-auto p-3 text-sm text-left"
              onClick={() => {
                setActiveSection('faq');
                setSearchQuery(article);
              }}
            >
              <HelpCircle className="w-4 h-4 mr-3 text-muted-foreground flex-shrink-0" />
              <span className="flex-1">{article}</span>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Still Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Email Support</p>
              <p className="text-sm text-muted-foreground">support@yogicmile.com</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Phone Support</p>
              <p className="text-sm text-muted-foreground">Available Mon-Fri, 9 AM - 6 PM</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            {activeSection !== 'home' ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveSection('home')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Help Center</span>
              </Button>
            ) : (
              <h1 className="text-xl font-bold text-foreground">Help & Support</h1>
            )}
          </div>
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {renderContent()}
      </div>
    </div>
  );
};