import { 
  users, campaigns, campaignMembers, tasks, activities, metrics, assets, emailTemplates,
  campaignCosts, campaignRevenue, clientFeedback, feedbackResponseTemplates, feedbackMetrics,
  assetTemplates, marketingInsights, userBranding, sharedInsights,
  type User, type InsertUser, 
  type Campaign, type InsertCampaign,
  type CampaignMember, type InsertCampaignMember,
  type Task, type InsertTask,
  type Activity, type InsertActivity,
  type Metric, type InsertMetric,
  type Asset, type InsertAsset,
  type AssetTemplate, type InsertAssetTemplate,
  type EmailTemplate, type InsertEmailTemplate,
  type CampaignCost, type InsertCampaignCost,
  type CampaignRevenue, type InsertCampaignRevenue,
  type ClientFeedback, type InsertClientFeedback,
  type FeedbackResponseTemplate, type InsertFeedbackResponseTemplate,
  type FeedbackMetrics, type InsertFeedbackMetrics,
  type MarketingInsight, type InsertMarketingInsight,
  type UserBranding, type InsertUserBranding,
  type SharedInsight, type InsertSharedInsight
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, lte, gte, and, isNull, isNotNull } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Campaign operations
  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign;
  }

  async getAllCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
  }

  async getActiveCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns)
      .where(eq(campaigns.status, 'active'))
      .orderBy(desc(campaigns.createdAt));
  }

  async createCampaign(campaignData: InsertCampaign): Promise<Campaign> {
    const [campaign] = await db.insert(campaigns).values(campaignData).returning();
    return campaign;
  }

  async updateCampaign(id: number, campaignData: Partial<Campaign>): Promise<Campaign | undefined> {
    const [updatedCampaign] = await db.update(campaigns)
      .set(campaignData)
      .where(eq(campaigns.id, id))
      .returning();
    return updatedCampaign;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    await db.delete(campaigns).where(eq(campaigns.id, id));
    return true;
  }

  // Campaign Member operations
  async addMemberToCampaign(memberData: InsertCampaignMember): Promise<CampaignMember> {
    const [member] = await db.insert(campaignMembers).values(memberData).returning();
    return member;
  }

  async getCampaignMembers(campaignId: number): Promise<CampaignMember[]> {
    return await db.select().from(campaignMembers).where(eq(campaignMembers.campaignId, campaignId));
  }

  async removeMemberFromCampaign(campaignId: number, userId: number): Promise<boolean> {
    await db.delete(campaignMembers)
      .where(
        and(
          eq(campaignMembers.campaignId, campaignId),
          eq(campaignMembers.userId, userId)
        )
      );
    return true;
  }

  // Task operations
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTasksByCampaign(campaignId: number): Promise<Task[]> {
    return await db.select().from(tasks)
      .where(eq(tasks.campaignId, campaignId))
      .orderBy(tasks.dueDate);
  }

  async getUpcomingTasks(limit?: number): Promise<Task[]> {
    const now = new Date();
    const results = await db.select().from(tasks)
      .where(
        and(
          eq(tasks.completed, false),
          gte(tasks.dueDate, now)
        )
      )
      .orderBy(tasks.dueDate);
    
    return limit ? results.slice(0, limit) : results;
  }

  async createTask(taskData: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(taskData).returning();
    return task;
  }

  async updateTask(id: number, taskData: Partial<Task>): Promise<Task | undefined> {
    const [updatedTask] = await db.update(tasks)
      .set(taskData)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    await db.delete(tasks).where(eq(tasks.id, id));
    return true;
  }

  // Activity operations
  async getActivity(id: number): Promise<Activity | undefined> {
    const [activity] = await db.select().from(activities).where(eq(activities.id, id));
    return activity;
  }

  async getAllActivities(limit?: number): Promise<Activity[]> {
    const results = await db.select().from(activities).orderBy(desc(activities.createdAt));
    
    return limit ? results.slice(0, limit) : results;
  }

  async getActivitiesByCampaign(campaignId: number): Promise<Activity[]> {
    return await db.select().from(activities)
      .where(eq(activities.campaignId, campaignId))
      .orderBy(desc(activities.createdAt));
  }

  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values(activityData).returning();
    return activity;
  }

  // Metric operations
  async getMetric(id: number): Promise<Metric | undefined> {
    const [metric] = await db.select().from(metrics).where(eq(metrics.id, id));
    return metric;
  }

  async getMetricsByCampaign(campaignId: number): Promise<Metric[]> {
    return await db.select().from(metrics)
      .where(eq(metrics.campaignId, campaignId))
      .orderBy(metrics.date);
  }

  async getMetricsForPeriod(startDate: Date, endDate: Date): Promise<Metric[]> {
    return await db.select().from(metrics)
      .where(
        and(
          gte(metrics.date, startDate),
          lte(metrics.date, endDate)
        )
      )
      .orderBy(metrics.date);
  }

  async createMetric(metricData: InsertMetric): Promise<Metric> {
    const [metric] = await db.insert(metrics).values(metricData).returning();
    return metric;
  }
  
  // Asset Template operations
  async getAssetTemplate(id: number): Promise<AssetTemplate | undefined> {
    const [template] = await db.select().from(assetTemplates).where(eq(assetTemplates.id, id));
    return template;
  }

  async getAssetTemplatesByCategory(category: string): Promise<AssetTemplate[]> {
    return await db.select().from(assetTemplates)
      .where(eq(assetTemplates.category, category))
      .orderBy(desc(assetTemplates.createdAt));
  }

  async getAssetTemplatesByType(type: string): Promise<AssetTemplate[]> {
    return await db.select().from(assetTemplates)
      .where(eq(assetTemplates.type, type))
      .orderBy(desc(assetTemplates.createdAt));
  }

  async getAllAssetTemplates(): Promise<AssetTemplate[]> {
    return await db.select().from(assetTemplates).orderBy(desc(assetTemplates.createdAt));
  }

  async createAssetTemplate(templateData: InsertAssetTemplate): Promise<AssetTemplate> {
    const [template] = await db.insert(assetTemplates).values({
      ...templateData,
      updatedAt: new Date()
    }).returning();
    return template;
  }

  async updateAssetTemplate(id: number, data: Partial<AssetTemplate>): Promise<AssetTemplate | undefined> {
    const [updatedTemplate] = await db.update(assetTemplates)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(assetTemplates.id, id))
      .returning();
    return updatedTemplate;
  }

  async deleteAssetTemplate(id: number): Promise<boolean> {
    await db.delete(assetTemplates).where(eq(assetTemplates.id, id));
    return true;
  }

  async generateAssetFromTemplate(templateId: number, data: { 
    name: string; 
    campaignId?: number; 
    customData: Record<string, any>; 
    uploadedBy: number 
  }): Promise<Asset> {
    const template = await this.getAssetTemplate(templateId);
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }
    
    // Extract the baseUrl from templateData
    const templateData = template.templateData as any;
    
    // Create a new asset based on the template
    const asset: InsertAsset = {
      name: data.name,
      type: template.type,
      url: templateData.baseUrl,
      uploadedBy: data.uploadedBy,
      campaignId: data.campaignId || null,
      templateId,
      customData: data.customData
    };
    
    return this.createAsset(asset);
  }
  
  // Asset operations
  async getAsset(id: number): Promise<Asset | undefined> {
    const [asset] = await db.select().from(assets).where(eq(assets.id, id));
    return asset;
  }

  async getAssetsByCampaign(campaignId: number): Promise<Asset[]> {
    return await db.select().from(assets)
      .where(eq(assets.campaignId, campaignId))
      .orderBy(desc(assets.createdAt));
  }

  async getAllAssets(): Promise<Asset[]> {
    return await db.select().from(assets).orderBy(desc(assets.createdAt));
  }

  async createAsset(assetData: InsertAsset): Promise<Asset> {
    const [asset] = await db.insert(assets).values(assetData).returning();
    return asset;
  }

  async deleteAsset(id: number): Promise<boolean> {
    await db.delete(assets).where(eq(assets.id, id));
    return true;
  }
  
  // Email Template operations
  async getEmailTemplate(id: number): Promise<EmailTemplate | undefined> {
    const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
    return template;
  }

  async getEmailTemplatesByCampaign(campaignId: number): Promise<EmailTemplate[]> {
    return await db.select().from(emailTemplates)
      .where(eq(emailTemplates.campaignId, campaignId))
      .orderBy(desc(emailTemplates.createdAt));
  }

  async getEmailTemplatesByCategory(category: string): Promise<EmailTemplate[]> {
    return await db.select().from(emailTemplates)
      .where(eq(emailTemplates.category, category))
      .orderBy(desc(emailTemplates.createdAt));
  }

  async getAllEmailTemplates(): Promise<EmailTemplate[]> {
    return await db.select().from(emailTemplates).orderBy(desc(emailTemplates.createdAt));
  }

  async createEmailTemplate(templateData: InsertEmailTemplate): Promise<EmailTemplate> {
    const [template] = await db.insert(emailTemplates).values({
      ...templateData,
      updatedAt: new Date()
    }).returning();
    return template;
  }

  async updateEmailTemplate(id: number, templateData: Partial<EmailTemplate>): Promise<EmailTemplate | undefined> {
    const [updatedTemplate] = await db.update(emailTemplates)
      .set({
        ...templateData,
        updatedAt: new Date()
      })
      .where(eq(emailTemplates.id, id))
      .returning();
    return updatedTemplate;
  }

  async deleteEmailTemplate(id: number): Promise<boolean> {
    await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
    return true;
  }

  async previewEmailTemplate(id: number, data: Record<string, any>): Promise<{ subject: string; htmlContent: string; textContent: string | null }> {
    const template = await this.getEmailTemplate(id);
    if (!template) throw new Error(`Template with id ${id} not found`);
    
    // Replace variables in subject
    let subject = template.subject;
    
    // Replace variables in HTML content
    let htmlContent = template.htmlContent;
    
    // Replace variables in text content
    let textContent = template.textContent;
    
    // Replace all variables with their values
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value as string);
      htmlContent = htmlContent.replace(regex, value as string);
      if (textContent) {
        textContent = textContent.replace(regex, value as string);
      }
    });
    
    return {
      subject,
      htmlContent,
      textContent
    };
  }

  // Campaign Cost operations
  async getCampaignCost(id: number): Promise<CampaignCost | undefined> {
    const [cost] = await db.select().from(campaignCosts).where(eq(campaignCosts.id, id));
    return cost;
  }

  async getCostsByCampaign(campaignId: number): Promise<CampaignCost[]> {
    return await db.select().from(campaignCosts)
      .where(eq(campaignCosts.campaignId, campaignId))
      .orderBy(desc(campaignCosts.date));
  }

  async getCostsForPeriod(startDate: Date, endDate: Date): Promise<CampaignCost[]> {
    return await db.select().from(campaignCosts)
      .where(
        and(
          gte(campaignCosts.date, startDate),
          lte(campaignCosts.date, endDate)
        )
      )
      .orderBy(campaignCosts.date);
  }

  async createCampaignCost(costData: InsertCampaignCost): Promise<CampaignCost> {
    const [cost] = await db.insert(campaignCosts).values(costData).returning();
    
    // Add an activity record for the cost entry
    this.createActivity({
      userId: costData.createdBy,
      campaignId: costData.campaignId,
      actionType: 'cost-added',
      content: `added a ${costData.category} cost of $${(costData.amount / 100).toFixed(2)} to the campaign`
    });
    
    return cost;
  }

  async updateCampaignCost(id: number, costData: Partial<CampaignCost>): Promise<CampaignCost | undefined> {
    const [cost] = await db.select().from(campaignCosts).where(eq(campaignCosts.id, id));
    
    if (!cost) {
      return undefined;
    }
    
    const [updatedCost] = await db.update(campaignCosts)
      .set(costData)
      .where(eq(campaignCosts.id, id))
      .returning();
    
    // Add an activity record for the cost update
    if (costData.createdBy && updatedCost) {
      this.createActivity({
        userId: costData.createdBy,
        campaignId: cost.campaignId,
        actionType: 'cost-updated',
        content: `updated a campaign cost entry (${cost.category})`
      });
    }
    
    return updatedCost;
  }

  async deleteCampaignCost(id: number): Promise<boolean> {
    await db.delete(campaignCosts).where(eq(campaignCosts.id, id));
    return true;
  }

  // Campaign Revenue operations
  async getCampaignRevenue(id: number): Promise<CampaignRevenue | undefined> {
    const [revenue] = await db.select().from(campaignRevenue).where(eq(campaignRevenue.id, id));
    return revenue;
  }

  async getRevenueByCampaign(campaignId: number): Promise<CampaignRevenue[]> {
    return await db.select().from(campaignRevenue)
      .where(eq(campaignRevenue.campaignId, campaignId))
      .orderBy(desc(campaignRevenue.date));
  }

  async getRevenueForPeriod(startDate: Date, endDate: Date): Promise<CampaignRevenue[]> {
    return await db.select().from(campaignRevenue)
      .where(
        and(
          gte(campaignRevenue.date, startDate),
          lte(campaignRevenue.date, endDate)
        )
      )
      .orderBy(campaignRevenue.date);
  }

  async createCampaignRevenue(revenueData: InsertCampaignRevenue): Promise<CampaignRevenue> {
    const [revenue] = await db.insert(campaignRevenue).values(revenueData).returning();
    
    // Add an activity record for the revenue entry
    this.createActivity({
      userId: revenueData.createdBy,
      campaignId: revenueData.campaignId,
      actionType: 'revenue-added',
      content: `recorded $${(revenueData.amount / 100).toFixed(2)} in revenue from ${revenueData.source}`
    });
    
    return revenue;
  }

  async updateCampaignRevenue(id: number, revenueData: Partial<CampaignRevenue>): Promise<CampaignRevenue | undefined> {
    const [revenue] = await db.select().from(campaignRevenue).where(eq(campaignRevenue.id, id));
    
    if (!revenue) {
      return undefined;
    }
    
    const [updatedRevenue] = await db.update(campaignRevenue)
      .set(revenueData)
      .where(eq(campaignRevenue.id, id))
      .returning();
    
    // Add an activity record for the revenue update
    if (revenueData.createdBy && updatedRevenue) {
      this.createActivity({
        userId: revenueData.createdBy,
        campaignId: revenue.campaignId,
        actionType: 'revenue-updated',
        content: `updated a revenue entry from ${revenue.source}`
      });
    }
    
    return updatedRevenue;
  }

  async deleteCampaignRevenue(id: number): Promise<boolean> {
    await db.delete(campaignRevenue).where(eq(campaignRevenue.id, id));
    return true;
  }

  // ROI Analysis operations
  async getCampaignROI(campaignId: number): Promise<{
    campaignId: number;
    totalCost: number;
    totalRevenue: number;
    roi: number;
    conversionRate: number;
    costPerLead: number;
    revenuePerLead: number;
  }> {
    // Get all costs for this campaign
    const costs = await this.getCostsByCampaign(campaignId);
    const totalCost = costs.reduce((sum, cost) => sum + cost.amount, 0);
    
    // Get all revenue for this campaign
    const revenues = await this.getRevenueByCampaign(campaignId);
    const totalRevenue = revenues.reduce((sum, rev) => sum + rev.amount, 0);
    
    // Calculate basic ROI
    const roi = totalCost === 0 ? 0 : ((totalRevenue - totalCost) / totalCost) * 100;
    
    // Get metrics for more detailed analysis
    const metrics = await this.getMetricsByCampaign(campaignId);
    
    // Sum up leads and conversions for all time periods
    const totalLeads = metrics.reduce((sum, metric) => sum + metric.leads, 0);
    const totalConversions = metrics.reduce((sum, metric) => sum + metric.conversions, 0);
    
    // Calculate derived metrics
    const conversionRate = totalLeads === 0 ? 0 : (totalConversions / totalLeads) * 100;
    const costPerLead = totalLeads === 0 ? 0 : totalCost / totalLeads;
    const revenuePerLead = totalLeads === 0 ? 0 : totalRevenue / totalLeads;
    
    return {
      campaignId,
      totalCost,
      totalRevenue,
      roi,
      conversionRate,
      costPerLead,
      revenuePerLead
    };
  }

  async getROIComparison(campaignIds: number[]): Promise<{
    campaignId: number;
    campaignName: string;
    roi: number;
    cost: number;
    revenue: number;
  }[]> {
    const results = [];
    
    for (const campaignId of campaignIds) {
      const campaign = await this.getCampaign(campaignId);
      if (!campaign) continue;
      
      const roi = await this.getCampaignROI(campaignId);
      
      results.push({
        campaignId,
        campaignName: campaign.name,
        roi: roi.roi,
        cost: roi.totalCost,
        revenue: roi.totalRevenue
      });
    }
    
    // Sort by ROI (highest first)
    return results.sort((a, b) => b.roi - a.roi);
  }

  // Client Feedback operations
  async getClientFeedback(id: number): Promise<ClientFeedback | undefined> {
    const [feedback] = await db.select().from(clientFeedback).where(eq(clientFeedback.id, id));
    return feedback;
  }

  async getClientFeedbackByCampaign(campaignId: number): Promise<ClientFeedback[]> {
    return await db.select().from(clientFeedback)
      .where(eq(clientFeedback.campaignId, campaignId))
      .orderBy(desc(clientFeedback.createdAt));
  }

  async getPendingClientFeedback(): Promise<ClientFeedback[]> {
    return await db.select().from(clientFeedback)
      .where(eq(clientFeedback.status, 'pending'))
      .orderBy(desc(clientFeedback.createdAt));
  }

  async createClientFeedback(feedbackData: InsertClientFeedback): Promise<ClientFeedback> {
    const [feedback] = await db.insert(clientFeedback).values({
      ...feedbackData,
      updatedAt: new Date()
    }).returning();
    
    // Log activity for new feedback
    if (feedback.campaignId) {
      const campaign = await this.getCampaign(feedback.campaignId);
      if (campaign) {
        this.createActivity({
          userId: campaign.createdBy, // Assign to campaign creator as a default
          campaignId: feedback.campaignId,
          actionType: 'feedback-received',
          content: `received new client feedback from ${feedback.clientName} with rating ${feedback.rating}/5`
        });
      }
    }
    
    return feedback;
  }

  async updateClientFeedback(id: number, feedbackData: Partial<ClientFeedback>): Promise<ClientFeedback | undefined> {
    // Get current feedback to compare for activity logging
    const [currentFeedback] = await db.select().from(clientFeedback).where(eq(clientFeedback.id, id));
    
    if (!currentFeedback) {
      return undefined;
    }
    
    // Update feedback
    const [updatedFeedback] = await db.update(clientFeedback)
      .set({
        ...feedbackData,
        updatedAt: new Date()
      })
      .where(eq(clientFeedback.id, id))
      .returning();
    
    // Log activity if status changed or a response was added
    if (updatedFeedback && 
        (feedbackData.status !== currentFeedback.status || 
         (feedbackData.response && feedbackData.response !== currentFeedback.response))) {
      
      let actionType = 'feedback-updated';
      let content = 'updated client feedback';
      
      if (feedbackData.status === 'reviewed' && currentFeedback.status === 'pending') {
        actionType = 'feedback-reviewed';
        content = `reviewed feedback from ${currentFeedback.clientName}`;
      } else if (feedbackData.status === 'responded' && feedbackData.response) {
        actionType = 'feedback-responded';
        content = `responded to feedback from ${currentFeedback.clientName}`;
      }
      
      if (feedbackData.reviewedBy) {
        this.createActivity({
          userId: feedbackData.reviewedBy,
          campaignId: currentFeedback.campaignId,
          actionType,
          content
        });
      }
    }
    
    return updatedFeedback;
  }

  async deleteClientFeedback(id: number): Promise<boolean> {
    await db.delete(clientFeedback).where(eq(clientFeedback.id, id));
    return true;
  }

  // Feedback Response Template operations
  async getFeedbackResponseTemplate(id: number): Promise<FeedbackResponseTemplate | undefined> {
    const [template] = await db.select().from(feedbackResponseTemplates).where(eq(feedbackResponseTemplates.id, id));
    return template;
  }

  async getAllFeedbackResponseTemplates(): Promise<FeedbackResponseTemplate[]> {
    return await db.select().from(feedbackResponseTemplates).orderBy(desc(feedbackResponseTemplates.createdAt));
  }

  async getFeedbackResponseTemplatesByCategory(category: string): Promise<FeedbackResponseTemplate[]> {
    return await db.select().from(feedbackResponseTemplates)
      .where(eq(feedbackResponseTemplates.category, category))
      .orderBy(desc(feedbackResponseTemplates.createdAt));
  }

  async createFeedbackResponseTemplate(templateData: InsertFeedbackResponseTemplate): Promise<FeedbackResponseTemplate> {
    const [template] = await db.insert(feedbackResponseTemplates).values({
      ...templateData,
      updatedAt: new Date()
    }).returning();
    return template;
  }

  async updateFeedbackResponseTemplate(id: number, templateData: Partial<FeedbackResponseTemplate>): Promise<FeedbackResponseTemplate | undefined> {
    const [updatedTemplate] = await db.update(feedbackResponseTemplates)
      .set({
        ...templateData,
        updatedAt: new Date()
      })
      .where(eq(feedbackResponseTemplates.id, id))
      .returning();
    return updatedTemplate;
  }

  async deleteFeedbackResponseTemplate(id: number): Promise<boolean> {
    await db.delete(feedbackResponseTemplates).where(eq(feedbackResponseTemplates.id, id));
    return true;
  }

  async previewFeedbackResponseTemplate(id: number, data: Record<string, any>): Promise<{ responseText: string }> {
    const template = await this.getFeedbackResponseTemplate(id);
    if (!template) throw new Error(`Template with id ${id} not found`);
    
    // Replace variables in response text
    let responseText = template.responseText;
    
    // Replace all variables with their values
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      responseText = responseText.replace(regex, value as string);
    });
    
    return { responseText };
  }

  // Feedback Metrics operations
  async getFeedbackMetrics(id: number): Promise<FeedbackMetrics | undefined> {
    const [metrics] = await db.select().from(feedbackMetrics).where(eq(feedbackMetrics.id, id));
    if (!metrics) return undefined;
    
    // Ensure numeric values are returned as strings for type safety
    return {
      ...metrics,
      averageRating: metrics.averageRating.toString(),
      responseRate: metrics.responseRate.toString()
    };
  }

  async getFeedbackMetricsByCampaign(campaignId: number): Promise<FeedbackMetrics[]> {
    const metricsData = await db.select().from(feedbackMetrics)
      .where(eq(feedbackMetrics.campaignId, campaignId))
      .orderBy(feedbackMetrics.date);
    
    // Ensure numeric values are returned as strings for type safety
    return metricsData.map(metrics => ({
      ...metrics,
      averageRating: metrics.averageRating.toString(),
      responseRate: metrics.responseRate.toString()
    }));
  }

  async calculateFeedbackMetrics(campaignId: number, date: Date): Promise<FeedbackMetrics> {
    // Get all feedback for this campaign
    const allFeedback = await this.getClientFeedbackByCampaign(campaignId);
    
    // Calculate metrics
    const totalFeedbackCount = allFeedback.length;
    let totalRating = 0;
    let positiveFeedbackCount = 0;
    let neutralFeedbackCount = 0;
    let negativeFeedbackCount = 0;
    let respondedCount = 0;
    
    allFeedback.forEach(feedback => {
      // Sum ratings
      totalRating += Number(feedback.rating);
      
      // Count by sentiment
      if (Number(feedback.rating) >= 4) {
        positiveFeedbackCount++;
      } else if (Number(feedback.rating) === 3) {
        neutralFeedbackCount++;
      } else {
        negativeFeedbackCount++;
      }
      
      // Count responses
      if (feedback.status === 'responded') {
        respondedCount++;
      }
    });
    
    // Calculate averages
    const averageRating = totalFeedbackCount > 0 ? totalRating / totalFeedbackCount : 0;
    const responseRate = totalFeedbackCount > 0 ? (respondedCount / totalFeedbackCount) * 100 : 0;
    
    // Create metrics record
    const metricsData: InsertFeedbackMetrics = {
      campaignId,
      date,
      averageRating: averageRating.toString(),
      totalFeedbackCount,
      positiveFeedbackCount,
      neutralFeedbackCount, 
      negativeFeedbackCount,
      responseRate: responseRate.toString()
    };
    
    // Save and return metrics
    const [metrics] = await db.insert(feedbackMetrics).values(metricsData).returning();
    return metrics;
  }

  async getLatestFeedbackMetrics(campaignId: number): Promise<FeedbackMetrics | undefined> {
    const [metrics] = await db.select().from(feedbackMetrics)
      .where(eq(feedbackMetrics.campaignId, campaignId))
      .orderBy(desc(feedbackMetrics.date))
      .limit(1);
    
    if (!metrics) return undefined;
    
    // Ensure numeric values are returned as strings for type safety
    return {
      ...metrics,
      averageRating: metrics.averageRating.toString(),
      responseRate: metrics.responseRate.toString()
    };
  }

  async getFeedbackSummary(campaignId: number): Promise<{
    averageRating: number;
    totalCount: number;
    positiveCount: number;
    neutralCount: number;
    negativeCount: number;
    responseRate: number;
    recentFeedback: ClientFeedback[];
  }> {
    // Get latest metrics
    const metrics = await this.getLatestFeedbackMetrics(campaignId);
    
    // Get recent feedback
    const recentFeedback = await db.select().from(clientFeedback)
      .where(eq(clientFeedback.campaignId, campaignId))
      .orderBy(desc(clientFeedback.createdAt))
      .limit(5);
    
    if (!metrics) {
      // Return default values if no metrics exist
      return {
        averageRating: 0,
        totalCount: 0,
        positiveCount: 0,
        neutralCount: 0,
        negativeCount: 0,
        responseRate: 0,
        recentFeedback
      };
    }
    
    return {
      averageRating: Number(metrics.averageRating),
      totalCount: metrics.totalFeedbackCount,
      positiveCount: metrics.positiveFeedbackCount,
      neutralCount: metrics.neutralFeedbackCount,
      negativeCount: metrics.negativeFeedbackCount,
      responseRate: Number(metrics.responseRate),
      recentFeedback
    };
  }

  // Marketing Insights operations
  async getMarketingInsight(id: number): Promise<MarketingInsight | undefined> {
    const [insight] = await db.select().from(marketingInsights).where(eq(marketingInsights.id, id));
    return insight;
  }

  async getMarketingInsightsByCampaign(campaignId: number): Promise<MarketingInsight[]> {
    return await db.select().from(marketingInsights)
      .where(eq(marketingInsights.campaignId, campaignId))
      .orderBy(desc(marketingInsights.createdAt));
  }

  async getAllMarketingInsights(limit?: number): Promise<MarketingInsight[]> {
    const insights = await db.select().from(marketingInsights)
      .orderBy(desc(marketingInsights.createdAt));
    
    if (limit) {
      return insights.slice(0, limit);
    }
    
    return insights;
  }

  async createMarketingInsight(insightData: InsertMarketingInsight): Promise<MarketingInsight> {
    const [insight] = await db.insert(marketingInsights).values({
      ...insightData,
      createdAt: new Date()
    }).returning();
    
    // Add an activity record for the insight creation
    if (insightData.campaignId) {
      this.createActivity({
        userId: insightData.createdBy,
        campaignId: insightData.campaignId,
        actionType: 'insight-created',
        content: `generated new marketing insights: ${insightData.summary.substring(0, 50)}...`
      });
    }
    
    return insight;
  }

  async deleteMarketingInsight(id: number): Promise<boolean> {
    await db.delete(marketingInsights).where(eq(marketingInsights.id, id));
    return true;
  }
  
  // User Branding operations
  async getUserBranding(userId: number): Promise<UserBranding | undefined> {
    const [branding] = await db.select().from(userBranding).where(eq(userBranding.userId, userId));
    return branding;
  }

  async createUserBranding(brandingData: InsertUserBranding): Promise<UserBranding> {
    const [branding] = await db.insert(userBranding).values(brandingData).returning();
    return branding;
  }

  async updateUserBranding(userId: number, brandingData: Partial<UserBranding>): Promise<UserBranding | undefined> {
    const [updatedBranding] = await db.update(userBranding)
      .set({
        ...brandingData,
        updatedAt: new Date()
      })
      .where(eq(userBranding.userId, userId))
      .returning();
    return updatedBranding;
  }
  
  // Shared Insights operations
  async getSharedInsight(shareCode: string): Promise<SharedInsight | undefined> {
    const [sharedInsight] = await db.select().from(sharedInsights)
      .where(eq(sharedInsights.shareCode, shareCode));
    return sharedInsight;
  }

  async getSharedInsightsByUser(userId: number): Promise<SharedInsight[]> {
    return await db.select().from(sharedInsights)
      .where(eq(sharedInsights.userId, userId))
      .orderBy(desc(sharedInsights.createdAt));
  }

  async createSharedInsight(insightData: InsertSharedInsight): Promise<SharedInsight> {
    const [sharedInsight] = await db.insert(sharedInsights).values({
      ...insightData,
      views: 0, // Initialize views count
      updatedAt: new Date()
    }).returning();
    return sharedInsight;
  }

  async updateSharedInsight(id: number, insightData: Partial<SharedInsight>): Promise<SharedInsight | undefined> {
    const [updatedInsight] = await db.update(sharedInsights)
      .set({
        ...insightData,
        updatedAt: new Date()
      })
      .where(eq(sharedInsights.id, id))
      .returning();
    return updatedInsight;
  }
  
  async incrementSharedInsightViews(shareCode: string): Promise<SharedInsight | undefined> {
    // First, find the shared insight
    const [sharedInsight] = await db.select().from(sharedInsights)
      .where(eq(sharedInsights.shareCode, shareCode));
    
    if (!sharedInsight) {
      return undefined;
    }
    
    // Update the view count and last viewed timestamp
    const [updatedInsight] = await db.update(sharedInsights)
      .set({
        views: (sharedInsight.views || 0) + 1,
        lastViewed: new Date(),
        updatedAt: new Date()
      })
      .where(eq(sharedInsights.shareCode, shareCode))
      .returning();
    
    return updatedInsight;
  }

  async deleteSharedInsight(id: number): Promise<boolean> {
    await db.delete(sharedInsights).where(eq(sharedInsights.id, id));
    return true;
  }
}