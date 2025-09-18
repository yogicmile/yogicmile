import React, { useState, useEffect } from 'react';
import { UserPlus, Users, Clock, Check, X, MessageCircle, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCommunity } from '@/hooks/use-community';
import type { FriendshipWithProfile, UserProfile } from '@/types/community';

export const CommunityFriends = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [friendRequestMessage, setFriendRequestMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { 
    friends, 
    userProfile, 
    searchUsers, 
    sendFriendRequest, 
    respondToFriendRequest,
    loadFriends 
  } = useCommunity();

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

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

  const handleSendFriendRequest = async (userId: string) => {
    await sendFriendRequest(userId, friendRequestMessage);
    setFriendRequestMessage('');
    setSelectedUser(null);
  };

  const acceptedFriends = friends.filter(f => f.status === 'accepted');
  const pendingRequests = friends.filter(f => 
    f.status === 'pending' && f.addressee_id === userProfile?.user_id
  );
  const sentRequests = friends.filter(f => 
    f.status === 'pending' && f.requester_id === userProfile?.user_id
  );

  const getFriendProfile = (friendship: FriendshipWithProfile) => {
    if (friendship.requester_id === userProfile?.user_id) {
      return friendship.addressee_profile;
    }
    return friendship.requester_profile;
  };

  return (
    <div className="space-y-6">
      {/* Add Friends Section */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Find New Friends
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by name or location..."
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
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {searchResults.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.profile_picture_url} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.display_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.display_name}</p>
                      {user.location_city && (
                        <p className="text-sm text-muted-foreground">
                          {user.location_city}{user.location_state && `, ${user.location_state}`}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {userProfile?.user_id !== user.user_id && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          onClick={() => setSelectedUser(user)}
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Add Friend
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Send Friend Request</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={user.profile_picture_url} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {user.display_name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.display_name}</p>
                              {user.bio && (
                                <p className="text-sm text-muted-foreground">{user.bio}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="message">Personal Message (Optional)</Label>
                            <Textarea
                              id="message"
                              placeholder="Hi! I'd like to connect and share our wellness journey together."
                              value={friendRequestMessage}
                              onChange={(e) => setFriendRequestMessage(e.target.value)}
                              maxLength={500}
                              rows={3}
                            />
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(null);
                                setFriendRequestMessage('');
                              }}
                            >
                              Cancel
                            </Button>
                            <Button onClick={() => handleSendFriendRequest(user.user_id)}>
                              Send Request
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Friends Management */}
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="friends" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Friends ({acceptedFriends.length})
                </TabsTrigger>
                <TabsTrigger value="requests" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Requests ({pendingRequests.length})
                </TabsTrigger>
                <TabsTrigger value="sent" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Sent ({sentRequests.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="friends" className="px-6 pb-6">
              {acceptedFriends.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No friends yet</h3>
                  <p className="text-muted-foreground">Search for users above to start building your network!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {acceptedFriends.map((friendship) => {
                    const friend = getFriendProfile(friendship);
                    if (!friend) return null;
                    
                    return (
                      <Card key={friendship.id} className="bg-gradient-to-r from-card to-card/80">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={friend.profile_picture_url} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {friend.display_name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{friend.display_name}</p>
                                {friend.bio && (
                                  <p className="text-sm text-muted-foreground line-clamp-1">{friend.bio}</p>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    Friends since {new Date(friendship.accepted_at!).toLocaleDateString()}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <MessageCircle className="w-4 h-4 mr-1" />
                                Message
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

            <TabsContent value="requests" className="px-6 pb-6">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No friend requests</h3>
                  <p className="text-muted-foreground">Friend requests will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((friendship) => {
                    const requester = friendship.requester_profile;
                    if (!requester) return null;
                    
                    return (
                      <Card key={friendship.id} className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={requester.profile_picture_url} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {requester.display_name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{requester.display_name}</p>
                                {friendship.request_message && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    "{friendship.request_message}"
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  Sent {new Date(friendship.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => respondToFriendRequest(friendship.id, false)}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Decline
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => respondToFriendRequest(friendship.id, true)}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Accept
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

            <TabsContent value="sent" className="px-6 pb-6">
              {sentRequests.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
                  <p className="text-muted-foreground">Friend requests you send will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sentRequests.map((friendship) => {
                    const addressee = friendship.addressee_profile;
                    if (!addressee) return null;
                    
                    return (
                      <Card key={friendship.id} className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={addressee.profile_picture_url} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {addressee.display_name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{addressee.display_name}</p>
                                {friendship.request_message && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Your message: "{friendship.request_message}"
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  Sent {new Date(friendship.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};