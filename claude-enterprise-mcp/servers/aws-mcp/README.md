# AWS MCP Server

MCP Server for AWS integration with Claude Code Enterprise.

## ⚠️ READ-ONLY ACCESS ONLY

This server provides **read-only** access to AWS resources.

**NO write operations are exposed.**

For infrastructure changes:
1. Use GitHub MCP to create a PR to the Terraform repository
2. Let CI/CD pipeline apply the changes

## Features

- **CloudWatch Metrics:** Query performance metrics
- **CloudWatch Logs:** Query application and system logs
- **EC2:** Describe instances
- **RDS:** Describe database instances
- **EKS:** Describe Kubernetes clusters

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AWS_REGION` | No | AWS region (default: us-east-1) |
| `AWS_ACCESS_KEY_ID` | No | AWS access key (or use IAM role) |
| `AWS_SECRET_ACCESS_KEY` | No | AWS secret key (or use IAM role) |
| `AWS_USER` | No | User identifier for audit logs |
| `AUDIT_LOG_DIR` | No | Local audit log directory |

### Claude Code Configuration

```json
{
  "mcpServers": {
    "aws": {
      "command": "node",
      "args": ["/path/to/aws-mcp/dist/index.js"],
      "env": {
        "AWS_REGION": "eu-west-1"
      }
    }
  }
}
```

## Tools

| Tool | Access | Description |
|------|--------|-------------|
| `aws_cloudwatch_get_metrics` | Read | Query CloudWatch metrics |
| `aws_cloudwatch_get_logs` | Read | Query CloudWatch logs |
| `aws_describe_instances` | Read | Describe EC2 instances |
| `aws_describe_rds` | Read | Describe RDS instances |
| `aws_describe_eks` | Read | Describe EKS clusters |

## Why Read-Only?

Production access is restricted to read-only for:
1. **Security:** Prevent accidental or malicious changes
2. **Compliance:** All changes must go through CAB process
3. **Audit:** IaC changes are tracked in Git history
4. **Consistency:** Infrastructure is defined as code

## Development

```bash
npm install
npm run build
npm run dev
```

## License

MIT
