# API Documentation

Backend API reference for the E-commerce Demo.

## Base URL

- **Local**: `http://localhost:4000`
- **Demo**: `https://api.demo.example.com`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Headers

```
Authorization: Bearer <token>
```

### Token Lifecycle

- Access tokens expire in 7 days
- Refresh tokens expire in 30 days

## Endpoints

### Health & Status

#### Health Check
```
GET /health
```

**Response**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Readiness Check
```
GET /ready
```

**Response**
```json
{
  "status": "ready",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### Authentication

#### Register

```
POST /api/auth/register
```

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CUSTOMER",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login

```
POST /api/auth/login
```

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Current User

```
GET /api/auth/me
Authorization: Bearer <token>
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CUSTOMER",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update Profile

```
PATCH /api/auth/me
Authorization: Bearer <token>
```

**Request Body**
```json
{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

#### Change Password

```
POST /api/auth/change-password
Authorization: Bearer <token>
```

**Request Body**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

---

### Catalog

#### List Categories

```
GET /api/catalog/categories
```

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "name": "Electronics",
      "slug": "electronics",
      "description": "Electronic devices",
      "imageUrl": "https://...",
      "_count": { "products": 42 }
    }
  ]
}
```

#### Get Category

```
GET /api/catalog/categories/:idOrSlug
```

#### List Products

```
GET /api/catalog/products
```

**Query Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 100) |
| categoryId | string | Filter by category |
| minPrice | number | Minimum price |
| maxPrice | number | Maximum price |
| featured | boolean | Featured products only |
| sortBy | string | Sort field (name, price, createdAt) |
| sortOrder | string | Sort order (asc, desc) |

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "sku": "PROD-001",
      "name": "Product Name",
      "slug": "product-name",
      "description": "Product description",
      "price": "99.99",
      "stock": 100,
      "imageUrl": "https://...",
      "status": "ACTIVE",
      "isFeatured": true,
      "category": {
        "id": "clx...",
        "name": "Electronics",
        "slug": "electronics"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### Get Product

```
GET /api/catalog/products/:idOrSlug
```

#### Create Product (Admin)

```
POST /api/catalog/products
Authorization: Bearer <admin_token>
```

**Request Body**
```json
{
  "categoryId": "clx...",
  "sku": "PROD-001",
  "name": "New Product",
  "slug": "new-product",
  "description": "Product description",
  "price": 99.99,
  "stock": 100,
  "imageUrl": "https://...",
  "status": "ACTIVE",
  "isFeatured": false
}
```

#### Update Product (Admin)

```
PATCH /api/catalog/products/:id
Authorization: Bearer <admin_token>
```

#### Delete Product (Admin)

```
DELETE /api/catalog/products/:id
Authorization: Bearer <admin_token>
```

---

### Search

#### Search

```
GET /api/search
```

**Query Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| q | string | Search query (required) |
| type | string | Search type (all, products, categories) |
| page | number | Page number |
| limit | number | Items per page |
| categoryId | string | Filter by category |
| minPrice | number | Minimum price |
| maxPrice | number | Maximum price |

**Response**
```json
{
  "success": true,
  "products": [...],
  "categories": [...],
  "meta": {
    "query": "search term",
    "page": 1,
    "limit": 20,
    "totalProducts": 10,
    "totalCategories": 2
  }
}
```

#### Autocomplete Suggestions

```
GET /api/search/suggest?q=prod&limit=5
```

#### Popular Searches

```
GET /api/search/popular
```

---

### Orders

#### Create Order

```
POST /api/orders
Authorization: Bearer <token>
```

**Request Body**
```json
{
  "items": [
    {
      "productId": "clx...",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "address1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US"
  },
  "notes": "Leave at door"
}
```

**Response** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "orderNumber": "ORD-ABC123-XYZ",
    "status": "PENDING",
    "subtotal": "199.98",
    "tax": "19.99",
    "totalAmount": "219.97",
    "items": [...]
  }
}
```

#### List Orders

```
GET /api/orders
Authorization: Bearer <token>
```

**Query Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| status | string | Filter by status |

#### Get Order

```
GET /api/orders/:id
Authorization: Bearer <token>
```

#### Cancel Order

```
POST /api/orders/:id/cancel
Authorization: Bearer <token>
```

#### List All Orders (Admin)

```
GET /api/orders/admin/all
Authorization: Bearer <admin_token>
```

#### Update Order Status (Admin)

```
PATCH /api/orders/:id/status
Authorization: Bearer <admin_token>
```

**Request Body**
```json
{
  "status": "SHIPPED",
  "notes": "Shipped via UPS"
}
```

#### Order Statistics (Admin)

```
GET /api/orders/admin/stats
Authorization: Bearer <admin_token>
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| BAD_REQUEST | 400 | Invalid request data |
| UNAUTHORIZED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| VALIDATION_ERROR | 422 | Request validation failed |
| INTERNAL_ERROR | 500 | Server error |

### Validation Errors

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "errors": {
      "email": ["Invalid email address"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

## Rate Limiting

- Default: 100 requests per minute per IP
- Headers:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

## OpenAPI Documentation

Interactive API documentation is available at:
- **Local**: http://localhost:4000/docs
- **Demo**: https://api.demo.example.com/docs
