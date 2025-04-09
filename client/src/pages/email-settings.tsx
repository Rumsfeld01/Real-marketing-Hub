import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, EmailServiceStatus, ApiKeyUpdateResponse } from "@/lib/queryClient";
import { RiMailLine, RiMailAddLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Settings, 
  HelpCircle,
  ExternalLink 
} from "lucide-react";

export default function EmailSettings() {
  const queryClient = useQueryClient();
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);
  
  // Query to check email service status
  const emailStatusQuery = useQuery<EmailServiceStatus>({
    queryKey: ["/api/email/status"],
    refetchOnWindowFocus: false
  });
  
  // Show API key dialog automatically if not configured
  useEffect(() => {
    if (emailStatusQuery.data && !emailStatusQuery.data.configured) {
      setShowApiKeyPrompt(true);
    }
  }, [emailStatusQuery.data]);

  // Mutation for updating SendGrid API key
  const updateApiKeyMutation = useMutation<Response, Error, string, unknown>({
    mutationFn: async (newApiKey: string) => {
      const response = await apiRequest("POST", "/api/email/config", { apiKey: newApiKey });
      return response;
    },
    onSuccess: async (response) => {
      // Invalidate the email status query to reflect changes
      queryClient.invalidateQueries({ queryKey: ["/api/email/status"] });
      setApiKey(""); // Clear the input field
      
      // Extract the response data
      const data: ApiKeyUpdateResponse = await response.json();
      console.log('API key update success:', data.message);
    }
  });

  const handleUpdateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) return;
    
    await updateApiKeyMutation.mutateAsync(apiKey);
  };

  // Handle dialog submission
  const handleApiKeyPromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) return;
    
    try {
      await updateApiKeyMutation.mutateAsync(apiKey);
      setShowApiKeyPrompt(false);
    } catch (error) {
      console.error('Failed to update API key:', error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h1 className="text-3xl font-bold">Email Configuration</h1>
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href="/email-templates">
              <RiMailAddLine className="mr-2 h-4 w-4" />
              Templates
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href="/email-test">
              <RiMailLine className="mr-2 h-4 w-4" />
              Test Email
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Auto API Key Dialog */}
      <Dialog open={showApiKeyPrompt} onOpenChange={setShowApiKeyPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Service Configuration Required</DialogTitle>
            <DialogDescription>
              The email service needs to be configured with a SendGrid API key to enable email sending in CampaignPro.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApiKeyPromptSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="promptApiKey">
                  SendGrid API Key
                </Label>
                <Input
                  id="promptApiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="SG.xxxxxxxx"
                  type="password"
                  required
                />
                <p className="text-sm text-gray-500">
                  Your API key should start with "SG." and be kept secret.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-blue-800 text-sm">
                <HelpCircle className="h-4 w-4 inline mr-2" />
                <span>Don't have a SendGrid API key? Click the "Help" button below for instructions.</span>
              </div>
            </div>
            <DialogFooter className="flex justify-between items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" type="button">
                    <HelpCircle className="h-4 w-4 mr-1" />
                    Help
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>How to Get a SendGrid API Key</DialogTitle>
                    <DialogDescription>
                      Follow these steps to create a SendGrid API key for your account
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <ol className="space-y-3 list-decimal list-inside">
                      <li>Sign up for a <a href="https://signup.sendgrid.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center">SendGrid account <ExternalLink className="h-3 w-3 ml-1" /></a></li>
                      <li>After signing in, go to Settings &gt; API Keys</li>
                      <li>Click "Create API Key" button</li>
                      <li>Give your API key a name (e.g., "CampaignPro")</li>
                      <li>Select "Full Access" or "Restricted Access" (for email sending, you need at least Mail Send permissions)</li>
                      <li>Click "Create & View"</li>
                      <li>Copy the displayed API key (it starts with "SG.")</li>
                      <li>Paste it in the field above and click "Update"</li>
                    </ol>
                  </div>
                </DialogContent>
              </Dialog>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setShowApiKeyPrompt(false)}
                >
                  Skip for now
                </Button>
                <Button 
                  type="submit"
                  disabled={updateApiKeyMutation.isPending || !apiKey}
                >
                  {updateApiKeyMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save API Key
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Email Service Status</CardTitle>
          <CardDescription>Check if the email service is properly configured</CardDescription>
        </CardHeader>
        <CardContent>
          {emailStatusQuery.isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Checking email service status...</span>
            </div>
          ) : emailStatusQuery.isError ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Unable to check email service status. Please try again later.
              </AlertDescription>
            </Alert>
          ) : emailStatusQuery.data?.configured ? (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Email Service Ready</AlertTitle>
              <AlertDescription>
                {emailStatusQuery.data.message}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-amber-50 border-amber-200 text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Email Service Not Configured</AlertTitle>
              <AlertDescription className="flex flex-col space-y-3">
                <span>{emailStatusQuery.data?.message || "SendGrid API key is missing or invalid. Email sending will not work."}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-fit"
                  onClick={() => setShowApiKeyPrompt(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configure API Key
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Update SendGrid API Key</CardTitle>
          <CardDescription>
            Configure your SendGrid API key to enable email sending
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateApiKey} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="apiKey">
                  SendGrid API Key
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1"
                    placeholder="SG.xxxxxxxx"
                    type="password"
                    required
                  />
                  <Button 
                    type="submit" 
                    disabled={updateApiKeyMutation.isPending || !apiKey}
                  >
                    {updateApiKeyMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <Settings className="mr-2 h-4 w-4" />
                    Update
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                <div>
                  <p>Your API key should start with "SG." and be kept secret.</p>
                  <p className="mt-1">You can obtain an API key from your SendGrid account dashboard.</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <HelpCircle className="h-4 w-4 mr-1" />
                      Help
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>How to Get a SendGrid API Key</DialogTitle>
                      <DialogDescription>
                        Follow these steps to create a SendGrid API key for your account
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <ol className="space-y-3 list-decimal list-inside">
                        <li>Sign up for a <a href="https://signup.sendgrid.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center">SendGrid account <ExternalLink className="h-3 w-3 ml-1" /></a></li>
                        <li>After signing in, go to Settings &gt; API Keys</li>
                        <li>Click "Create API Key" button</li>
                        <li>Give your API key a name (e.g., "CampaignPro")</li>
                        <li>Select "Full Access" or "Restricted Access" (for email sending, you need at least Mail Send permissions)</li>
                        <li>Click "Create & View"</li>
                        <li>Copy the displayed API key (it starts with "SG.")</li>
                        <li>Paste it in the field above and click "Update"</li>
                      </ol>
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm">
                        <AlertTriangle className="h-4 w-4 inline mr-2" />
                        <span className="font-medium">Important:</span> The API key will only be displayed once. If you lose it, you'll need to create a new one.
                      </div>
                    </div>
                    <DialogFooter>
                      <a 
                        href="https://docs.sendgrid.com/ui/account-and-settings/api-keys" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center"
                      >
                        <Button variant="outline">
                          Visit SendGrid Documentation
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </Button>
                      </a>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          {updateApiKeyMutation.isError && (
            <Alert variant="destructive" className="w-full">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {(updateApiKeyMutation.error as any)?.message || 
                "Failed to update API key. Please try again."}
              </AlertDescription>
            </Alert>
          )}
          
          {updateApiKeyMutation.isSuccess && (
            <Alert className="w-full bg-green-50 border-green-200 text-green-800">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                SendGrid API key has been updated successfully.
              </AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}