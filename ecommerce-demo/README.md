# E-commerce Demo

A production-ready e-commerce monorepo designed for deployment on AWS EKS. This project demonstrates modern cloud-native architecture patterns with a Next.js frontend and Fastify backend.

## Architecture Overview

```mermaid
flowchart TB
    subgraph Internet
        User[User Browser]
        CDN[CloudFront CDN]
    end

    subgraph AWS["AWS Cloud"]
        subgraph VPC["VPC"]
            subgraph Public["Public Subnets"]
                ALB[Application Load Balancer]
                NAT[NAT Gateway]
            end

            subgraph Private["Private Subnets"]
                subgraph EKS["EKS Cluster"]
                    subgraph Frontend["Frontend Pods"]
                        FE1[Next.js App]
                        FE2[Next.js App]
                    end
                    subgraph Backend["Backend Pods"]
                        BE1[Fastify API]
                        BE2[Fastify API]
                    end
                end
            end

            subgraph Data["Data Layer"]
                RDS[(PostgreSQL RDS)]
                ElastiCache[(ElastiCache Redis)]
            end
        end

        S3[(S3 Bucket)]
        ECR[ECR Registry]
    end

    User --> CDN
    CDN --> ALB
    CDN --> S3
    ALB --> FE1
    ALB --> FE2
    ALB --> BE1
    ALB --> BE2
    FE1 & FE2 --> BE1 & BE2
    BE1 & BE2 --> RDS
    BE1 & BE2 --> ElastiCache
    BE1 & BE2 --> S3
```

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Query (TanStack Query)
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js 20
- **Framework:** Fastify
- **Language:** TypeScript
- **ORM:** Prisma
- **Validation:** Zod
- **Authentication:** JWT (jsonwebtoken)
- **Logging:** Pino
- **Cache:** Redis (ioredis)

### Infrastructure
- **Cloud:** AWS
- **Container Orchestration:** EKS (Kubernetes)
- **IaC:** Terraform
- **Package Management:** Helm
- **CI/CD:** GitHub Actions
- **Database:** PostgreSQL (RDS)
- **Cache:** Redis (ElastiCache)
- **CDN:** CloudFront
- **Storage:** S3

## Project Structure

```
ecommerce-demo/
├── apps/
│   ├── frontend/          # Next.js frontend application
│   └── backend/           # Fastify backend API
├── infra/
│   └── terraform/         # Terraform IaC modules
├── helm/                  # Helm charts for K8s deployment
├── .github/workflows/     # CI/CD pipelines
├── scripts/               # Utility scripts
└── docs/                  # Documentation
```

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- Docker & Docker Compose
- AWS CLI (for deployment)
- kubectl (for Kubernetes)
- Terraform 1.5+ (for infrastructure)
- Helm 3+ (for Kubernetes packages)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start infrastructure services**
   ```bash
   npm run docker:up
   ```

4. **Set up environment variables**
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   cp apps/frontend/.env.example apps/frontend/.env
   ```

5. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

6. **Seed the database (optional)**
   ```bash
   npm run db:seed
   ```

7. **Start development servers**
   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:3000
   - Backend: http://localhost:4000
   - Adminer (DB UI): http://localhost:8080

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all apps in development mode |
| `npm run build` | Build all apps for production |
| `npm run test` | Run tests across all apps |
| `npm run lint` | Lint all apps |
| `npm run docker:up` | Start Docker services (PostgreSQL, Redis) |
| `npm run docker:down` | Stop Docker services |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |

## Documentation

- [Setup Guide](docs/SETUP.md) - Detailed setup instructions
- [Development Guide](docs/DEVELOPMENT.md) - Development workflow and conventions
- [Deployment Guide](docs/DEPLOYMENT.md) - AWS deployment instructions
- [API Documentation](docs/API.md) - Backend API reference

## Environment Variables

See `.env.example` files in each app directory for required environment variables.

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

MIT License - see LICENSE file for details.
