#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { InfrastructureStack } from '../lib/infrastructure-stack';
import { settings } from '../config/settings';

const app = new cdk.App();

new InfrastructureStack(app, 'InfrastructureStack', settings);
