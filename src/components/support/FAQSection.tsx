import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Search, 
  ThumbsUp, 
  ThumbsDown, 
  ChevronDown, 
  ChevronUp,
  HelpCircle,
  Filter
} from 'lucide-react';
import { useSupportSystem } from '@/hooks/use-support-system';
import { LoadingStates } from '@/components/LoadingStates';

export const FAQSection: React.FC = () => {
  const { faqs, loading, fetchFAQs, voteFAQ } = useSupportSystem();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const categories = [
    { id: 'all', name: 'All Categories', count: faqs.length },
    { id: 'Account & Login', name: 'Account & Login', count: faqs.filter(f => f.category === 'Account & Login').length },
    { id: 'Rewards & Wallet', name: 'Rewards & Wallet', count: faqs.filter(f => f.category === 'Rewards & Wallet').length },
    { id: 'Step Tracking', name: 'Step Tracking', count: faqs.filter(f => f.category === 'Step Tracking').length },
    { id: 'Coupons & Ads', name: 'Coupons & Ads', count: faqs.filter(f => f.category === 'Coupons & Ads').length },
  ];

  useEffect(() => {
    fetchFAQs(selectedCategory === 'all' ? undefined : selectedCategory, searchQuery);
  }, [selectedCategory, searchQuery]);

  const toggleExpanded = (faqId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(faqId)) {
      newExpanded.delete(faqId);
    } else {
      newExpanded.add(faqId);
    }
    setExpandedItems(newExpanded);
  };

  const handleVote = async (faqId: string, voteType: 'helpful' | 'unhelpful') => {
    await voteFAQ(faqId, voteType);
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.search_keywords.some(keyword => 
        keyword.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading && faqs.length === 0) {
    return <div className="flex items-center justify-center p-8">Loading FAQ...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
          <HelpCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">
          Find quick answers to common questions about Yogic Mile
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder="Search FAQs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12"
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
          {categories.slice(0, 3).map((category) => (
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

        {/* Show more categories button for mobile */}
        <div className="flex gap-2 mt-2 overflow-x-auto">
          {categories.slice(3).map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex-shrink-0"
            >
              {category.name}
              {category.count > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {category.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        <TabsContent value={selectedCategory} className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No FAQs Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? `No results found for "${searchQuery}". Try different keywords.`
                    : 'No FAQs available in this category yet.'
                  }
                </p>
                {searchQuery && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <Card key={faq.id} className="border-l-4 border-l-primary/20">
                  <Collapsible
                    open={expandedItems.has(faq.id)}
                    onOpenChange={() => toggleExpanded(faq.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 text-left">
                            <CardTitle className="text-base font-semibold text-foreground">
                              {faq.question}
                            </CardTitle>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {faq.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {faq.views_count} views
                              </span>
                            </div>
                          </div>
                          {expandedItems.has(faq.id) ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="prose prose-sm max-w-none">
                          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                            {faq.answer}
                          </p>
                        </div>

                        {/* Voting */}
                        <div className="flex items-center justify-between mt-6 pt-4 border-t">
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <span>Was this helpful?</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVote(faq.id, 'helpful')}
                              className="flex items-center space-x-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <ThumbsUp className="w-4 h-4" />
                              <span>{faq.helpful_votes}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVote(faq.id, 'unhelpful')}
                              className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <ThumbsDown className="w-4 h-4" />
                              <span>{faq.unhelpful_votes}</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Results Summary */}
      {searchQuery && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} for "{searchQuery}"
        </div>
      )}
    </div>
  );
};