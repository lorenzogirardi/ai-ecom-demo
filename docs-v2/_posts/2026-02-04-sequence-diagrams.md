---
layout: post
title: "Sequence Diagrams"
date: 2026-02-04
category: architecture
order: 4
reading_time: 15
tags: [api,flows,authentication,orders]
---


Sequence diagrams for the main application flows.

---

## 1. Authentication (Login)

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as Frontend<br/>(Next.js)
    participant BE as Backend<br/>(Fastify)
    participant DB as PostgreSQL

    U->>FE: Enter email and password
    FE->>FE: Client-side form validation
    FE->>FE: Axios POST /api/auth/login
    Note over FE: Next.js Proxy<br/>(server-side)
    FE->>BE: Proxy → POST /api/auth/login<br/>{email, password}
    BE->>BE: Zod schema validation
    BE->>DB: SELECT * FROM User<br/>WHERE email = ?
    DB-->>BE: User record (with password hash)
    BE->>BE: bcrypt.compare(password, hash)
    alt Valid password
        BE->>BE: JWT.sign({sub: userId, role})
        BE-->>FE: 200 OK<br/>{user, token}
        FE->>FE: localStorage.setItem('token', token)
        FE->>FE: document.cookie = token
        FE-->>U: Redirect to Home
    else Invalid password
        BE-->>FE: 401 Unauthorized
        FE-->>U: Show error "Invalid credentials"
    end
```

---

## 2. Registration

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as Frontend<br/>(Next.js)
    participant BE as Backend<br/>(Fastify)
    participant DB as PostgreSQL

    U->>FE: Fill registration form
    FE->>FE: Client-side validation
    FE->>FE: Axios POST /api/auth/register
    Note over FE: Next.js Proxy<br/>(server-side)
    FE->>BE: POST /api/auth/register<br/>{email, password, firstName, lastName}
    BE->>BE: Zod schema validation
    BE->>DB: SELECT * FROM User<br/>WHERE email = ?
    alt Email already exists
        DB-->>BE: User found
        BE-->>FE: 409 Conflict
        FE-->>U: "Email already registered"
    else Email available
        DB-->>BE: null
        BE->>BE: bcrypt.hash(password, 10)
        BE->>DB: INSERT INTO User<br/>(email, password, firstName, lastName)
        DB-->>BE: User created
        BE->>BE: JWT.sign({sub: userId, role})
        BE-->>FE: 201 Created<br/>{user, token}
        FE->>FE: localStorage.setItem('token', token)
        FE-->>U: Redirect to Home
    end
```

---

## 3. Browse Products (with Cache)

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as Frontend<br/>(Next.js)
    participant RQ as React Query<br/>(Cache)
    participant BE as Backend<br/>(Fastify)
    participant Redis as Redis<br/>(Cache)
    participant DB as PostgreSQL

    U->>FE: Navigate to /products
    FE->>RQ: useProducts({page: 1, limit: 20})
    alt Cache HIT (React Query)
        RQ-->>FE: Cached products
        FE-->>U: Render product grid
    else Cache MISS
        RQ->>FE: Axios GET /api/catalog/products
        Note over FE: Next.js Proxy<br/>(server-side)
        FE->>BE: GET /api/catalog/products?page=1&limit=20
        BE->>BE: Query params validation
        BE->>DB: SELECT * FROM Product<br/>WHERE status = 'ACTIVE'<br/>LIMIT 20 OFFSET 0
        DB-->>BE: Products[]
        BE->>DB: SELECT COUNT(*) FROM Product
        DB-->>BE: total count
        BE-->>RQ: {data: products, meta: pagination}
        RQ->>RQ: Cache response (staleTime)
        RQ-->>FE: Products data
        FE-->>U: Render product grid
    end

    U->>FE: Click on product
    FE->>RQ: useProduct(slug)
    RQ->>BE: GET /api/catalog/products/:slug
    BE->>DB: SELECT * FROM Product<br/>WHERE slug = ?<br/>INCLUDE Category
    DB-->>BE: Product with Category
    BE-->>RQ: Product details
    RQ-->>FE: Product data
    FE-->>U: Render product page
```

---

## 4. Browse Categories (with Redis Cache)

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as Frontend<br/>(Next.js)
    participant BE as Backend<br/>(Fastify)
    participant Redis as Redis<br/>(Cache)
    participant DB as PostgreSQL

    U->>FE: Navigate to /categories
    FE->>FE: Axios GET /api/catalog/categories
    Note over FE: Next.js Proxy<br/>(server-side)
    FE->>BE: GET /api/catalog/categories
    BE->>Redis: GET categories:all
    alt Redis Cache HIT
        Redis-->>BE: Cached categories JSON
        BE-->>FE: Categories[]
    else Redis Cache MISS
        Redis-->>BE: null
        BE->>DB: SELECT * FROM Category<br/>WHERE isActive = true<br/>ORDER BY sortOrder
        DB-->>BE: Categories[]
        BE->>Redis: SET categories:all<br/>EX 300 (5 min)
        Redis-->>BE: OK
        BE-->>FE: Categories[]
    end
    FE-->>U: Render category grid
```

---

## 5. Cart Management (Client-Side)

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as Frontend<br/>(Next.js)
    participant Zustand as Zustand Store
    participant LS as localStorage

    Note over U,LS: Add to Cart
    U->>FE: Click "Add to cart"
    FE->>Zustand: addItem(product, quantity)
    Zustand->>Zustand: Check if product exists
    alt Product already in cart
        Zustand->>Zustand: item.quantity += quantity
    else New product
        Zustand->>Zustand: items.push({product, quantity})
    end
    Zustand->>LS: persist({items})
    Zustand-->>FE: Updated cart state
    FE-->>U: Update cart badge count

    Note over U,LS: Update Quantity
    U->>FE: Change quantity
    FE->>Zustand: updateQuantity(productId, newQty)
    alt newQty <= 0
        Zustand->>Zustand: Remove item from array
    else newQty > 0
        Zustand->>Zustand: item.quantity = newQty
    end
    Zustand->>LS: persist({items})
    FE->>FE: Recalculate getTotal()
    FE-->>U: Update cart display

    Note over U,LS: Page Reload
    U->>FE: Refresh page
    FE->>Zustand: Initialize store
    Zustand->>LS: getItem('cart-storage')
    LS-->>Zustand: Persisted cart data
    Zustand-->>FE: Restored cart state
    FE-->>U: Cart restored
```

---

## 6. Checkout and Order Creation

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as Frontend<br/>(Next.js)
    participant Cart as Zustand Cart
    participant BE as Backend<br/>(Fastify)
    participant DB as PostgreSQL

    U->>FE: Navigate to /checkout
    FE->>Cart: getItems()
    Cart-->>FE: Cart items
    FE-->>U: Show summary + address form

    U->>FE: Fill address and confirm
    FE->>FE: Axios POST /api/orders
    Note over FE: Next.js Proxy<br/>(server-side)
    FE->>BE: POST /api/orders<br/>{items, shippingAddress, billingAddress}

    Note over BE,DB: Transaction Start
    BE->>BE: Zod schema validation
    BE->>DB: SELECT * FROM Product<br/>WHERE id IN (...)
    DB-->>BE: Products[]
    BE->>BE: Verify stock availability

    alt Insufficient stock
        BE-->>FE: 400 Bad Request<br/>"Insufficient stock"
        FE-->>U: Show stock error
    else Stock OK
        BE->>BE: Calculate subtotal, tax (10%), total
        BE->>BE: Generate orderNumber<br/>ORD-{timestamp}-{hex}
        BE->>DB: INSERT INTO Order
        DB-->>BE: Order created

        loop For each item
            BE->>DB: INSERT INTO OrderItem
            BE->>DB: UPDATE Product<br/>SET stock = stock - quantity
        end

        Note over BE,DB: Transaction Commit
        DB-->>BE: Success
        BE-->>FE: 201 Created<br/>{order with items}
        FE->>Cart: clearCart()
        Cart->>Cart: items = []
        FE-->>U: Redirect to /orders/:orderNumber
    end
```

---

## 7. View Orders

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as Frontend<br/>(Next.js)
    participant BE as Backend<br/>(Fastify)
    participant DB as PostgreSQL

    U->>FE: Navigate to /account/orders
    FE->>FE: Verify auth token
    FE->>FE: Axios GET /api/orders
    Note over FE: Next.js Proxy<br/>(server-side)
    FE->>BE: GET /api/orders<br/>Authorization: Bearer {token}
    BE->>BE: Verify JWT
    BE->>BE: Extract userId from token
    BE->>DB: SELECT * FROM Order<br/>WHERE userId = ?<br/>ORDER BY createdAt DESC<br/>INCLUDE OrderItem, Product
    DB-->>BE: Orders[]
    BE-->>FE: {data: orders, meta: pagination}
    FE-->>U: Render order history table

    U->>FE: Click on specific order
    FE->>FE: Axios GET /api/orders/:id
    Note over FE: Next.js Proxy
    FE->>BE: GET /api/orders/:id<br/>Authorization: Bearer {token}
    BE->>BE: Verify user owns order OR is admin
    BE->>DB: SELECT * FROM Order<br/>WHERE id = ?<br/>INCLUDE OrderItem, Product
    DB-->>BE: Order with items
    BE-->>FE: Order details
    FE-->>U: Render order detail page
```

---

## 8. Product Search (with Redis Cache)

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as Frontend<br/>(Next.js)
    participant BE as Backend<br/>(Fastify)
    participant Redis as Redis<br/>(Cache)
    participant DB as PostgreSQL

    U->>FE: Type "laptop" in search bar
    FE->>FE: Debounce input (300ms)
    FE->>FE: Axios GET /api/search
    Note over FE: Next.js Proxy<br/>(server-side)
    FE->>BE: GET /api/search?q=laptop&type=all
    BE->>BE: Query params validation
    BE->>Redis: GET search:laptop:all:1:20

    alt Redis Cache HIT
        Redis-->>BE: Cached results
        BE-->>FE: Search results
    else Redis Cache MISS
        Redis-->>BE: null

        par Parallel queries
            BE->>DB: SELECT * FROM Product<br/>WHERE status='ACTIVE'<br/>AND (name ILIKE '%laptop%'<br/>OR description ILIKE '%laptop%')
            DB-->>BE: Products[]
        and
            BE->>DB: SELECT * FROM Category<br/>WHERE isActive=true<br/>AND name ILIKE '%laptop%'
            DB-->>BE: Categories[]
        end

        BE->>Redis: SET search:laptop:all:1:20<br/>EX 120 (2 min)
        BE-->>FE: {products, categories, meta}
    end

    FE-->>U: Render search results
```

---

## 9. Autocomplete/Suggestions

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as Frontend<br/>(Next.js)
    participant BE as Backend<br/>(Fastify)
    participant Redis as Redis<br/>(Cache)
    participant DB as PostgreSQL

    U->>FE: Start typing "lap"
    FE->>FE: Debounce (150ms)
    FE->>FE: Axios GET /api/search/suggest
    Note over FE: Next.js Proxy<br/>(server-side)
    FE->>BE: GET /api/search/suggest?q=lap&limit=5
    BE->>Redis: GET suggest:lap:5

    alt Redis Cache HIT
        Redis-->>BE: Cached suggestions
    else Redis Cache MISS
        BE->>DB: SELECT id, name, slug, imageUrl, price<br/>FROM Product<br/>WHERE name ILIKE 'lap%'<br/>LIMIT 5
        DB-->>BE: Matching products
        BE->>DB: SELECT id, name, slug<br/>FROM Category<br/>WHERE name ILIKE '%lap%'<br/>LIMIT 3
        DB-->>BE: Matching categories
        BE->>Redis: SET suggest:lap:5<br/>EX 300 (5 min)
    end

    BE-->>FE: {products, categories}
    FE-->>U: Show suggestions dropdown

    U->>FE: Click on suggestion
    FE->>FE: Navigate to /products/:slug
```

---

## 10. General Architecture

```mermaid
flowchart TB
    subgraph Client
        Browser[Browser]
        LS[(localStorage)]
    end

    subgraph Frontend["Frontend (Next.js)"]
        Pages[Pages/Components]
        RQ[React Query<br/>Cache]
        Zustand[Zustand<br/>Cart Store]
        Axios[Axios Client]
        Proxy[Next.js Proxy<br/>/api/* → Backend]
    end

    subgraph Backend["Backend (Fastify)"]
        Routes[API Routes]
        Auth[JWT Auth]
        Valid[Zod Validation]
        Handlers[Route Handlers]
    end

    subgraph Data
        Redis[(Redis<br/>Cache)]
        PG[(PostgreSQL<br/>Database)]
    end

    Browser --> Pages
    Pages <--> RQ
    Pages <--> Zustand
    Zustand <--> LS
    RQ <--> Axios
    Axios --> Proxy
    Proxy --> Routes
    Routes --> Auth
    Auth --> Valid
    Valid --> Handlers
    Handlers <--> Redis
    Handlers <--> PG
```

> **Note:** All API calls from the browser go through Next.js which acts as a proxy to the backend.
> This avoids CORS issues and maintains a single domain for the user.

---

## Legend

| Component | Technology | Function |
|-----------|------------|----------|
| **Frontend** | Next.js 16 | UI, routing, state management |
| **React Query** | TanStack Query | Data fetching, client-side cache |
| **Zustand** | Zustand + persist | Cart state, localStorage sync |
| **Backend** | Fastify | REST API, business logic |
| **Redis** | Redis | Server-side cache (5-10 min TTL) |
| **PostgreSQL** | Prisma ORM | Persistent data storage |

---

## Cache Strategy

| Data | Cache Layer | TTL |
|------|-------------|-----|
| Categories | Redis | 5 min |
| Products list | React Query | staleTime |
| Search results | Redis | 2 min |
| Suggestions | Redis | 5 min |
| Popular items | Redis | 10 min |
| Cart | localStorage | Persistent |
| Auth token | localStorage | Until logout |

---

*Document generated: 2025-12-30*
