import * as cdk from 'aws-cdk-lib';

export interface AppSettings extends cdk.StackProps {
  account: string;
  region: string;
  vpcCidr: string;
  maxAzs: number;
  natGateways: number;
}

export const settings: AppSettings = {
  account: process.env.CDK_DEFAULT_ACCOUNT || '123456789012',
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  vpcCidr: '10.0.0.0/16',
  maxAzs: 2,
  natGateways: 2,
};