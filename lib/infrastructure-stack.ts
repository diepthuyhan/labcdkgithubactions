import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { AppSettings } from '../config/settings';

export class InfrastructureStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly lambdaFunction: lambda.Function;
  public readonly ec2Instance: ec2.Instance;

  constructor(scope: Construct, id: string, props: AppSettings) {
    super(scope, id, {
      ...props,
      env: {
        account: props.account,
        region: props.region,
      },
    });

    const maxAzs = props.maxAzs;
    const natGateways = props.natGateways;
    const vpcCidr = props.vpcCidr;

    this.vpc = new ec2.Vpc(this, 'MyVPC', {
      ipAddresses: ec2.IpAddresses.cidr(vpcCidr),
      maxAzs: maxAzs,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
      natGateways: natGateways,
    });

    const ec2SecurityGroup = new ec2.SecurityGroup(this, 'EC2SecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for EC2 instance',
      allowAllOutbound: true,
    });

    ec2SecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allow SSH access'
    );

    ec2SecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP access'
    );

    const ec2Role = new iam.Role(this, 'EC2Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
    });

    this.ec2Instance = new ec2.Instance(this, 'bastion-host', {
      vpc: this.vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL),
      machineImage: ec2.MachineImage.latestAmazonLinux2(),
      securityGroup: ec2SecurityGroup,
      role: ec2Role,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      userData: ec2.UserData.custom(`#!/bin/bash
        yum update -y
        yum install -y nginx
        systemctl start nginx
        systemctl enable nginx
        echo "<p>Instance ID: $(curl -s http://169.254.169.254/latest/meta-data/instance-id)</p>" > /usr/share/nginx/html/index.html
        echo "<p>Availability Zone: $(curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone)</p>" > /usr/share/nginx/html/index.html
        `),
      });

    this.lambdaFunction = new lambda.Function(this, 'HelloWorldLambda', {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        import datetime

        def handler(event, context):
          print(datetime.datetime.now())
      `),
      description: 'Hello World Lambda',
      timeout: cdk.Duration.seconds(30),
      memorySize: 128,
      vpc: this.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
    });

    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      description: 'VPC ID',
    });

    new cdk.CfnOutput(this, 'EC2InstanceId', {
      value: this.ec2Instance.instanceId,
      description: 'EC2 Instance ID',
    });

    new cdk.CfnOutput(this, 'EC2PublicIP', {
      value: this.ec2Instance.instancePublicIp,
      description: 'EC2 Instance Public IP',
    });

    new cdk.CfnOutput(this, 'LambdaFunctionName', {
      value: this.lambdaFunction.functionName,
      description: 'Lambda Function Name',
    });

  }
}
