/**
 * Audit log entry structure
 */
export interface AuditLog {
  timestamp: string;
  user: string;
  tool: string;
  action: string;
  parameters: Record<string, unknown>;
  result: 'success' | 'error';
  error_message?: string;
  ai_context: {
    session_id: string;
    model: string;
  };
}

/**
 * Audit logger configuration
 */
export interface AuditLoggerConfig {
  sessionId: string;
  model: string;
}

/**
 * AWS configuration
 */
export interface AWSConfig {
  region: string;
}

/**
 * CloudWatch metric datapoint
 */
export interface MetricDatapoint {
  timestamp: Date;
  value: number;
  unit: string;
}

/**
 * CloudWatch metric result
 */
export interface MetricResult {
  namespace: string;
  metricName: string;
  dimensions: Record<string, string>;
  datapoints: MetricDatapoint[];
}

/**
 * CloudWatch log event
 */
export interface LogEvent {
  timestamp: number;
  message: string;
  logStreamName?: string;
}

/**
 * EC2 instance info
 */
export interface EC2Instance {
  instanceId: string;
  instanceType: string;
  state: string;
  privateIpAddress?: string;
  publicIpAddress?: string;
  tags: Record<string, string>;
  launchTime?: Date;
}

/**
 * RDS instance info
 */
export interface RDSInstance {
  dbInstanceIdentifier: string;
  dbInstanceClass: string;
  engine: string;
  engineVersion: string;
  status: string;
  endpoint?: {
    address: string;
    port: number;
  };
  allocatedStorage: number;
}

/**
 * EKS cluster info
 */
export interface EKSCluster {
  name: string;
  arn: string;
  status: string;
  version: string;
  endpoint?: string;
  createdAt?: Date;
}
