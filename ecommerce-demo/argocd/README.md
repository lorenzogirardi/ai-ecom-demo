# ArgoCD Configuration

GitOps configuration for deploying e-commerce applications to EKS.

## Directory Structure

```
argocd/
├── README.md                 # This file
├── install/
│   └── values.yaml           # ArgoCD Helm values for EKS
├── projects/
│   └── ecommerce.yaml        # ArgoCD Project definition
└── applications/
    ├── backend.yaml          # Backend Application (manual sync)
    └── frontend.yaml         # Frontend Application (manual sync)
```

## Prerequisites

1. **EKS Cluster** - Created via Terraform (Layer 1)
2. **AWS Load Balancer Controller** - Installed in EKS
3. **External Secrets Operator** - For AWS Secrets Manager integration
4. **ACM Certificate** - For HTTPS (update in values.yaml)

## Deployment

### Option 1: GitHub Actions (Recommended)

Run the `deploy-argocd.yml` workflow:

1. Go to **Actions** > **Deploy ArgoCD**
2. Click **Run workflow**
3. Select action: `install` or `upgrade`
4. Click **Run workflow**

### Option 2: Manual Deployment

```bash
# Configure kubectl
aws eks update-kubeconfig --name ecommerce-demo-demo-eks --region us-east-1

# Add ArgoCD Helm repo
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update

# Install ArgoCD
helm upgrade --install argocd argo/argo-cd \
  --namespace argocd \
  --create-namespace \
  --values argocd/install/values.yaml \
  --wait

# Apply Project and Applications
kubectl apply -f argocd/projects/ecommerce.yaml
kubectl apply -f argocd/applications/backend.yaml
kubectl apply -f argocd/applications/frontend.yaml
```

## Accessing ArgoCD

### Get Admin Password

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

### Get ArgoCD URL

```bash
kubectl get ingress argocd-server -n argocd -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

### Port Forward (alternative)

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
# Access at https://localhost:8080
```

## Sync Policy

**Manual Sync** is configured for both applications. This means:

- Changes to Helm charts in Git do NOT auto-deploy
- You must manually click "Sync" in ArgoCD UI
- Or use CLI: `argocd app sync backend`

This is intentional for demo/production environments where you want explicit control over deployments.

## Application Configuration

### Backend Application

- **Source:** `helm/backend` (values-demo.yaml)
- **Destination:** `ecommerce` namespace
- **Sync:** Manual
- **Health:** Ignores replica count (managed by HPA)

### Frontend Application

- **Source:** `helm/frontend` (values-demo.yaml)
- **Destination:** `ecommerce` namespace
- **Sync:** Manual
- **Health:** Ignores replica count (managed by HPA)

## Updating Image Tags

After CI builds a new image, update the application:

### Option 1: ArgoCD UI

1. Open application
2. Click "App Details"
3. Edit parameters
4. Set `image.tag` to new SHA
5. Click "Sync"

### Option 2: ArgoCD CLI

```bash
argocd app set backend --helm-set image.tag=abc123
argocd app sync backend
```

### Option 3: Update values-demo.yaml

```yaml
# helm/backend/values-demo.yaml
image:
  tag: "abc123"  # Update this
```

Then sync in ArgoCD.

## Troubleshooting

### Application Not Syncing

```bash
# Check application status
argocd app get backend

# View sync differences
argocd app diff backend

# Force sync
argocd app sync backend --force
```

### ArgoCD Server Not Ready

```bash
# Check pods
kubectl get pods -n argocd

# Check logs
kubectl logs -n argocd deployment/argocd-server
```

### Ingress Not Working

```bash
# Check ALB controller
kubectl get pods -n kube-system | grep aws-load-balancer

# Check ingress status
kubectl describe ingress argocd-server -n argocd
```

## Uninstall

```bash
# Delete applications
kubectl delete -f argocd/applications/
kubectl delete -f argocd/projects/

# Uninstall ArgoCD
helm uninstall argocd -n argocd

# Delete namespace
kubectl delete namespace argocd
```

Or run the GitHub Actions workflow with action: `uninstall`.
