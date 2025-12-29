#!/bin/bash
# Shutdown AWS resources to save costs overnight
# Run this script at the end of the day

set -e

CLUSTER_NAME="ecommerce-demo-demo-eks"
REGION="us-east-1"
RDS_INSTANCE="ecommerce-demo-demo-postgres"

echo "=== AWS Resource Shutdown Script ==="
echo "Region: $REGION"
echo "Cluster: $CLUSTER_NAME"
echo ""

# Get node group name
echo "1. Getting EKS node group..."
NODEGROUP=$(aws eks list-nodegroups --cluster-name $CLUSTER_NAME --region $REGION --query 'nodegroups[0]' --output text)
if [ "$NODEGROUP" == "None" ] || [ -z "$NODEGROUP" ]; then
    echo "   ERROR: No node group found"
    exit 1
fi
echo "   Found node group: $NODEGROUP"

# Get current node group config
echo ""
echo "2. Getting current node group configuration..."
CURRENT_SIZE=$(aws eks describe-nodegroup --cluster-name $CLUSTER_NAME --nodegroup-name $NODEGROUP --region $REGION --query 'nodegroup.scalingConfig' --output json)
echo "   Current scaling config: $CURRENT_SIZE"

# Scale EKS nodes to 0
echo ""
echo "3. Scaling EKS node group to 0..."
aws eks update-nodegroup-config \
    --cluster-name $CLUSTER_NAME \
    --nodegroup-name $NODEGROUP \
    --scaling-config minSize=0,maxSize=3,desiredSize=0 \
    --region $REGION

echo "   Node group scaling initiated. Waiting for update..."
aws eks wait nodegroup-active --cluster-name $CLUSTER_NAME --nodegroup-name $NODEGROUP --region $REGION 2>/dev/null || true
echo "   EKS nodes scaled to 0"

# Stop RDS instance
echo ""
echo "4. Stopping RDS instance: $RDS_INSTANCE..."
RDS_STATUS=$(aws rds describe-db-instances --db-instance-identifier $RDS_INSTANCE --region $REGION --query 'DBInstances[0].DBInstanceStatus' --output text 2>/dev/null || echo "not-found")

if [ "$RDS_STATUS" == "available" ]; then
    aws rds stop-db-instance --db-instance-identifier $RDS_INSTANCE --region $REGION
    echo "   RDS stop initiated"
elif [ "$RDS_STATUS" == "stopped" ]; then
    echo "   RDS already stopped"
else
    echo "   RDS status: $RDS_STATUS (skipping)"
fi

# Delete CloudFront distribution created via CLI (optional cleanup)
echo ""
echo "5. CloudFront distribution (E1UREM48VZYPQA)..."
echo "   NOTE: CloudFront distributions cannot be 'paused'. Consider deleting if not needed."
echo "   To delete: aws cloudfront delete-distribution --id E1UREM48VZYPQA --if-match <ETAG>"
echo "   (Get ETAG with: aws cloudfront get-distribution --id E1UREM48VZYPQA --query 'ETag' --output text)"

# Summary
echo ""
echo "=== Shutdown Summary ==="
echo "- EKS nodes: Scaled to 0 (no compute costs)"
echo "- RDS: Stopped (no compute costs, storage only)"
echo "- ElastiCache: Still running (cannot be stopped, ~\$0.017/hr for cache.t3.micro)"
echo "- ALB: Will be deleted when pods are removed (no targets)"
echo ""
echo "To bring resources back online, run: ./scripts/startup-resources.sh"
