import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  BarChart3,
  MessageSquare,
  CheckCircle,
  XCircle,
  PlayCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminTestingQuickActions: React.FC = () => {
  const navigate = useNavigate();

  const testCategories = [
    {
      title: 'Authentication Tests',
      icon: Shield,
      description: 'Admin login, security, and access control',
      testCount: 3,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'User Management',
      icon: Users,
      description: 'Search, profiles, and account management',
      testCount: 4,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Analytics & Reports',
      icon: BarChart3,
      description: 'Dashboard stats and performance metrics',
      testCount: 2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Content Control',
      icon: MessageSquare,
      description: 'Ads, moderation, and content validation',
      testCount: 3,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="w-5 h-5" />
          Admin Testing Suite
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4">
          Run comprehensive tests for admin panel functionality, user management, and security.
        </p>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          {testCategories.map((category) => (
            <div
              key={category.title}
              className={`p-3 rounded-lg border ${category.bgColor} border-opacity-20`}
            >
              <div className="flex items-center gap-2 mb-2">
                <category.icon className={`w-4 h-4 ${category.color}`} />
                <span className="font-medium text-sm">{category.title}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-1">
                {category.description}
              </p>
              <Badge variant="secondary" className="text-xs">
                {category.testCount} tests
              </Badge>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => navigate('/admin/testing')}
            className="flex-1"
          >
            Open Testing Suite
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.open('/support-testing', '_blank')}
          >
            Support Tests
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.open('/security-tests', '_blank')}
          >
            Security Tests
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.open('/performance-tests', '_blank')}
          >
            Performance Tests
          </Button>
        </div>

        <div className="mt-3 p-2 bg-muted rounded text-xs text-muted-foreground">
          <div className="flex items-center gap-1 mb-1">
            <CheckCircle className="w-3 h-3 text-green-600" />
            <span>7 test categories available</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-blue-600" />
            <span>Security & authorization testing included</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};