# Setup Guide

Complete setup guide for the E-commerce Demo project.

## Prerequisites

### Required Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20+ | JavaScript runtime |
| npm | 10+ | Package manager |
| Docker | 24+ | Container runtime |
| Docker Compose | 2+ | Local services orchestration |
| AWS CLI | 2+ | AWS operations |
| Terraform | 1.5+ | Infrastructure as Code |
| kubectl | 1.28+ | Kubernetes CLI |
| Helm | 3+ | Kubernetes package manager |

### Installation

#### macOS (using Homebrew)

```bash
# Node.js
brew install node@20

# Docker Desktop (includes Docker Compose)
brew install --cask docker

# AWS CLI
brew install awscli

# Terraform
brew install terraform

# kubectl
brew install kubectl

# Helm
brew install helm
```

#### Linux (Ubuntu/Debian)

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Terraform
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform

# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl && sudo mv kubectl /usr/local/bin/

# Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

## Local Development Setup

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd ecommerce-demo

# Run the setup script
./scripts/local-dev.sh setup

# Start development servers
./scripts/local-dev.sh dev
```

### Manual Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start infrastructure services**
   ```bash
   docker-compose up -d
   ```

3. **Configure environment**
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   cp apps/frontend/.env.example apps/frontend/.env
   ```

4. **Generate Prisma client**
   ```bash
   npm run db:generate -w apps/backend
   ```

5. **Run migrations**
   ```bash
   npm run db:migrate
   ```

6. **Seed database (optional)**
   ```bash
   npm run db:seed
   ```

7. **Start development servers**
   ```bash
   npm run dev
   ```

### Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | - |
| Backend API | http://localhost:4000 | - |
| API Documentation | http://localhost:4000/docs | - |
| Adminer (DB UI) | http://localhost:8080 | Server: postgres, User: ecommerce, Pass: ecommerce_secret |

## AWS Infrastructure Setup

### Configure AWS Credentials

```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your default region (e.g., us-east-1)
```

### Create Terraform Backend

```bash
./scripts/setup-infra.sh backend
```

### Deploy Infrastructure

1. **Initialize Terraform**
   ```bash
   ./scripts/setup-infra.sh init
   ```

2. **Configure variables**
   ```bash
   cd infra/terraform/environments/demo
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

3. **Plan infrastructure**
   ```bash
   ./scripts/setup-infra.sh plan
   ```

4. **Apply infrastructure**
   ```bash
   ./scripts/setup-infra.sh apply
   ```

5. **Configure kubectl**
   ```bash
   ./scripts/setup-infra.sh kubectl
   ```

6. **Install cluster components**
   ```bash
   ./scripts/setup-infra.sh cluster-components
   ```

## Troubleshooting

### Docker Issues

**Problem**: Docker containers won't start
```bash
# Check Docker status
docker info

# Restart Docker
# macOS: Restart Docker Desktop
# Linux: sudo systemctl restart docker
```

### Database Issues

**Problem**: Cannot connect to PostgreSQL
```bash
# Check if container is running
docker-compose ps

# View logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d
```

### Node.js Issues

**Problem**: npm install fails
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Kubernetes Issues

**Problem**: kubectl cannot connect to cluster
```bash
# Update kubeconfig
aws eks update-kubeconfig --name ecommerce-demo-demo-eks --region us-east-1

# Verify connection
kubectl cluster-info
```
