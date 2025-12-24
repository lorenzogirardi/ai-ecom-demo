# Development Guide

Guidelines and best practices for developing the E-commerce Demo project.

## Project Structure

```
ecommerce-demo/
├── apps/
│   ├── frontend/          # Next.js frontend application
│   │   ├── src/
│   │   │   └── app/       # Next.js App Router pages
│   │   ├── public/        # Static assets
│   │   └── ...
│   └── backend/           # Fastify backend API
│       ├── src/
│       │   ├── modules/   # Feature modules
│       │   ├── config/    # Configuration
│       │   ├── middleware/# Express middleware
│       │   └── utils/     # Utilities
│       ├── prisma/        # Database schema & migrations
│       └── tests/         # Test files
├── infra/                 # Infrastructure as Code
├── helm/                  # Kubernetes Helm charts
├── scripts/               # Utility scripts
└── docs/                  # Documentation
```

## Development Workflow

### Starting Development

```bash
# Start all services
npm run dev

# Or start individually
npm run dev:frontend
npm run dev:backend
```

### Running Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test -- --coverage

# Watch mode
npm run test -- --watch
```

### Linting

```bash
# Lint all projects
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## Backend Development

### Adding a New Module

1. Create module directory:
   ```
   apps/backend/src/modules/your-module/
   ├── your-module.routes.ts
   ├── your-module.service.ts
   ├── your-module.schema.ts
   └── your-module.types.ts
   ```

2. Register routes in `server.ts`:
   ```typescript
   import { yourModuleRoutes } from "./modules/your-module/your-module.routes.js";

   await app.register(yourModuleRoutes, { prefix: "/api/your-module" });
   ```

### Database Changes

1. **Modify schema**
   ```bash
   # Edit prisma/schema.prisma
   ```

2. **Create migration**
   ```bash
   npm run db:migrate -w apps/backend
   ```

3. **Apply to production**
   ```bash
   npm run db:migrate:prod -w apps/backend
   ```

### API Validation with Zod

```typescript
import { z } from "zod";

const createItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().positive("Price must be positive"),
  quantity: z.number().int().min(0).default(0),
});

// In route handler
const body = createItemSchema.parse(request.body);
```

### Error Handling

```typescript
import { NotFoundError, BadRequestError } from "../middleware/error-handler.js";

// Throw custom errors
if (!item) {
  throw new NotFoundError("Item not found");
}

if (item.stock < quantity) {
  throw new BadRequestError("Insufficient stock");
}
```

## Frontend Development

### Component Structure

```
src/
├── app/                 # Pages (App Router)
├── components/
│   ├── ui/              # Reusable UI components
│   ├── features/        # Feature-specific components
│   └── layout/          # Layout components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── services/            # API service functions
└── types/               # TypeScript types
```

### Using React Query

```typescript
import { useQuery, useMutation } from "@tanstack/react-query";
import { productsApi } from "@/services/api";

// Query
const { data, isLoading } = useQuery({
  queryKey: ["products"],
  queryFn: () => productsApi.getAll(),
});

// Mutation
const mutation = useMutation({
  mutationFn: productsApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  },
});
```

### Styling with Tailwind

```tsx
// Use utility classes
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
</div>

// Use custom components from globals.css
<button className="btn btn-primary btn-lg">
  Click me
</button>
```

## Git Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `chore/` - Maintenance tasks

### Commit Messages

Follow conventional commits:

```
feat: add product search functionality
fix: resolve cart quantity update issue
docs: update API documentation
refactor: simplify order processing logic
chore: update dependencies
```

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes and commit
3. Push and create PR to `develop`
4. Request review
5. Address feedback
6. Merge after approval

## Environment Variables

### Backend

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_HOST` | Redis host | Yes |
| `REDIS_PASSWORD` | Redis password | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `CORS_ORIGIN` | Allowed CORS origin | Yes |

### Frontend

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |
| `NEXT_PUBLIC_APP_NAME` | Application name | No |

## Code Quality

### Pre-commit Hooks

The project uses Husky and lint-staged for pre-commit hooks:

- Linting with ESLint
- Formatting with Prettier
- Type checking with TypeScript

### IDE Setup

#### VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma

#### Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```
