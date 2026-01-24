// Webhook Configuration Model
// This model represents the webhook configuration for Grafana integration

import { Company } from './company';

/**
 * Webhook Configuration Interface
 * Represents the configuration for Grafana webhook integration
 */
export interface WebhookConfig {
  id: number;
  companyId: number;
  apiKey: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  company?: Company;
}

/**
 * Webhook Alert Interface
 * Represents the alert data received from Grafana
 */
export interface GrafanaAlert {
  alertId: string;
  alertName: string;
  status: 'firing' | 'resolved';
  severity: 'critical' | 'warning' | 'info';
  dashboardId?: string;
  panelId?: string;
  ruleUrl?: string;
  evaluationTime?: string;
  values?: Record<string, number>;
  message?: string;
  customData?: {
    workflowId?: string;
    priority?: 'high' | 'medium' | 'low';
    additionalInfo?: Record<string, any>;
  };
}

/**
 * Webhook Response Interface
 * Represents the response from the webhook endpoint
 */
export interface WebhookResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

/**
 * Webhook Test Payload Interface
 * Represents a test payload for testing webhook functionality
 */
export interface WebhookTestPayload {
  alertId: string;
  alertName: string;
  status: 'firing' | 'resolved';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  customData?: {
    priority?: 'high' | 'medium' | 'low';
  };
}

/**
 * Webhook Configuration Form Values
 * Represents the form values for webhook configuration
 */
export interface WebhookConfigFormValues {
  enabled: boolean;
}

/**
 * Webhook Workflow Filter
 * Represents the filter criteria for webhook workflow matching
 */
export interface WebhookWorkflowFilter {
  alertName: string;
  severity: 'critical' | 'warning' | 'info';
}

/**
 * Webhook Integration Status
 * Represents the integration status between CMMS and Grafana
 */
export interface WebhookIntegrationStatus {
  connected: boolean;
  lastTest?: string;
  lastError?: string;
  apiKeyGenerated: boolean;
  workflowsConfigured: number;
}

/**
 * Webhook Setup Guide Step
 * Represents a step in the webhook setup guide
 */
export interface WebhookSetupStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  action?: () => void;
}

/**
 * Webhook Error Response
 * Represents error responses from webhook operations
 */
export interface WebhookErrorResponse {
  error: string;
  status: number;
  timestamp: string;
}

/**
 * Webhook Statistics
 * Represents statistics for webhook usage
 */
export interface WebhookStatistics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  workflowsTriggered: number;
  last24Hours: number;
}

/**
 * Webhook Grafana Configuration
 * Represents the configuration needed for Grafana setup
 */
export interface WebhookGrafanaConfig {
  webhookUrl: string;
  apiKey: string;
  headers: Record<string, string>;
  examplePayload: GrafanaAlert;
}

/**
 * Webhook Workflow Action
 * Represents the action to be taken when a webhook is triggered
 */
export type WebhookWorkflowAction = 'CREATE_WORK_ORDER' | 'CREATE_REQUEST' | 'SEND_NOTIFICATION';

/**
 * Webhook Workflow Configuration
 * Represents the workflow configuration for webhook triggers
 */
export interface WebhookWorkflowConfig {
  id: number;
  name: string;
  alertName: string;
  severity: 'critical' | 'warning' | 'info';
  action: WebhookWorkflowAction;
  enabled: boolean;
}

/**
 * Webhook Test Result
 * Represents the result of a webhook test
 */
export interface WebhookTestResult {
  success: boolean;
  message: string;
  responseTime: number;
  workflowTriggered?: string;
  errorDetails?: string;
}
