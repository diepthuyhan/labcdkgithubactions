import * as cdk from 'aws-cdk-lib';

export interface AppSettings extends cdk.StackProps {
  vpcCidr: string;
  maxAzs: number;
  natGateways: number;
}

export const settings: AppSettings = {
  vpcCidr: '10.0.0.0/16',
  maxAzs: 2,
  natGateways: 2,
};