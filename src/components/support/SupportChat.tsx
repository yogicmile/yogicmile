import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Send, 
  Paperclip, 
  Bot, 
  User,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useSupportSystem } from '@/hooks/use-support-system';
import { LoadingStates } from '@/components/LoadingStates';
import { format } from 'date-fns';

export const SupportChat: React.FC = () => {
  const { chats, loading, fetchUserChats, sendChatMessage } = useSupportSystem();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUserChats();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  const handleSendMessage = async () => {
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      await sendChatMessage(message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  const formatDate = (timestamp: string) => {
    return format(new Date(timestamp), 'MMM dd, yyyy');
  };

  const groupMessagesByDate = () => {
    const grouped: { [key: string]: typeof chats } = {};
    
    chats.forEach(chat => {
      const date = formatDate(chat.timestamp);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(chat);
    });

    return grouped;
  };

  if (loading && chats.length === 0) {
    return <LoadingStates type="page" message="Loading chat..." />;
  }

  const groupedMessages = groupMessagesByDate();

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <Card className="flex-shrink-0">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">Live Support Chat</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                  Online
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Typical response time: 2-5 minutes
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Chat Messages */}
      <Card className="flex-1 flex flex-col mt-4">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {Object.keys(groupedMessages).length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
              <p className="text-muted-foreground mb-4">
                Ask us anything about Yogic Mile. We're here to help!
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>💡 Common topics:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Account issues', 'Step tracking', 'Wallet balance', 'Rewards'].map((topic) => (
                    <Badge key={topic} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedMessages).map(([date, messages]) => (
                <div key={date}>
                  {/* Date Separator */}
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                      {date}
                    </div>
                  </div>

                  {/* Messages for this date */}
                  <div className="space-y-3">
                    {messages.map((chat) => (
                      <div
                        key={chat.id}
                        className={`flex ${chat.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`flex max-w-[80%] space-x-2 ${
                            chat.sender_type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                          }`}
                        >
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarFallback>
                              {chat.sender_type === 'user' ? (
                                <User className="w-4 h-4" />
                              ) : (
                                <Bot className="w-4 h-4" />
                              )}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                chat.sender_type === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-foreground'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{chat.message}</p>
                            </div>
                            <div className="flex items-center space-x-1 mt-1 px-2">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {formatTime(chat.timestamp)}
                              </span>
                              {chat.sender_type === 'user' && (
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Chat Input */}
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="flex-shrink-0">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sending}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim() || sending}
              size="sm"
              className="flex-shrink-0"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            For complex issues, our team will respond via email within 24 hours
          </p>
        </div>
      </Card>
    </div>
  );
};