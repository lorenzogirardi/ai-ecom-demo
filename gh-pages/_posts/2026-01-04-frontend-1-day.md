---
layout: post
title: "Frontend in 1 Day: Next.js 16 + React Components"
date: 2026-01-04
category: AI-Augmented
reading_time: 8
tags: [nextjs, react, typescript, tailwind, frontend]
excerpt: "Building a complete e-commerce frontend with Next.js 16 App Router in a single day. Components, hooks, and patterns."
takeaway: "AI excels at generating UI boilerplate. The developer focuses on UX decisions and edge cases."
---

## Day 3: Frontend Sprint

With the backend API ready, it was time for the frontend. Goal: **complete e-commerce UI** in one day.

### What We Built

- Next.js 16 with App Router
- 15+ React components
- 5 custom hooks with React Query
- Authentication flow
- Shopping cart and checkout
- 29 frontend tests

## Project Structure

```
apps/frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── layout.tsx
│   │   ├── page.tsx      # Homepage
│   │   ├── products/
│   │   ├── categories/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── auth/
│   │   └── account/
│   ├── components/
│   │   ├── layout/       # Header, Footer
│   │   ├── ui/           # Button, Input, Card
│   │   ├── products/     # ProductCard, ProductGrid
│   │   ├── cart/         # CartItem, CartSummary
│   │   └── checkout/     # AddressForm
│   ├── hooks/            # useProducts, useCart, useAuth
│   ├── lib/              # API client, auth context
│   └── types/
├── tests/
└── Dockerfile
```

## Component Library

### Design System with Tailwind

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors;
  }
  .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700;
  }
  .btn-secondary {
    @apply bg-gray-200 text-gray-800 hover:bg-gray-300;
  }
  .card {
    @apply bg-white rounded-lg shadow-md p-4;
  }
  .input {
    @apply w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500;
  }
}
```

### ProductCard Component

```tsx
// src/components/products/ProductCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/models';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="card group hover:shadow-lg transition-shadow">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
          <Image
            src={product.imageUrl || '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        </div>
        <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
          {product.name}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2">
          {product.description}
        </p>
        <p className="mt-2 font-bold text-lg">
          {formatPrice(product.price)}
        </p>
      </Link>
      <button
        className="btn btn-primary w-full mt-4"
        onClick={() => addToCart(product)}
      >
        Add to Cart
      </button>
    </div>
  );
}
```

### ProductGrid with Responsive Layout

```tsx
// src/components/products/ProductGrid.tsx
import { ProductCard } from './ProductCard';
import { Product } from '@/types/models';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

export function ProductGrid({ products, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

## Custom Hooks with React Query

### useProducts Hook

```tsx
// src/hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface UseProductsOptions {
  page?: number;
  limit?: number;
  category?: string;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { page = 1, limit = 20, category } = options;

  return useQuery({
    queryKey: ['products', { page, limit, category }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(category && { category })
      });

      const response = await api.get(`/catalog/products?${params}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### useCart Hook

```tsx
// src/hooks/useCart.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

export function useCart() {
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await api.get('/cart');
      return response.data;
    }
  });

  const addItem = useMutation({
    mutationFn: async ({ productId, quantity }: AddItemInput) => {
      return api.post('/cart/items', { productId, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart!');
    },
    onError: () => {
      toast.error('Failed to add item');
    }
  });

  const removeItem = useMutation({
    mutationFn: async (itemId: string) => {
      return api.delete(`/cart/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });

  return {
    cart: cartQuery.data,
    isLoading: cartQuery.isLoading,
    addItem: addItem.mutate,
    removeItem: removeItem.mutate,
    isAdding: addItem.isPending
  };
}
```

### useAuth Hook with Context

```tsx
// src/lib/auth-context.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await api.get('/auth/me');
        setUser(response.data.data);
      }
    } catch {
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
  }

  function logout() {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

## Pages

### Products Page

```tsx
// src/app/products/page.tsx
import { Suspense } from 'react';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductFilters } from '@/components/products/ProductFilters';

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>

      <div className="flex gap-8">
        <aside className="w-64 flex-shrink-0">
          <ProductFilters />
        </aside>

        <main className="flex-1">
          <Suspense fallback={<ProductGrid products={[]} loading />}>
            <ProductList />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

async function ProductList() {
  const products = await fetchProducts();
  return <ProductGrid products={products} />;
}
```

### Checkout Flow

```tsx
// src/app/checkout/page.tsx
'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/lib/auth-context';
import { AddressForm } from '@/components/checkout/AddressForm';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { redirect } from 'next/navigation';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart, isLoading } = useCart();
  const [step, setStep] = useState<'address' | 'payment' | 'confirm'>('address');

  if (!user) redirect('/auth/login?redirect=/checkout');
  if (!cart?.items.length) redirect('/cart');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 'address' && (
            <AddressForm onComplete={() => setStep('payment')} />
          )}
          {step === 'payment' && (
            <PaymentForm onComplete={() => setStep('confirm')} />
          )}
          {step === 'confirm' && (
            <OrderConfirmation />
          )}
        </div>

        <aside>
          <OrderSummary cart={cart} />
        </aside>
      </div>
    </div>
  );
}
```

## Testing

### Component Tests

```tsx
// tests/components/AddressForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AddressForm } from '@/components/checkout/AddressForm';

describe('AddressForm', () => {
  it('validates required fields', async () => {
    const onComplete = vi.fn();
    render(<AddressForm onComplete={onComplete} />);

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    expect(await screen.findByText(/street is required/i)).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('submits valid address', async () => {
    const onComplete = vi.fn();
    render(<AddressForm onComplete={onComplete} />);

    fireEvent.change(screen.getByLabelText(/street/i), {
      target: { value: '123 Main St' }
    });
    fireEvent.change(screen.getByLabelText(/city/i), {
      target: { value: 'New York' }
    });
    // ... fill other fields

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });
});
```

### Hook Tests

```tsx
// tests/hooks/useAuth.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useAuth, AuthProvider } from '@/lib/auth-context';

describe('useAuth', () => {
  it('logs in user successfully', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.user).toBeDefined();
    expect(result.current.user?.email).toBe('test@example.com');
  });

  it('logs out user', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    // First login
    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    // Then logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
  });
});
```

## Docker Configuration

```dockerfile
# apps/frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
```

## Results

After 1 day:

| Metric | Value |
|--------|-------|
| Components | 15+ |
| Custom Hooks | 5 |
| Pages | 12 |
| Tests | 29 |
| Lines of Code | ~2,500 |
| Time Spent | ~8 hours |

---

*Next: [CI/CD Enterprise-Grade: Security by Design](/blog/cicd-security/)*
