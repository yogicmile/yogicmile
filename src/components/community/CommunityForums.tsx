import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Plus, TrendingUp, Heart, MessageCircle, Bookmark, Flag, Filter, Image as ImageIcon, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCommunity } from '@/hooks/use-community';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { FORUM_CATEGORIES, type ForumCategory } from '@/types/community';
import type { ForumPost, ForumComment } from '@/types/community';
import { PhotoUploadService } from '@/services/PhotoUploadService';

export const CommunityForums = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ForumCategory | 'all'>('all');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const { userProfile } = useCommunity();
  const { user, isGuest } = useAuth();
  const { toast } = useToast();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPosts();
  }, [selectedCategory]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('forum_posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data: postsData, error: postsError } = await query;
      if (postsError) throw postsError;

      // Get unique author IDs
      const authorIds = [...new Set(postsData?.map(post => post.author_id) || [])];
      
      // Fetch author profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, display_name, profile_picture_url')
        .in('user_id', authorIds);
      
      if (profilesError) throw profilesError;

      // Create a map for quick profile lookup
      const profilesMap = new Map(profilesData?.map(profile => [profile.user_id, profile]) || []);

      // Combine posts with author profiles
      const postsWithProfiles = postsData?.map(post => ({
        ...post,
        author_profile: profilesMap.get(post.author_id)
      })) || [];

      setPosts(postsWithProfiles as any);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: "Error",
        description: "Failed to load forum posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const compressed = await PhotoUploadService.compressImage(file, 1920, 0.85);
        const result = await PhotoUploadService.uploadCommunityPhoto(
          compressed,
          'forum-post',
          undefined
        );
        return result.success ? result.url : null;
      });

      const urls = await Promise.all(uploadPromises);
      const validUrls = urls.filter((url): url is string => url !== null);
      setUploadedImages(prev => [...prev, ...validUrls]);

      toast({
        title: "Success",
        description: `${validUrls.length} image(s) uploaded`
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Could not upload images",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCreatePost = async (formData: FormData) => {
    if (!userProfile || !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create posts",
        variant: "destructive"
      });
      return;
    }

    try {
      const postData = {
        author_id: userProfile.user_id,
        category: formData.get('category') as ForumCategory,
        title: formData.get('title') as string,
        content: formData.get('content') as string,
        tags: (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(Boolean) || [],
        image_urls: uploadedImages.length > 0 ? uploadedImages : null
      };

      const { error } = await supabase
        .from('forum_posts')
        .insert(postData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post created successfully!"
      });

      setShowCreatePost(false);
      setUploadedImages([]);
      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
    }
  };

  const handleVote = async (postId: string, voteType: 'upvote' | 'downvote') => {
    if (!userProfile || !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to vote on posts",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('content_votes')
        .select('*')
        .eq('user_id', userProfile.user_id)
        .eq('content_id', postId)
        .eq('content_type', 'post')
        .single();

      if (existingVote) {
        // Update existing vote or remove if same
        if (existingVote.vote_type === voteType) {
          await supabase
            .from('content_votes')
            .delete()
            .eq('id', existingVote.id);
        } else {
          await supabase
            .from('content_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);
        }
      } else {
        // Create new vote
        await supabase
          .from('content_votes')
          .insert({
            user_id: userProfile.user_id,
            content_id: postId,
            content_type: 'post',
            vote_type: voteType
          });
      }

      // Refresh posts to show updated vote counts
      loadPosts();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Authentication Check */}
      {(isGuest || !user) && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Join the Community</h3>
            <p className="text-muted-foreground mb-4">
              Sign in to participate in community forums, create posts, and engage with other members.
            </p>
            <Button onClick={() => navigate('/login')}>
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Forum Content - Only show if authenticated */}
      {!isGuest && user && (
        <>
          {/* Forum Header */}
          <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Community Forums</h2>
          <p className="text-muted-foreground">Share knowledge, experiences, and connect with fellow walkers</p>
        </div>
        
        <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
          <DialogTrigger asChild>
            <Button 
              className="flex items-center gap-2"
              disabled={isGuest || !user}
            >
              <Plus className="w-4 h-4" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreatePost(formData);
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(FORUM_CATEGORIES).map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter post title (max 100 characters)"
                  maxLength={100}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Write your post content here..."
                  maxLength={2000}
                  rows={8}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (Optional)</Label>
                <Input
                  id="tags"
                  name="tags"
                  placeholder="Enter tags separated by commas"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Images (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || uploadedImages.length >= 4}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Add Images'}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {uploadedImages.length}/4 images
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {uploadedImages.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== index))}
                          className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setShowCreatePost(false);
                  setUploadedImages([]);
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  Create Post
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filter */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All Posts
            </Button>
            {Object.values(FORUM_CATEGORIES).map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id as ForumCategory)}
                className="flex items-center gap-2"
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex space-x-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-primary/20 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-primary/20 rounded w-full mb-2"></div>
                      <div className="h-3 bg-primary/20 rounded w-2/3"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to start a discussion in this category!
              </p>
              <Button onClick={() => setShowCreatePost(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="bg-card/80 backdrop-blur-sm border-primary/20 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex space-x-4">
                  {/* Author Avatar */}
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={post.author_profile?.profile_picture_url} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {post.author_profile?.display_name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Post Content */}
                  <div className="flex-1 min-w-0">
                    {/* Post Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {FORUM_CATEGORIES[post.category]?.icon} {FORUM_CATEGORIES[post.category]?.name}
                          </Badge>
                          {post.is_pinned && (
                            <Badge variant="secondary" className="text-xs">
                              📌 Pinned
                            </Badge>
                          )}
                          {post.is_featured && (
                            <Badge variant="secondary" className="text-xs">
                              ⭐ Featured
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-2">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{post.author_profile?.display_name || 'Unknown User'}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(post.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Post Content Preview */}
                    <p className="text-muted-foreground mb-3 line-clamp-3">
                      {post.content}
                    </p>

                    {/* Post Images */}
                    {post.image_urls && Array.isArray(post.image_urls) && post.image_urls.length > 0 && (
                      <div className={`grid gap-2 mb-3 ${post.image_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        {post.image_urls.slice(0, 4).map((url: string, index: number) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Post image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.tags.slice(0, 5).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Post Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Upvote/Downvote */}
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleVote(post.id, 'upvote')}
                            className="p-1 h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </Button>
                          <span className="text-sm font-medium text-green-600">
                            {post.upvotes}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleVote(post.id, 'downvote')}
                            className="p-1 h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <TrendingUp className="w-4 h-4 rotate-180" />
                          </Button>
                          <span className="text-sm font-medium text-red-600">
                            {post.downvotes}
                          </span>
                        </div>
                        
                        {/* Comments */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">{post.comments_count}</span>
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Bookmark */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-2 text-muted-foreground hover:text-foreground"
                        >
                          <Bookmark className="w-4 h-4" />
                        </Button>
                        
                        {/* Report */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-2 text-muted-foreground hover:text-foreground"
                        >
                          <Flag className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
        </>
      )}
    </div>
  );
};