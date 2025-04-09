import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface MarketingTrend {
  trend: string;
  description: string;
  relevance: number;  // 1-10 rating
  recommendation: string;
  category: string;
}

export interface MarketInsight {
  id: string;
  timestamp: Date;
  insights: MarketingTrend[];
  summary: string;
  targetMarket?: string;
  propertyType?: string;
  priceRange?: string;
  location?: string;
  keywords?: string[];
}

/**
 * Analyzes marketing data to identify trends and insights
 */
export async function generateMarketingInsights(params: {
  targetMarket?: string;
  propertyType?: string;
  priceRange?: string;
  location?: string;
  marketingChannel?: string;
  campaignData?: any;
  keywords?: string[];
}): Promise<MarketInsight> {
  try {
    // Create a prompt based on the parameters
    const prompt = createInsightPrompt(params);
    
    // Call OpenAI API with structured response format
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert real estate marketing analyst. Analyze the given real estate marketing data and provide insights on current marketing trends, effectiveness, and recommendations for improvement."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI API");
    }
    
    const result = JSON.parse(content);
    
    // Format and return the insights
    return {
      id: generateId(),
      timestamp: new Date(),
      insights: result.trends,
      summary: result.summary,
      targetMarket: params.targetMarket,
      propertyType: params.propertyType,
      priceRange: params.priceRange,
      location: params.location,
      keywords: params.keywords
    };
  } catch (error) {
    console.error("Error generating marketing insights:", error);
    throw new Error(`Failed to generate marketing insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Creates a prompt for the OpenAI API based on the given parameters
 */
function createInsightPrompt(params: {
  targetMarket?: string;
  propertyType?: string;
  priceRange?: string;
  location?: string;
  marketingChannel?: string;
  campaignData?: any;
  keywords?: string[];
}): string {
  const { targetMarket, propertyType, priceRange, location, marketingChannel, campaignData, keywords } = params;
  
  let prompt = `Analyze current real estate marketing trends and provide insights for`;
  
  if (targetMarket) prompt += ` target market: ${targetMarket},`;
  if (propertyType) prompt += ` property type: ${propertyType},`;
  if (priceRange) prompt += ` price range: ${priceRange},`;
  if (location) prompt += ` location: ${location},`;
  if (marketingChannel) prompt += ` marketing channel: ${marketingChannel},`;
  if (keywords && keywords.length > 0) prompt += ` focusing on these keywords: ${keywords.join(", ")}.`;
  
  prompt += `\n\nProvide the response in this format:
  {
    "trends": [
      {
        "trend": "Trend name or title",
        "description": "Detailed description of the trend",
        "relevance": 8,
        "recommendation": "Specific, actionable recommendation for implementing this trend",
        "category": "Category of the trend (e.g., social media, visual content, copywriting, etc.)"
      }
    ],
    "summary": "Overall summary of insights and key recommendations"
  }

  For the 'trends' array, provide 5 distinct, relevant trends. Rate each trend's relevance on a scale of 1-10, with 10 being most relevant. Ensure recommendations are specific and actionable.`;
  
  if (campaignData) {
    prompt += `\n\nHere is additional campaign data to consider in your analysis:\n${JSON.stringify(campaignData, null, 2)}`;
  }
  
  return prompt;
}

/**
 * Generates a random ID for insights
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Analyze feedback data to extract insights and sentiment
 */
export async function analyzeFeedback(feedbackData: any[]): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert real estate marketing analyst specializing in customer feedback analysis. Analyze the provided feedback data and extract key insights, sentiment patterns, and actionable recommendations."
        },
        {
          role: "user",
          content: `Analyze this collection of customer feedback from real estate marketing campaigns and provide insights:\n${JSON.stringify(feedbackData, null, 2)}\n\nProvide analysis in JSON format with these sections: overall sentiment summary, key positive themes, key negative themes, specific improvement opportunities, and actionable recommendations.`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI API");
    }
    
    return JSON.parse(content);
  } catch (error) {
    console.error("Error analyzing feedback:", error);
    throw new Error(`Failed to analyze feedback: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate content recommendations for marketing campaigns
 */
export async function generateContentRecommendations(campaignData: any): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert real estate marketing content strategist. Generate content recommendations for real estate marketing campaigns based on the provided campaign data."
        },
        {
          role: "user",
          content: `Based on this campaign data, provide content recommendations:\n${JSON.stringify(campaignData, null, 2)}\n\nProvide recommendations in JSON format with these sections: content themes, suggested headlines, key messaging points, visual content ideas, and content distribution strategy.`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI API");
    }
    
    return JSON.parse(content);
  } catch (error) {
    console.error("Error generating content recommendations:", error);
    throw new Error(`Failed to generate content recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}