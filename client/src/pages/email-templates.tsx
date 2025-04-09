import React, { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { RiMailLine, RiMailSettingsLine } from "react-icons/ri";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Mail,
  Filter,
  Copy,
} from "lucide-react";

// Type for the email template
interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string | null;
  category: string;
  variables: string[];
  createdBy: number;
  campaignId: number | null;
  createdAt: string;
  updatedAt: string;
}

// Type for the preview response
interface TemplatePreview {
  subject: string;
  htmlContent: string;
  textContent: string | null;
}

// Categories for email templates
const templateCategories = [
  "marketing",
  "notification",
  "follow-up",
  "open-house",
  "listing",
  "newsletter",
  "welcome",
  "other",
];

export default function EmailTemplates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [showHtmlPreview, setShowHtmlPreview] = useState(true);
  const [previewVariables, setPreviewVariables] = useState("{}");
  const [previewResult, setPreviewResult] = useState<TemplatePreview | null>(null);

  // Form state for create/edit
  const [formValues, setFormValues] = useState({
    name: "",
    subject: "",
    htmlContent: "",
    textContent: "",
    category: "marketing",
    variables: "",
    campaignId: null as number | null,
  });

  // Query to get all templates
  const templatesQuery = useQuery<EmailTemplate[]>({
    queryKey: ["/api/email-templates"],
  });

  // Query to get all campaigns (for associating templates)
  const campaignsQuery = useQuery({
    queryKey: ["/api/campaigns"],
  });

  // Mutation to create a new template
  const createTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/email-templates", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      toast({
        title: "Success",
        description: "Email template created successfully",
      });
      resetForm();
      setIsCreating(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create template",
        variant: "destructive",
      });
    },
  });

  // Mutation to update a template
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest("PATCH", `/api/email-templates/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      toast({
        title: "Success",
        description: "Email template updated successfully",
      });
      resetForm();
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update template",
        variant: "destructive",
      });
    },
  });

  // Mutation to delete a template
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/email-templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      toast({
        title: "Success",
        description: "Email template deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete template",
        variant: "destructive",
      });
    },
  });

  // Mutation to preview a template
  const previewTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest("POST", `/api/email-templates/${id}/preview`, data);
    },
    onSuccess: (data: TemplatePreview) => {
      setPreviewResult(data);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate preview",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormValues({
      name: "",
      subject: "",
      htmlContent: "",
      textContent: "",
      category: "marketing",
      variables: "",
      campaignId: null,
    });
    setSelectedTemplate(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormValues((prev) => ({ ...prev, category: value }));
  };

  const handleCampaignChange = (value: string) => {
    setFormValues((prev) => ({
      ...prev,
      campaignId: value === "none" ? null : parseInt(value),
    }));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Parse variables as JSON array
    let parsedVariables;
    try {
      parsedVariables = formValues.variables
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v);
    } catch (error) {
      toast({
        title: "Error",
        description: "Variables must be a comma-separated list",
        variant: "destructive",
      });
      return;
    }

    // Gather user ID (in a real app, this would come from auth context)
    const userId = 1; // Using a default user ID for simplicity

    createTemplateMutation.mutate({
      name: formValues.name,
      subject: formValues.subject,
      htmlContent: formValues.htmlContent,
      textContent: formValues.textContent || null,
      category: formValues.category,
      variables: parsedVariables,
      createdBy: userId,
      campaignId: formValues.campaignId,
    });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    // Parse variables as JSON array
    let parsedVariables;
    try {
      parsedVariables = formValues.variables
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v);
    } catch (error) {
      toast({
        title: "Error",
        description: "Variables must be a comma-separated list",
        variant: "destructive",
      });
      return;
    }

    updateTemplateMutation.mutate({
      id: selectedTemplate.id,
      data: {
        name: formValues.name,
        subject: formValues.subject,
        htmlContent: formValues.htmlContent,
        textContent: formValues.textContent || null,
        category: formValues.category,
        variables: parsedVariables,
        campaignId: formValues.campaignId,
      },
    });
  };

  const handleEditClick = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormValues({
      name: template.name,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent || "",
      category: template.category,
      variables: template.variables.join(", "),
      campaignId: template.campaignId,
    });
    setIsEditing(true);
  };

  const handleDeleteClick = (id: number) => {
    deleteTemplateMutation.mutate(id);
  };

  const handlePreviewClick = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setPreviewVariables(
      JSON.stringify(
        template.variables.reduce((acc, variable) => {
          acc[variable] = `[${variable} value]`;
          return acc;
        }, {} as Record<string, string>),
        null,
        2
      )
    );
    setIsPreviewing(true);
  };

  const handleGeneratePreview = () => {
    if (!selectedTemplate) return;

    let variables;
    try {
      variables = JSON.parse(previewVariables);
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid JSON format for variables",
        variant: "destructive",
      });
      return;
    }

    previewTemplateMutation.mutate({
      id: selectedTemplate.id,
      data: variables,
    });
  };

  const handleCloneTemplate = (template: EmailTemplate) => {
    setFormValues({
      name: `Copy of ${template.name}`,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent || "",
      category: template.category,
      variables: template.variables.join(", "),
      campaignId: template.campaignId,
    });
    setIsCreating(true);
  };

  // Filter templates based on search query and category
  const filteredTemplates = templatesQuery.data
    ? templatesQuery.data.filter((template) => {
        const matchesSearch =
          !searchQuery ||
          template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.subject.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !categoryFilter || template.category === categoryFilter;
        return matchesSearch && matchesCategory;
      })
    : [];

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h1 className="text-3xl font-bold">Email Templates</h1>
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href="/email-test">
              <RiMailLine className="mr-2 h-4 w-4" />
              Email Test
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href="/email-settings">
              <RiMailSettingsLine className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Templates listing section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
            <CardTitle>All Templates</CardTitle>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </div>
          <CardDescription>
            Create and manage your email templates for marketing campaigns
          </CardDescription>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={categoryFilter || ""}
              onValueChange={(value) => setCategoryFilter(value === "" ? null : value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {templateCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {templatesQuery.isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : templatesQuery.isError ? (
            <div className="text-center py-8 text-red-500">
              Error loading templates
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery || categoryFilter
                ? "No templates match your search criteria"
                : "No email templates found. Create your first template."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Variables</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">
                        {template.name}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {template.subject}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {template.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {template.variables.join(", ")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handlePreviewClick(template)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditClick(template)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCloneTemplate(template)}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Clone
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you sure you want to delete this template?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently
                                    delete the "{template.name}" email template.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => handleDeleteClick(template.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Template Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Email Template</DialogTitle>
            <DialogDescription>
              Design a new email template for your marketing campaigns
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formValues.name}
                  onChange={handleInputChange}
                  placeholder="Summer Sale Announcement"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formValues.category}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {templateCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formValues.subject}
                  onChange={handleInputChange}
                  placeholder="Check out our new property at {{address}}"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign">Associated Campaign (optional)</Label>
                <Select
                  value={formValues.campaignId?.toString() || "none"}
                  onValueChange={handleCampaignChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No campaign</SelectItem>
                    {campaignsQuery.data?.map((campaign: any) => (
                      <SelectItem key={campaign.id} value={campaign.id.toString()}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="variables">
                Variable Placeholders (comma-separated)
              </Label>
              <Input
                id="variables"
                name="variables"
                value={formValues.variables}
                onChange={handleInputChange}
                placeholder="name, propertyAddress, price, agentName"
              />
              <p className="text-xs text-muted-foreground">
                These will be used as {{variableName}} in your template
              </p>
            </div>

            <Tabs defaultValue="html" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="html">HTML Content</TabsTrigger>
                <TabsTrigger value="text">Plain Text Content</TabsTrigger>
              </TabsList>
              <TabsContent value="html" className="space-y-2">
                <Label htmlFor="htmlContent">HTML Email Body</Label>
                <Textarea
                  id="htmlContent"
                  name="htmlContent"
                  value={formValues.htmlContent}
                  onChange={handleInputChange}
                  className="font-mono min-h-[300px]"
                  placeholder={`<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1>Hello {{name}}!</h1>
  <p>We're excited to show you our new listing at {{propertyAddress}}.</p>
  <div style="margin: 20px 0;">
    <img src="{{propertyImageUrl}}" alt="Property Image" style="max-width: 100%;" />
  </div>
  <p>Price: <strong>{{price}}</strong></p>
  <p>Contact {{agentName}} to schedule a viewing!</p>
</div>`}
                  required
                />
              </TabsContent>
              <TabsContent value="text" className="space-y-2">
                <Label htmlFor="textContent">Plain Text Email Body (optional)</Label>
                <Textarea
                  id="textContent"
                  name="textContent"
                  value={formValues.textContent}
                  onChange={handleInputChange}
                  className="font-mono min-h-[300px]"
                  placeholder={`Hello {{name}}!

We're excited to show you our new listing at {{propertyAddress}}.

Price: {{price}}

Contact {{agentName}} to schedule a viewing!`}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={createTemplateMutation.isPending}
              >
                {createTemplateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Template
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Email Template</DialogTitle>
            <DialogDescription>
              Update your email template
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Template Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formValues.name}
                  onChange={handleInputChange}
                  placeholder="Summer Sale Announcement"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={formValues.category}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {templateCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-subject">Email Subject</Label>
                <Input
                  id="edit-subject"
                  name="subject"
                  value={formValues.subject}
                  onChange={handleInputChange}
                  placeholder="Check out our new property at {{address}}"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-campaign">
                  Associated Campaign (optional)
                </Label>
                <Select
                  value={formValues.campaignId?.toString() || "none"}
                  onValueChange={handleCampaignChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No campaign</SelectItem>
                    {campaignsQuery.data?.map((campaign: any) => (
                      <SelectItem key={campaign.id} value={campaign.id.toString()}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-variables">
                Variable Placeholders (comma-separated)
              </Label>
              <Input
                id="edit-variables"
                name="variables"
                value={formValues.variables}
                onChange={handleInputChange}
                placeholder="name, propertyAddress, price, agentName"
              />
              <p className="text-xs text-muted-foreground">
                These will be used as {{variableName}} in your template
              </p>
            </div>

            <Tabs defaultValue="html" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="html">HTML Content</TabsTrigger>
                <TabsTrigger value="text">Plain Text Content</TabsTrigger>
              </TabsList>
              <TabsContent value="html" className="space-y-2">
                <Label htmlFor="edit-htmlContent">HTML Email Body</Label>
                <Textarea
                  id="edit-htmlContent"
                  name="htmlContent"
                  value={formValues.htmlContent}
                  onChange={handleInputChange}
                  className="font-mono min-h-[300px]"
                  required
                />
              </TabsContent>
              <TabsContent value="text" className="space-y-2">
                <Label htmlFor="edit-textContent">
                  Plain Text Email Body (optional)
                </Label>
                <Textarea
                  id="edit-textContent"
                  name="textContent"
                  value={formValues.textContent}
                  onChange={handleInputChange}
                  className="font-mono min-h-[300px]"
                />
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={updateTemplateMutation.isPending}
              >
                {updateTemplateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Template
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Template Dialog */}
      <Dialog open={isPreviewing} onOpenChange={setIsPreviewing}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate?.name} - Preview
            </DialogTitle>
            <DialogDescription>
              See how your email will look with variable data
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Preview options */}
            <div className="space-y-2">
              <Label htmlFor="preview-variables">
                Variable Values (JSON format)
              </Label>
              <Textarea
                id="preview-variables"
                value={previewVariables}
                onChange={(e) => setPreviewVariables(e.target.value)}
                className="font-mono min-h-[100px]"
                placeholder={`{
  "name": "John Smith",
  "propertyAddress": "123 Main St"
}`}
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={handleGeneratePreview}
                  disabled={previewTemplateMutation.isPending}
                >
                  {previewTemplateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generate Preview
                </Button>
              </div>
            </div>

            {previewResult && (
              <div className="space-y-4">
                <Separator />
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <div className="p-3 border rounded-md bg-muted">
                    {previewResult.subject}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Email Content</Label>
                    <div className="space-x-2">
                      <Button
                        variant={showHtmlPreview ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowHtmlPreview(true)}
                      >
                        HTML
                      </Button>
                      <Button
                        variant={!showHtmlPreview ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowHtmlPreview(false)}
                        disabled={!previewResult.textContent}
                      >
                        Plain Text
                      </Button>
                    </div>
                  </div>

                  {showHtmlPreview ? (
                    <div className="border rounded-md bg-card p-4 overflow-auto max-h-[400px]">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: previewResult.htmlContent,
                        }}
                      />
                    </div>
                  ) : (
                    <div className="border rounded-md bg-card p-4 overflow-auto max-h-[400px] whitespace-pre-line font-mono text-sm">
                      {previewResult.textContent}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPreviewing(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsPreviewing(false);
                if (selectedTemplate) {
                  handleEditClick(selectedTemplate);
                }
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}