import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest } from '@/lib/queryClient';
import { 
  AlertCircle, 
  ArrowLeft, 
  ExternalLink,
  Calendar, 
  TrendingUp, 
  Download,
  Share2
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

interface SharedResponse {
  sharedInsight: SharedInsight;
  insight: MarketingInsight;
  branding: UserBranding | null;
}

export default function SharedInsightPage() {
  const params = useParams();
  const shareCode = params.code;
  
  // Apply branding to the page if available
  const applyBrandingToPage = (branding: UserBranding) => {
    const root = document.documentElement;
    
    // Apply font family if specified
    if (branding.fontFamily) {
      root.style.setProperty('--font-sans', branding.fontFamily);
    }
    
    // Apply brand colors
    if (branding.primaryColor) {
      root.style.setProperty('--primary', branding.primaryColor);
      // Also apply primary color as theme color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', branding.primaryColor);
      }
    }
    
    // You could add more style customizations here
    return () => {
      // Cleanup function to reset styles when component unmounts
      root.style.removeProperty('--font-sans');
      root.style.removeProperty('--primary');
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#ffffff');
      }
    };
  };
  
  // Query for getting the shared insight data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['/api/shared-insights', shareCode],
    queryFn: () => 
      apiRequest(`/api/shared-insights/${shareCode}`)
        .then(res => res.json()),
  });
  
  // Apply branding effect when data is loaded
  useEffect(() => {
    if (data?.branding) {
      const cleanup = applyBrandingToPage(data.branding);
      return cleanup;
    }
  }, [data?.branding]);
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-12 w-full max-w-md" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }
  
  if (isError || !data) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error 
              ? error.message 
              : "This shared insight couldn't be found or may have expired."
            }
          </AlertDescription>
        </Alert>
        
        <div className="text-center mt-12">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }
  
  const { sharedInsight, insight, branding } = data as SharedResponse;
  
  // Check if insight has expired
  const isExpired = sharedInsight.expiresAt && new Date(sharedInsight.expiresAt) < new Date();
  
  if (isExpired || sharedInsight.status !== 'active') {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Expired Content</AlertTitle>
          <AlertDescription>
            This shared insight has expired or is no longer available.
          </AlertDescription>
        </Alert>
        
        <div className="text-center mt-12">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }
  
  // Parse JSON fields
  const parsedInsights = JSON.parse(insight.insights);
  const parsedRecommendations = JSON.parse(insight.recommendations);
  
  return (
    <div className={`min-h-screen ${branding ? 'bg-gray-50' : ''}`}>
      {/* Branded Header */}
      {branding && (
        <header className="bg-white shadow-sm py-4 mb-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center">
              {branding.logoUrl && (
                <img 
                  src={branding.logoUrl} 
                  alt={branding.companyName} 
                  className="h-10 mr-3 object-contain" 
                />
              )}
              <div>
                <h1 
                  className="text-xl font-bold" 
                  style={{ color: branding.primaryColor }}
                >
                  {branding.companyName}
                </h1>
                {branding.tagline && (
                  <p className="text-sm text-gray-600">{branding.tagline}</p>
                )}
              </div>
            </div>
            
            {branding.websiteUrl && (
              <a 
                href={branding.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm flex items-center hover:underline"
                style={{ color: branding.primaryColor }}
              >
                Visit our website
                <ExternalLink className="h-3.5 w-3.5 ml-1" />
              </a>
            )}
          </div>
        </header>
      )}
      
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Info bar with date */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              Shared on {new Date(sharedInsight.createdAt || Date.now()).toLocaleDateString()}
            </span>
          </div>
          
          <Badge variant="outline" className="text-xs">
            {insight.category}
          </Badge>
        </div>
        
        {/* Insight Title */}
        <h1 
          className="text-3xl font-bold mb-4"
          style={branding ? { color: branding.primaryColor } : {}}
        >
          {sharedInsight.title || insight.title}
        </h1>
        
        {/* Custom message if available */}
        {sharedInsight.customMessage && (
          <Card className="mb-8 bg-gray-50 border-gray-200">
            <CardContent className="pt-6 italic text-gray-700">
              {sharedInsight.customMessage}
            </CardContent>
          </Card>
        )}
        
        {/* Insight Summary Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <span>Market Overview</span>
              <span className="text-lg ml-2">{insight.trendEmoji}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{insight.summary}</p>
          </CardContent>
        </Card>
        
        {/* Key Insights and Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Key Insights */}
          <Card>
            <CardHeader>
              <CardTitle style={branding ? { color: branding.secondaryColor } : {}}>
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {parsedInsights.map((item: any, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="text-lg mr-2">{insight.trendEmoji}</div>
                    <div>
                      <p className="font-medium">{item.trend}</p>
                      <p className="text-sm text-gray-600">{item.category}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle style={branding ? { color: branding.secondaryColor } : {}}>
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {parsedRecommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="font-medium mr-2">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        
        {/* Relevance Indicator */}
        <Card className="mb-8">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Market Relevance Score
              </div>
              <div className="flex items-center">
                <div className="bg-gray-200 rounded-full h-2 w-48 mr-3">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ 
                      width: `${(insight.relevance / 10) * 100}%`,
                      backgroundColor: branding ? branding.primaryColor : 'var(--primary)' 
                    }}
                  />
                </div>
                <span className="font-medium">{insight.relevance}/10</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Footer with agent/company info when branding is enabled */}
        {branding && (
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="mb-4 md:mb-0">
                  <div 
                    className="mb-2"
                    dangerouslySetInnerHTML={{ __html: branding.emailSignature }} 
                  />
                  
                  {Object.keys(branding.socialLinks || {}).length > 0 && (
                    <div className="flex gap-3 mt-3">
                      {Object.entries(branding.socialLinks).map(([platform, url]) => (
                        url && (
                          <a 
                            key={platform} 
                            href={url} 
                            className="text-gray-500 hover:text-gray-700 text-sm"
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
                
                <div className="flex gap-2">
                  {branding.websiteUrl && (
                    <a 
                      href={branding.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        Visit Website
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}