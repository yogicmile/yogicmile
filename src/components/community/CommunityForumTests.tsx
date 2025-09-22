import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, Hash, ThumbsUp, MessageCircle, 
  Eye, Send, CheckCircle2, Activity 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FORUM_CATEGORIES, type ForumCategory } from '@/types/community';

interface TestResult {
  testId: string;
  status: 'passed' | 'failed' | 'pending' | 'running';
  message: string;
}

interface CommunityForumTestsProps {
  testResults: TestResult[];
  onTestUpdate: (testId: string, status: TestResult['status'], message: string) => void;
}

interface TestPost {
  title: string;
  content: string;
  category: ForumCategory;
  tags: string[];
}

export const CommunityForumTests: React.FC<CommunityForumTestsProps> = ({
  testResults,
  onTestUpdate
}) => {
  const { toast } = useToast();
  
  const [testPost, setTestPost] = useState<TestPost>({
    title: '',
    content: '',
    category: 'health_tips',
    tags: []
  });
  const [currentTag, setCurrentTag] = useState('');
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Test TC072: Forum Posting Test
  const runForumPostingTest = async () => {
    const testId = 'TC072';
    onTestUpdate(testId, 'running', 'Testing forum posting functionality...');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        onTestUpdate(testId, 'failed', 'User must be logged in to test forum posting');
        return;
      }

      // Create test post
      const postData = {
        author_id: user.id,
        category: testPost.category,
        title: testPost.title || 'Test Forum Post - TC072',
        content: testPost.content || 'This is a test post to verify forum functionality and proper formatting.',
        tags: testPost.tags.length > 0 ? testPost.tags : ['test', 'community'],
        status: 'published'
      };

      const { data: newPost, error } = await supabase
        .from('forum_posts')
        .insert(postData)
        .select()
        .single();

      if (error) throw error;

      // Verify post formatting and visibility
      const verificationChecks = {
        titlePresent: newPost.title?.length > 0,
        contentPresent: newPost.content?.length > 0,
        categorySet: newPost.category === testPost.category,
        tagsPresent: Array.isArray(newPost.tags) && newPost.tags.length > 0,
        statusPublished: newPost.status === 'published',
        authorSet: newPost.author_id === user.id
      };

      const allChecksPass = Object.values(verificationChecks).every(Boolean);

      if (allChecksPass) {
        onTestUpdate(testId, 'passed', 
          `Forum post created successfully with proper formatting. Post ID: ${newPost.id.slice(0, 8)}`
        );
        
        // Refresh recent posts
        loadRecentPosts();

        toast({
          title: "Test Passed",
          description: "Forum posting test completed successfully"
        });
      } else {
        const failedChecks = Object.entries(verificationChecks)
          .filter(([_, passed]) => !passed)
          .map(([check, _]) => check);
        
        onTestUpdate(testId, 'failed', 
          `Forum post creation failed verification: ${failedChecks.join(', ')}`
        );
      }

    } catch (error) {
      onTestUpdate(testId, 'failed', `Forum posting failed: ${error}`);
      toast({
        title: "Test Failed",
        description: "Forum posting test failed",
        variant: "destructive"
      });
    }
  };

  // Load recent posts for verification
  const loadRecentPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          id,
          title,
          content,
          category,
          tags,
          upvotes,
          downvotes,
          comments_count,
          status,
          created_at,
          author_id
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentPosts(data || []);
    } catch (error) {
      console.error('Failed to load recent posts:', error);
    }
  };

  // Add tag to post
  const addTag = () => {
    if (currentTag.trim() && !testPost.tags.includes(currentTag.trim())) {
      setTestPost(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  // Remove tag from post
  const removeTag = (tagToRemove: string) => {
    setTestPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Load recent posts on component mount
  useEffect(() => {
    loadRecentPosts();
  }, []);

  const testResult = testResults.find(r => r.testId === 'TC072');

  return (
    <div className="space-y-6">
      {/* Test TC072: Forum Posting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Forum Posting Test (TC072)
            {testResult && (
              <Badge 
                variant={
                  testResult.status === 'passed' ? 'default' :
                  testResult.status === 'failed' ? 'destructive' :
                  testResult.status === 'running' ? 'outline' : 'secondary'
                }
              >
                {testResult.status}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Test Scenario: Create post → Published with proper formatting and visibility
          </p>
          
          <div className="space-y-4">
            {/* Post Title */}
            <div>
              <Label htmlFor="post-title">Post Title</Label>
              <Input
                id="post-title"
                value={testPost.title}
                onChange={(e) => setTestPost(prev => ({...prev, title: e.target.value}))}
                placeholder="Enter post title..."
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {testPost.title.length}/200 characters
              </p>
            </div>

            {/* Category Selection */}
            <div>
              <Label>Category</Label>
              <Select 
                value={testPost.category} 
                onValueChange={(value: ForumCategory) => setTestPost(prev => ({...prev, category: value}))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FORUM_CATEGORIES).map(([key, category]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Post Content */}
            <div>
              <Label htmlFor="post-content">Post Content</Label>
              <Textarea
                id="post-content"
                value={testPost.content}
                onChange={(e) => setTestPost(prev => ({...prev, content: e.target.value}))}
                placeholder="Write your post content here..."
                rows={6}
                maxLength={5000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {testPost.content.length}/5000 characters
              </p>
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button onClick={addTag} variant="outline" size="sm">
                  <Hash className="w-4 h-4" />
                </Button>
              </div>
              {testPost.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {testPost.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      #{tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button 
              onClick={runForumPostingTest}
              disabled={loading || testResult?.status === 'running'}
              className="w-full"
            >
              {testResult?.status === 'running' ? 'Creating Post...' : 'Create Forum Post (Test)'}
            </Button>

            {testResult && (
              <Card className={`border-l-4 ${
                testResult.status === 'passed' ? 'border-l-green-500 bg-green-50/50' :
                testResult.status === 'failed' ? 'border-l-red-500 bg-red-50/50' :
                'border-l-blue-500 bg-blue-50/50'
              }`}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    {testResult.status === 'passed' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                    <h4 className="font-semibold">Test Result</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{testResult.message}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Posts Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Forum Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentPosts.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No recent posts found</p>
          ) : (
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <Card key={post.id} className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{post.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {FORUM_CATEGORIES[post.category as ForumCategory]?.name} • 
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {post.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {post.content}
                    </p>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex gap-1 mb-3 flex-wrap">
                        {post.tags.slice(0, 3).map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Post Stats */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{post.upvotes || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{post.comments_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>Published</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <Button 
            onClick={loadRecentPosts} 
            variant="outline" 
            size="sm" 
            className="w-full mt-4"
          >
            Refresh Posts
          </Button>
        </CardContent>
      </Card>

      {/* Forum Categories Overview */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm">Available Forum Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(FORUM_CATEGORIES).map(([key, category]) => (
              <div 
                key={key} 
                className="flex items-center gap-3 p-3 border rounded-lg bg-background/50"
              >
                <span className="text-lg">{category.icon}</span>
                <div>
                  <h4 className="font-medium text-sm">{category.name}</h4>
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};