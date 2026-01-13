#!/bin/bash
# configure-claude.sh - Configure Claude Code to use enterprise MCP servers

set -e

INSTALL_DIR="${INSTALL_DIR:-$HOME/.claude-enterprise}"
CLAUDE_CONFIG_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.config/claude-code}"
MCP_CONFIG_FILE="$CLAUDE_CONFIG_DIR/mcp-servers.json"

echo "Configuring Claude Code MCP servers..."

# Create config directory if not exists
mkdir -p "$CLAUDE_CONFIG_DIR"

# Generate MCP servers configuration
cat > "$MCP_CONFIG_FILE" << EOF
{
  "mcpServers": {
    "github": {
      "command": "node",
      "args": ["$INSTALL_DIR/servers/github-mcp/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "\${GITHUB_TOKEN}",
        "AUDIT_LOG_DIR": "$INSTALL_DIR/audit-logs"
      }
    },
    "jira": {
      "command": "node",
      "args": ["$INSTALL_DIR/servers/jira-mcp/dist/index.js"],
      "env": {
        "JIRA_BASE_URL": "\${JIRA_BASE_URL}",
        "JIRA_EMAIL": "\${JIRA_EMAIL}",
        "JIRA_API_TOKEN": "\${JIRA_API_TOKEN}",
        "AUDIT_LOG_DIR": "$INSTALL_DIR/audit-logs"
      }
    },
    "confluence": {
      "command": "node",
      "args": ["$INSTALL_DIR/servers/confluence-mcp/dist/index.js"],
      "env": {
        "CONFLUENCE_BASE_URL": "\${CONFLUENCE_BASE_URL}",
        "CONFLUENCE_EMAIL": "\${CONFLUENCE_EMAIL}",
        "CONFLUENCE_API_TOKEN": "\${CONFLUENCE_API_TOKEN}",
        "AUDIT_LOG_DIR": "$INSTALL_DIR/audit-logs"
      }
    },
    "aws": {
      "command": "node",
      "args": ["$INSTALL_DIR/servers/aws-mcp/dist/index.js"],
      "env": {
        "AWS_REGION": "\${AWS_REGION:-eu-west-1}",
        "AUDIT_LOG_DIR": "$INSTALL_DIR/audit-logs"
      }
    }
  }
}
EOF

echo "Configuration written to: $MCP_CONFIG_FILE"

# Create .env template if not exists
ENV_FILE="$INSTALL_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
    cat > "$ENV_FILE" << 'EOF'
# Claude Enterprise MCP Configuration
# Copy this file and fill in your credentials

# GitHub
GITHUB_TOKEN=your_github_pat_here

# Jira / Confluence (Atlassian)
JIRA_BASE_URL=https://your-company.atlassian.net
JIRA_EMAIL=your.email@company.com
JIRA_API_TOKEN=your_atlassian_api_token

CONFLUENCE_BASE_URL=https://your-company.atlassian.net
CONFLUENCE_EMAIL=your.email@company.com
CONFLUENCE_API_TOKEN=your_atlassian_api_token

# AWS
AWS_REGION=eu-west-1
# AWS credentials via IAM role or environment variables

# Audit Logging (optional)
# CENTRAL_LOG_ENDPOINT=https://logs.company.com/api
# CENTRAL_LOG_API_KEY=your_api_key
EOF
    echo "Environment template created: $ENV_FILE"
    echo "Please edit $ENV_FILE with your credentials."
else
    echo "Environment file exists: $ENV_FILE"
fi

echo ""
echo "Claude Code MCP configuration complete."
echo ""
