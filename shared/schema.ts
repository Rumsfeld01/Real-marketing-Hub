import { pgTable, text, serial, integer, boolean, timestamp, jsonb, primaryKey, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  initials: text("initials").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
  initials: true,
});

// Campaign schema
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(), // active, draft, completed, archived
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  progress: integer("progress").notNull().default(0),
  budget: integer("budget").notNull().default(0),
  targetAudience: text("target_audience"),
  channels: jsonb("channels").notNull(),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCampaignSchema = createInsertSchema(campaigns).pick({
  name: true,
  description: true,
  status: true,
  startDate: true,
  endDate: true,
  progress: true,
  budget: true,
  targetAudience: true,
  channels: true,
  createdBy: true,
});

// Campaign Team Member schema - used to define which users are assigned to which campaigns
export const campaignMembers = pgTable("campaign_members", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  userId: integer("user_id").notNull(),
});

export const insertCampaignMemberSchema = createInsertSchema(campaignMembers).pick({
  campaignId: true,
  userId: true,
});

// Task schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  campaignId: integer("campaign_id").notNull(),
  assigneeId: integer("assignee_id"),
  dueDate: timestamp("due_date").notNull(),
  priority: text("priority").notNull(), // urgent, high, medium, low
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  campaignId: true,
  assigneeId: true,
  dueDate: true,
  priority: true,
  completed: true,
});

// Activity schema
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  campaignId: integer("campaign_id"),
  actionType: text("action_type").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true, 
  campaignId: true,
  actionType: true,
  content: true,
});

// Campaign Performance Metrics schema
export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  date: timestamp("date").notNull(),
  leads: integer("leads").notNull().default(0),
  views: integer("views").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  conversions: integer("conversions").notNull().default(0),
});

export const insertMetricSchema = createInsertSchema(metrics).pick({
  campaignId: true,
  date: true,
  leads: true,
  views: true,
  clicks: true,
  conversions: true,
});

// Campaign Cost Tracking schema
export const campaignCosts = pgTable("campaign_costs", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  date: timestamp("date").notNull(),
  amount: integer("amount").notNull(), // Amount in cents
  category: text("category").notNull(), // advertising, design, print, etc.
  description: text("description").notNull(),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCampaignCostSchema = createInsertSchema(campaignCosts)
  .extend({
    date: z.coerce.date(),
  })
  .pick({
    campaignId: true,
    date: true,
    amount: true,
    category: true,
    description: true,
    createdBy: true,
  });

// Campaign Revenue Tracking schema
export const campaignRevenue = pgTable("campaign_revenue", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  date: timestamp("date").notNull(),
  amount: integer("amount").notNull(), // Amount in cents
  source: text("source").notNull(), // direct sale, referral, etc.
  propertyValue: integer("property_value").notNull().default(0), // Property value in cents
  commissionRate: integer("commission_rate").notNull().default(300), // Commission rate in basis points (300 = 3%)
  description: text("description").notNull(),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCampaignRevenueSchema = createInsertSchema(campaignRevenue)
  .extend({
    date: z.coerce.date(),
  })
  .pick({
    campaignId: true,
    date: true,
    amount: true,
    source: true,
    propertyValue: true,
    commissionRate: true,
    description: true,
    createdBy: true,
  });

// Asset Template schema
export const assetTemplates = pgTable("asset_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // image, document, video, flyer, brochure, postcard, social-post
  category: text("category").notNull(), // listing, open-house, general-marketing, etc.
  previewUrl: text("preview_url").notNull(),
  templateData: jsonb("template_data").notNull(), // Structure, variables, and design elements
  variables: jsonb("variables").notNull(), // JSON array of the variables used in template
  createdBy: integer("created_by").notNull(),
  isPublic: boolean("is_public").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAssetTemplateSchema = createInsertSchema(assetTemplates).pick({
  name: true,
  type: true,
  category: true,
  previewUrl: true,
  templateData: true,
  variables: true,
  createdBy: true,
  isPublic: true,
});

// Asset schema
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // image, document, video
  url: text("url").notNull(),
  campaignId: integer("campaign_id"),
  uploadedBy: integer("uploaded_by").notNull(),
  templateId: integer("template_id"), // Reference to template used (if any)
  customData: jsonb("custom_data"), // Custom data used to generate this asset
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAssetSchema = createInsertSchema(assets).pick({
  name: true,
  type: true,
  url: true,
  campaignId: true,
  uploadedBy: true,
  templateId: true,
  customData: true,
});

// Email Template schema
export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  htmlContent: text("html_content").notNull(),
  textContent: text("text_content"),
  category: text("category").notNull(), // marketing, notification, follow-up, etc.
  variables: jsonb("variables").notNull(), // JSON array of the variables used in template
  createdBy: integer("created_by").notNull(),
  campaignId: integer("campaign_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).pick({
  name: true,
  subject: true,
  htmlContent: true,
  textContent: true,
  category: true,
  variables: true,
  createdBy: true,
  campaignId: true,
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  campaignMembers: many(campaignMembers),
  tasks: many(tasks, { relationName: "assignee" }),
  activities: many(activities),
  assets: many(assets, { relationName: "uploader" }),
  createdCampaigns: many(campaigns, { relationName: "creator" }),
  assetTemplates: many(assetTemplates),
  notificationPreferences: one(notificationPreferences),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  creator: one(users, {
    fields: [campaigns.createdBy],
    references: [users.id],
    relationName: "creator",
  }),
  members: many(campaignMembers),
  tasks: many(tasks),
  activities: many(activities),
  metrics: many(metrics),
  assets: many(assets),
  emailTemplates: many(emailTemplates),
  costs: many(campaignCosts),
  revenue: many(campaignRevenue),
  feedback: many(clientFeedback),
  feedbackMetrics: many(feedbackMetrics),
}));

export const campaignMembersRelations = relations(campaignMembers, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignMembers.campaignId],
    references: [campaigns.id],
  }),
  user: one(users, {
    fields: [campaignMembers.userId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [tasks.campaignId],
    references: [campaigns.id],
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
    relationName: "assignee",
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
  campaign: one(campaigns, {
    fields: [activities.campaignId],
    references: [campaigns.id],
  }),
}));

export const metricsRelations = relations(metrics, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [metrics.campaignId],
    references: [campaigns.id],
  }),
}));

export const assetTemplatesRelations = relations(assetTemplates, ({ one, many }) => ({
  creator: one(users, {
    fields: [assetTemplates.createdBy],
    references: [users.id],
  }),
  assets: many(assets, { relationName: "template" }),
}));

export const assetsRelations = relations(assets, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [assets.campaignId],
    references: [campaigns.id],
  }),
  uploader: one(users, {
    fields: [assets.uploadedBy],
    references: [users.id],
    relationName: "uploader",
  }),
  template: one(assetTemplates, {
    fields: [assets.templateId],
    references: [assetTemplates.id],
    relationName: "template",
  }),
}));

export const emailTemplateRelations = relations(emailTemplates, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [emailTemplates.campaignId],
    references: [campaigns.id],
  }),
  creator: one(users, {
    fields: [emailTemplates.createdBy],
    references: [users.id],
  }),
}));

export const campaignCostsRelations = relations(campaignCosts, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignCosts.campaignId],
    references: [campaigns.id],
  }),
  creator: one(users, {
    fields: [campaignCosts.createdBy],
    references: [users.id],
  }),
}));

export const campaignRevenueRelations = relations(campaignRevenue, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignRevenue.campaignId],
    references: [campaigns.id],
  }),
  creator: one(users, {
    fields: [campaignRevenue.createdBy],
    references: [users.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type CampaignMember = typeof campaignMembers.$inferSelect;
export type InsertCampaignMember = z.infer<typeof insertCampaignMemberSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Metric = typeof metrics.$inferSelect;
export type InsertMetric = z.infer<typeof insertMetricSchema>;

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;

export type AssetTemplate = typeof assetTemplates.$inferSelect;
export type InsertAssetTemplate = z.infer<typeof insertAssetTemplateSchema>;

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;

export type CampaignCost = typeof campaignCosts.$inferSelect;
export type InsertCampaignCost = z.infer<typeof insertCampaignCostSchema>;

export type CampaignRevenue = typeof campaignRevenue.$inferSelect;
export type InsertCampaignRevenue = z.infer<typeof insertCampaignRevenueSchema>;

// Client Feedback schema
export const clientFeedback = pgTable("client_feedback", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  campaignId: integer("campaign_id").notNull(),
  rating: numeric("rating").notNull(), // Rating from 1-5
  feedbackText: text("feedback_text"),
  category: text("category").notNull(), // general, design, content, responsiveness, etc.
  status: text("status").notNull().default("pending"), // pending, reviewed, responded
  reviewedBy: integer("reviewed_by"),
  response: text("response"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertClientFeedbackSchema = createInsertSchema(clientFeedback)
  .pick({
    clientName: true,
    clientEmail: true,
    campaignId: true,
    rating: true,
    feedbackText: true,
    category: true,
    status: true,
    reviewedBy: true,
    response: true,
  });

// Feedback Response Templates schema
export const feedbackResponseTemplates = pgTable("feedback_response_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // category of feedback it's meant to respond to
  responseText: text("response_text").notNull(),
  variables: jsonb("variables").notNull(), // JSON array of the variables used in template
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertFeedbackResponseTemplateSchema = createInsertSchema(feedbackResponseTemplates)
  .pick({
    name: true,
    category: true,
    responseText: true,
    variables: true,
    createdBy: true,
  });

// Feedback Metrics schema - for aggregating feedback data
export const feedbackMetrics = pgTable("feedback_metrics", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  date: timestamp("date").notNull(),
  averageRating: numeric("average_rating").notNull(),
  totalFeedbackCount: integer("total_feedback_count").notNull(),
  positiveFeedbackCount: integer("positive_feedback_count").notNull(), // ratings 4-5
  neutralFeedbackCount: integer("neutral_feedback_count").notNull(),   // rating 3
  negativeFeedbackCount: integer("negative_feedback_count").notNull(), // ratings 1-2
  responseRate: numeric("response_rate").notNull(), // percentage of feedback responded to
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFeedbackMetricsSchema = createInsertSchema(feedbackMetrics)
  .extend({
    date: z.coerce.date(),
  })
  .pick({
    campaignId: true,
    date: true,
    averageRating: true,
    totalFeedbackCount: true,
    positiveFeedbackCount: true,
    neutralFeedbackCount: true,
    negativeFeedbackCount: true,
    responseRate: true,
  });

// Relations for feedback tables
export const clientFeedbackRelations = relations(clientFeedback, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [clientFeedback.campaignId],
    references: [campaigns.id],
  }),
  reviewer: one(users, {
    fields: [clientFeedback.reviewedBy],
    references: [users.id],
  }),
}));

export const feedbackResponseTemplatesRelations = relations(feedbackResponseTemplates, ({ one }) => ({
  creator: one(users, {
    fields: [feedbackResponseTemplates.createdBy],
    references: [users.id],
  }),
}));

export const feedbackMetricsRelations = relations(feedbackMetrics, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [feedbackMetrics.campaignId],
    references: [campaigns.id],
  }),
}));

// Type exports for feedback tables
export type ClientFeedback = typeof clientFeedback.$inferSelect;
export type InsertClientFeedback = z.infer<typeof insertClientFeedbackSchema>;

export type FeedbackResponseTemplate = typeof feedbackResponseTemplates.$inferSelect;
export type InsertFeedbackResponseTemplate = z.infer<typeof insertFeedbackResponseTemplateSchema>;

export type FeedbackMetrics = typeof feedbackMetrics.$inferSelect;
export type InsertFeedbackMetrics = z.infer<typeof insertFeedbackMetricsSchema>;

// Marketing Insights schema
export const marketingInsights = pgTable("marketing_insights", {
  id: serial("id").primaryKey(),
  insightId: text("insight_id").notNull(),
  campaignId: integer("campaign_id"),
  targetMarket: text("target_market"),
  propertyType: text("property_type"),
  priceRange: text("price_range"),
  location: text("location"),
  summary: text("summary").notNull(),
  insights: jsonb("insights").notNull(),
  keywords: jsonb("keywords"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMarketingInsightSchema = createInsertSchema(marketingInsights).pick({
  insightId: true,
  campaignId: true,
  targetMarket: true,
  propertyType: true,
  priceRange: true,
  location: true,
  summary: true,
  insights: true,
  keywords: true,
  createdBy: true,
});

export const marketingInsightsRelations = relations(marketingInsights, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [marketingInsights.campaignId],
    references: [campaigns.id],
    relationName: "campaign_insights",
  }),
  creator: one(users, {
    fields: [marketingInsights.createdBy],
    references: [users.id],
    relationName: "insight_creator",
  }),
}));

export type MarketingInsight = typeof marketingInsights.$inferSelect;
export type InsertMarketingInsight = z.infer<typeof insertMarketingInsightSchema>;

// Notification Preferences schema
export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  categories: jsonb("categories").notNull().default(JSON.stringify([])), // Array of categories (Technology, Marketing Channel, Strategy, etc.)
  propertyTypes: jsonb("property_types").notNull().default(JSON.stringify([])), // Array of property types
  relevanceThreshold: integer("relevance_threshold").notNull().default(5), // Minimum relevance score (1-10)
  locations: jsonb("locations").notNull().default(JSON.stringify([])), // Array of locations
  keywordMatches: jsonb("keyword_matches").notNull().default(JSON.stringify([])), // Array of keywords to match
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences).pick({
  userId: true,
  categories: true,
  propertyTypes: true,
  relevanceThreshold: true,
  locations: true,
  keywordMatches: true,
  enabled: true,
});

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id],
  }),
}));

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = z.infer<typeof insertNotificationPreferencesSchema>;

// User Branding schema
export const userBranding = pgTable("user_branding", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").notNull().default("#1a73e8"),
  secondaryColor: text("secondary_color").notNull().default("#4285f4"),
  fontFamily: text("font_family").notNull().default("Arial, sans-serif"),
  companyName: text("company_name"),
  tagline: text("tagline"),
  websiteUrl: text("website_url"),
  emailSignature: text("email_signature"),
  socialLinks: jsonb("social_links").notNull().default(JSON.stringify({})),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserBrandingSchema = createInsertSchema(userBranding).pick({
  userId: true,
  logoUrl: true,
  primaryColor: true,
  secondaryColor: true,
  fontFamily: true,
  companyName: true,
  tagline: true,
  websiteUrl: true,
  emailSignature: true,
  socialLinks: true,
});

export const userBrandingRelations = relations(userBranding, ({ one }) => ({
  user: one(users, {
    fields: [userBranding.userId],
    references: [users.id],
  }),
}));

// Shared Insights schema for tracking shared insights and their performance
export const sharedInsights = pgTable("shared_insights", {
  id: serial("id").primaryKey(),
  insightId: integer("insight_id").notNull(),
  userId: integer("user_id").notNull(),
  shareCode: text("share_code").notNull().unique(),
  title: text("title").notNull(),
  customMessage: text("custom_message"),
  useBranding: boolean("use_branding").notNull().default(true),
  shareUrl: text("share_url").notNull(),
  views: integer("views").notNull().default(0),
  lastViewed: timestamp("last_viewed"),
  recipientEmails: jsonb("recipient_emails").default(JSON.stringify([])),
  status: text("status").notNull().default("active"), // active, archived, expired
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSharedInsightSchema = createInsertSchema(sharedInsights).pick({
  insightId: true,
  userId: true,
  shareCode: true,
  title: true,
  customMessage: true,
  useBranding: true,
  shareUrl: true,
  recipientEmails: true,
  status: true,
  expiresAt: true,
});

export const sharedInsightsRelations = relations(sharedInsights, ({ one }) => ({
  insight: one(marketingInsights, {
    fields: [sharedInsights.insightId],
    references: [marketingInsights.id],
  }),
  user: one(users, {
    fields: [sharedInsights.userId],
    references: [users.id],
  }),
}));

export type UserBranding = typeof userBranding.$inferSelect;
export type InsertUserBranding = z.infer<typeof insertUserBrandingSchema>;

export type SharedInsight = typeof sharedInsights.$inferSelect;
export type InsertSharedInsight = z.infer<typeof insertSharedInsightSchema>;
