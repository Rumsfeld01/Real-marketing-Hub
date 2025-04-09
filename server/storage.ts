import { 
  users, User, InsertUser,
  campaigns, Campaign, InsertCampaign,
  campaignMembers, CampaignMember, InsertCampaignMember,
  tasks, Task, InsertTask,
  activities, Activity, InsertActivity,
  metrics, Metric, InsertMetric,
  assets, Asset, InsertAsset,
  assetTemplates, AssetTemplate, InsertAssetTemplate,
  emailTemplates, EmailTemplate, InsertEmailTemplate,
  campaignCosts, CampaignCost, InsertCampaignCost,
  campaignRevenue, CampaignRevenue, InsertCampaignRevenue,
  clientFeedback, ClientFeedback, InsertClientFeedback,
  feedbackResponseTemplates, FeedbackResponseTemplate, InsertFeedbackResponseTemplate,
  feedbackMetrics, FeedbackMetrics, InsertFeedbackMetrics,
  marketingInsights, MarketingInsight, InsertMarketingInsight,
  notificationPreferences, NotificationPreference, InsertNotificationPreference
} from "@shared/schema";

import { addDays, format } from "date-fns";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // User Branding operations
  getUserBranding(userId: number): Promise<UserBranding | undefined>;
  createUserBranding(branding: InsertUserBranding): Promise<UserBranding>;
  updateUserBranding(userId: number, branding: Partial<UserBranding>): Promise<UserBranding | undefined>;

  // Shared Insights operations
  getSharedInsight(shareCode: string): Promise<SharedInsight | undefined>;
  getSharedInsightsByUser(userId: number): Promise<SharedInsight[]>;
  createSharedInsight(insight: InsertSharedInsight): Promise<SharedInsight>;
  updateSharedInsight(id: number, insight: Partial<SharedInsight>): Promise<SharedInsight | undefined>;
  incrementSharedInsightViews(shareCode: string): Promise<SharedInsight | undefined>;
  deleteSharedInsight(id: number): Promise<boolean>;

  // Campaign operations
  getCampaign(id: number): Promise<Campaign | undefined>;
  getAllCampaigns(): Promise<Campaign[]>;
  getActiveCampaigns(): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaign: Partial<Campaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: number): Promise<boolean>;

  // Campaign Member operations
  addMemberToCampaign(member: InsertCampaignMember): Promise<CampaignMember>;
  getCampaignMembers(campaignId: number): Promise<CampaignMember[]>;
  removeMemberFromCampaign(campaignId: number, userId: number): Promise<boolean>;

  // Task operations
  getTask(id: number): Promise<Task | undefined>;
  getAllTasks(): Promise<Task[]>;
  getTasksByCampaign(campaignId: number): Promise<Task[]>;
  getUpcomingTasks(limit?: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;

  // Activity operations
  getActivity(id: number): Promise<Activity | undefined>;
  getAllActivities(limit?: number): Promise<Activity[]>;
  getActivitiesByCampaign(campaignId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Metric operations
  getMetric(id: number): Promise<Metric | undefined>;
  getMetricsByCampaign(campaignId: number): Promise<Metric[]>;
  getMetricsForPeriod(startDate: Date, endDate: Date): Promise<Metric[]>;
  createMetric(metric: InsertMetric): Promise<Metric>;
  
  // Asset Template operations
  getAssetTemplate(id: number): Promise<AssetTemplate | undefined>;
  getAssetTemplatesByCategory(category: string): Promise<AssetTemplate[]>;
  getAssetTemplatesByType(type: string): Promise<AssetTemplate[]>;
  getAllAssetTemplates(): Promise<AssetTemplate[]>;
  createAssetTemplate(template: InsertAssetTemplate): Promise<AssetTemplate>;
  updateAssetTemplate(id: number, template: Partial<AssetTemplate>): Promise<AssetTemplate | undefined>;
  deleteAssetTemplate(id: number): Promise<boolean>;
  generateAssetFromTemplate(templateId: number, data: { 
    name: string; 
    campaignId?: number; 
    customData: Record<string, any>; 
    uploadedBy: number 
  }): Promise<Asset>;
  
  // Asset operations
  getAsset(id: number): Promise<Asset | undefined>;
  getAssetsByCampaign(campaignId: number): Promise<Asset[]>;
  getAllAssets(): Promise<Asset[]>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  deleteAsset(id: number): Promise<boolean>;
  
  // Email Template operations
  getEmailTemplate(id: number): Promise<EmailTemplate | undefined>;
  getEmailTemplatesByCampaign(campaignId: number): Promise<EmailTemplate[]>;
  getEmailTemplatesByCategory(category: string): Promise<EmailTemplate[]>;
  getAllEmailTemplates(): Promise<EmailTemplate[]>;
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  updateEmailTemplate(id: number, template: Partial<EmailTemplate>): Promise<EmailTemplate | undefined>;
  deleteEmailTemplate(id: number): Promise<boolean>;
  previewEmailTemplate(id: number, data: Record<string, any>): Promise<{ subject: string; htmlContent: string; textContent: string | null }>;
  
  // Campaign Cost operations
  getCampaignCost(id: number): Promise<CampaignCost | undefined>;
  getCostsByCampaign(campaignId: number): Promise<CampaignCost[]>;
  getCostsForPeriod(startDate: Date, endDate: Date): Promise<CampaignCost[]>;
  createCampaignCost(cost: InsertCampaignCost): Promise<CampaignCost>;
  updateCampaignCost(id: number, cost: Partial<CampaignCost>): Promise<CampaignCost | undefined>;
  deleteCampaignCost(id: number): Promise<boolean>;
  
  // Campaign Revenue operations
  getCampaignRevenue(id: number): Promise<CampaignRevenue | undefined>;
  getRevenueByCampaign(campaignId: number): Promise<CampaignRevenue[]>;
  getRevenueForPeriod(startDate: Date, endDate: Date): Promise<CampaignRevenue[]>;
  createCampaignRevenue(revenue: InsertCampaignRevenue): Promise<CampaignRevenue>;
  updateCampaignRevenue(id: number, revenue: Partial<CampaignRevenue>): Promise<CampaignRevenue | undefined>;
  deleteCampaignRevenue(id: number): Promise<boolean>;
  
  // ROI Analysis operations
  getCampaignROI(campaignId: number): Promise<{
    campaignId: number;
    totalCost: number;
    totalRevenue: number;
    roi: number;
    conversionRate: number;
    costPerLead: number;
    revenuePerLead: number;
  }>;
  getROIComparison(campaignIds: number[]): Promise<{
    campaignId: number;
    campaignName: string;
    roi: number;
    cost: number;
    revenue: number;
  }[]>;

  // Client Feedback operations
  getClientFeedback(id: number): Promise<ClientFeedback | undefined>;
  getClientFeedbackByCampaign(campaignId: number): Promise<ClientFeedback[]>;
  getPendingClientFeedback(): Promise<ClientFeedback[]>;
  createClientFeedback(feedback: InsertClientFeedback): Promise<ClientFeedback>;
  updateClientFeedback(id: number, feedback: Partial<ClientFeedback>): Promise<ClientFeedback | undefined>;
  deleteClientFeedback(id: number): Promise<boolean>;

  // Feedback Response Template operations
  getFeedbackResponseTemplate(id: number): Promise<FeedbackResponseTemplate | undefined>;
  getAllFeedbackResponseTemplates(): Promise<FeedbackResponseTemplate[]>;
  getFeedbackResponseTemplatesByCategory(category: string): Promise<FeedbackResponseTemplate[]>;
  createFeedbackResponseTemplate(template: InsertFeedbackResponseTemplate): Promise<FeedbackResponseTemplate>;
  updateFeedbackResponseTemplate(id: number, template: Partial<FeedbackResponseTemplate>): Promise<FeedbackResponseTemplate | undefined>;
  deleteFeedbackResponseTemplate(id: number): Promise<boolean>;
  previewFeedbackResponseTemplate(id: number, data: Record<string, any>): Promise<{ responseText: string }>;

  // Feedback Metrics operations
  getFeedbackMetrics(id: number): Promise<FeedbackMetrics | undefined>;
  getFeedbackMetricsByCampaign(campaignId: number): Promise<FeedbackMetrics[]>;
  calculateFeedbackMetrics(campaignId: number, date: Date): Promise<FeedbackMetrics>;
  getLatestFeedbackMetrics(campaignId: number): Promise<FeedbackMetrics | undefined>;
  getFeedbackSummary(campaignId: number): Promise<{
    averageRating: number;
    totalCount: number;
    positiveCount: number;
    neutralCount: number;
    negativeCount: number;
    responseRate: number;
    recentFeedback: ClientFeedback[];
  }>;
  
  // Marketing Insights operations
  getMarketingInsight(id: number): Promise<MarketingInsight | undefined>;
  getMarketingInsightsByCampaign(campaignId: number): Promise<MarketingInsight[]>;
  getAllMarketingInsights(limit?: number): Promise<MarketingInsight[]>;
  createMarketingInsight(insight: InsertMarketingInsight): Promise<MarketingInsight>;
  deleteMarketingInsight(id: number): Promise<boolean>;
  
  // Notification Preferences operations
  getNotificationPreference(userId: number): Promise<NotificationPreference | undefined>;
  createNotificationPreference(preferences: InsertNotificationPreference): Promise<NotificationPreference>;
  updateNotificationPreference(userId: number, preferences: Partial<NotificationPreference>): Promise<NotificationPreference | undefined>;
  matchInsightWithPreferences(insight: MarketingInsight): Promise<number[]>; // Returns array of user IDs that match
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private campaigns: Map<number, Campaign>;
  private campaignMembers: Map<number, CampaignMember>;
  private tasks: Map<number, Task>;
  private activities: Map<number, Activity>;
  private metrics: Map<number, Metric>;
  private assets: Map<number, Asset>;
  private assetTemplates: Map<number, AssetTemplate>;
  private emailTemplates: Map<number, EmailTemplate>;
  private campaignCosts: Map<number, CampaignCost>;
  private campaignRevenues: Map<number, CampaignRevenue>;
  private clientFeedback: Map<number, ClientFeedback>;
  private feedbackResponseTemplates: Map<number, FeedbackResponseTemplate>;
  private feedbackMetrics: Map<number, FeedbackMetrics>;
  private marketingInsights: Map<number, MarketingInsight>;
  private notificationPreferences: Map<number, NotificationPreference>;
  private userBranding: Map<number, UserBranding>;
  private sharedInsights: Map<number, SharedInsight>;

  private userIdCounter: number;
  private campaignIdCounter: number;
  private campaignMemberIdCounter: number;
  private taskIdCounter: number;
  private activityIdCounter: number;
  private metricIdCounter: number;
  private assetIdCounter: number;
  private assetTemplateIdCounter: number;
  private emailTemplateIdCounter: number;
  private campaignCostIdCounter: number;
  private campaignRevenueIdCounter: number;
  private clientFeedbackIdCounter: number;
  private feedbackResponseTemplateIdCounter: number;
  private feedbackMetricsIdCounter: number;
  private marketingInsightIdCounter: number;
  private notificationPreferenceIdCounter: number;
  private userBrandingIdCounter: number;
  private sharedInsightIdCounter: number;

  constructor() {
    this.users = new Map();
    this.campaigns = new Map();
    this.campaignMembers = new Map();
    this.tasks = new Map();
    this.activities = new Map();
    this.metrics = new Map();
    this.assets = new Map();
    this.assetTemplates = new Map();
    this.emailTemplates = new Map();
    this.campaignCosts = new Map();
    this.campaignRevenues = new Map();
    this.clientFeedback = new Map();
    this.feedbackResponseTemplates = new Map();
    this.feedbackMetrics = new Map();
    this.marketingInsights = new Map();
    this.notificationPreferences = new Map();
    this.userBranding = new Map();
    this.sharedInsights = new Map();

    this.userIdCounter = 1;
    this.campaignIdCounter = 1;
    this.campaignMemberIdCounter = 1;
    this.taskIdCounter = 1;
    this.activityIdCounter = 1;
    this.metricIdCounter = 1;
    this.assetIdCounter = 1;
    this.assetTemplateIdCounter = 1;
    this.emailTemplateIdCounter = 1;
    this.campaignCostIdCounter = 1;
    this.campaignRevenueIdCounter = 1;
    this.clientFeedbackIdCounter = 1;
    this.feedbackResponseTemplateIdCounter = 1;
    this.feedbackMetricsIdCounter = 1;
    this.marketingInsightIdCounter = 1;
    this.notificationPreferenceIdCounter = 1;
    this.userBrandingIdCounter = 1;
    this.sharedInsightIdCounter = 1;

    // Seed data for development
    this.seedData();
  }

  private seedData() {
    // Seed users
    const user1: InsertUser = {
      username: 'jane.doe',
      password: 'password',
      name: 'Jane Doe',
      role: 'Lead Agent',
      initials: 'JD'
    };
    const user2: InsertUser = {
      username: 'robert.smith',
      password: 'password',
      name: 'Robert Smith',
      role: 'Agent',
      initials: 'RS'
    };
    const user3: InsertUser = {
      username: 'alice.johnson',
      password: 'password',
      name: 'Alice Johnson',
      role: 'Marketing Specialist',
      initials: 'AJ'
    };

    const seedUser1 = this.createUser(user1);
    const seedUser2 = this.createUser(user2);
    const seedUser3 = this.createUser(user3);

    // Seed campaigns
    const campaign1: InsertCampaign = {
      name: 'Spring Listings Showcase',
      description: 'Email and social campaign for new spring property listings.',
      status: 'active',
      startDate: new Date(),
      endDate: addDays(new Date(), 14),
      progress: 67,
      budget: 5000,
      targetAudience: 'First-time home buyers',
      channels: ['email', 'social', 'web'],
      createdBy: 1
    };

    const campaign2: InsertCampaign = {
      name: 'Downtown Open Houses',
      description: 'Weekend open house event for downtown luxury properties.',
      status: 'active',
      startDate: new Date(),
      endDate: addDays(new Date(), 5),
      progress: 45,
      budget: 3000,
      targetAudience: 'Luxury home buyers',
      channels: ['email', 'print', 'events'],
      createdBy: 2
    };

    const campaign3: InsertCampaign = {
      name: 'Luxury Property Showcase',
      description: 'Multi-channel campaign featuring high-end properties in the bay area.',
      status: 'active',
      startDate: new Date(),
      endDate: addDays(new Date(), 30),
      progress: 12,
      budget: 10000,
      targetAudience: 'High-net-worth individuals',
      channels: ['email', 'social', 'print', 'events'],
      createdBy: 1
    };

    const seedCampaign1 = this.createCampaign(campaign1);
    const seedCampaign2 = this.createCampaign(campaign2);
    const seedCampaign3 = this.createCampaign(campaign3);

    // Seed campaign members
    this.addMemberToCampaign({ campaignId: 1, userId: 1 });
    this.addMemberToCampaign({ campaignId: 1, userId: 2 });
    this.addMemberToCampaign({ campaignId: 1, userId: 3 });
    this.addMemberToCampaign({ campaignId: 2, userId: 2 });
    this.addMemberToCampaign({ campaignId: 3, userId: 1 });
    this.addMemberToCampaign({ campaignId: 3, userId: 3 });

    // Seed tasks
    const task1: InsertTask = {
      title: 'Update campaign visuals',
      description: 'Refresh all visuals for the spring campaign',
      campaignId: 1,
      assigneeId: 3,
      dueDate: new Date(),
      priority: 'urgent',
      completed: false
    };

    const task2: InsertTask = {
      title: 'Coordinate with photographer',
      description: 'Set up property photo shoots for the weekend',
      campaignId: 2,
      assigneeId: 2,
      dueDate: addDays(new Date(), 1),
      priority: 'high',
      completed: false
    };

    const task3: InsertTask = {
      title: 'Review ad copy',
      description: 'Review and approve the copy for magazine ads',
      campaignId: 3,
      assigneeId: 1,
      dueDate: addDays(new Date(), 2),
      priority: 'medium',
      completed: false
    };

    const task4: InsertTask = {
      title: 'Schedule social media posts',
      description: 'Create and schedule social posts for the week',
      campaignId: 1,
      assigneeId: 3,
      dueDate: addDays(new Date(), 3),
      priority: 'low',
      completed: false
    };

    const task5: InsertTask = {
      title: 'Prepare email newsletter',
      description: 'Draft the weekly newsletter featuring open houses',
      campaignId: 2,
      assigneeId: 2,
      dueDate: addDays(new Date(), 4),
      priority: 'low',
      completed: false
    };

    this.createTask(task1);
    this.createTask(task2);
    this.createTask(task3);
    this.createTask(task4);
    this.createTask(task5);

    // Seed activities
    const activity1: InsertActivity = {
      userId: 2,
      campaignId: 2,
      actionType: 'update',
      content: 'added 5 new properties to Downtown Open Houses'
    };

    const activity2: InsertActivity = {
      userId: 1,
      campaignId: 3,
      actionType: 'create',
      content: 'launched Luxury Property Showcase'
    };

    const activity3: InsertActivity = {
      userId: 3,
      campaignId: 1,
      actionType: 'comment',
      content: 'commented on Spring Listings Showcase: "We should add more family homes to this campaign. Currently too focused on condos."'
    };

    const activity4: InsertActivity = {
      userId: 3,
      campaignId: 3,
      actionType: 'update',
      content: 'updated the targeting for Luxury Property Showcase'
    };

    this.createActivity(activity1);
    this.createActivity(activity2);
    this.createActivity(activity3);
    this.createActivity(activity4);

    // Seed metrics
    // Create metrics for the last 8 weeks for each campaign
    const today = new Date();
    
    for (let i = 0; i < 8; i++) {
      const date = addDays(today, -i * 7);
      
      // Campaign 1 metrics
      this.createMetric({
        campaignId: 1,
        date,
        leads: Math.floor(Math.random() * 30) + 10,
        views: Math.floor(Math.random() * 1000) + 500,
        clicks: Math.floor(Math.random() * 200) + 100,
        conversions: Math.floor(Math.random() * 10) + 5
      });
      
      // Campaign 2 metrics
      this.createMetric({
        campaignId: 2,
        date,
        leads: Math.floor(Math.random() * 20) + 5,
        views: Math.floor(Math.random() * 800) + 300,
        clicks: Math.floor(Math.random() * 150) + 50,
        conversions: Math.floor(Math.random() * 8) + 2
      });
      
      // Campaign 3 metrics
      this.createMetric({
        campaignId: 3,
        date,
        leads: Math.floor(Math.random() * 15) + 3,
        views: Math.floor(Math.random() * 600) + 200,
        clicks: Math.floor(Math.random() * 100) + 30,
        conversions: Math.floor(Math.random() * 5) + 1
      });
    }

    // Seed assets
    const asset1: InsertAsset = {
      name: 'Spring Campaign Banner',
      type: 'image',
      url: 'https://example.com/spring-banner.jpg',
      campaignId: 1,
      uploadedBy: 1
    };

    const asset2: InsertAsset = {
      name: 'Downtown Properties Brochure',
      type: 'document',
      url: 'https://example.com/downtown-brochure.pdf',
      campaignId: 2,
      uploadedBy: 2
    };

    const asset3: InsertAsset = {
      name: 'Luxury Homes Video Tour',
      type: 'video',
      url: 'https://example.com/luxury-tour.mp4',
      campaignId: 3,
      uploadedBy: 1
    };

    this.createAsset(asset1);
    this.createAsset(asset2);
    this.createAsset(asset3);

    // Seed email templates
    const template1: InsertEmailTemplate = {
      name: 'New Listing Announcement',
      subject: 'New Property Just Listed: {{propertyAddress}}',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2a4365;">New Property Just Listed!</h1>
          <h2>{{propertyAddress}}</h2>
          <div style="margin: 20px 0;">
            <img src="{{propertyImageUrl}}" alt="{{propertyAddress}}" style="max-width: 100%; height: auto;" />
          </div>
          <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px;">
            <p><strong>Price:</strong> {{propertyPrice}}</p>
            <p><strong>Bedrooms:</strong> {{bedrooms}}</p>
            <p><strong>Bathrooms:</strong> {{bathrooms}}</p>
            <p><strong>Square Footage:</strong> {{squareFootage}}</p>
          </div>
          <div style="margin-top: 20px;">
            <p>{{propertyDescription}}</p>
          </div>
          <div style="margin-top: 30px; text-align: center;">
            <a href="{{viewingScheduleUrl}}" style="background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Schedule a Viewing</a>
          </div>
          <div style="margin-top: 30px; font-size: 14px; color: #718096;">
            <p>Contact: {{agentName}}</p>
            <p>Phone: {{agentPhone}}</p>
            <p>Email: {{agentEmail}}</p>
          </div>
        </div>
      `,
      textContent: 'New Property Just Listed: {{propertyAddress}}\\n\\nPrice: {{propertyPrice}}\\nBedrooms: {{bedrooms}}\\nBathrooms: {{bathrooms}}\\nSquare Footage: {{squareFootage}}\\n\\n{{propertyDescription}}\\n\\nSchedule a viewing: {{viewingScheduleUrl}}\\n\\nContact: {{agentName}}\\nPhone: {{agentPhone}}\\nEmail: {{agentEmail}}',
      category: 'property-listing',
      variables: [
        'propertyAddress', 'propertyImageUrl', 'propertyPrice', 'bedrooms', 
        'bathrooms', 'squareFootage', 'propertyDescription', 'viewingScheduleUrl', 
        'agentName', 'agentPhone', 'agentEmail'
      ],
      createdBy: 1,
      campaignId: 1
    };

    const template2: InsertEmailTemplate = {
      name: 'Open House Invitation',
      subject: 'You\'re Invited: Open House at {{propertyAddress}}',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2a4365;">Open House Invitation</h1>
          <div style="background-color: #ebf8ff; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h2 style="margin-top: 0;">{{propertyAddress}}</h2>
            <p><strong>Date:</strong> {{openHouseDate}}</p>
            <p><strong>Time:</strong> {{openHouseTime}}</p>
          </div>
          <div style="margin: 20px 0;">
            <img src="{{propertyImageUrl}}" alt="{{propertyAddress}}" style="max-width: 100%; height: auto;" />
          </div>
          <div style="margin-top: 20px;">
            <p>Join us for an open house at this beautiful property in {{neighborhood}}.</p>
            <p>{{propertyDescription}}</p>
            <ul>
              <li>{{feature1}}</li>
              <li>{{feature2}}</li>
              <li>{{feature3}}</li>
            </ul>
          </div>
          <div style="margin-top: 30px; text-align: center;">
            <a href="{{rsvpUrl}}" style="background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">RSVP Now</a>
          </div>
          <div style="margin-top: 30px; font-size: 14px; color: #718096;">
            <p>Hosted by: {{agentName}}</p>
            <p>Phone: {{agentPhone}}</p>
            <p>Email: {{agentEmail}}</p>
          </div>
        </div>
      `,
      textContent: 'Open House Invitation\\n\\n{{propertyAddress}}\\n\\nDate: {{openHouseDate}}\\nTime: {{openHouseTime}}\\n\\nJoin us for an open house at this beautiful property in {{neighborhood}}.\\n\\n{{propertyDescription}}\\n\\n* {{feature1}}\\n* {{feature2}}\\n* {{feature3}}\\n\\nRSVP Now: {{rsvpUrl}}\\n\\nHosted by: {{agentName}}\\nPhone: {{agentPhone}}\\nEmail: {{agentEmail}}',
      category: 'open-house',
      variables: [
        'propertyAddress', 'openHouseDate', 'openHouseTime', 'propertyImageUrl', 
        'neighborhood', 'propertyDescription', 'feature1', 'feature2', 'feature3', 
        'rsvpUrl', 'agentName', 'agentPhone', 'agentEmail'
      ],
      createdBy: 2,
      campaignId: 2
    };
    
    const template3: InsertEmailTemplate = {
      name: 'Market Update Newsletter',
      subject: '{{month}} Real Estate Market Update for {{location}}',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2a4365;">{{month}} Real Estate Market Update</h1>
          <h2>{{location}}</h2>
          
          <div style="margin: 20px 0;">
            <h3>Market Overview</h3>
            <p>{{marketOverview}}</p>
          </div>
          
          <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Key Statistics</h3>
            <p><strong>Average Sale Price:</strong> {{avgSalePrice}}</p>
            <p><strong>Median Sale Price:</strong> {{medianSalePrice}}</p>
            <p><strong>Homes Sold:</strong> {{homesSold}}</p>
            <p><strong>Average Days on Market:</strong> {{avgDaysOnMarket}}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3>Hot Neighborhoods</h3>
            <ol>
              <li>{{hotNeighborhood1}}</li>
              <li>{{hotNeighborhood2}}</li>
              <li>{{hotNeighborhood3}}</li>
            </ol>
          </div>
          
          <div style="margin: 20px 0;">
            <h3>Featured Listings</h3>
            <p>{{featuredListingDescription}}</p>
            <div style="text-align: center; margin-top: 15px;">
              <a href="{{featuredListingsUrl}}" style="background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Featured Listings</a>
            </div>
          </div>
          
          <div style="margin-top: 30px; font-size: 14px; color: #718096; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <p>This market update is provided by {{agencyName}}</p>
            <p>Contact us at {{agencyPhone}} or {{agencyEmail}}</p>
            <p><a href="{{unsubscribeUrl}}">Unsubscribe</a> | <a href="{{preferencesUrl}}">Update Preferences</a></p>
          </div>
        </div>
      `,
      textContent: '{{month}} Real Estate Market Update - {{location}}\\n\\nMarket Overview:\\n{{marketOverview}}\\n\\nKey Statistics:\\n- Average Sale Price: {{avgSalePrice}}\\n- Median Sale Price: {{medianSalePrice}}\\n- Homes Sold: {{homesSold}}\\n- Average Days on Market: {{avgDaysOnMarket}}\\n\\nHot Neighborhoods:\\n1. {{hotNeighborhood1}}\\n2. {{hotNeighborhood2}}\\n3. {{hotNeighborhood3}}\\n\\nFeatured Listings:\\n{{featuredListingDescription}}\\n\\nView Featured Listings: {{featuredListingsUrl}}\\n\\nThis market update is provided by {{agencyName}}\\nContact us at {{agencyPhone}} or {{agencyEmail}}\\n\\nUnsubscribe: {{unsubscribeUrl}}\\nUpdate Preferences: {{preferencesUrl}}',
      category: 'newsletter',
      variables: [
        'month', 'location', 'marketOverview', 'avgSalePrice', 'medianSalePrice', 
        'homesSold', 'avgDaysOnMarket', 'hotNeighborhood1', 'hotNeighborhood2', 
        'hotNeighborhood3', 'featuredListingDescription', 'featuredListingsUrl', 
        'agencyName', 'agencyPhone', 'agencyEmail', 'unsubscribeUrl', 'preferencesUrl'
      ],
      createdBy: 1,
      campaignId: 3
    };

    this.createEmailTemplate(template1);
    this.createEmailTemplate(template2);
    this.createEmailTemplate(template3);
    
    // Seed asset templates
    const assetTemplate1: InsertAssetTemplate = {
      name: 'Property Flyer Template',
      type: 'flyer',
      category: 'property-marketing',
      previewUrl: 'https://example.com/thumbnails/property-flyer.jpg',
      templateData: {
        baseUrl: 'https://example.com/templates/property-flyer.svg',
        description: 'A customizable flyer template for property listings',
        dimensions: { width: 1200, height: 1800 },
        layout: 'portrait',
        sections: [
          { id: 'header', type: 'text', position: { x: 0, y: 0 }, size: { width: 1200, height: 200 } },
          { id: 'image', type: 'image', position: { x: 0, y: 200 }, size: { width: 1200, height: 800 } },
          { id: 'details', type: 'details', position: { x: 0, y: 1000 }, size: { width: 1200, height: 400 } },
          { id: 'footer', type: 'contact', position: { x: 0, y: 1400 }, size: { width: 1200, height: 400 } }
        ]
      },
      variables: {
        propertyTitle: { type: 'string', required: true },
        propertyImage: { type: 'image', required: true },
        price: { type: 'string', required: true },
        bedrooms: { type: 'number', required: true },
        bathrooms: { type: 'number', required: true },
        squareFeet: { type: 'number', required: true },
        description: { type: 'text', required: true },
        agentName: { type: 'string', required: true },
        agentPhone: { type: 'string', required: true },
        agentEmail: { type: 'string', required: true },
        brokerageLogo: { type: 'image', required: false }
      },
      createdBy: 1,
      isPublic: true
    };
    
    const assetTemplate2: InsertAssetTemplate = {
      name: 'Open House Sign Template',
      type: 'sign',
      category: 'event-marketing',
      previewUrl: 'https://example.com/thumbnails/open-house-sign.jpg',
      templateData: {
        baseUrl: 'https://example.com/templates/open-house-sign.svg',
        description: 'Customizable open house directional sign',
        dimensions: { width: 800, height: 1200 },
        layout: 'portrait',
        sections: [
          { id: 'header', type: 'text', position: { x: 0, y: 0 }, size: { width: 800, height: 200 } },
          { id: 'address', type: 'text', position: { x: 0, y: 200 }, size: { width: 800, height: 300 } },
          { id: 'arrow', type: 'arrow', position: { x: 0, y: 500 }, size: { width: 800, height: 400 } },
          { id: 'time', type: 'text', position: { x: 0, y: 900 }, size: { width: 800, height: 200 } },
          { id: 'footer', type: 'contact', position: { x: 0, y: 1100 }, size: { width: 800, height: 100 } }
        ]
      },
      variables: {
        address: { type: 'string', required: true },
        date: { type: 'string', required: true },
        time: { type: 'string', required: true },
        agentName: { type: 'string', required: true },
        agentPhone: { type: 'string', required: true },
        arrowDirection: { type: 'select', options: ['left', 'right', 'up', 'down'], required: true },
        brokerageLogo: { type: 'image', required: false }
      },
      createdBy: 2,
      isPublic: true
    };
    
    const assetTemplate3: InsertAssetTemplate = {
      name: 'Social Media Property Card',
      type: 'social-card',
      category: 'digital-marketing',
      previewUrl: 'https://example.com/thumbnails/social-property-card.jpg',
      templateData: {
        baseUrl: 'https://example.com/templates/social-property-card.svg',
        description: 'Eye-catching social media card for property listings',
        dimensions: { width: 1200, height: 628 },
        layout: 'landscape',
        sections: [
          { id: 'background', type: 'rectangle', position: { x: 0, y: 0 }, size: { width: 1200, height: 628 } },
          { id: 'property-image', type: 'image', position: { x: 0, y: 0 }, size: { width: 600, height: 628 } },
          { id: 'headline', type: 'text', position: { x: 620, y: 50 }, size: { width: 560, height: 150 } },
          { id: 'price', type: 'text', position: { x: 620, y: 220 }, size: { width: 560, height: 80 } },
          { id: 'location', type: 'text', position: { x: 620, y: 320 }, size: { width: 560, height: 80 } },
          { id: 'cta', type: 'button', position: { x: 620, y: 450 }, size: { width: 300, height: 80 } },
          { id: 'logo', type: 'image', position: { x: 950, y: 550 }, size: { width: 200, height: 60 } }
        ]
      },
      variables: {
        propertyImage: { type: 'image', required: true },
        headline: { type: 'string', required: true },
        price: { type: 'string', required: true },
        location: { type: 'string', required: true },
        callToAction: { type: 'string', required: false, default: 'Learn More' },
        backgroundColor: { type: 'color', required: false, default: '#4A90E2' },
        textColor: { type: 'color', required: false, default: '#FFFFFF' },
        brokerageLogo: { type: 'image', required: false }
      },
      createdBy: 1,
      isPublic: true
    };
    
    this.createAssetTemplate(assetTemplate1);
    this.createAssetTemplate(assetTemplate2);
    this.createAssetTemplate(assetTemplate3);

    // Seed marketing insights
    const insightTrends1 = [
      {
        trend: "Virtual Home Tours",
        description: "Immersive 3D virtual tours are becoming essential for luxury property marketing",
        relevance: 9,
        recommendation: "Invest in high-quality virtual tour technology for all luxury listings",
        category: "technology"
      },
      {
        trend: "Sustainability Focus",
        description: "Growing interest in eco-friendly features and sustainable materials",
        relevance: 8,
        recommendation: "Highlight energy efficiency and sustainable features in property descriptions",
        category: "consumer-preference"
      },
      {
        trend: "Video Marketing",
        description: "Short-form video content performing exceptionally well for property showcasing",
        relevance: 9,
        recommendation: "Create 60-second highlight videos for each luxury property",
        category: "marketing-channel"
      }
    ];

    const marketingInsight1: InsertMarketingInsight = {
      insightId: "ins_lux_spring2023",
      createdBy: 1,
      summary: "Luxury real estate marketing trends for Spring 2023 indicate strong preference for digital immersive experiences and sustainability messaging.",
      insights: insightTrends1,
      targetMarket: "High-net-worth individuals",
      propertyType: "Luxury homes",
      priceRange: "$1.5M - $5M",
      location: "Bay Area",
      keywords: ["luxury", "sustainability", "virtual tours", "video marketing"],
      campaignId: 3
    };

    const insightTrends2 = [
      {
        trend: "First-time Buyer Incentives",
        description: "Increased interest in programs and financing options for first-time buyers",
        relevance: 8,
        recommendation: "Create educational content about mortgage options and buyer assistance programs",
        category: "financing"
      },
      {
        trend: "Local Community Focus",
        description: "Growing emphasis on neighborhood amenities and community features",
        relevance: 7,
        recommendation: "Develop neighborhood guides highlighting schools, parks, and local businesses",
        category: "location-value"
      },
      {
        trend: "Social Proof Marketing",
        description: "Testimonials and success stories driving engagement and trust",
        relevance: 8,
        recommendation: "Include client success stories in every email campaign",
        category: "marketing-strategy"
      }
    ];

    const marketingInsight2: InsertMarketingInsight = {
      insightId: "ins_spring_listings_2023",
      createdBy: 1,
      summary: "First-time homebuyers are increasingly looking for community-focused properties with strong educational resources and financing guidance.",
      insights: insightTrends2,
      targetMarket: "First-time home buyers",
      propertyType: "Single-family homes, Condos",
      priceRange: "$350K - $750K",
      location: "Metropolitan suburbs",
      keywords: ["first-time buyers", "community", "education", "financing"],
      campaignId: 1
    };
    
    // Seed notification preferences
    const notificationPreference1: InsertNotificationPreference = {
      userId: 1,
      enabled: true,
      categories: ['luxury', 'commercial'],
      propertyTypes: ['luxury', 'commercial'],
      locations: ['Coastal Regions', 'Metropolitan Areas'],
      keywordMatches: ['luxury', 'high-end', 'investment'],
      relevanceThreshold: 3,
      emailNotifications: true,
      appNotifications: true,
      frequencyLimit: 'daily'
    };
    
    const notificationPreference2: InsertNotificationPreference = {
      userId: 2,
      enabled: true,
      categories: ['residential', 'neighborhood'],
      propertyTypes: ['residential', 'condo'],
      locations: ['Urban Centers', 'Suburban Areas'],
      keywordMatches: ['first-time buyer', 'millennial', 'affordable'],
      relevanceThreshold: 2,
      emailNotifications: true,
      appNotifications: true,
      frequencyLimit: 'immediate'
    };
    
    const notificationPreference3: InsertNotificationPreference = {
      userId: 3,
      enabled: true,
      categories: ['residential', 'luxury', 'commercial', 'neighborhood'],
      propertyTypes: ['residential', 'luxury', 'commercial', 'condo'],
      locations: ['Coastal Regions', 'Urban Centers', 'Suburban Areas', 'Metropolitan Areas'],
      keywordMatches: ['luxury', 'high-end', 'first-time buyer', 'millennial', 'investment', 'trending'],
      relevanceThreshold: 1,
      emailNotifications: true,
      appNotifications: true,
      frequencyLimit: 'immediate'
    };
    
    this.createNotificationPreference(notificationPreference1);
    this.createNotificationPreference(notificationPreference2);
    this.createNotificationPreference(notificationPreference3);

    // Create marketing insights after notification preferences are set up
    // This will trigger the matching logic and log the matched users
    this.createMarketingInsight(marketingInsight1);
    this.createMarketingInsight(marketingInsight2);

    // Seed user branding
    const userBranding1: InsertUserBranding = {
      userId: 1, // Jane Doe
      logoUrl: "https://example.com/logos/jd-realty.png",
      primaryColor: "#4a90e2",
      secondaryColor: "#5cb85c",
      fontFamily: "Montserrat, sans-serif",
      companyName: "JD Realty Group",
      tagline: "Your Trusted Partner in Real Estate",
      websiteUrl: "https://jd-realty.example.com",
      emailSignature: "<div>Jane Doe | Lead Agent<br>JD Realty Group<br>555-123-4567</div>",
      socialLinks: {
        facebook: "https://facebook.com/jd-realty",
        instagram: "https://instagram.com/jd-realty",
        linkedin: "https://linkedin.com/in/jane-doe-realty"
      }
    };

    const userBranding2: InsertUserBranding = {
      userId: 2, // Robert Smith
      logoUrl: "https://example.com/logos/smith-properties.png",
      primaryColor: "#9c27b0",
      secondaryColor: "#ff9800",
      fontFamily: "Roboto, sans-serif",
      companyName: "Smith Properties",
      tagline: "Exceptional Homes, Exceptional Service",
      websiteUrl: "https://smith-properties.example.com",
      emailSignature: "<div>Robert Smith | Agent<br>Smith Properties<br>555-987-6543</div>",
      socialLinks: {
        facebook: "https://facebook.com/smith-properties",
        twitter: "https://twitter.com/smith-properties"
      }
    };

    this.createUserBranding(userBranding1);
    this.createUserBranding(userBranding2);

    // Create a shared insight
    const insight = this.marketingInsights.get(1);
    if (insight) {
      const sharedInsight: InsertSharedInsight = {
        insightId: insight.id,
        userId: 1, // Shared by Jane Doe
        shareCode: "mkt-insight-2023-q1",
        title: "Q1 2023 Market Trends - Shared by JD Realty",
        customMessage: "I thought you might find this market analysis interesting. Let me know if you'd like to discuss how these trends could impact your property decisions.",
        useBranding: true,
        shareUrl: "https://app.example.com/shared/mkt-insight-2023-q1",
        recipientEmails: ["client1@example.com", "client2@example.com"],
        status: "active",
        expiresAt: new Date(new Date().setDate(new Date().getDate() + 30)) // Expires in 30 days
      };
      
      this.createSharedInsight(sharedInsight);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...userData, id };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Campaign operations
  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async getAllCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values());
  }

  async getActiveCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).filter(
      (campaign) => campaign.status === 'active'
    );
  }

  async createCampaign(campaignData: InsertCampaign): Promise<Campaign> {
    const id = this.campaignIdCounter++;
    const campaign: Campaign = { 
      ...campaignData, 
      id,
      createdAt: new Date()
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: number, campaignData: Partial<Campaign>): Promise<Campaign | undefined> {
    const campaign = await this.getCampaign(id);
    if (!campaign) return undefined;

    const updatedCampaign = { ...campaign, ...campaignData };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    return this.campaigns.delete(id);
  }

  // Campaign Member operations
  async addMemberToCampaign(memberData: InsertCampaignMember): Promise<CampaignMember> {
    const id = this.campaignMemberIdCounter++;
    const member: CampaignMember = { ...memberData, id };
    this.campaignMembers.set(id, member);
    return member;
  }

  async getCampaignMembers(campaignId: number): Promise<CampaignMember[]> {
    return Array.from(this.campaignMembers.values()).filter(
      (member) => member.campaignId === campaignId
    );
  }

  async removeMemberFromCampaign(campaignId: number, userId: number): Promise<boolean> {
    const member = Array.from(this.campaignMembers.values()).find(
      (m) => m.campaignId === campaignId && m.userId === userId
    );
    if (!member) return false;
    return this.campaignMembers.delete(member.id);
  }

  // Task operations
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTasksByCampaign(campaignId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.campaignId === campaignId
    );
  }

  async getUpcomingTasks(limit?: number): Promise<Task[]> {
    const tasks = Array.from(this.tasks.values())
      .filter(task => !task.completed)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    
    return limit ? tasks.slice(0, limit) : tasks;
  }

  async createTask(taskData: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const task: Task = { 
      ...taskData, 
      id,
      createdAt: new Date()
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, taskData: Partial<Task>): Promise<Task | undefined> {
    const task = await this.getTask(id);
    if (!task) return undefined;

    const updatedTask = { ...task, ...taskData };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Activity operations
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async getAllActivities(limit?: number): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return limit ? activities.slice(0, limit) : activities;
  }

  async getActivitiesByCampaign(campaignId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.campaignId === campaignId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const activity: Activity = { 
      ...activityData, 
      id,
      createdAt: new Date() 
    };
    this.activities.set(id, activity);
    return activity;
  }

  // Metric operations
  async getMetric(id: number): Promise<Metric | undefined> {
    return this.metrics.get(id);
  }

  async getMetricsByCampaign(campaignId: number): Promise<Metric[]> {
    return Array.from(this.metrics.values())
      .filter(metric => metric.campaignId === campaignId)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async getMetricsForPeriod(startDate: Date, endDate: Date): Promise<Metric[]> {
    return Array.from(this.metrics.values())
      .filter(metric => 
        metric.date.getTime() >= startDate.getTime() && 
        metric.date.getTime() <= endDate.getTime()
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async createMetric(metricData: InsertMetric): Promise<Metric> {
    const id = this.metricIdCounter++;
    const metric: Metric = { ...metricData, id };
    this.metrics.set(id, metric);
    return metric;
  }

  // Asset Template operations
  async getAssetTemplate(id: number): Promise<AssetTemplate | undefined> {
    return this.assetTemplates.get(id);
  }

  async getAssetTemplatesByCategory(category: string): Promise<AssetTemplate[]> {
    return Array.from(this.assetTemplates.values()).filter(
      (template) => template.category === category
    );
  }

  async getAssetTemplatesByType(type: string): Promise<AssetTemplate[]> {
    return Array.from(this.assetTemplates.values()).filter(
      (template) => template.type === type
    );
  }

  async getAllAssetTemplates(): Promise<AssetTemplate[]> {
    return Array.from(this.assetTemplates.values());
  }

  async createAssetTemplate(templateData: InsertAssetTemplate): Promise<AssetTemplate> {
    const id = this.assetTemplateIdCounter++;
    const now = new Date();
    const template: AssetTemplate = {
      id,
      createdAt: now,
      updatedAt: now,
      ...templateData,
      campaignId: templateData.campaignId || null,
    };
    this.assetTemplates.set(id, template);
    return template;
  }

  async updateAssetTemplate(id: number, data: Partial<AssetTemplate>): Promise<AssetTemplate | undefined> {
    const template = this.assetTemplates.get(id);
    if (!template) {
      return undefined;
    }
    
    const updatedTemplate: AssetTemplate = {
      ...template,
      ...data,
      updatedAt: new Date()
    };
    this.assetTemplates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteAssetTemplate(id: number): Promise<boolean> {
    return this.assetTemplates.delete(id);
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
    
    // Create a new asset based on the template
    const asset: InsertAsset = {
      name: data.name,
      type: template.type,
      url: template.templateData.baseUrl,
      uploadedBy: data.uploadedBy,
      campaignId: data.campaignId,
      templateId,
      customData: data.customData
    };
    
    return this.createAsset(asset);
  }
  
  // Asset operations
  async getAsset(id: number): Promise<Asset | undefined> {
    return this.assets.get(id);
  }

  async getAssetsByCampaign(campaignId: number): Promise<Asset[]> {
    return Array.from(this.assets.values())
      .filter(asset => asset.campaignId === campaignId);
  }

  async getAllAssets(): Promise<Asset[]> {
    return Array.from(this.assets.values());
  }

  async createAsset(assetData: InsertAsset): Promise<Asset> {
    const id = this.assetIdCounter++;
    const asset: Asset = { 
      ...assetData, 
      id,
      createdAt: new Date() 
    };
    this.assets.set(id, asset);
    return asset;
  }

  async deleteAsset(id: number): Promise<boolean> {
    return this.assets.delete(id);
  }

  // Email Template operations
  async getEmailTemplate(id: number): Promise<EmailTemplate | undefined> {
    return this.emailTemplates.get(id);
  }

  async getEmailTemplatesByCampaign(campaignId: number): Promise<EmailTemplate[]> {
    return Array.from(this.emailTemplates.values())
      .filter(template => template.campaignId === campaignId);
  }

  async getEmailTemplatesByCategory(category: string): Promise<EmailTemplate[]> {
    return Array.from(this.emailTemplates.values())
      .filter(template => template.category === category);
  }

  async getAllEmailTemplates(): Promise<EmailTemplate[]> {
    return Array.from(this.emailTemplates.values());
  }

  async createEmailTemplate(templateData: InsertEmailTemplate): Promise<EmailTemplate> {
    const id = this.emailTemplateIdCounter++;
    const template: EmailTemplate = {
      ...templateData,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.emailTemplates.set(id, template);
    return template;
  }

  async updateEmailTemplate(id: number, templateData: Partial<EmailTemplate>): Promise<EmailTemplate | undefined> {
    const template = await this.getEmailTemplate(id);
    if (!template) return undefined;

    const updatedTemplate = { 
      ...template, 
      ...templateData,
      updatedAt: new Date()
    };
    this.emailTemplates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteEmailTemplate(id: number): Promise<boolean> {
    return this.emailTemplates.delete(id);
  }

  async previewEmailTemplate(id: number, data: Record<string, any>): Promise<{ subject: string; htmlContent: string; textContent: string | null }> {
    const template = await this.getEmailTemplate(id);
    if (!template) throw new Error(`Template with id ${id} not found`);
    
    // Replace variables in subject
    let subject = template.subject;
    
    // Replace variables in HTML content
    let htmlContent = template.htmlContent;
    
    // Replace variables in text content
    let textContent = template.textContent || null;
    
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
    return this.campaignCosts.get(id);
  }

  async getCostsByCampaign(campaignId: number): Promise<CampaignCost[]> {
    return Array.from(this.campaignCosts.values()).filter(
      (cost) => cost.campaignId === campaignId
    );
  }

  async getCostsForPeriod(startDate: Date, endDate: Date): Promise<CampaignCost[]> {
    return Array.from(this.campaignCosts.values()).filter(
      (cost) => cost.date >= startDate && cost.date <= endDate
    );
  }

  async createCampaignCost(costData: InsertCampaignCost): Promise<CampaignCost> {
    const id = this.campaignCostIdCounter++;
    const cost: CampaignCost = {
      id,
      ...costData,
      createdAt: new Date(),
    };

    this.campaignCosts.set(id, cost);
    
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
    const cost = this.campaignCosts.get(id);
    
    if (!cost) {
      return undefined;
    }

    const updatedCost = {
      ...cost,
      ...costData,
    };

    this.campaignCosts.set(id, updatedCost);
    
    // Add an activity record for the cost update
    if (costData.createdBy) {
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
    const cost = this.campaignCosts.get(id);
    
    if (!cost) {
      return false;
    }
    
    return this.campaignCosts.delete(id);
  }

  // Campaign Revenue operations
  async getCampaignRevenue(id: number): Promise<CampaignRevenue | undefined> {
    return this.campaignRevenues.get(id);
  }

  async getRevenueByCampaign(campaignId: number): Promise<CampaignRevenue[]> {
    return Array.from(this.campaignRevenues.values()).filter(
      (revenue) => revenue.campaignId === campaignId
    );
  }

  async getRevenueForPeriod(startDate: Date, endDate: Date): Promise<CampaignRevenue[]> {
    return Array.from(this.campaignRevenues.values()).filter(
      (revenue) => revenue.date >= startDate && revenue.date <= endDate
    );
  }

  async createCampaignRevenue(revenueData: InsertCampaignRevenue): Promise<CampaignRevenue> {
    const id = this.campaignRevenueIdCounter++;
    const revenue: CampaignRevenue = {
      id,
      ...revenueData,
      createdAt: new Date(),
    };

    this.campaignRevenues.set(id, revenue);
    
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
    const revenue = this.campaignRevenues.get(id);
    
    if (!revenue) {
      return undefined;
    }

    const updatedRevenue = {
      ...revenue,
      ...revenueData,
    };

    this.campaignRevenues.set(id, updatedRevenue);
    
    // Add an activity record for the revenue update
    if (revenueData.createdBy) {
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
    const revenue = this.campaignRevenues.get(id);
    
    if (!revenue) {
      return false;
    }
    
    return this.campaignRevenues.delete(id);
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
    return this.clientFeedback.get(id);
  }

  async getClientFeedbackByCampaign(campaignId: number): Promise<ClientFeedback[]> {
    return Array.from(this.clientFeedback.values())
      .filter(feedback => feedback.campaignId === campaignId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPendingClientFeedback(): Promise<ClientFeedback[]> {
    return Array.from(this.clientFeedback.values())
      .filter(feedback => feedback.status === 'pending')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createClientFeedback(feedbackData: InsertClientFeedback): Promise<ClientFeedback> {
    const id = this.clientFeedbackIdCounter++;
    const now = new Date();
    
    const feedback: ClientFeedback = {
      id,
      createdAt: now,
      updatedAt: now,
      ...feedbackData,
      status: feedbackData.status || 'pending',
      response: feedbackData.response || null,
      reviewedBy: feedbackData.reviewedBy || null
    };
    
    this.clientFeedback.set(id, feedback);
    
    // Log activity for new feedback
    if (feedback.campaignId) {
      const campaign = this.campaigns.get(feedback.campaignId);
      if (campaign) {
        this.createActivity({
          userId: campaign.createdBy,
          campaignId: feedback.campaignId,
          actionType: 'feedback-received',
          content: `received new client feedback from ${feedback.clientName} with rating ${feedback.rating}/5`
        });
      }
    }
    
    return feedback;
  }

  async updateClientFeedback(id: number, feedbackData: Partial<ClientFeedback>): Promise<ClientFeedback | undefined> {
    const currentFeedback = this.clientFeedback.get(id);
    
    if (!currentFeedback) {
      return undefined;
    }
    
    const updatedFeedback: ClientFeedback = {
      ...currentFeedback,
      ...feedbackData,
      updatedAt: new Date()
    };
    
    this.clientFeedback.set(id, updatedFeedback);
    
    // Log activity if status changed or a response was added
    if (feedbackData.status !== currentFeedback.status || 
       (feedbackData.response && feedbackData.response !== currentFeedback.response)) {
      
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
    return this.clientFeedback.delete(id);
  }

  // Feedback Response Template operations
  async getFeedbackResponseTemplate(id: number): Promise<FeedbackResponseTemplate | undefined> {
    return this.feedbackResponseTemplates.get(id);
  }

  async getAllFeedbackResponseTemplates(): Promise<FeedbackResponseTemplate[]> {
    return Array.from(this.feedbackResponseTemplates.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getFeedbackResponseTemplatesByCategory(category: string): Promise<FeedbackResponseTemplate[]> {
    return Array.from(this.feedbackResponseTemplates.values())
      .filter(template => template.category === category)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createFeedbackResponseTemplate(templateData: InsertFeedbackResponseTemplate): Promise<FeedbackResponseTemplate> {
    const id = this.feedbackResponseTemplateIdCounter++;
    const now = new Date();
    
    const template: FeedbackResponseTemplate = {
      id,
      createdAt: now,
      updatedAt: now,
      ...templateData
    };
    
    this.feedbackResponseTemplates.set(id, template);
    return template;
  }

  async updateFeedbackResponseTemplate(id: number, templateData: Partial<FeedbackResponseTemplate>): Promise<FeedbackResponseTemplate | undefined> {
    const currentTemplate = this.feedbackResponseTemplates.get(id);
    
    if (!currentTemplate) {
      return undefined;
    }
    
    const updatedTemplate: FeedbackResponseTemplate = {
      ...currentTemplate,
      ...templateData,
      updatedAt: new Date()
    };
    
    this.feedbackResponseTemplates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteFeedbackResponseTemplate(id: number): Promise<boolean> {
    return this.feedbackResponseTemplates.delete(id);
  }

  async previewFeedbackResponseTemplate(id: number, data: Record<string, any>): Promise<{ responseText: string }> {
    const template = this.feedbackResponseTemplates.get(id);
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
    return this.feedbackMetrics.get(id);
  }

  async getFeedbackMetricsByCampaign(campaignId: number): Promise<FeedbackMetrics[]> {
    return Array.from(this.feedbackMetrics.values())
      .filter(metrics => metrics.campaignId === campaignId)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
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
    
    // Create a new metrics record
    const id = this.feedbackMetricsIdCounter++;
    const metrics: FeedbackMetrics = {
      id,
      campaignId,
      date,
      averageRating: averageRating.toString(),
      totalFeedbackCount,
      positiveFeedbackCount,
      neutralFeedbackCount,
      negativeFeedbackCount,
      responseRate: responseRate.toString(),
      createdAt: new Date()
    };
    
    this.feedbackMetrics.set(id, metrics);
    return metrics;
  }

  async getLatestFeedbackMetrics(campaignId: number): Promise<FeedbackMetrics | undefined> {
    const metrics = Array.from(this.feedbackMetrics.values())
      .filter(m => m.campaignId === campaignId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return metrics.length > 0 ? metrics[0] : undefined;
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
    const allFeedback = Array.from(this.clientFeedback.values())
      .filter(feedback => feedback.campaignId === campaignId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    const recentFeedback = allFeedback.slice(0, 5);
    
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
    return this.marketingInsights.get(id);
  }

  async getMarketingInsightsByCampaign(campaignId: number): Promise<MarketingInsight[]> {
    return Array.from(this.marketingInsights.values())
      .filter(insight => insight.campaignId === campaignId);
  }

  async getAllMarketingInsights(limit?: number): Promise<MarketingInsight[]> {
    const insights = Array.from(this.marketingInsights.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (limit) {
      return insights.slice(0, limit);
    }
    
    return insights;
  }

  async createMarketingInsight(insight: InsertMarketingInsight): Promise<MarketingInsight> {
    const id = this.marketingInsightIdCounter++;
    const createdAt = new Date();
    
    const newInsight: MarketingInsight = {
      id,
      createdAt,
      ...insight
    };
    
    this.marketingInsights.set(id, newInsight);
    
    // Match with notification preferences and notify users
    const matchedUserIds = await this.matchInsightWithPreferences(newInsight);
    
    if (matchedUserIds.length > 0) {
      console.log(`Marketing insight "${newInsight.title}" matches preferences for ${matchedUserIds.length} users:`, matchedUserIds);
      
      // Get notification preferences for each matched user
      const matchedUsers = await Promise.all(
        matchedUserIds.map(async (userId) => {
          const user = this.users.get(userId);
          const preferences = await this.getNotificationPreference(userId);
          return { user, preferences };
        })
      );
      
      // Find the broadcastNotification function that's defined in routes.ts
      let broadcastNotification;
      try {
        // Check if we're in a Node.js environment (not a browser)
        if (typeof global !== 'undefined') {
          // This is a workaround since we can't directly access functions from other modules
          broadcastNotification = (global as any).broadcastNotification;
        }
      } catch (e) {
        console.log("Could not access broadcastNotification function:", e);
      }
      
      // Create activities and log notifications that would be sent
      matchedUsers.forEach(({ user, preferences }) => {
        if (user && preferences) {
          console.log(`Would send notification to ${user.username} (ID: ${user.id}):`);
          console.log(`  - Insight: "${newInsight.title}"`);
          console.log(`  - Email notifications: ${preferences.emailNotifications ? 'Yes' : 'No'}`);
          console.log(`  - App notifications: ${preferences.appNotifications ? 'Yes' : 'No'}`);
          console.log(`  - Frequency: ${preferences.frequencyLimit}`);
          
          // Create an activity for the user about this insight
          this.createActivity({
            userId: user.id,
            campaignId: newInsight.campaignId || 1, // Default to a campaign if not specified
            actionType: 'insight-notification',
            content: `New marketing insight: "${newInsight.title}" matches your notification preferences`
          });
          
          // If app notifications are enabled, broadcast a WebSocket notification
          if (preferences.appNotifications && broadcastNotification) {
            const notification = {
              id: `insight-${newInsight.id}-${user.id}`,
              userId: user.id,
              title: "New Marketing Insight",
              message: `"${newInsight.title}" matches your notification preferences`,
              type: "insight",
              category: newInsight.category,
              timestamp: new Date(),
              read: false,
              link: `/marketing-insights/${newInsight.id}`,
              data: {
                insightId: newInsight.id,
                relevance: newInsight.relevance || 5
              }
            };
            
            broadcastNotification(notification);
            console.log(`WebSocket notification sent to user ${user.id} for insight ${newInsight.id}`);
          }
        }
      });
    } else {
      console.log(`No users matched for insight "${newInsight.title}"`);
    }
    
    return newInsight;
  }

  async deleteMarketingInsight(id: number): Promise<boolean> {
    return this.marketingInsights.delete(id);
  }
  
  // Notification Preferences operations
  async getNotificationPreference(userId: number): Promise<NotificationPreference | undefined> {
    // Find notification preference by userId
    for (const preference of this.notificationPreferences.values()) {
      if (preference.userId === userId) {
        return preference;
      }
    }
    return undefined;
  }
  
  async createNotificationPreference(preferences: InsertNotificationPreference): Promise<NotificationPreference> {
    const id = this.notificationPreferenceIdCounter++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const newPreference: NotificationPreference = {
      id,
      createdAt,
      updatedAt,
      ...preferences
    };
    
    this.notificationPreferences.set(id, newPreference);
    return newPreference;
  }
  
  async updateNotificationPreference(userId: number, preferences: Partial<NotificationPreference>): Promise<NotificationPreference | undefined> {
    // Find notification preference by userId
    let userPreference: NotificationPreference | undefined;
    let preferenceId: number | undefined;
    
    for (const [id, preference] of this.notificationPreferences.entries()) {
      if (preference.userId === userId) {
        userPreference = preference;
        preferenceId = id;
        break;
      }
    }
    
    if (!userPreference || !preferenceId) {
      return undefined;
    }
    
    const updatedPreference: NotificationPreference = {
      ...userPreference,
      ...preferences,
      updatedAt: new Date()
    };
    
    this.notificationPreferences.set(preferenceId, updatedPreference);
    return updatedPreference;
  }
  
  async matchInsightWithPreferences(insight: MarketingInsight): Promise<number[]> {
    const matchedUserIds: number[] = [];
    
    // Get all users with notification preferences
    for (const preference of this.notificationPreferences.values()) {
      if (!preference.enabled) continue;
      
      let matches = true;
      let relevanceScore = 0;
      
      // Check property type matches
      if (preference.propertyTypes.length > 0 && insight.propertyType) {
        if (!preference.propertyTypes.includes(insight.propertyType)) {
          matches = false;
        } else {
          relevanceScore++;
        }
      }
      
      // Check location matches
      if (preference.locations.length > 0 && insight.location) {
        const locationMatches = preference.locations.some(
          location => insight.location?.toLowerCase().includes(location.toLowerCase())
        );
        if (!locationMatches) {
          matches = false;
        } else {
          relevanceScore++;
        }
      }
      
      // Check categories matches
      if (preference.categories.length > 0 && insight.category) {
        const categoryMatches = preference.categories.includes(insight.category);
        
        if (!categoryMatches) {
          matches = false;
        } else {
          relevanceScore += 2; // Categories are more important
        }
      }
      
      // Check keyword matches
      if (preference.keywordMatches.length > 0 && insight.keywords) {
        const insightKeywords = Array.isArray(insight.keywords) 
          ? insight.keywords 
          : [];
        
        const keywordMatches = preference.keywordMatches.some(
          keyword => insightKeywords.includes(keyword)
        );
        
        if (keywordMatches) {
          relevanceScore += 3; // Keywords are very important
        }
      }
      
      // Additional relevance from summary content
      if (insight.summary) {
        for (const keyword of preference.keywordMatches) {
          if (insight.summary.toLowerCase().includes(keyword.toLowerCase())) {
            relevanceScore += 1;
          }
        }
      }
      
      // Check if overall relevance meets user's threshold
      if (matches && relevanceScore >= preference.relevanceThreshold) {
        matchedUserIds.push(preference.userId);
      }
    }
    
    return matchedUserIds;
  }

  // User Branding methods
  async getUserBranding(userId: number): Promise<UserBranding | undefined> {
    // Find by userId, not by id
    return Array.from(this.userBranding.values()).find(
      b => b.userId === userId
    );
  }

  async createUserBranding(branding: InsertUserBranding): Promise<UserBranding> {
    const id = this.userBrandingIdCounter++;
    const now = new Date();
    
    const newBranding: UserBranding = {
      id,
      ...branding,
      createdAt: now,
      updatedAt: now
    };
    
    this.userBranding.set(id, newBranding);
    return newBranding;
  }

  async updateUserBranding(userId: number, branding: Partial<UserBranding>): Promise<UserBranding | undefined> {
    // First find by userId, not by ID
    const existingBranding = Array.from(this.userBranding.values()).find(
      b => b.userId === userId
    );
    
    if (!existingBranding) {
      return undefined;
    }
    
    const updatedBranding: UserBranding = {
      ...existingBranding,
      ...branding,
      updatedAt: new Date()
    };
    
    this.userBranding.set(existingBranding.id, updatedBranding);
    return updatedBranding;
  }

  // Shared Insights methods
  async getSharedInsight(shareCode: string): Promise<SharedInsight | undefined> {
    return Array.from(this.sharedInsights.values()).find(
      s => s.shareCode === shareCode
    );
  }

  async getSharedInsightsByUser(userId: number): Promise<SharedInsight[]> {
    return Array.from(this.sharedInsights.values()).filter(
      s => s.userId === userId
    );
  }

  async createSharedInsight(insight: InsertSharedInsight): Promise<SharedInsight> {
    const id = this.sharedInsightIdCounter++;
    const now = new Date();
    
    const newSharedInsight: SharedInsight = {
      id,
      ...insight,
      views: 0,
      createdAt: now,
      updatedAt: now
    };
    
    this.sharedInsights.set(id, newSharedInsight);
    return newSharedInsight;
  }

  async updateSharedInsight(id: number, insight: Partial<SharedInsight>): Promise<SharedInsight | undefined> {
    const existingInsight = this.sharedInsights.get(id);
    
    if (!existingInsight) {
      return undefined;
    }
    
    const updatedInsight: SharedInsight = {
      ...existingInsight,
      ...insight,
      updatedAt: new Date()
    };
    
    this.sharedInsights.set(id, updatedInsight);
    return updatedInsight;
  }

  async incrementSharedInsightViews(shareCode: string): Promise<SharedInsight | undefined> {
    const sharedInsight = Array.from(this.sharedInsights.values()).find(
      s => s.shareCode === shareCode
    );
    
    if (!sharedInsight) {
      return undefined;
    }
    
    const updatedInsight: SharedInsight = {
      ...sharedInsight,
      views: sharedInsight.views + 1,
      lastViewed: new Date(),
      updatedAt: new Date()
    };
    
    this.sharedInsights.set(sharedInsight.id, updatedInsight);
    return updatedInsight;
  }

  async deleteSharedInsight(id: number): Promise<boolean> {
    return this.sharedInsights.delete(id);
  }
}

// Import the DatabaseStorage implementation
import { DatabaseStorage } from './database-storage';

// Use MemStorage for now to test notification preferences
export const storage = new MemStorage();

// When ready to use the database, uncomment this line
// export const storage = new DatabaseStorage();
