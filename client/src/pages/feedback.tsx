import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "../lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Loader2, Star, StarIcon } from "lucide-react";

// Types for our data
interface FeedbackItem {
  id: number;
  createdAt: string;
  updatedAt: string;
  campaignId: number;
  clientName: string;
  clientEmail: string;
  rating: string;
  feedbackText: string | null;
  category: string;
  status: string;
  reviewedBy: number | null;
  response: string | null;
}

interface Campaign {
  id: number;
  name: string;
}

interface FeedbackSummary {
  averageRating: number;
  totalCount: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  responseRate: number;
  recentFeedback: FeedbackItem[];
}

interface FeedbackMetric {
  id: number;
  campaignId: number;
  date: string;
  averageRating: string;
  totalFeedbackCount: number;
  positiveFeedbackCount: number;
  neutralFeedbackCount: number;
  negativeFeedbackCount: number;
  responseRate: string;
  createdAt: string;
}

interface ResponseTemplate {
  id: number;
  name: string;
  category: string;
  responseText: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

// Component for displaying star ratings
const StarRating = ({ rating }: { rating: string }) => {
  const numRating = parseInt(rating);
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <StarIcon 
          key={i} 
          className={`h-5 w-5 ${i < numRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
        />
      ))}
    </div>
  );
};

// Main Feedback Dashboard Component
export default function FeedbackDashboard() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [selectedTab, setSelectedTab] = useState<string>("overview");
  const [responseDialogOpen, setResponseDialogOpen] = useState<boolean>(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [responseText, setResponseText] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  // Fetch all campaigns
  const { data: campaigns } = useQuery({
    queryKey: ['/api/campaigns'],
    staleTime: 10000,
  });

  // Fetch all feedback or campaign-specific feedback
  const { 
    data: feedback, 
    isLoading: isFeedbackLoading 
  } = useQuery({
    queryKey: selectedCampaign === "all" 
      ? ['/api/feedback'] 
      : ['/api/campaigns', parseInt(selectedCampaign), 'feedback'],
    staleTime: 5000,
  });

  // Fetch feedback summary for selected campaign
  const { 
    data: feedbackSummary,
    isLoading: isSummaryLoading
  } = useQuery({
    queryKey: selectedCampaign === "all" 
      ? ['feedback-summary'] // This won't be used
      : ['/api/campaigns', parseInt(selectedCampaign), 'feedback/summary'],
    staleTime: 5000,
    enabled: selectedCampaign !== "all",
  });

  // Fetch feedback metrics for selected campaign
  const { 
    data: feedbackMetrics,
    isLoading: isMetricsLoading
  } = useQuery({
    queryKey: selectedCampaign === "all" 
      ? ['feedback-metrics'] // This won't be used
      : ['/api/campaigns', parseInt(selectedCampaign), 'feedback/metrics'],
    staleTime: 5000,
    enabled: selectedCampaign !== "all",
  });

  // Fetch response templates
  const { data: responseTemplates } = useQuery({
    queryKey: ['/api/feedback/templates'],
    staleTime: 10000,
  });

  // Mutation for responding to feedback
  const respondMutation = useMutation({
    mutationFn: ({ id, response }: { id: number; response: string }) => 
      apiRequest(`/api/feedback/${id}`, 'PATCH', { 
        status: 'responded', 
        response,
        reviewedBy: 1 // Hardcoded for simplicity, should be current user id
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
      if (selectedCampaign !== "all") {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/campaigns', parseInt(selectedCampaign), 'feedback'] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['/api/campaigns', parseInt(selectedCampaign), 'feedback/summary'] 
        });
      }
      toast({
        title: "Success",
        description: "Response sent successfully",
      });
      setResponseDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send response",
        variant: "destructive",
      });
    }
  });

  // Mutation for previewing a response template
  const previewTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest(`/api/feedback/templates/${id}/preview`, 'POST', data),
    onSuccess: (data) => {
      setResponseText(data.responseText);
    },
  });

  // Function to handle template selection
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId && selectedFeedback) {
      const templateData = {
        clientName: selectedFeedback.clientName,
        rating: selectedFeedback.rating,
        feedback: selectedFeedback.feedbackText || "your feedback",
        campaignName: campaigns?.find((c: Campaign) => c.id === selectedFeedback.campaignId)?.name || "our campaign"
      };
      
      previewTemplateMutation.mutate({ 
        id: parseInt(templateId), 
        data: templateData 
      });
    }
  };

  // Function to open response dialog
  const openResponseDialog = (item: FeedbackItem) => {
    setSelectedFeedback(item);
    setResponseText(item.response || "");
    setSelectedTemplate("");
    setResponseDialogOpen(true);
  };

  // Function to send a response
  const sendResponse = () => {
    if (!selectedFeedback || !responseText.trim()) return;
    
    respondMutation.mutate({
      id: selectedFeedback.id,
      response: responseText
    });
  };

  // Prepare chart data for metrics
  const prepareMetricsChartData = () => {
    if (!feedbackMetrics) return [];
    
    return feedbackMetrics.map((metric: FeedbackMetric) => ({
      date: format(new Date(metric.date), 'MMM dd'),
      averageRating: Number(metric.averageRating),
      totalFeedback: metric.totalFeedbackCount,
      responseRate: Number(metric.responseRate)
    }));
  };

  // Prepare sentiment pie chart data
  const prepareSentimentData = () => {
    if (!feedbackSummary) return [];
    
    return [
      { name: 'Positive', value: feedbackSummary.positiveCount, color: '#4ade80' },
      { name: 'Neutral', value: feedbackSummary.neutralCount, color: '#facc15' },
      { name: 'Negative', value: feedbackSummary.negativeCount, color: '#f87171' }
    ];
  };

  // Calculate feedback stats
  const feedbackStats = {
    total: feedback?.length || 0,
    pending: feedback?.filter((item: FeedbackItem) => item.status === 'pending').length || 0,
    responded: feedback?.filter((item: FeedbackItem) => item.status === 'responded').length || 0,
    avgRating: feedback?.length 
      ? (feedback.reduce((sum: number, item: FeedbackItem) => sum + parseInt(item.rating), 0) / feedback.length).toFixed(1)
      : 'N/A'
  };

  // Get badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending</Badge>;
      case 'reviewed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Reviewed</Badge>;
      case 'responded':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Responded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get badge color based on rating
  const getRatingBadge = (rating: string) => {
    const numRating = parseInt(rating);
    if (numRating >= 4) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{rating}/5</Badge>;
    } else if (numRating === 3) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{rating}/5</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{rating}/5</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Client Feedback Dashboard</h1>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-500">Campaign:</span>
          <Select 
            value={selectedCampaign} 
            onValueChange={setSelectedCampaign}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Campaign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              {campaigns?.map((campaign: Campaign) => (
                <SelectItem key={campaign.id} value={campaign.id.toString()}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-gray-500">Total Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{feedbackStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{feedbackStats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-gray-500">Responded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{feedbackStats.responded}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-gray-500">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              {feedbackStats.avgRating}
              {feedbackStats.avgRating !== 'N/A' && (
                <StarIcon className="h-6 w-6 text-yellow-400 fill-yellow-400" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="list">All Feedback</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {selectedCampaign === "all" ? (
            <div className="text-center py-10 text-gray-500">
              Select a specific campaign to view detailed feedback overview
            </div>
          ) : (
            <>
              {isSummaryLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : feedbackSummary ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Feedback Summary Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Feedback Summary</CardTitle>
                        <CardDescription>
                          Overall feedback metrics for this campaign
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Average Rating</span>
                            <div className="flex items-center">
                              <span className="text-xl font-bold mr-2">
                                {feedbackSummary.averageRating.toFixed(1)}
                              </span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <StarIcon 
                                    key={i} 
                                    className={`h-4 w-4 ${
                                      i < Math.round(feedbackSummary.averageRating) 
                                        ? "text-yellow-400 fill-yellow-400" 
                                        : "text-gray-300"
                                    }`} 
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Response Rate</span>
                            <span className="text-xl font-bold">
                              {feedbackSummary.responseRate.toFixed(0)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Total Feedback</span>
                            <span className="text-xl font-bold">
                              {feedbackSummary.totalCount}
                            </span>
                          </div>
                          
                          <Separator />
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-green-600">Positive Feedback</span>
                            <span className="text-xl font-bold text-green-600">
                              {feedbackSummary.positiveCount}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-yellow-600">Neutral Feedback</span>
                            <span className="text-xl font-bold text-yellow-600">
                              {feedbackSummary.neutralCount}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-red-600">Negative Feedback</span>
                            <span className="text-xl font-bold text-red-600">
                              {feedbackSummary.negativeCount}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Sentiment Distribution Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Sentiment Distribution</CardTitle>
                        <CardDescription>
                          Distribution of positive, neutral, and negative feedback
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={prepareSentimentData()}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => 
                                  `${name}: ${(percent * 100).toFixed(0)}%`
                                }
                              >
                                {prepareSentimentData().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Feedback */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Feedback</CardTitle>
                      <CardDescription>
                        Latest client feedback for this campaign
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {feedbackSummary.recentFeedback.length > 0 ? (
                          feedbackSummary.recentFeedback.map((item) => (
                            <div key={item.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div className="font-medium">{item.clientName}</div>
                                  <div className="text-sm text-gray-500">{item.clientEmail}</div>
                                </div>
                                <div className="flex gap-2">
                                  {getRatingBadge(item.rating)}
                                  {getStatusBadge(item.status)}
                                </div>
                              </div>
                              
                              <div className="mb-2">
                                <StarRating rating={item.rating} />
                              </div>
                              
                              {item.feedbackText && (
                                <div className="text-gray-700 mb-3 italic">
                                  "{item.feedbackText}"
                                </div>
                              )}
                              
                              {item.response && (
                                <div className="bg-gray-50 p-3 rounded-lg mt-2">
                                  <div className="text-sm font-medium mb-1">Our Response:</div>
                                  <div className="text-gray-700">{item.response}</div>
                                </div>
                              )}
                              
                              <div className="flex justify-between items-center mt-3">
                                <div className="text-xs text-gray-500">
                                  {format(new Date(item.createdAt), 'MMM dd, yyyy')}
                                </div>
                                
                                {item.status !== 'responded' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => openResponseDialog(item)}
                                  >
                                    Respond
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-10 text-gray-500">
                            No feedback received yet
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No feedback data available for this campaign
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* All Feedback Tab */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>All Feedback</CardTitle>
              <CardDescription>
                Complete list of client feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isFeedbackLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : feedback?.length > 0 ? (
                <div className="space-y-4">
                  {feedback.map((item: FeedbackItem) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{item.clientName}</div>
                          <div className="text-sm text-gray-500">{item.clientEmail}</div>
                        </div>
                        <div className="flex gap-2">
                          {getRatingBadge(item.rating)}
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <StarRating rating={item.rating} />
                      </div>
                      
                      {item.feedbackText && (
                        <div className="text-gray-700 mb-3 italic">
                          "{item.feedbackText}"
                        </div>
                      )}
                      
                      {item.response && (
                        <div className="bg-gray-50 p-3 rounded-lg mt-2">
                          <div className="text-sm font-medium mb-1">Our Response:</div>
                          <div className="text-gray-700">{item.response}</div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex gap-4">
                          <div className="text-xs text-gray-500">
                            {format(new Date(item.createdAt), 'MMM dd, yyyy')}
                          </div>
                          {selectedCampaign === "all" && campaigns && (
                            <div className="text-xs text-gray-500">
                              Campaign: {campaigns.find((c: Campaign) => c.id === item.campaignId)?.name}
                            </div>
                          )}
                        </div>
                        
                        {item.status !== 'responded' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openResponseDialog(item)}
                          >
                            Respond
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No feedback found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          {selectedCampaign === "all" ? (
            <div className="text-center py-10 text-gray-500">
              Select a specific campaign to view detailed feedback analytics
            </div>
          ) : (
            <>
              {isMetricsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : feedbackMetrics && feedbackMetrics.length > 0 ? (
                <div className="space-y-6">
                  {/* Average Rating Over Time */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Average Rating Over Time</CardTitle>
                      <CardDescription>
                        Trend of client feedback ratings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={prepareMetricsChartData()}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[0, 5]} />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="averageRating"
                              name="Average Rating"
                              stroke="#8884d8"
                              activeDot={{ r: 8 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Feedback Volume & Response Rate */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Feedback Volume & Response Rate</CardTitle>
                      <CardDescription>
                        Number of feedback received and response rate over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={prepareMetricsChartData()}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis yAxisId="left" />
                            <YAxis 
                              yAxisId="right" 
                              orientation="right" 
                              domain={[0, 100]}
                              tickFormatter={(value) => `${value}%`}
                            />
                            <Tooltip />
                            <Legend />
                            <Bar
                              yAxisId="left"
                              dataKey="totalFeedback"
                              name="Feedback Count"
                              fill="#82ca9d"
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="responseRate"
                              name="Response Rate"
                              stroke="#ff7300"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No metrics data available for this campaign
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      <AlertDialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <AlertDialogContent className="max-w-[500px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Respond to Client Feedback</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedFeedback && (
                <div className="space-y-2 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">From:</span>
                    <span>{selectedFeedback.clientName} ({selectedFeedback.clientEmail})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Rating:</span>
                    <StarRating rating={selectedFeedback.rating} />
                  </div>
                  {selectedFeedback.feedbackText && (
                    <div className="mt-2">
                      <span className="font-medium">Feedback:</span>
                      <div className="italic mt-1 p-2 bg-gray-50 rounded-md">
                        "{selectedFeedback.feedbackText}"
                      </div>
                    </div>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 mb-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">Your Response</h4>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Template:</span>
                <Select 
                  value={selectedTemplate} 
                  onValueChange={handleTemplateChange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {responseTemplates?.map((template: ResponseTemplate) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Textarea 
              value={responseText} 
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Write your response here..."
              rows={6}
              className="w-full"
            />
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={sendResponse}
              disabled={!responseText.trim() || respondMutation.isPending}
            >
              {respondMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                "Send Response"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}