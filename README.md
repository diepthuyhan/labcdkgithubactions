# GitHub Action CDK

This project demonstrates how to use AWS CDK with GitHub Actions for CI/CD pipelines.

## Stacks

This project contains two main stacks:

1. **GithubactioncdkStack** - The original application stack
2. **GitHubPipelineStack** - Generates GitHub Actions workflow using `cdk-pipelines-github`

## Setup

### Prerequisites

- Node.js 18 or later
- AWS CLI configured
- GitHub repository

### Installation

```bash
npm install
```

### Configuration

1. Update the GitHub repository URL in the pipeline stack:
   - In `lib/github-pipeline-stack.ts`: Change `'your-username/githubactioncdk'` to your actual repository

2. Set up GitHub Secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

### Deployment

#### Deploy all stacks:
```bash
npx cdk deploy --all
```

#### Deploy specific stacks:
```bash
# Deploy only the application stack
npx cdk deploy GithubactioncdkStack

# Deploy the GitHub pipeline stack
npx cdk deploy GitHubPipelineStack
```

## GitHub Actions Workflow

### GitHub Pipeline Stack (`GitHubPipelineStack`)

This stack uses `cdk-pipelines-github` to generate a GitHub Actions workflow file. The workflow will:

- Trigger on pushes to `main` branch and pull requests
- Install dependencies
- Build the project
- Configure AWS credentials
- Deploy the CDK stack

The workflow file will be automatically generated in `.github/workflows/` when you deploy the stack.

## Development

### Build the project:
```bash
npm run build
```

### Run tests:
```bash
npm test
```

### Watch for changes:
```bash
npm run watch
```

## Useful CDK Commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
