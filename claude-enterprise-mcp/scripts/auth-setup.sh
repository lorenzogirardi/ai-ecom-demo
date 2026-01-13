#!/bin/bash
# auth-setup.sh - Interactive authentication setup

set -e

INSTALL_DIR="${INSTALL_DIR:-$HOME/.claude-enterprise}"

echo "======================================"
echo "Authentication Setup"
echo "======================================"
echo ""

# Source .env if exists
if [ -f "$INSTALL_DIR/.env" ]; then
    source "$INSTALL_DIR/.env"
fi

# GitHub Authentication
setup_github() {
    echo "--- GitHub Authentication ---"
    echo ""
    echo "GitHub requires a Personal Access Token (PAT)."
    echo ""
    echo "Create a PAT at: https://github.com/settings/tokens/new"
    echo "Required scopes: repo, read:org"
    echo ""

    if [ -n "$GITHUB_TOKEN" ]; then
        echo "Current token: ${GITHUB_TOKEN:0:10}..."
        read -p "Use existing token? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "GitHub authentication: OK"
            return
        fi
    fi

    read -p "Enter GitHub PAT: " -s GITHUB_TOKEN
    echo ""

    # Validate token
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: token $GITHUB_TOKEN" \
        https://api.github.com/user)

    if [ "$HTTP_CODE" = "200" ]; then
        echo "GitHub authentication: OK ✓"
        # Update .env
        sed -i.bak "s/GITHUB_TOKEN=.*/GITHUB_TOKEN=$GITHUB_TOKEN/" "$INSTALL_DIR/.env"
    else
        echo "GitHub authentication: FAILED (HTTP $HTTP_CODE)"
    fi
    echo ""
}

# Atlassian (Jira/Confluence) Authentication
setup_atlassian() {
    echo "--- Atlassian Authentication ---"
    echo ""
    echo "Atlassian requires an API token."
    echo ""
    echo "Create a token at: https://id.atlassian.com/manage-profile/security/api-tokens"
    echo ""

    read -p "Enter Atlassian Base URL (e.g., https://company.atlassian.net): " JIRA_BASE_URL
    read -p "Enter your Atlassian email: " JIRA_EMAIL
    read -p "Enter Atlassian API Token: " -s JIRA_API_TOKEN
    echo ""

    # Validate token
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
        -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
        "$JIRA_BASE_URL/rest/api/3/myself")

    if [ "$HTTP_CODE" = "200" ]; then
        echo "Atlassian authentication: OK ✓"
        # Update .env
        sed -i.bak "s|JIRA_BASE_URL=.*|JIRA_BASE_URL=$JIRA_BASE_URL|" "$INSTALL_DIR/.env"
        sed -i.bak "s/JIRA_EMAIL=.*/JIRA_EMAIL=$JIRA_EMAIL/" "$INSTALL_DIR/.env"
        sed -i.bak "s/JIRA_API_TOKEN=.*/JIRA_API_TOKEN=$JIRA_API_TOKEN/" "$INSTALL_DIR/.env"
        sed -i.bak "s|CONFLUENCE_BASE_URL=.*|CONFLUENCE_BASE_URL=$JIRA_BASE_URL|" "$INSTALL_DIR/.env"
        sed -i.bak "s/CONFLUENCE_EMAIL=.*/CONFLUENCE_EMAIL=$JIRA_EMAIL/" "$INSTALL_DIR/.env"
        sed -i.bak "s/CONFLUENCE_API_TOKEN=.*/CONFLUENCE_API_TOKEN=$JIRA_API_TOKEN/" "$INSTALL_DIR/.env"
    else
        echo "Atlassian authentication: FAILED (HTTP $HTTP_CODE)"
    fi
    echo ""
}

# AWS Authentication
setup_aws() {
    echo "--- AWS Authentication ---"
    echo ""
    echo "AWS authentication options:"
    echo "  1. IAM Role (recommended for EC2/EKS)"
    echo "  2. AWS CLI profile"
    echo "  3. Environment variables"
    echo ""

    if command -v aws &> /dev/null; then
        AWS_IDENTITY=$(aws sts get-caller-identity 2>/dev/null || echo "")
        if [ -n "$AWS_IDENTITY" ]; then
            echo "Current AWS identity:"
            echo "$AWS_IDENTITY" | head -5
            echo "AWS authentication: OK ✓"
        else
            echo "AWS CLI configured but no valid credentials."
            echo "Please configure AWS credentials separately."
        fi
    else
        echo "AWS CLI not installed."
        echo "AWS authentication will use environment variables if set."
    fi
    echo ""
}

# Main
main() {
    echo "This script will help you configure authentication"
    echo "for each enterprise service."
    echo ""

    read -p "Setup GitHub authentication? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_github
    fi

    read -p "Setup Atlassian (Jira/Confluence) authentication? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_atlassian
    fi

    read -p "Check AWS authentication? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_aws
    fi

    echo ""
    echo "======================================"
    echo "Authentication Setup Complete"
    echo "======================================"
    echo ""
    echo "Credentials stored in: $INSTALL_DIR/.env"
    echo ""
}

main "$@"
