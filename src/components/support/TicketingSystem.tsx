import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Upload,
  Eye,
  MessageSquare
} from 'lucide-react';
import { useSupportSystem } from '@/hooks/use-support-system';
import { LoadingSpinner } from '@/components/LoadingStates';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export const TicketingSystem: React.FC = () => {
  const { tickets, loading, fetchUserTickets, createTicket } = useSupportSystem();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('list');
  const [creating, setCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  useEffect(() => {
    fetchUserTickets();
  }, []);

  const categories = [
    { value: 'account', label: 'Account Issues' },
    { value: 'payment', label: 'Payment Problems' },
    { value: 'steps', label: 'Step Tracking' },
    { value: 'rewards', label: 'Rewards/Coupons' },
    { value: 'technical', label: 'Technical Bug' },
    { value: 'feature', label: 'Feature Request' },
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600 bg-green-50' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-50' },
    { value: 'high', label: 'High', color: 'text-red-600 bg-red-50' },
  ];

  const statusConfig = {
    'open': { label: 'Open', color: 'bg-blue-100 text-blue-800', icon: Clock },
    'in-progress': { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
    'resolved': { label: 'Resolved', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    'closed': { label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle2 },
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.subject || !formData.description) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      await createTicket({
        category: formData.category,
        subject: formData.subject,
        description: formData.description,
        priority: formData.priority,
      });

      // Reset form
      setFormData({
        category: '',
        subject: '',
        description: '',
        priority: 'medium',
      });

      // Switch to tickets list
      setActiveTab('list');
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy - HH:mm');
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner className="mr-2" />
        Loading support tickets...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-orange-500 rounded-full flex items-center justify-center">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Support Tickets</h1>
        <p className="text-muted-foreground">
          Create and track your support requests
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">
            My Tickets ({tickets.length})
          </TabsTrigger>
          <TabsTrigger value="create">
            <Plus className="w-4 h-4 mr-2" />
            Create Ticket
          </TabsTrigger>
        </TabsList>

        {/* Tickets List */}
        <TabsContent value="list" className="space-y-4">
          {tickets.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Support Tickets</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't created any support tickets yet.
                </p>
                <Button onClick={() => setActiveTab('create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Ticket
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => {
                const status = statusConfig[ticket.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;
                
                return (
                  <Card key={ticket.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge variant="outline" className="text-xs font-mono">
                                #{ticket.id.slice(0, 8)}
                              </Badge>
                              <Badge className={`text-xs ${status.color}`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {status.label}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {priorities.find(p => p.value === ticket.priority)?.label}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-foreground mb-1">{ticket.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {ticket.description}
                            </p>
                          </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Created: {formatDate(ticket.created_at)}</span>
                        <div className="flex items-center space-x-3">
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Create Ticket Form */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create Support Ticket</CardTitle>
              <p className="text-sm text-muted-foreground">
                Describe your issue in detail so we can help you better.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Issue Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => handleInputChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${priority.color.split(' ')[1]}`} />
                            <span>{priority.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.subject.length}/100 characters
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={6}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.description.length}/1000 characters
                  </p>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label>Attachment (Optional)</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload screenshots or files to help us understand your issue
                    </p>
                    <Button variant="outline" size="sm" type="button">
                      Choose File
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Max file size: 10MB. Supports: JPG, PNG, PDF
                    </p>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    disabled={creating}
                    className="flex-1"
                  >
                    {creating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Creating Ticket...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Create Support Ticket
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('list')}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};