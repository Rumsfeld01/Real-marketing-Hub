import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from 'ws';
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCampaignSchema, 
  insertCampaignMemberSchema, 
  insertTaskSchema, 
  insertActivitySchema, 
  insertMetricSchema, 
  insertAssetSchema,
  insertAssetTemplateSchema,
  insertEmailTemplateSchema,
  insertCampaignCostSchema,
  insertCampaignRevenueSchema,
  insertClientFeedbackSchema,
  insertFeedbackResponseTemplateSchema,
  insertMarketingInsightSchema,
  insertUserBrandingSchema,
  insertSharedInsightSchema
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { 
  sendEmail, 
  sendTemplateEmail, 
  sendCampaignEmail, 
  isEmailConfigured,
  getEmailServiceStatus,
  updateApiKey
} from "./email";
import { generateMarketingInsights } from "./ai";

export async function registerRoutes(app: Express): Promise<Server> {
  // User Routes
  app.get("/api/users", async (_req: Request, res: Response) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    const user = await storage.getUser(Number(req.params.id));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "An error occurred while creating user" });
    }
  });

  // Campaign Routes
  app.get("/api/campaigns", async (_req: Request, res: Response) => {
    const campaigns = await storage.getAllCampaigns();
    res.json(campaigns);
  });

  app.get("/api/campaigns/active", async (_req: Request, res: Response) => {
    const campaigns = await storage.getActiveCampaigns();
    res.json(campaigns);
  });

  app.get("/api/campaigns/:id", async (req: Request, res: Response) => {
    const campaign = await storage.getCampaign(Number(req.params.id));
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    res.json(campaign);
  });

  app.post("/api/campaigns", async (req: Request, res: Response) => {
    try {
      const campaignData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(campaignData);
      res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "An error occurred while creating campaign" });
    }
  });

  app.patch("/api/campaigns/:id", async (req: Request, res: Response) => {
    try {
      const campaignId = Number(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const updatedCampaign = await storage.updateCampaign(campaignId, req.body);
      res.json(updatedCampaign);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while updating campaign" });
    }
  });

  app.delete("/api/campaigns/:id", async (req: Request, res: Response) => {
    try {
      const campaignId = Number(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      await storage.deleteCampaign(campaignId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "An error occurred while deleting campaign" });
    }
  });

  // Campaign Members Routes
  app.get("/api/campaigns/:id/members", async (req: Request, res: Response) => {
    try {
      const campaignId = Number(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const members = await storage.getCampaignMembers(campaignId);
      
      // Get the full user details for each member
      const memberDetails = await Promise.all(
        members.map(async (member) => {
          const user = await storage.getUser(member.userId);
          return { ...member, user };
        })
      );
      
      res.json(memberDetails);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching campaign members" });
    }
  });

  app.post("/api/campaigns/:id/members", async (req: Request, res: Response) => {
    try {
      const campaignId = Number(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const memberData = insertCampaignMemberSchema.parse({
        ...req.body,
        campaignId
      });
      
      const member = await storage.addMemberToCampaign(memberData);
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "An error occurred while adding member to campaign" });
    }
  });

  app.delete("/api/campaigns/:campaignId/members/:userId", async (req: Request, res: Response) => {
    try {
      const campaignId = Number(req.params.campaignId);
      const userId = Number(req.params.userId);
      
      const campaign = await storage.getCampaign(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      await storage.removeMemberFromCampaign(campaignId, userId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "An error occurred while removing member from campaign" });
    }
  });

  // Task Routes
  app.get("/api/tasks", async (_req: Request, res: Response) => {
    const tasks = await storage.getAllTasks();
    res.json(tasks);
  });

  app.get("/api/tasks/upcoming", async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const tasks = await storage.getUpcomingTasks(limit);
    res.json(tasks);
  });

  app.get("/api/campaigns/:id/tasks", async (req: Request, res: Response) => {
    const campaignId = Number(req.params.id);
    const campaign = await storage.getCampaign(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    const tasks = await storage.getTasksByCampaign(campaignId);
    res.json(tasks);
  });

  app.get("/api/tasks/:id", async (req: Request, res: Response) => {
    const task = await storage.getTask(Number(req.params.id));
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  });

  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "An error occurred while creating task" });
    }
  });

  app.patch("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const taskId = Number(req.params.id);
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      const updatedTask = await storage.updateTask(taskId, req.body);
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while updating task" });
    }
  });

  app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const taskId = Number(req.params.id);
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      await storage.deleteTask(taskId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "An error occurred while deleting task" });
    }
  });

  // Activity Routes
  app.get("/api/activities", async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const activities = await storage.getAllActivities(limit);
    res.json(activities);
  });

  app.get("/api/campaigns/:id/activities", async (req: Request, res: Response) => {
    const campaignId = Number(req.params.id);
    const campaign = await storage.getCampaign(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    const activities = await storage.getActivitiesByCampaign(campaignId);
    res.json(activities);
  });

  app.post("/api/activities", async (req: Request, res: Response) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "An error occurred while creating activity" });
    }
  });

  // Metrics Routes
  app.get("/api/campaigns/:id/metrics", async (req: Request, res: Response) => {
    const campaignId = Number(req.params.id);
    const campaign = await storage.getCampaign(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    const metrics = await storage.getMetricsByCampaign(campaignId);
    res.json(metrics);
  });

  app.post("/api/metrics", async (req: Request, res: Response) => {
    try {
      const metricData = insertMetricSchema.parse(req.body);
      const metric = await storage.createMetric(metricData);
      res.status(201).json(metric);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "An error occurred while creating metric" });
    }
  });

  // Asset Templates Routes
  app.get("/api/asset-templates", async (_req: Request, res: Response) => {
    try {
      const templates = await storage.getAllAssetTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while fetching asset templates",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/asset-templates/:id", async (req: Request, res: Response) => {
    try {
      const templateId = Number(req.params.id);
      const template = await storage.getAssetTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Asset template not found" });
      }
      
      res.json(template);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while fetching asset template",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/asset-templates/category/:category", async (req: Request, res: Response) => {
    try {
      const { category } = req.params;
      const templates = await storage.getAssetTemplatesByCategory(category);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while fetching asset templates by category",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/asset-templates/type/:type", async (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      const templates = await storage.getAssetTemplatesByType(type);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while fetching asset templates by type",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/asset-templates", async (req: Request, res: Response) => {
    try {
      const templateData = insertAssetTemplateSchema.parse(req.body);
      const template = await storage.createAssetTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ 
        message: "An error occurred while creating asset template",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.patch("/api/asset-templates/:id", async (req: Request, res: Response) => {
    try {
      const templateId = Number(req.params.id);
      const template = await storage.getAssetTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Asset template not found" });
      }
      
      const updatedTemplate = await storage.updateAssetTemplate(templateId, req.body);
      res.json(updatedTemplate);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while updating asset template",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.delete("/api/asset-templates/:id", async (req: Request, res: Response) => {
    try {
      const templateId = Number(req.params.id);
      const template = await storage.getAssetTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Asset template not found" });
      }
      
      await storage.deleteAssetTemplate(templateId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while deleting asset template",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/asset-templates/:id/generate", async (req: Request, res: Response) => {
    try {
      const templateId = Number(req.params.id);
      const template = await storage.getAssetTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Asset template not found" });
      }
      
      const { name, campaignId, customData, uploadedBy } = req.body;
      
      const generatedAsset = await storage.generateAssetFromTemplate(templateId, {
        name,
        campaignId,
        customData,
        uploadedBy
      });
      
      res.status(201).json(generatedAsset);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while generating asset from template",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Assets Routes
  app.get("/api/assets", async (_req: Request, res: Response) => {
    const assets = await storage.getAllAssets();
    res.json(assets);
  });

  app.get("/api/campaigns/:id/assets", async (req: Request, res: Response) => {
    const campaignId = Number(req.params.id);
    const campaign = await storage.getCampaign(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    const assets = await storage.getAssetsByCampaign(campaignId);
    res.json(assets);
  });

  app.post("/api/assets", async (req: Request, res: Response) => {
    try {
      const assetData = insertAssetSchema.parse(req.body);
      const asset = await storage.createAsset(assetData);
      res.status(201).json(asset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "An error occurred while creating asset" });
    }
  });

  app.delete("/api/assets/:id", async (req: Request, res: Response) => {
    try {
      const assetId = Number(req.params.id);
      const asset = await storage.getAsset(assetId);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      
      await storage.deleteAsset(assetId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "An error occurred while deleting asset" });
    }
  });

  // Email Template Routes
  app.get("/api/email-templates", async (_req: Request, res: Response) => {
    const templates = await storage.getAllEmailTemplates();
    res.json(templates);
  });

  app.get("/api/email-templates/:id", async (req: Request, res: Response) => {
    const templateId = Number(req.params.id);
    const template = await storage.getEmailTemplate(templateId);
    if (!template) {
      return res.status(404).json({ message: "Email template not found" });
    }
    res.json(template);
  });

  app.get("/api/campaigns/:id/email-templates", async (req: Request, res: Response) => {
    const campaignId = Number(req.params.id);
    const campaign = await storage.getCampaign(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    const templates = await storage.getEmailTemplatesByCampaign(campaignId);
    res.json(templates);
  });

  app.get("/api/email-templates/category/:category", async (req: Request, res: Response) => {
    const category = req.params.category;
    const templates = await storage.getEmailTemplatesByCategory(category);
    res.json(templates);
  });

  app.post("/api/email-templates", async (req: Request, res: Response) => {
    try {
      const templateData = insertEmailTemplateSchema.parse(req.body);
      const template = await storage.createEmailTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "An error occurred while creating email template" });
    }
  });

  app.patch("/api/email-templates/:id", async (req: Request, res: Response) => {
    try {
      const templateId = Number(req.params.id);
      const template = await storage.getEmailTemplate(templateId);
      if (!template) {
        return res.status(404).json({ message: "Email template not found" });
      }
      
      const updatedTemplate = await storage.updateEmailTemplate(templateId, req.body);
      res.json(updatedTemplate);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while updating email template" });
    }
  });

  app.delete("/api/email-templates/:id", async (req: Request, res: Response) => {
    try {
      const templateId = Number(req.params.id);
      const template = await storage.getEmailTemplate(templateId);
      if (!template) {
        return res.status(404).json({ message: "Email template not found" });
      }
      
      await storage.deleteEmailTemplate(templateId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "An error occurred while deleting email template" });
    }
  });

  app.post("/api/email-templates/:id/preview", async (req: Request, res: Response) => {
    try {
      const templateId = Number(req.params.id);
      const template = await storage.getEmailTemplate(templateId);
      if (!template) {
        return res.status(404).json({ message: "Email template not found" });
      }
      
      const previewData = req.body;
      const preview = await storage.previewEmailTemplate(templateId, previewData);
      res.json(preview);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while generating email template preview",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Email Sending Routes
  app.get("/api/email/status", async (_req: Request, res: Response) => {
    const status = getEmailServiceStatus();
    res.json(status);
  });
  
  app.post("/api/email/config", async (req: Request, res: Response) => {
    try {
      const { apiKey } = req.body;
      
      if (!apiKey) {
        return res.status(400).json({ 
          success: false,
          message: "API key is required"
        });
      }
      
      const result = updateApiKey(apiKey);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "An error occurred while updating the API key",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/email/send", async (req: Request, res: Response) => {
    try {
      if (!isEmailConfigured()) {
        return res.status(503).json({ 
          message: "Email service is not configured. Please set the SENDGRID_API_KEY environment variable." 
        });
      }

      const { to, from, subject, html, text } = req.body;
      
      // Basic validation
      if (!to || !from || !subject || !html) {
        return res.status(400).json({ 
          message: "Missing required fields. 'to', 'from', 'subject', and 'html' are required." 
        });
      }
      
      const result = await sendEmail({
        to,
        from,
        subject,
        html,
        text
      });
      
      if (result) {
        res.json({ success: true, message: "Email sent successfully" });
      } else {
        res.status(500).json({ success: false, message: "Failed to send email" });
      }
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while sending email",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/email/send-template/:id", async (req: Request, res: Response) => {
    try {
      if (!isEmailConfigured()) {
        return res.status(503).json({ 
          message: "Email service is not configured. Please set the SENDGRID_API_KEY environment variable." 
        });
      }

      const templateId = Number(req.params.id);
      const template = await storage.getEmailTemplate(templateId);
      if (!template) {
        return res.status(404).json({ message: "Email template not found" });
      }
      
      const { to, from, variables } = req.body;
      
      // Basic validation
      if (!to || !from || !variables) {
        return res.status(400).json({ 
          message: "Missing required fields. 'to', 'from', and 'variables' are required." 
        });
      }
      
      const result = await sendTemplateEmail(to, from, templateId, variables);
      
      if (result) {
        res.json({ success: true, message: "Email sent successfully" });
      } else {
        res.status(500).json({ success: false, message: "Failed to send email" });
      }
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while sending templated email",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/campaigns/:id/send-email", async (req: Request, res: Response) => {
    try {
      if (!isEmailConfigured()) {
        return res.status(503).json({ 
          message: "Email service is not configured. Please set the SENDGRID_API_KEY environment variable." 
        });
      }

      const campaignId = Number(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const { templateId, recipients, from, variables } = req.body;
      
      // Basic validation
      if (!templateId || !recipients || !from || !variables) {
        return res.status(400).json({ 
          message: "Missing required fields. 'templateId', 'recipients', 'from', and 'variables' are required." 
        });
      }
      
      const template = await storage.getEmailTemplate(templateId);
      if (!template) {
        return res.status(404).json({ message: "Email template not found" });
      }
      
      // Validate that recipients is an array
      if (!Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({ message: "Recipients must be a non-empty array of email addresses" });
      }
      
      const result = await sendCampaignEmail(campaignId, templateId, recipients, from, variables);
      
      // Create an activity entry for this email campaign
      await storage.createActivity({
        content: `Sent ${result.success} email(s) using template "${template.name}"`,
        userId: 1, // Assuming this is the currently logged-in user
        actionType: "email_campaign",
        campaignId
      });
      
      res.json({
        success: true,
        campaignId,
        templateId,
        stats: result
      });
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while sending campaign emails",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // ROI Analysis Routes
  app.get("/api/campaigns/:id/roi", async (req: Request, res: Response) => {
    try {
      const campaignId = Number(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const roi = await storage.getCampaignROI(campaignId);
      res.json(roi);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while calculating campaign ROI",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/roi/comparison", async (req: Request, res: Response) => {
    try {
      const { campaignIds } = req.body;
      
      if (!campaignIds || !Array.isArray(campaignIds) || campaignIds.length === 0) {
        return res.status(400).json({ message: "A non-empty array of campaign IDs is required" });
      }
      
      const comparison = await storage.getROIComparison(campaignIds);
      res.json(comparison);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while generating ROI comparison",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Campaign Cost Routes
  app.get("/api/campaigns/:id/costs", async (req: Request, res: Response) => {
    try {
      const campaignId = Number(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const costs = await storage.getCostsByCampaign(campaignId);
      res.json(costs);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while fetching campaign costs",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/campaign-costs", async (req: Request, res: Response) => {
    try {
      const costData = insertCampaignCostSchema.parse(req.body);
      const cost = await storage.createCampaignCost(costData);
      res.status(201).json(cost);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ 
        message: "An error occurred while creating campaign cost entry",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.patch("/api/campaign-costs/:id", async (req: Request, res: Response) => {
    try {
      const costId = Number(req.params.id);
      const cost = await storage.getCampaignCost(costId);
      if (!cost) {
        return res.status(404).json({ message: "Campaign cost entry not found" });
      }
      
      const updatedCost = await storage.updateCampaignCost(costId, req.body);
      res.json(updatedCost);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while updating campaign cost entry",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.delete("/api/campaign-costs/:id", async (req: Request, res: Response) => {
    try {
      const costId = Number(req.params.id);
      const cost = await storage.getCampaignCost(costId);
      if (!cost) {
        return res.status(404).json({ message: "Campaign cost entry not found" });
      }
      
      await storage.deleteCampaignCost(costId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while deleting campaign cost entry",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Campaign Revenue Routes
  app.get("/api/campaigns/:id/revenue", async (req: Request, res: Response) => {
    try {
      const campaignId = Number(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const revenue = await storage.getRevenueByCampaign(campaignId);
      res.json(revenue);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while fetching campaign revenue",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/campaign-revenue", async (req: Request, res: Response) => {
    try {
      const revenueData = insertCampaignRevenueSchema.parse(req.body);
      const revenue = await storage.createCampaignRevenue(revenueData);
      res.status(201).json(revenue);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ 
        message: "An error occurred while creating campaign revenue entry",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.patch("/api/campaign-revenue/:id", async (req: Request, res: Response) => {
    try {
      const revenueId = Number(req.params.id);
      const revenue = await storage.getCampaignRevenue(revenueId);
      if (!revenue) {
        return res.status(404).json({ message: "Campaign revenue entry not found" });
      }
      
      const updatedRevenue = await storage.updateCampaignRevenue(revenueId, req.body);
      res.json(updatedRevenue);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while updating campaign revenue entry",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.delete("/api/campaign-revenue/:id", async (req: Request, res: Response) => {
    try {
      const revenueId = Number(req.params.id);
      const revenue = await storage.getCampaignRevenue(revenueId);
      if (!revenue) {
        return res.status(404).json({ message: "Campaign revenue entry not found" });
      }
      
      await storage.deleteCampaignRevenue(revenueId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while deleting campaign revenue entry",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Client Feedback Routes
  app.get("/api/feedback", async (_req: Request, res: Response) => {
    try {
      const feedback = await storage.getPendingClientFeedback();
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while fetching client feedback",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/feedback/:id", async (req: Request, res: Response) => {
    try {
      const feedbackId = Number(req.params.id);
      const feedback = await storage.getClientFeedback(feedbackId);
      
      if (!feedback) {
        return res.status(404).json({ message: "Client feedback not found" });
      }
      
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while fetching client feedback",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/campaigns/:id/feedback", async (req: Request, res: Response) => {
    try {
      const campaignId = Number(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const feedback = await storage.getClientFeedbackByCampaign(campaignId);
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while fetching campaign feedback",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/campaigns/:id/feedback/summary", async (req: Request, res: Response) => {
    try {
      const campaignId = Number(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const summary = await storage.getFeedbackSummary(campaignId);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while fetching feedback summary",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/feedback", async (req: Request, res: Response) => {
    try {
      const feedbackData = insertClientFeedbackSchema.parse(req.body);
      const feedback = await storage.createClientFeedback(feedbackData);
      
      // Generate metrics after receiving new feedback
      const campaign = await storage.getCampaign(feedbackData.campaignId);
      if (campaign) {
        await storage.calculateFeedbackMetrics(feedbackData.campaignId, new Date());
      }
      
      // Send real-time notification if it's a negative rating (1-3 stars)
      if (parseInt(feedback.rating) <= 3) {
        const campaignName = campaign ? campaign.name : `Campaign #${feedback.campaignId}`;
        
        const notification = {
          id: Date.now().toString(),
          title: 'New Critical Feedback',
          message: `${feedback.clientName} gave a rating of ${feedback.rating}/5 for ${campaignName}`,
          type: 'feedback',
          timestamp: new Date(),
          read: false,
          link: '/feedback',
          data: { 
            feedbackId: feedback.id,
            campaignId: feedback.campaignId,
            rating: feedback.rating
          }
        };
        
        // Use the broadcast function to send notification to all connected clients
        broadcastNotification(notification);
      }
      
      res.status(201).json(feedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ 
        message: "An error occurred while creating client feedback",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.patch("/api/feedback/:id", async (req: Request, res: Response) => {
    try {
      const feedbackId = Number(req.params.id);
      const feedback = await storage.getClientFeedback(feedbackId);
      
      if (!feedback) {
        return res.status(404).json({ message: "Client feedback not found" });
      }
      
      const updatedFeedback = await storage.updateClientFeedback(feedbackId, req.body);
      
      // If feedback was responded to, update metrics
      if (req.body.status === 'responded' && feedback.status !== 'responded') {
        await storage.calculateFeedbackMetrics(feedback.campaignId, new Date());
      }
      
      res.json(updatedFeedback);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while updating client feedback",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.delete("/api/feedback/:id", async (req: Request, res: Response) => {
    try {
      const feedbackId = Number(req.params.id);
      const feedback = await storage.getClientFeedback(feedbackId);
      
      if (!feedback) {
        return res.status(404).json({ message: "Client feedback not found" });
      }
      
      await storage.deleteClientFeedback(feedbackId);
      
      // Update metrics after deleting feedback
      await storage.calculateFeedbackMetrics(feedback.campaignId, new Date());
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while deleting client feedback",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Feedback Response Template Routes
  app.get("/api/feedback/templates", async (_req: Request, res: Response) => {
    try {
      const templates = await storage.getAllFeedbackResponseTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while fetching feedback response templates",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/feedback/templates/:id", async (req: Request, res: Response) => {
    try {
      const templateId = Number(req.params.id);
      const template = await storage.getFeedbackResponseTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Feedback response template not found" });
      }
      
      res.json(template);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while fetching feedback response template",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/feedback/templates/category/:category", async (req: Request, res: Response) => {
    try {
      const category = req.params.category;
      const templates = await storage.getFeedbackResponseTemplatesByCategory(category);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while fetching feedback response templates by category",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/feedback/templates", async (req: Request, res: Response) => {
    try {
      const templateData = insertFeedbackResponseTemplateSchema.parse(req.body);
      const template = await storage.createFeedbackResponseTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ 
        message: "An error occurred while creating feedback response template",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.patch("/api/feedback/templates/:id", async (req: Request, res: Response) => {
    try {
      const templateId = Number(req.params.id);
      const template = await storage.getFeedbackResponseTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Feedback response template not found" });
      }
      
      const updatedTemplate = await storage.updateFeedbackResponseTemplate(templateId, req.body);
      res.json(updatedTemplate);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while updating feedback response template",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.delete("/api/feedback/templates/:id", async (req: Request, res: Response) => {
    try {
      const templateId = Number(req.params.id);
      const template = await storage.getFeedbackResponseTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Feedback response template not found" });
      }
      
      await storage.deleteFeedbackResponseTemplate(templateId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while deleting feedback response template",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/feedback/templates/:id/preview", async (req: Request, res: Response) => {
    try {
      const templateId = Number(req.params.id);
      const template = await storage.getFeedbackResponseTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Feedback response template not found" });
      }
      
      const previewData = req.body;
      const preview = await storage.previewFeedbackResponseTemplate(templateId, previewData);
      res.json(preview);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while generating feedback response template preview",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Feedback Metrics Routes
  app.get("/api/campaigns/:id/feedback/metrics", async (req: Request, res: Response) => {
    try {
      const campaignId = Number(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const metrics = await storage.getFeedbackMetricsByCampaign(campaignId);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while fetching feedback metrics",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/campaigns/:id/feedback/metrics/latest", async (req: Request, res: Response) => {
    try {
      const campaignId = Number(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const metrics = await storage.getLatestFeedbackMetrics(campaignId);
      
      if (!metrics) {
        return res.status(404).json({ message: "No feedback metrics found for this campaign" });
      }
      
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while fetching latest feedback metrics",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/campaigns/:id/feedback/metrics/calculate", async (req: Request, res: Response) => {
    try {
      const campaignId = Number(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const metrics = await storage.calculateFeedbackMetrics(campaignId, new Date());
      res.status(201).json(metrics);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while calculating feedback metrics",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Marketing Insights Routes
  app.get("/api/marketing-insights", async (_req: Request, res: Response) => {
    try {
      const insights = await storage.getAllMarketingInsights();
      res.json(insights);
    } catch (error) {
      res.status(500).json({
        message: "An error occurred while fetching marketing insights",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/marketing-insights/:id", async (req: Request, res: Response) => {
    try {
      const insightId = Number(req.params.id);
      const insight = await storage.getMarketingInsight(insightId);
      
      if (!insight) {
        return res.status(404).json({ message: "Marketing insight not found" });
      }
      
      res.json(insight);
    } catch (error) {
      res.status(500).json({
        message: "An error occurred while fetching marketing insight",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/campaigns/:id/marketing-insights", async (req: Request, res: Response) => {
    try {
      const campaignId = Number(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const insights = await storage.getMarketingInsightsByCampaign(campaignId);
      res.json(insights);
    } catch (error) {
      res.status(500).json({
        message: "An error occurred while fetching marketing insights for campaign",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/marketing-insights/generate", async (req: Request, res: Response) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ 
          message: "OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable."
        });
      }

      const { 
        marketingChannel, 
        propertyType, 
        priceRange, 
        location, 
        targetMarket,
        campaignId,
        createdBy,
        keywords
      } = req.body;

      // Validate required fields
      if (!targetMarket && !propertyType && !location) {
        return res.status(400).json({ message: "At least one of targetMarket, propertyType, or location is required" });
      }

      const insight = await generateMarketingInsights({
        targetMarket,
        propertyType,
        priceRange,
        location,
        marketingChannel,
        keywords
      });

      // Store the generated insight in the database
      const insightData = {
        insightId: insight.id,
        summary: insight.summary,
        insights: insight.insights,
        targetMarket: insight.targetMarket || null,
        propertyType: insight.propertyType || null,
        priceRange: insight.priceRange || null,
        location: insight.location || null,
        keywords: insight.keywords || [],
        campaignId: campaignId || null,
        createdBy: createdBy
      };

      const savedInsight = await storage.createMarketingInsight(insightData);
      res.status(201).json(savedInsight);
    } catch (error) {
      console.error("Error generating marketing insights:", error);
      res.status(500).json({
        message: "An error occurred while generating marketing insights",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.delete("/api/marketing-insights/:id", async (req: Request, res: Response) => {
    try {
      const insightId = Number(req.params.id);
      const insight = await storage.getMarketingInsight(insightId);
      
      if (!insight) {
        return res.status(404).json({ message: "Marketing insight not found" });
      }
      
      await storage.deleteMarketingInsight(insightId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        message: "An error occurred while deleting marketing insight",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Notification Preferences endpoints
  app.get("/api/notification-preferences/:userId", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const preferences = await storage.getNotificationPreference(userId);
      
      if (!preferences) {
        return res.status(404).json({ message: "Notification preferences not found" });
      }
      
      res.json(preferences);
    } catch (error) {
      res.status(500).json({
        message: "An error occurred while fetching notification preferences",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  app.post("/api/notification-preferences", async (req: Request, res: Response) => {
    try {
      const preferencesData = req.body;
      const newPreferences = await storage.createNotificationPreference(preferencesData);
      res.status(201).json(newPreferences);
    } catch (error) {
      res.status(500).json({
        message: "An error occurred while creating notification preferences",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  app.patch("/api/notification-preferences/:userId", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const preferencesData = req.body;
      const updatedPreferences = await storage.updateNotificationPreference(userId, preferencesData);
      
      if (!updatedPreferences) {
        return res.status(404).json({ message: "Notification preferences not found" });
      }
      
      res.json(updatedPreferences);
    } catch (error) {
      res.status(500).json({
        message: "An error occurred while updating notification preferences",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  
  // Set up WebSocket server with a specific path to not conflict with Vite's HMR
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active connections
  const activeConnections: Set<WebSocket> = new Set();
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    activeConnections.add(ws);
    
    ws.on('message', (message) => {
      try {
        // Parse incoming message
        const data = JSON.parse(message.toString());
        console.log('WebSocket message received:', data);
        
        // Handle specific message types here
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date() }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      activeConnections.delete(ws);
    });
    
    // Send welcome message
    ws.send(JSON.stringify({ 
      type: 'connection', 
      message: 'Connected to CampaignPro WebSocket server',
      timestamp: new Date()
    }));
  });
  
  // Helper function to broadcast notifications to all connected clients
  const broadcastNotification = (notification: any) => {
    const message = JSON.stringify({
      type: 'notification',
      notification,
      timestamp: new Date()
    });
    
    activeConnections.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };
  
  // Make broadcastNotification available globally so other modules can access it
  (global as any).broadcastNotification = broadcastNotification;
  
  // Add a new route to test notifications
  app.post("/api/notifications/test", (req: Request, res: Response) => {
    const notification = {
      id: Date.now().toString(),
      title: req.body.title || 'Test Notification',
      message: req.body.message || 'This is a test notification',
      type: req.body.type || 'info',
      timestamp: new Date(),
      read: false,
      link: req.body.link,
      data: req.body.data
    };
    
    broadcastNotification(notification);
    res.json({ success: true, notification });
  });
  
  // Add a route to serve the WebSocket test page
  app.get("/websocket-test", (_req: Request, res: Response) => {
    res.sendFile('test-websocket.html', { root: '.' });
  });
  
  // Add an endpoint to test marketing insight notifications with preferences
  app.post("/api/notifications/test-insight", async (req: Request, res: Response) => {
    try {
      const { title, category, propertyType, location, keywords, summary } = req.body;
      
      // Create a test marketing insight
      const testInsight = await storage.createMarketingInsight({
        title: title || "Test Marketing Insight",
        category: category || "luxury",
        summary: summary || "This is a test marketing insight for notification preferences testing.",
        insights: JSON.stringify([
          { category: "test", trend: "upward", confidence: 0.9 }
        ]),
        recommendations: JSON.stringify([
          "This is a test recommendation for notification preferences"
        ]),
        propertyType: propertyType || "luxury",
        location: location || "Test Location",
        createdBy: 1,
        keywords: keywords || ["test", "luxury", "notification"],
        relevance: 8,
        trendDirection: "up",
        trendEmoji: "🔥",
        campaignId: 1
      });
      
      res.status(201).json({
        success: true,
        message: "Test insight created with notification preferences matching",
        insight: testInsight
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "Failed to create test insight notification",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // User Branding Routes
  app.get("/api/user-branding/:userId", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const branding = await storage.getUserBranding(userId);
      
      if (!branding) {
        return res.status(404).json({ message: "User branding not found" });
      }
      
      res.json(branding);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while fetching user branding",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/user-branding", async (req: Request, res: Response) => {
    try {
      const brandingData = insertUserBrandingSchema.parse(req.body);
      // Check if branding already exists for this user
      const existingBranding = await storage.getUserBranding(brandingData.userId);
      
      if (existingBranding) {
        return res.status(400).json({ 
          message: "Branding already exists for this user. Use PATCH to update."
        });
      }
      
      const branding = await storage.createUserBranding(brandingData);
      res.status(201).json(branding);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ 
        message: "An error occurred while creating user branding",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.patch("/api/user-branding/:userId", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const existingBranding = await storage.getUserBranding(userId);
      
      if (!existingBranding) {
        return res.status(404).json({ message: "User branding not found" });
      }
      
      const updatedBranding = await storage.updateUserBranding(userId, req.body);
      res.json(updatedBranding);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while updating user branding",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Shared Insights Routes
  app.get("/api/shared-insights/:shareCode", async (req: Request, res: Response) => {
    try {
      const { shareCode } = req.params;
      let sharedInsight = await storage.getSharedInsight(shareCode);
      
      if (!sharedInsight) {
        return res.status(404).json({ message: "Shared insight not found" });
      }
      
      // Get the original insight details
      const insight = await storage.getMarketingInsight(sharedInsight.insightId);
      
      if (!insight) {
        return res.status(404).json({ message: "Original insight not found" });
      }
      
      // Get user branding if enabled
      let branding = null;
      if (sharedInsight.useBranding) {
        branding = await storage.getUserBranding(sharedInsight.userId);
      }
      
      // Increment the view counter async (don't await to speed up response)
      storage.incrementSharedInsightViews(shareCode)
        .then(updatedInsight => {
          // Successfully incremented view count
          console.log(`Incremented view count for shared insight ${shareCode}`);
        })
        .catch(err => {
          console.error(`Failed to increment view count: ${err.message}`);
        });
      
      // Combine the data
      const response = {
        sharedInsight,
        insight,
        branding
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while fetching shared insight",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/users/:userId/shared-insights", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const sharedInsights = await storage.getSharedInsightsByUser(userId);
      res.json(sharedInsights);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while fetching shared insights by user",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  app.get("/api/users/:userId/shared-insights/analytics", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const sharedInsights = await storage.getSharedInsightsByUser(userId);
      
      if (!sharedInsights || sharedInsights.length === 0) {
        return res.json({
          totalShared: 0,
          totalViews: 0,
          activeCount: 0,
          mostViewedInsight: null,
          recentlyViewed: []
        });
      }
      
      // Calculate analytics
      const totalShared = sharedInsights.length;
      const totalViews = sharedInsights.reduce((sum, insight) => sum + (insight.views || 0), 0);
      const activeCount = sharedInsights.filter(insight => insight.status === 'active').length;
      
      // Get most viewed insight
      const mostViewedInsight = [...sharedInsights].sort((a, b) => 
        (b.views || 0) - (a.views || 0)
      )[0];
      
      // Get recently viewed insights
      const recentlyViewed = [...sharedInsights]
        .filter(insight => insight.lastViewed)
        .sort((a, b) => 
          new Date(b.lastViewed || 0).getTime() - new Date(a.lastViewed || 0).getTime()
        )
        .slice(0, 5); // Top 5 recently viewed
      
      res.json({
        totalShared,
        totalViews,
        activeCount,
        mostViewedInsight: mostViewedInsight || null,
        recentlyViewed
      });
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while fetching shared insights analytics",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/shared-insights", async (req: Request, res: Response) => {
    try {
      const insightData = insertSharedInsightSchema.parse(req.body);
      
      // Verify the insight exists
      const insight = await storage.getMarketingInsight(insightData.insightId);
      if (!insight) {
        return res.status(404).json({ message: "Marketing insight not found" });
      }
      
      // Verify the user exists
      const user = await storage.getUser(insightData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create a unique share code if not provided
      if (!insightData.shareCode) {
        insightData.shareCode = `insight-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      }
      
      const sharedInsight = await storage.createSharedInsight(insightData);
      
      // If email recipients are specified, send them the shared insight
      if (insightData.recipientEmails && insightData.recipientEmails.length > 0) {
        // Here we would integrate with email service to send emails
        // This would use the sendEmail function with custom template
      }
      
      res.status(201).json(sharedInsight);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ 
        message: "An error occurred while sharing insight",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  return httpServer;
}
