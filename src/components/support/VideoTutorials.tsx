import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  PlayCircle, 
  Clock, 
  Eye, 
  ThumbsUp, 
  ThumbsDown,
  Play,
  ExternalLink
} from 'lucide-react';
import { useSupportSystem } from '@/hooks/use-support-system';
import { LoadingStates } from '@/components/LoadingStates';

export const VideoTutorials: React.FC = () => {
  const { tutorials, loading, fetchTutorials, trackTutorialView } = useSupportSystem();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTutorial, setSelectedTutorial] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const categories = [
    { id: 'all', name: 'All Tutorials', count: tutorials.length },
    { id: 'Getting Started', name: 'Getting Started', count: tutorials.filter(t => t.category === 'Getting Started').length },
    { id: 'Step Tracking', name: 'Step Tracking', count: tutorials.filter(t => t.category === 'Step Tracking').length },
    { id: 'Wallet Usage', name: 'Wallet Usage', count: tutorials.filter(t => t.category === 'Wallet Usage').length },
  ];

  useEffect(() => {
    fetchTutorials(selectedCategory === 'all' ? undefined : selectedCategory);
  }, [selectedCategory]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleTutorialClick = (tutorial: any) => {
    setSelectedTutorial(tutorial);
    setDialogOpen(true);
    trackTutorialView(tutorial.id);
  };

  const filteredTutorials = selectedCategory === 'all' 
    ? tutorials 
    : tutorials.filter(t => t.category === selectedCategory);

  if (loading && tutorials.length === 0) {
    return <LoadingStates type="page" message="Loading video tutorials..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-purple-500 rounded-full flex items-center justify-center">
          <PlayCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Video Tutorials</h1>
        <p className="text-muted-foreground">
          Step-by-step guides to help you make the most of Yogic Mile
        </p>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs">
              {category.name.split(' ')[0]}
              {category.count > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {category.count}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          {filteredTutorials.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <PlayCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Tutorials Available</h3>
                <p className="text-muted-foreground">
                  No video tutorials available in this category yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredTutorials.map((tutorial) => (
                <Card 
                  key={tutorial.id} 
                  className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => handleTutorialClick(tutorial)}
                >
                  <div className="relative">
                    {/* Thumbnail */}
                    <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-500 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                      {tutorial.thumbnail_url ? (
                        <img 
                          src={tutorial.thumbnail_url} 
                          alt={tutorial.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 w-full h-full flex items-center justify-center">
                          <PlayCircle className="w-16 h-16 text-white" />
                        </div>
                      )}
                      
                      {/* Play overlay */}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                          <Play className="w-6 h-6 text-gray-800 ml-0.5" />
                        </div>
                      </div>

                      {/* Duration badge */}
                      <Badge className="absolute bottom-2 right-2 bg-black/70 text-white text-xs">
                        {formatDuration(tutorial.duration)}
                      </Badge>

                      {/* Category badge */}
                      <Badge className="absolute top-2 left-2 bg-purple-500 text-white text-xs">
                        {tutorial.category}
                      </Badge>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                        {tutorial.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {tutorial.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{tutorial.views_count} views</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDuration(tutorial.duration)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm" className="h-6 px-1 text-green-600">
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            <span className="text-xs">{tutorial.helpful_votes}</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 px-1 text-red-600">
                            <ThumbsDown className="w-3 h-3 mr-1" />
                            <span className="text-xs">{tutorial.unhelpful_votes}</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Video Player Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedTutorial?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedTutorial && (
            <div className="space-y-4">
              {/* Video Player */}
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={selectedTutorial.embed_code}
                  title={selectedTutorial.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Video Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{selectedTutorial.category}</Badge>
                  <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{selectedTutorial.views_count} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(selectedTutorial.duration)}</span>
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground">
                  {selectedTutorial.description}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Was this helpful?</span>
                    <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {selectedTutorial.helpful_votes}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                      <ThumbsDown className="w-4 h-4 mr-1" />
                      {selectedTutorial.unhelpful_votes}
                    </Button>
                  </div>
                  
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};