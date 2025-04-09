import { MailService } from '@sendgrid/mail';
import { EmailTemplate } from '@shared/schema';
import { storage } from './storage';

// Initialize SendGrid mail service
const mailService = new MailService();

// Setting the SendGrid API key
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn("WARNING: SENDGRID_API_KEY is not set. Email sending will not work.");
}

interface EmailData {
  to: string;
  from: string;
  templateId?: number;
  subject?: string;
  html?: string;
  text?: string;
  variables?: Record<string, any>;
}

/**
 * Sends an email using SendGrid
 * Can use either a direct message (subject, html, text) or a templateId with variables
 */
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    // Check if SendGrid API key is set
    if (!process.env.SENDGRID_API_KEY) {
      console.error("SendGrid API key not set. Cannot send email.");
      return false;
    }

    // If templateId is provided, fetch and apply the template
    if (emailData.templateId) {
      if (!emailData.variables) {
        throw new Error("Variables must be provided when using a template");
      }
      
      // Get and process the template
      const previewResult = await storage.previewEmailTemplate(
        emailData.templateId, 
        emailData.variables
      );
      
      // Set the email content from the template
      emailData.subject = previewResult.subject;
      emailData.html = previewResult.htmlContent;
      emailData.text = previewResult.textContent || undefined;
    }
    
    // Validate required fields
    if (!emailData.subject || !emailData.html) {
      throw new Error("Email subject and HTML content are required");
    }

    // Send the email
    await mailService.send({
      to: emailData.to,
      from: emailData.from,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text
    });
    
    console.log(`Email sent successfully to ${emailData.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

/**
 * Helper function to send an email using an email template
 */
export async function sendTemplateEmail(
  to: string,
  from: string,
  templateId: number,
  variables: Record<string, any>
): Promise<boolean> {
  return sendEmail({
    to,
    from,
    templateId,
    variables
  });
}

/**
 * Sends a campaign notification to multiple recipients
 */
export async function sendCampaignEmail(
  campaignId: number,
  templateId: number,
  recipients: string[],
  from: string,
  variables: Record<string, any>
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  // Send email to each recipient
  for (const recipient of recipients) {
    const result = await sendTemplateEmail(
      recipient,
      from,
      templateId,
      variables
    );
    
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  // Log the campaign email statistics
  console.log(`Campaign ${campaignId} email stats: ${success} sent successfully, ${failed} failed`);
  
  return { success, failed };
}

/**
 * Helper function to test if email sending is configured
 */
export function isEmailConfigured(): boolean {
  return !!process.env.SENDGRID_API_KEY;
}

/**
 * Check the status of the email service
 */
export function getEmailServiceStatus(): { configured: boolean; message: string } {
  const apiKey = process.env.SENDGRID_API_KEY;
  
  if (!apiKey) {
    return {
      configured: false,
      message: "SendGrid API key is not set. Email sending will not work."
    };
  }
  
  if (!apiKey.startsWith('SG.')) {
    return {
      configured: false,
      message: "Invalid SendGrid API key format. API key should start with 'SG.'"
    };
  }
  
  return {
    configured: true,
    message: "SendGrid is properly configured and ready to send emails."
  };
}

/**
 * Update the SendGrid API key
 */
export function updateApiKey(newApiKey: string): { success: boolean; message: string } {
  try {
    if (!newApiKey) {
      return {
        success: false,
        message: "API key cannot be empty"
      };
    }
    
    if (!newApiKey.startsWith('SG.')) {
      return {
        success: false,
        message: "Invalid SendGrid API key format. API key should start with 'SG.'"
      };
    }
    
    // Update the environment variable
    process.env.SENDGRID_API_KEY = newApiKey;
    
    // Update the SendGrid client
    mailService.setApiKey(newApiKey);
    
    return {
      success: true,
      message: "SendGrid API key has been updated successfully"
    };
  } catch (error) {
    console.error('Error updating SendGrid API key:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}