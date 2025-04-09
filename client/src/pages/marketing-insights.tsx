import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { AlertCircle, Trash2, TrendingUp, FileText, Search } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface InsightTrend {
  trend: string;
  description: string;
  relevance: number;
  recommendation: string;
  category: string;
}

interface MarketingInsight {
  id: number;
  insightId: string;
  createdAt: string;
  summary: string;
  insights: InsightTrend[];
  targetMarket: string | null;
  propertyType: string | null;
  priceRange: string | null;
  location: string | null;
  keywords: string[];
  campaignId: number | null;
  createdBy: number;
}

function InsightCard({ insight }: { insight: MarketingInsight }) {
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteInsightMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/marketing-insights/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketing-insights'] });
      toast({
        title: 'Insight deleted',
        description: 'The marketing insight has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete insight: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  });

  const categoryColors: Record<string, string> = {
    'technology': 'bg-blue-100 text-blue-800',
    'consumer-preference': 'bg-green-100 text-green-800',
    'marketing-channel': 'bg-purple-100 text-purple-800',
    'marketing-strategy': 'bg-indigo-100 text-indigo-800',
    'location-value': 'bg-amber-100 text-amber-800',
    'financing': 'bg-red-100 text-red-800',
    'social-media': 'bg-pink-100 text-pink-800',
    'visual-content': 'bg-teal-100 text-teal-800',
    'copywriting': 'bg-orange-100 text-orange-800',
  };
  
  // Emoji mapping for trend categories and mood indication
  const getTrendEmoji = (category: string, relevance: number): { emoji: string, label: string } => {
    // Base emojis by category
    const categoryEmojis: Record<string, { emoji: string, label: string }> = {
      'technology': { emoji: '💻', label: 'Technology Trend' },
      'consumer-preference': { emoji: '👥', label: 'Consumer Preference' },
      'marketing-channel': { emoji: '📣', label: 'Marketing Channel' },
      'marketing-strategy': { emoji: '📊', label: 'Marketing Strategy' },
      'location-value': { emoji: '📍', label: 'Location Value' },
      'financing': { emoji: '💰', label: 'Financing Trend' },
      'social-media': { emoji: '📱', label: 'Social Media' },
      'visual-content': { emoji: '🖼️', label: 'Visual Content' },
      'copywriting': { emoji: '✍️', label: 'Copywriting' },
    };
    
    // Mood emojis based on relevance score
    const moodEmojis = [
      { range: [1, 3], emoji: '😐', label: 'Low Relevance' },
      { range: [4, 6], emoji: '🙂', label: 'Medium Relevance' },
      { range: [7, 8], emoji: '😊', label: 'High Relevance' },
      { range: [9, 10], emoji: '🔥', label: 'Very High Relevance' },
    ];
    
    // Find the right mood emoji based on relevance
    const mood = moodEmojis.find(m => relevance >= m.range[0] && relevance <= m.range[1]) || moodEmojis[0];
    
    // Get the category emoji or default
    const categoryInfo = categoryEmojis[category.toLowerCase()] || { emoji: '📈', label: 'Market Trend' };
    
    // Combine category and mood
    return {
      emoji: `${categoryInfo.emoji} ${mood.emoji}`,
      label: `${categoryInfo.label} - ${mood.label}`,
    };
  };

  const getDefaultCategoryColor = () => 'bg-gray-100 text-gray-800';

  const getCategoryClass = (category: string) => {
    return categoryColors[category.toLowerCase()] || getDefaultCategoryColor();
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this insight?')) {
      deleteInsightMutation.mutate(insight.id);
    }
  };

  const formattedDate = new Date(insight.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <Card className="mb-6 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">{insight.targetMarket ? `${insight.targetMarket} Market Trends` : 'Marketing Trends'}</CardTitle>
            <CardDescription>
              {formattedDate} · ID: {insight.insightId}
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDelete}
            disabled={deleteInsightMutation.isPending}
          >
            {deleteInsightMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-gray-700">
            {expanded ? insight.summary : truncateText(insight.summary, 200)}
          </p>
          {insight.summary.length > 200 && (
            <Button variant="link" className="p-0 h-auto" onClick={() => setExpanded(!expanded)}>
              {expanded ? 'Show less' : 'Read more'}
            </Button>
          )}
        </div>

        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {insight.keywords && insight.keywords.map((keyword, idx) => (
              <Badge key={idx} variant="secondary">{keyword}</Badge>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm mt-4">
            {insight.propertyType && (
              <div>
                <span className="font-semibold">Property Type:</span> {insight.propertyType}
              </div>
            )}
            {insight.priceRange && (
              <div>
                <span className="font-semibold">Price Range:</span> {insight.priceRange}
              </div>
            )}
            {insight.location && (
              <div>
                <span className="font-semibold">Location:</span> {insight.location}
              </div>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" /> Key Trends & Recommendations
        </h4>

        <div className="space-y-4">
          {insight.insights.map((trend, idx) => (
            <div key={idx} className="border rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <h5 className="font-semibold">{trend.trend}</h5>
                  <span className="text-base" title={getTrendEmoji(trend.category, trend.relevance).label}>
                    {getTrendEmoji(trend.category, trend.relevance).emoji}
                  </span>
                </div>
                <Badge className={getCategoryClass(trend.category)}>{trend.category}</Badge>
              </div>
              <p className="text-sm mb-2">{trend.description}</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-xs font-medium mr-2">Relevance:</span>
                  <div className="bg-gray-200 h-2 w-24 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full" 
                      style={{ width: `${(trend.relevance / 10) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs ml-2">{trend.relevance}/10</span>
                </div>
              </div>
              <div className="mt-3 text-sm">
                <span className="font-semibold">Recommendation:</span> {trend.recommendation}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function InsightSkeletonCard() {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
        
        <div className="flex gap-2 mt-4 mb-4">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        
        <Separator className="my-4" />
        
        <Skeleton className="h-5 w-40 mb-4" />
        
        <div className="space-y-4">
          <div className="border rounded-lg p-3">
            <Skeleton className="h-4 w-1/3 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="border rounded-lg p-3">
            <Skeleton className="h-4 w-1/3 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GenerateInsightDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [targetMarket, setTargetMarket] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [location, setLocation] = useState('');
  const [marketingChannel, setMarketingChannel] = useState('');
  const [keywords, setKeywords] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateInsightMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/marketing-insights/generate', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketing-insights'] });
      toast({
        title: 'Success',
        description: 'Marketing insight generated successfully',
      });
      setIsOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to generate insight: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  });

  const resetForm = () => {
    setTargetMarket('');
    setPropertyType('');
    setPriceRange('');
    setLocation('');
    setMarketingChannel('');
    setKeywords('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if at least one field is filled
    if (!targetMarket && !propertyType && !location) {
      toast({
        title: 'Validation Error',
        description: 'Please provide at least one of: Target Market, Property Type, or Location',
        variant: 'destructive',
      });
      return;
    }

    // Prepare keywords array
    const keywordsArray = keywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);
    
    generateInsightMutation.mutate({
      targetMarket: targetMarket || undefined,
      propertyType: propertyType || undefined,
      priceRange: priceRange || undefined,
      location: location || undefined,
      marketingChannel: marketingChannel || undefined,
      keywords: keywordsArray.length > 0 ? keywordsArray : undefined,
      createdBy: 1, // Hardcoded for now, would be the current user's ID
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <TrendingUp className="mr-2 h-4 w-4" /> Generate New Insight
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Marketing Insight</DialogTitle>
          <DialogDescription>
            Provide details about your target market and properties to generate AI-powered marketing insights.
          </DialogDescription>
        </DialogHeader>

        {/* Removed environment variable check as it's not accessible in client */}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetMarket">Target Market</Label>
                <Input
                  id="targetMarket"
                  placeholder="e.g., First-time homebuyers"
                  value={targetMarket}
                  onChange={(e) => setTargetMarket(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type</Label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Residential</SelectLabel>
                      <SelectItem value="Single-family homes">Single-family homes</SelectItem>
                      <SelectItem value="Condos">Condos</SelectItem>
                      <SelectItem value="Townhouses">Townhouses</SelectItem>
                      <SelectItem value="Luxury homes">Luxury homes</SelectItem>
                      <SelectItem value="Multi-family properties">Multi-family properties</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Commercial</SelectLabel>
                      <SelectItem value="Office spaces">Office spaces</SelectItem>
                      <SelectItem value="Retail properties">Retail properties</SelectItem>
                      <SelectItem value="Industrial properties">Industrial properties</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceRange">Price Range</Label>
                <Input
                  id="priceRange"
                  placeholder="e.g., $300K - $500K"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Bay Area, Downtown"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="marketingChannel">Marketing Channel (Optional)</Label>
              <Select value={marketingChannel} onValueChange={setMarketingChannel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select marketing channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Social media">Social Media</SelectItem>
                  <SelectItem value="Email marketing">Email Marketing</SelectItem>
                  <SelectItem value="Content marketing">Content Marketing</SelectItem>
                  <SelectItem value="Video marketing">Video Marketing</SelectItem>
                  <SelectItem value="Print advertising">Print Advertising</SelectItem>
                  <SelectItem value="SEO">Search Engine Optimization</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (comma-separated, optional)</Label>
              <Textarea
                id="keywords"
                placeholder="e.g., sustainable, family-friendly, investment"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={generateInsightMutation.isPending}
            >
              {generateInsightMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Insight'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function MarketingInsightsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState('all');
  
  const { data: insights, isLoading, error } = useQuery({
    queryKey: ['/api/marketing-insights'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const filteredInsights = () => {
    if (!insights) return [];
    
    let filtered = [...insights];
    
    // Filter by search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(insight => 
        insight.summary.toLowerCase().includes(lowerQuery) ||
        insight.targetMarket?.toLowerCase().includes(lowerQuery) ||
        insight.propertyType?.toLowerCase().includes(lowerQuery) ||
        insight.location?.toLowerCase().includes(lowerQuery) ||
        insight.keywords?.some(k => k.toLowerCase().includes(lowerQuery)) ||
        insight.insights.some(trend => 
          trend.trend.toLowerCase().includes(lowerQuery) ||
          trend.description.toLowerCase().includes(lowerQuery) ||
          trend.category.toLowerCase().includes(lowerQuery)
        )
      );
    }
    
    // Filter by tab
    if (currentTab === 'luxury') {
      filtered = filtered.filter(insight => 
        insight.propertyType?.toLowerCase().includes('luxury') ||
        insight.keywords?.some(k => k.toLowerCase().includes('luxury')) ||
        (insight.priceRange && parseInt(insight.priceRange.replace(/[^0-9]/g, '')) > 1000000)
      );
    } else if (currentTab === 'residential') {
      filtered = filtered.filter(insight => 
        insight.propertyType?.toLowerCase().includes('family') ||
        insight.propertyType?.toLowerCase().includes('condo') ||
        insight.propertyType?.toLowerCase().includes('town') ||
        insight.keywords?.some(k => k.toLowerCase().includes('residential'))
      );
    } else if (currentTab === 'commercial') {
      filtered = filtered.filter(insight => 
        insight.propertyType?.toLowerCase().includes('office') ||
        insight.propertyType?.toLowerCase().includes('retail') ||
        insight.propertyType?.toLowerCase().includes('industrial') ||
        insight.keywords?.some(k => k.toLowerCase().includes('commercial'))
      );
    }
    
    // Sort by creation date (newest first)
    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing Insights</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered marketing trend analysis and recommendations
          </p>
        </div>
        <GenerateInsightDialog />
      </div>
      
      <div className="bg-muted/50 p-3 rounded-lg mb-6">
        <h3 className="text-sm font-medium mb-2">Trend Mood Indicators:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-base">💻 😐</span>
            <span>Technology (Low Relevance)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base">📣 🙂</span>
            <span>Marketing Channel (Medium)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base">📊 😊</span>
            <span>Strategy (High Relevance)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base">📱 🔥</span>
            <span>Social Media (Very High)</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search insights..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="all" className="w-full" value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="luxury">Luxury</TabsTrigger>
            <TabsTrigger value="residential">Residential</TabsTrigger>
            <TabsTrigger value="commercial">Commercial</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {error ? (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load marketing insights. Please try again later.
          </AlertDescription>
        </Alert>
      ) : isLoading ? (
        <div>
          <InsightSkeletonCard />
          <InsightSkeletonCard />
        </div>
      ) : filteredInsights().length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No insights found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? "No insights match your search criteria." 
              : "There are no marketing insights available yet."}
          </p>
          <GenerateInsightDialog />
        </div>
      ) : (
        <ScrollArea className="pr-4">
          {filteredInsights().map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </ScrollArea>
      )}
    </div>
  );
}