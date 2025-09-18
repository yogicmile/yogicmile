import React, { useState, useEffect } from 'react';
import { Search, MapPin, Activity, Users, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCommunity } from '@/hooks/use-community';
import type { UserProfile } from '@/types/community';

export const CommunityProfiles = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const { userProfile, searchUsers, updateUserProfile, sendFriendRequest } = useCommunity();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results as UserProfile[]);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async (profileId: string) => {
    if (userProfile) {
      await sendFriendRequest(profileId);
    }
  };

  const handleUpdateProfile = async (data: FormData) => {
    const updates = {
      display_name: data.get('display_name') as string,
      bio: data.get('bio') as string,
      location_city: data.get('location_city') as string,
      location_state: data.get('location_state') as string,
      profile_visibility: data.get('profile_visibility') as 'public' | 'friends_only' | 'private',
      stats_visible: data.get('stats_visible') === 'on',
      activity_visible: data.get('activity_visible') === 'on'
    };

    await updateUserProfile(updates);
    setShowEditProfile(false);
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Discover Community Members
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by name, location, or interests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              Search
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {searchResults.map((profile) => (
                <Card key={profile.id} className="bg-card/80 backdrop-blur-sm border-primary/10">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={profile.profile_picture_url} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {profile.display_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {profile.display_name}
                        </h3>
                        {profile.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {profile.bio}
                          </p>
                        )}
                        {(profile.location_city || profile.location_state) && (
                          <div className="flex items-center gap-1 mt-2">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {[profile.location_city, profile.location_state].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => setSelectedProfile(profile)}
                            variant="outline"
                          >
                            View Profile
                          </Button>
                          {userProfile?.user_id !== profile.user_id && (
                            <Button
                              size="sm"
                              onClick={() => handleSendFriendRequest(profile.user_id)}
                            >
                              Add Friend
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Profile Section */}
      {userProfile && (
        <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              My Profile
            </CardTitle>
            <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleUpdateProfile(formData);
                }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input
                      id="display_name"
                      name="display_name"
                      defaultValue={userProfile.display_name}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio (150 characters max)</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      defaultValue={userProfile.bio || ''}
                      maxLength={150}
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location_city">City</Label>
                      <Input
                        id="location_city"
                        name="location_city"
                        defaultValue={userProfile.location_city || ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location_state">State</Label>
                      <Input
                        id="location_state"
                        name="location_state"
                        defaultValue={userProfile.location_state || ''}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile_visibility">Profile Visibility</Label>
                    <Select name="profile_visibility" defaultValue={userProfile.profile_visibility}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public - Visible to everyone</SelectItem>
                        <SelectItem value="friends_only">Friends Only - Visible to friends</SelectItem>
                        <SelectItem value="private">Private - Hidden from community</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="stats_visible" 
                        name="stats_visible" 
                        defaultChecked={userProfile.stats_visible}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="stats_visible">Show my stats on profile</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="activity_visible" 
                        name="activity_visible" 
                        defaultChecked={userProfile.activity_visible}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="activity_visible">Show my activity feed</Label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowEditProfile(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Save Changes
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={userProfile.profile_picture_url} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {userProfile.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground">
                  {userProfile.display_name}
                </h3>
                {userProfile.bio && (
                  <p className="text-muted-foreground mt-1">{userProfile.bio}</p>
                )}
                <div className="flex items-center gap-4 mt-3">
                  {(userProfile.location_city || userProfile.location_state) && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {[userProfile.location_city, userProfile.location_state].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Activity Score: {userProfile.community_activity_score}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Badge variant="outline">
                    {userProfile.profile_visibility === 'public' ? 'Public Profile' : 
                     userProfile.profile_visibility === 'friends_only' ? 'Friends Only' : 'Private'}
                  </Badge>
                  {userProfile.stats_visible && (
                    <Badge variant="outline">Stats Visible</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Detail Dialog */}
      <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <DialogContent className="max-w-lg">
          {selectedProfile && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedProfile.profile_picture_url} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedProfile.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {selectedProfile.display_name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {selectedProfile.bio && (
                  <p className="text-muted-foreground">{selectedProfile.bio}</p>
                )}
                
                {(selectedProfile.location_city || selectedProfile.location_state) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {[selectedProfile.location_city, selectedProfile.location_state].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    Community Activity Score: {selectedProfile.community_activity_score}
                  </span>
                </div>

                {userProfile?.user_id !== selectedProfile.user_id && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => handleSendFriendRequest(selectedProfile.user_id)}
                      className="flex-1"
                    >
                      Send Friend Request
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};