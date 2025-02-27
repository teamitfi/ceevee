# 🚀 AWS CDK - Infrastructure for Ceevee

This module creates Ceevee infrastructure using AWS CDK, including:
- VPC and Network Infrastructure
- RDS PostgreSQL Database
- Cognito User Authentication
- ECR Container Registry
- API Infrastructure

## Prerequisites

### AWS CLI Setup
```bash
  # Configure AWS CLI with SSO
  aws configure sso
```

```bash
  # Verify configuration
  aws configure list
  aws sts get-caller-identity
```

## Deployment

### Infrastructure Deployment
```bash
  # Deploy VPC, ECR, and Cognito
  yarn deploy:infra
```

```bash
  # Deploy Database
  yarn deploy:db
```

```bash
  # Deploy API
  yarn deploy:api
```

```bash
  # Or deploy everything at once
  yarn deploy:all
```

## Database Access Setup

### 1. SSH Configuration
```bash
  # Set up SSH access to bastion host
  ./scripts/setup-bastion-ssh.sh
```

```bash
  # Test connection
  ssh ceevee-bastion
```

### 2. Get Connection Details
```bash
  # Get bastion host DNS
  aws cloudformation describe-stacks \
    --stack-name CeeveeNetworkStack \
    --query 'Stacks[0].Outputs[?OutputKey==`BastionHostPublicDNS`].OutputValue' \
    --output text
```

```bash
  # Get database credentials
  aws secretsmanager get-secret-value \
    --secret-id ceevee/database/credentials \
    --query 'SecretString' \
    --output text
```

```bash
  # Get RDS endpoint
  aws cloudformation describe-stacks \
    --stack-name CeeveeDbStack \
    --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' \
    --output text
```

```bash
  # List all RDS instances
  yarn db:list
```

### 3. IntelliJ Database Configuration

1. Database Connection:
```properties
Host: <RDS endpoint>
Port: 5432
Database: ceevee
Authentication: User & Password
User: postgres
Password: <from secrets manager>
```

2. SSH Tunnel:
```properties
✓ Use SSH tunnel
Proxy Host: <bastion DNS>
Proxy User: ec2-user
Auth Type: OpenSSH config and authentication agent
Private key: /Users/<your-username>/.ssh/ceevee/ceevee-bastion-key.pem
```

## Cleanup

```bash
  # Remove API infrastructure
  yarn destroy:api
```

```bash
  # Remove database
  yarn destroy:db
```

```bash
  # Remove base infrastructure
  yarn destroy:infra
```

## Development

```bash
  # Compile TypeScript
  yarn build
```

```bash
  # Watch for changes
  yarn watch
```

```bash
  # Run tests
  yarn test
```

```bash
  # Preview changes
  npx cdk diff
```

```
  yarn ts-node scripts/create-user.ts "<username>" "<password>"
```

## References
- [AWS CDK Developer Guide](https://docs.aws.amazon.com/cdk/latest/guide/home.html)
- [AWS CLI Configuration Guide](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html)