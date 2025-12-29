#!/bin/bash
# Startup AWS resources for Day 6
# Run this script to bring resources back online

set -e

CLUSTER_NAME="ecommerce-demo-demo-eks"
REGION="us-east-1"
RDS_INSTANCE="ecommerce-demo-demo-postgres"

echo "=== AWS Resource Startup Script ==="
echo "Region: $REGION"
echo "Cluster: $CLUSTER_NAME"
echo ""

# Start RDS instance first (takes longer)
echo "1. Starting RDS instance: $RDS_INSTANCE..."
RDS_STATUS=$(aws rds describe-db-instances --db-instance-identifier $RDS_INSTANCE --region $REGION --query 'DBInstances[0].DBInstanceStatus' --output text 2>/dev/null || echo "not-found")

if [ "$RDS_STATUS" == "stopped" ]; then
    aws rds start-db-instance --db-instance-identifier $RDS_INSTANCE --region $REGION
    echo "   RDS start initiated (takes ~5-10 minutes)"
elif [ "$RDS_STATUS" == "available" ]; then
    echo "   RDS already running"
else
    echo "   RDS status: $RDS_STATUS"
fi

# Get node group name
echo ""
echo "2. Getting EKS node group..."
NODEGROUP=$(aws eks list-nodegroups --cluster-name $CLUSTER_NAME --region $REGION --query 'nodegroups[0]' --output text)
if [ "$NODEGROUP" == "None" ] || [ -z "$NODEGROUP" ]; then
    echo "   ERROR: No node group found"
    exit 1
fi
echo "   Found node group: $NODEGROUP"

# Scale EKS nodes back up
echo ""
echo "3. Scaling EKS node group to 2 nodes..."
aws eks update-nodegroup-config \
    --cluster-name $CLUSTER_NAME \
    --nodegroup-name $NODEGROUP \
    --scaling-config minSize=1,maxSize=3,desiredSize=2 \
    --region $REGION

echo "   Node group scaling initiated (takes ~3-5 minutes)"

# Wait for nodes to be ready
echo ""
echo "4. Waiting for resources to be ready..."
echo "   This may take several minutes..."

# Wait for RDS
echo ""
echo "   Waiting for RDS to be available..."
aws rds wait db-instance-available --db-instance-identifier $RDS_INSTANCE --region $REGION 2>/dev/null || echo "   (RDS wait timed out, check manually)"

# Wait for node group
echo "   Waiting for EKS node group..."
aws eks wait nodegroup-active --cluster-name $CLUSTER_NAME --nodegroup-name $NODEGROUP --region $REGION 2>/dev/null || echo "   (Node group wait completed)"

# Update kubeconfig
echo ""
echo "5. Updating kubeconfig..."
aws eks update-kubeconfig --name $CLUSTER_NAME --region $REGION

# Check pods status
echo ""
echo "6. Checking pod status..."
kubectl get pods -n ecommerce 2>/dev/null || echo "   (Pods may take a few minutes to start)"

# ArgoCD sync reminder
echo ""
echo "=== Startup Complete ==="
echo ""
echo "Next steps:"
echo "1. Wait for all pods to be Running: kubectl get pods -n ecommerce -w"
echo "2. If pods don't start, sync via ArgoCD:"
echo "   kubectl port-forward svc/argocd-server -n argocd 8080:80"
echo "   Open: https://localhost:8080"
echo "3. Get ArgoCD admin password:"
echo "   kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d"
echo ""
echo "Application URLs:"
echo "- E-commerce: https://dls03qes9fc77.cloudfront.net"
echo "- API Health: https://dls03qes9fc77.cloudfront.net/api/health"
