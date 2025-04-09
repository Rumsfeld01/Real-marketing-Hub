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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Switch } from '@/components/ui/switch';
import { 
  AlertCircle, 
  Share2, 
  Upload, 
  Copy,
  Link, 
  Mail, 
  Palette, 
  CheckCircle2, 
  Loader2,
  ExternalLink,
  Edit,
  Eye,
  Trash2,
  LayoutTemplate
} from 'lucide-react';

// Type Definitions
interface UserBranding {
  id: number;
  userId: number;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  companyName: string;
  tagline: string;
  websiteUrl: string;
  emailSignature: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    [key: string]: string | undefined;
  };
}

interface MarketingInsight {
  id: number;
  title: string;
  category: string;
  summary: string;
  insights: string;
  recommendations: string;
  relevance: number;
  createdAt: string;
  createdBy: number;
  trendDirection: string;
  trendEmoji: string;
}

interface SharedInsight {
  id: number;
  insightId: number;
  userId: number;
  shareCode: string;
  title: string;
  customMessage: string;
  useBranding: boolean;
  shareUrl: string;
  recipientEmails: string[];
  status: 'active' | 'expired' | 'draft';
  views: number;
  lastViewed?: string;
  createdAt?: string;
  expiresAt?: string;
}

// A preview component to show how the shared insight will look
function SharedInsightPreview({ 
  branding, 
  insight, 
  customMessage 
}: { 
  branding: UserBranding | null;
  insight: MarketingInsight | null;
  customMessage: string;
}) {
  if (!insight) return null;
  
  return (
    <div className={`p-6 rounded-xl border ${branding ? 'bg-white' : 'bg-gray-50'}`}>
      {branding && (
        <div className="mb-4 pb-4 border-b flex items-center justify-between">
          <div>
            {branding.logoUrl && (
              <img 
                src={branding.logoUrl} 
                alt={branding.companyName} 
                className="h-12 mb-2 object-contain" 
              />
            )}
            <h3 className="text-xl font-bold" style={{ color: branding.primaryColor }}>
              {branding.companyName}
            </h3>
            <p className="text-sm text-gray-600">{branding.tagline}</p>
          </div>
        </div>
      )}
      
      <h2 className={`text-2xl font-bold mb-3 ${branding ? '' : 'text-primary'}`} 
        style={branding ? { color: branding.primaryColor } : {}}>
        {insight.title}
      </h2>
      
      {customMessage && (
        <div className="bg-gray-50 p-3 rounded-md mb-4 italic text-gray-700">
          {customMessage}
        </div>
      )}
      
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs">
            {insight.category}
          </Badge>
          <span className="text-lg">{insight.trendEmoji}</span>
        </div>
        <p className="text-gray-700 mt-2">{insight.summary}</p>
      </div>
      
      <div className="mb-4">
        <h3 className={`text-lg font-semibold mb-2 ${branding ? '' : 'text-primary'}`}
          style={branding ? { color: branding.secondaryColor } : {}}>
          Key Insights
        </h3>
        <div className="bg-gray-50 rounded p-3">
          {JSON.parse(insight.insights).map((item: any, i: number) => (
            <div key={i} className="mb-2 last:mb-0">
              • {item.trend}: {item.category}
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className={`text-lg font-semibold mb-2 ${branding ? '' : 'text-primary'}`}
          style={branding ? { color: branding.secondaryColor } : {}}>
          Recommendations
        </h3>
        <div className="bg-gray-50 rounded p-3">
          {JSON.parse(insight.recommendations).map((rec: string, i: number) => (
            <div key={i} className="mb-2 last:mb-0">• {rec}</div>
          ))}
        </div>
      </div>
      
      {branding && (
        <div className="mt-6 pt-4 border-t">
          <div dangerouslySetInnerHTML={{ __html: branding.emailSignature }} />
          
          {Object.keys(branding.socialLinks).length > 0 && (
            <div className="mt-3 flex gap-3">
              {Object.entries(branding.socialLinks).map(([platform, url]) => (
                url && (
                  <a 
                    key={platform} 
                    href={url} 
                    className="text-gray-500 hover:text-gray-700"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </a>
                )
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Component for managing branding
function BrandingManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const currentUserId = 1; // Normally would come from auth context
  
  // State for edit form
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserBranding>>({
    companyName: '',
    tagline: '',
    logoUrl: '',
    primaryColor: '#4a90e2',
    secondaryColor: '#5cb85c',
    fontFamily: 'Inter, sans-serif',
    websiteUrl: '',
    emailSignature: '',
    socialLinks: {}
  });
  
  // Fetch user branding
  const { 
    data: branding, 
    isLoading, 
    isError 
  } = useQuery({ 
    queryKey: ['/api/user-branding', currentUserId],
    queryFn: () => 
      apiRequest(`/api/user-branding/${currentUserId}`)
        .then(res => res.json())
        .catch(error => {
          // If 404, it's acceptable - the user just doesn't have branding set up yet
          if (error.status === 404) return null;
          throw error;
        })
  });
  
  // Create branding mutation
  const createBranding = useMutation({
    mutationFn: (data: any) => 
      apiRequest('/api/user-branding', {
        method: 'POST',
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-branding', currentUserId] });
      setIsEditing(false);
      toast({
        title: "Branding created",
        description: "Your branding settings have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating branding",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Update branding mutation
  const updateBranding = useMutation({
    mutationFn: (data: any) => 
      apiRequest(`/api/user-branding/${currentUserId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-branding', currentUserId] });
      setIsEditing(false);
      toast({
        title: "Branding updated",
        description: "Your branding settings have been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating branding",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      userId: currentUserId,
    };
    
    if (branding) {
      updateBranding.mutate(payload);
    } else {
      createBranding.mutate(payload);
    }
  };
  
  // Start editing with current values
  const handleEdit = () => {
    if (branding) {
      setFormData({
        companyName: branding.companyName,
        tagline: branding.tagline,
        logoUrl: branding.logoUrl,
        primaryColor: branding.primaryColor,
        secondaryColor: branding.secondaryColor,
        fontFamily: branding.fontFamily,
        websiteUrl: branding.websiteUrl,
        emailSignature: branding.emailSignature,
        socialLinks: branding.socialLinks
      });
    }
    setIsEditing(true);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load branding information. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <span>Your Branding</span>
          </div>
          {branding && !isEditing && (
            <Button onClick={handleEdit} variant="ghost" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Customize how your shared insights appear to clients
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {branding && !isEditing ? (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              {branding.logoUrl && (
                <img 
                  src={branding.logoUrl}
                  alt={branding.companyName}
                  className="w-24 h-24 object-contain border rounded-md p-2"
                />
              )}
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{branding.companyName}</h3>
                <p className="text-gray-500">{branding.tagline}</p>
                
                {branding.websiteUrl && (
                  <a 
                    href={branding.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary inline-flex items-center mt-2 text-sm hover:underline"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {branding.websiteUrl}
                  </a>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-2">Colors</h4>
              <div className="flex gap-3">
                <div className="flex items-center">
                  <div 
                    className="w-6 h-6 rounded-full mr-2" 
                    style={{ backgroundColor: branding.primaryColor }}
                  />
                  <span className="text-sm">{branding.primaryColor}</span>
                </div>
                <div className="flex items-center">
                  <div 
                    className="w-6 h-6 rounded-full mr-2" 
                    style={{ backgroundColor: branding.secondaryColor }}
                  />
                  <span className="text-sm">{branding.secondaryColor}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-2">Font</h4>
              <p className="text-sm">{branding.fontFamily}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-2">Email Signature</h4>
              <div 
                className="p-3 bg-gray-50 rounded-md border text-sm" 
                dangerouslySetInnerHTML={{ __html: branding.emailSignature }}
              />
            </div>
            
            {Object.keys(branding.socialLinks).length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Social Links</h4>
                <div className="space-y-1 text-sm">
                  {Object.entries(branding.socialLinks).map(([platform, url]) => (
                    url && (
                      <div key={platform} className="flex items-center">
                        <span className="capitalize mr-2">{platform}:</span>
                        <a 
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate"
                        >
                          {url}
                        </a>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName || ''}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Your Company"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={formData.tagline || ''}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Your trusted real estate partner"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                value={formData.logoUrl || ''}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center">
                  <input
                    type="color"
                    id="primaryColor"
                    value={formData.primaryColor || '#4a90e2'}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-10 h-10 p-1 rounded mr-2 border"
                  />
                  <Input
                    value={formData.primaryColor || '#4a90e2'}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    placeholder="#000000"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex items-center">
                  <input
                    type="color"
                    id="secondaryColor"
                    value={formData.secondaryColor || '#5cb85c'}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="w-10 h-10 p-1 rounded mr-2 border"
                  />
                  <Input
                    value={formData.secondaryColor || '#5cb85c'}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fontFamily">Font Family</Label>
              <Input
                id="fontFamily"
                value={formData.fontFamily || 'Inter, sans-serif'}
                onChange={(e) => setFormData({ ...formData, fontFamily: e.target.value })}
                placeholder="Arial, sans-serif"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                value={formData.websiteUrl || ''}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                placeholder="https://yourwebsite.com"
                type="url"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emailSignature">Email Signature (HTML)</Label>
              <Textarea
                id="emailSignature"
                value={formData.emailSignature || ''}
                onChange={(e) => setFormData({ ...formData, emailSignature: e.target.value })}
                placeholder="<div>Your Name<br>Your Title<br>Your Phone</div>"
                rows={4}
              />
            </div>
            
            <div className="space-y-3">
              <Label>Social Media Links</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook" className="text-xs">Facebook</Label>
                  <Input
                    id="facebook"
                    value={formData.socialLinks?.facebook || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      socialLinks: { 
                        ...formData.socialLinks, 
                        facebook: e.target.value 
                      } 
                    })}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="text-xs">Twitter</Label>
                  <Input
                    id="twitter"
                    value={formData.socialLinks?.twitter || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      socialLinks: { 
                        ...formData.socialLinks, 
                        twitter: e.target.value 
                      } 
                    })}
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="text-xs">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.socialLinks?.instagram || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      socialLinks: { 
                        ...formData.socialLinks, 
                        instagram: e.target.value 
                      } 
                    })}
                    placeholder="https://instagram.com/yourhandle"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="text-xs">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.socialLinks?.linkedin || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      socialLinks: { 
                        ...formData.socialLinks, 
                        linkedin: e.target.value 
                      } 
                    })}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              {isEditing && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={createBranding.isPending || updateBranding.isPending}
              >
                {(createBranding.isPending || updateBranding.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {branding ? 'Update Branding' : 'Save Branding'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

// Component for Shared Insights Management
function SharedInsightsManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const currentUserId = 1; // Normally would come from auth context
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<MarketingInsight | null>(null);
  
  // Fetch analytics data
  const { data: analyticsData, isLoading: loadingAnalytics } = useQuery({
    queryKey: ['/api/users', currentUserId, 'shared-insights/analytics'],
    queryFn: () =>
      apiRequest(`/api/users/${currentUserId}/shared-insights/analytics`)
        .then(res => res.json()),
  });
  
  // Form state for creating a shared insight
  const [shareForm, setShareForm] = useState({
    title: '',
    customMessage: '',
    useBranding: true,
    recipientEmails: '',
  });
  
  // Fetch user's shared insights
  const { 
    data: sharedInsights, 
    isLoading: loadingShared,
    isError: errorShared
  } = useQuery({
    queryKey: ['/api/users', currentUserId, 'shared-insights'],
    queryFn: () => 
      apiRequest(`/api/users/${currentUserId}/shared-insights`)
        .then(res => res.json())
  });
  
  // Fetch insights for sharing
  const { 
    data: insights, 
    isLoading: loadingInsights, 
    isError: errorInsights 
  } = useQuery({
    queryKey: ['/api/marketing-insights'],
    queryFn: () => apiRequest('/api/marketing-insights').then(res => res.json())
  });
  
  // Fetch user branding
  const { data: branding } = useQuery({
    queryKey: ['/api/user-branding', currentUserId],
    queryFn: () => 
      apiRequest(`/api/user-branding/${currentUserId}`)
        .then(res => res.json())
        .catch(() => null) // We don't want this to fail if branding doesn't exist
  });
  
  // Create shared insight mutation
  const createSharedInsight = useMutation({
    mutationFn: (data: any) => 
      apiRequest('/api/shared-insights', {
        method: 'POST',
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/users', currentUserId, 'shared-insights'] 
      });
      setShareDialogOpen(false);
      
      // Reset form
      setShareForm({
        title: '',
        customMessage: '',
        useBranding: true,
        recipientEmails: '',
      });
      setSelectedInsight(null);
      
      toast({
        title: "Insight shared successfully",
        description: 
          data.shareUrl 
            ? `Share URL: ${data.shareUrl}`
            : "Your insight has been shared",
      });
    },
    onError: (error) => {
      toast({
        title: "Error sharing insight",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  const handleOpenShareDialog = (insight: MarketingInsight) => {
    setSelectedInsight(insight);
    setShareForm({
      ...shareForm,
      title: `${insight.title} - Shared by ${branding?.companyName || 'Me'}`
    });
    setShareDialogOpen(true);
  };
  
  const handleShareInsight = () => {
    if (!selectedInsight) return;
    
    // Process recipient emails
    const recipientEmails = shareForm.recipientEmails
      ? shareForm.recipientEmails.split(',').map(email => email.trim())
      : [];
    
    const payload = {
      insightId: selectedInsight.id,
      userId: currentUserId,
      title: shareForm.title,
      customMessage: shareForm.customMessage,
      useBranding: shareForm.useBranding,
      recipientEmails,
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    };
    
    createSharedInsight.mutate(payload);
  };
  
  const copyShareLink = (shareCode: string) => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/insights/shared/${shareCode}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: "Link copied",
        description: "The share link has been copied to your clipboard",
      });
    }).catch(() => {
      toast({
        title: "Copy failed",
        description: "Could not copy the link. Please try again.",
        variant: "destructive",
      });
    });
  };
  
  // Render loading states
  if (loadingInsights || loadingShared) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  
  // Render error states
  if (errorInsights || errorShared) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load insights or shared data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            <span>Share Marketing Insights</span>
          </CardTitle>
          <CardDescription>
            Share valuable market trend insights with your clients, branded with your company information
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Analytics Overview */}
          {analyticsData && !loadingAnalytics && (
            <div className="mb-6 bg-gray-50 rounded-lg p-4 border">
              <h3 className="text-lg font-semibold mb-3">Insights Sharing Analytics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-3 rounded-md border shadow-sm">
                  <div className="text-gray-500 text-sm">Total Shared</div>
                  <div className="text-2xl font-bold">{analyticsData.totalShared}</div>
                </div>
                <div className="bg-white p-3 rounded-md border shadow-sm">
                  <div className="text-gray-500 text-sm">Total Views</div>
                  <div className="text-2xl font-bold">{analyticsData.totalViews}</div>
                </div>
                <div className="bg-white p-3 rounded-md border shadow-sm">
                  <div className="text-gray-500 text-sm">Active Shares</div>
                  <div className="text-2xl font-bold">{analyticsData.activeCount}</div>
                </div>
              </div>
              
              {analyticsData.mostViewedInsight && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Most Viewed Insight</h4>
                  <div className="bg-white p-3 rounded-md border shadow-sm">
                    <div className="flex justify-between">
                      <div className="font-medium">{analyticsData.mostViewedInsight.title}</div>
                      <div className="flex items-center text-gray-600">
                        <Eye className="h-4 w-4 mr-1" />
                        <span>{analyticsData.mostViewedInsight.views} views</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Shared on {new Date(analyticsData.mostViewedInsight.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
              
              {analyticsData.recentlyViewed && analyticsData.recentlyViewed.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Recently Viewed Insights</h4>
                  <div className="bg-white rounded-md border shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-2 px-3 text-left">Title</th>
                          <th className="py-2 px-3 text-right">Views</th>
                          <th className="py-2 px-3 text-right">Last Viewed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.recentlyViewed.map((insight) => (
                          <tr key={insight.id} className="border-t">
                            <td className="py-2 px-3">{insight.title}</td>
                            <td className="py-2 px-3 text-right">{insight.views}</td>
                            <td className="py-2 px-3 text-right">
                              {insight.lastViewed ? 
                                new Date(insight.lastViewed).toLocaleDateString() : 
                                "Never"
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Available Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights && insights.length > 0 ? (
                insights.map((insight: MarketingInsight) => (
                  <Card key={insight.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-md">
                          {insight.title}
                        </CardTitle>
                        <Badge variant="outline">{insight.category}</Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="py-2">
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {insight.summary}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <span>{insight.trendEmoji}</span>
                        <span>Relevance: {insight.relevance}/10</span>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="bg-gray-50 flex justify-end pt-3 pb-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenShareDialog(insight)}
                      >
                        <Share2 className="h-3.5 w-3.5 mr-1" />
                        Share
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 p-8 text-center text-gray-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No insights available to share.</p>
                  <p className="text-sm mt-1">
                    Visit the Marketing Insights page to generate new insights.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Your Shared Insights</h3>
            {sharedInsights && sharedInsights.length > 0 ? (
              <div className="space-y-4">
                {sharedInsights.map((shared: SharedInsight) => (
                  <Card key={shared.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-md">{shared.title}</CardTitle>
                        <Badge 
                          variant={shared.status === 'active' ? 'default' : 'secondary'}
                        >
                          {shared.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        Shared on {new Date(shared.createdAt || Date.now()).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="py-0">
                      {shared.customMessage && (
                        <div className="bg-gray-50 p-2 rounded-md text-sm mb-3">
                          <span className="font-medium text-xs block text-gray-600 mb-1">
                            Message to recipients:
                          </span>
                          {shared.customMessage}
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2 items-center text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Link className="h-3.5 w-3.5" />
                          <span>Code: {shared.shareCode}</span>
                        </div>
                        
                        {shared.useBranding && (
                          <Badge variant="outline" className="text-xs">
                            Branded
                          </Badge>
                        )}
                        
                        {shared.recipientEmails && shared.recipientEmails.length > 0 && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Mail className="h-3.5 w-3.5" />
                            <span>{shared.recipientEmails.length} recipients</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1 text-gray-600">
                          <Eye className="h-3.5 w-3.5" />
                          <span>{shared.views} views</span>
                          {shared.lastViewed && (
                            <span className="text-xs text-gray-500">
                              · last viewed {new Date(shared.lastViewed).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="bg-gray-50 flex justify-between pt-3 pb-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyShareLink(shared.shareCode)}
                      >
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        Copy Link
                      </Button>
                      
                      <a 
                        href={`/insights/shared/${shared.shareCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-3.5 w-3.5 mr-1" />
                          View
                        </Button>
                      </a>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 border rounded-lg">
                <Share2 className="h-8 w-8 mx-auto mb-2" />
                <p>You haven't shared any insights yet.</p>
                <p className="text-sm mt-1">
                  Share valuable market trends with your clients to keep them informed.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Share Marketing Insight</DialogTitle>
            <DialogDescription>
              Customize how this insight will be shared with your clients
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shareTitle">Title</Label>
                <Input
                  id="shareTitle"
                  value={shareForm.title}
                  onChange={(e) => setShareForm({ ...shareForm, title: e.target.value })}
                  placeholder="Market Analysis - Q1 2023"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customMessage">Custom Message (optional)</Label>
                <Textarea
                  id="customMessage"
                  value={shareForm.customMessage}
                  onChange={(e) => setShareForm({ ...shareForm, customMessage: e.target.value })}
                  placeholder="I thought you might find this market analysis interesting..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipientEmails">Recipient Emails (comma separated)</Label>
                <Textarea
                  id="recipientEmails"
                  value={shareForm.recipientEmails}
                  onChange={(e) => setShareForm({ ...shareForm, recipientEmails: e.target.value })}
                  placeholder="client1@example.com, client2@example.com"
                  rows={2}
                />
                <p className="text-xs text-gray-500">
                  Leave blank to generate a share link without sending emails
                </p>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="use-branding"
                  checked={shareForm.useBranding}
                  onCheckedChange={(checked) => setShareForm({ ...shareForm, useBranding: checked })}
                />
                <Label htmlFor="use-branding">
                  Apply your branding
                </Label>
              </div>
              
              {shareForm.useBranding && !branding && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No branding configured</AlertTitle>
                  <AlertDescription>
                    You don't have any branding set up yet. The insight will be shared without branding.
                    <Button
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => setShareDialogOpen(false)}
                    >
                      Set up branding first
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-sm font-medium mb-3">Preview</h3>
              <div className="max-h-[400px] overflow-y-auto">
                <SharedInsightPreview
                  branding={shareForm.useBranding ? branding : null}
                  insight={selectedInsight}
                  customMessage={shareForm.customMessage}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setShareDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleShareInsight}
              disabled={createSharedInsight.isPending || !selectedInsight}
            >
              {createSharedInsight.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function BrandingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          Branding & Insight Sharing
        </h1>
        <p className="text-gray-500 mb-6">
          Customize your branding and share valuable market insights with your clients
        </p>
      </div>
      
      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4" />
            <span>Branding</span>
          </TabsTrigger>
          <TabsTrigger value="sharing" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            <span>Insight Sharing</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="branding" className="py-4">
          <BrandingManager />
        </TabsContent>
        
        <TabsContent value="sharing" className="py-4">
          <SharedInsightsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}