import React, { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, EmailServiceStatus, EmailTemplate } from "@/lib/queryClient";
import { RiMailAddLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Mail, AlertTriangle, CheckCircle2, Settings } from "lucide-react";

export default function EmailTest() {
  const [, setLocation] = useLocation();
  const [formValues, setFormValues] = useState({
    to: "",
    from: "marketing@yourrealestatebusiness.com",
    templateId: "",
    variables: "{\"name\": \"John Doe\", \"propertyAddress\": \"123 Main St\"}"
  });
  
  // Optionally redirect to email settings if not configured
  const goToEmailSettings = () => {
    setLocation("/email-settings");
  };

  // Query to check email service status
  const emailStatusQuery = useQuery<EmailServiceStatus>({
    queryKey: ["/api/email/status"],
    refetchOnWindowFocus: false
  });

  // Query to get available email templates
  const templatesQuery = useQuery<EmailTemplate[]>({
    queryKey: ["/api/email-templates"],
    refetchOnWindowFocus: false
  });

  // Mutation for sending a template email
  const sendTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      return apiRequest("POST", `/api/email/send-template/${id}`, data);
    }
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleTemplateChange = (value: string) => {
    setFormValues(prev => ({ ...prev, templateId: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Parse the variables JSON string
      const variables = JSON.parse(formValues.variables);
      
      await sendTemplateMutation.mutateAsync({
        id: parseInt(formValues.templateId),
        data: {
          to: formValues.to,
          from: formValues.from,
          variables
        }
      });
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h1 className="text-3xl font-bold">Email Testing Center</h1>
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
            <Link href="/email-settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>
      
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
                <span>{emailStatusQuery.data?.message || "SendGrid API key is missing. Email sending will not work."}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-fit"
                  onClick={goToEmailSettings}
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
          <CardTitle>Send Test Email</CardTitle>
          <CardDescription>
            Select a template and send a test email
            {!emailStatusQuery.data?.configured && (
              <div className="mt-2">
                <span className="block text-amber-600 mb-2">
                  Note: Emails won't actually be sent until the SendGrid API key is configured
                </span>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={goToEmailSettings}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Email
                </Button>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="to" className="text-right">
                  To:
                </Label>
                <Input
                  id="to"
                  name="to"
                  value={formValues.to}
                  onChange={handleFormChange}
                  className="col-span-3"
                  placeholder="recipient@example.com"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="from" className="text-right">
                  From:
                </Label>
                <Input
                  id="from"
                  name="from"
                  value={formValues.from}
                  onChange={handleFormChange}
                  className="col-span-3"
                  placeholder="sender@yourcompany.com"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="template" className="text-right">
                  Template:
                </Label>
                <Select 
                  value={formValues.templateId} 
                  onValueChange={handleTemplateChange}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templatesQuery.isLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading templates...
                      </SelectItem>
                    ) : templatesQuery.isError ? (
                      <SelectItem value="error" disabled>
                        Error loading templates
                      </SelectItem>
                    ) : templatesQuery.data?.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        No templates available
                      </SelectItem>
                    ) : (
                      templatesQuery.data?.map((template: any) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name} ({template.category})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="variables" className="text-right pt-2">
                  Variables (JSON):
                </Label>
                <Textarea
                  id="variables"
                  name="variables"
                  value={formValues.variables}
                  onChange={handleFormChange}
                  className="col-span-3 min-h-[100px] font-mono text-sm"
                  placeholder='{"name": "John Doe", "propertyAddress": "123 Main St"}'
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={
                  sendTemplateMutation.isPending || 
                  !formValues.to || 
                  !formValues.from || 
                  !formValues.templateId
                }
              >
                {sendTemplateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Mail className="mr-2 h-4 w-4" />
                Send Test Email
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          {sendTemplateMutation.isError && (
            <Alert variant="destructive" className="w-full">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {(sendTemplateMutation.error as any)?.message || 
                "Failed to send email. Please check your inputs and try again."}
              </AlertDescription>
            </Alert>
          )}
          
          {sendTemplateMutation.isSuccess && (
            <Alert className="w-full bg-green-50 border-green-200 text-green-800">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                {emailStatusQuery.data?.configured
                  ? "Email sent successfully!"
                  : "Email would have been sent if SendGrid was configured."}
              </AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}