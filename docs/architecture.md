# Architecture Document
## Zewar Mahal — NestJS Backend

---

**Version:** 1.0  
**Date:** October 2026  
**Stack:** NestJS · TypeScript · PostgreSQL · Redis · Firebase · Docker  

---

## 1. System Overview

The Zewar Mahal backend is a **RESTful API** built with **NestJS** (Node.js), serving:
- **React Native Mobile App** — customer-facing
- **CMS Web Application** — admin-facing

```
┌─────────────────────┐     ┌──────────────────────┐
│  React Native App   │     │   CMS Web Application │
│  (Customer Mobile)  │     │   (Admin Dashboard)   │
└────────┬────────────┘     └──────────┬────────────┘
         │  HTTPS / REST API           │
         └──────────────┬──────────────┘
                        ▼
            ┌───────────────────────┐
            │   NestJS REST API     │
            │   (jewellew-back-api) │
            │   Port: 3000          │
            └─────────┬─────────────┘
                      │
         ┌────────────┼────────────────┐
         ▼            ▼                ▼
   ┌──────────┐ ┌──────────┐   ┌─────────────┐
   │PostgreSQL│ │  Redis   │   │  Firebase   │
   │(Primary  │ │  Cache   │   │  (FCM +     │
   │   DB)    │ │  + OTP   │   │  Crashlytics│
   └──────────┘ └──────────┘   └─────────────┘
                      │
         ┌────────────┼─────────────┐
         ▼            ▼             ▼
   ┌──────────┐ ┌──────────┐ ┌──────────────┐
   │MessageBot│ │Gold/Silver│ │ Image/Cloud  │
   │SMS (OTP) │ │Rate API   │ │ Storage      │
   └──────────┘ └──────────┘ └──────────────┘
```

---

## 2. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Runtime | Node.js | 20 LTS | JavaScript runtime |
| Framework | NestJS | 10.x | Backend framework |
| Language | TypeScript | 5.x | Type safety |
| ORM | TypeORM | 0.3.x | PostgreSQL ORM |
| Database | PostgreSQL | 16.x | Primary data store |
| Cache / OTP | Redis | 7.x | Caching + OTP TTL |
| Auth | JWT (RS256 or HS256) | — | Access + Refresh tokens |
| SMS | MessageBot | — | OTP delivery |
| Push Notifications | Firebase Admin SDK | — | FCM push notifications |
| File Storage | Multer + S3 / Local | — | Image uploads |
| API Docs | Swagger / OpenAPI | 3.0 | Auto-generated docs |
| Containerization | Docker + Docker Compose | — | Local dev environment |
| Testing | Jest + Supertest | — | Unit + E2E tests |
| Process Manager | PM2 | — | Production process management |

---

## 3. NestJS Project Structure

```
jewellew-back-api/
├── src/
│   ├── main.ts                    # App bootstrap
│   ├── app.module.ts              # Root module
│   ├── common/                    # Shared utilities
│   │   ├── decorators/            # Custom decorators (@CurrentUser, @Roles)
│   │   ├── filters/               # AllExceptionsFilter
│   │   ├── guards/                # JwtAuthGuard, AdminGuard, RolesGuard
│   │   ├── interceptors/          # ResponseInterceptor, LoggingInterceptor
│   │   ├── pipes/                 # ParseObjectIdPipe, etc.
│   │   └── dto/                   # Shared DTOs (PaginationDto)
│   ├── config/                    # @nestjs/config schemas
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   └── jwt.config.ts
│   ├── database/                  # TypeORM setup
│   │   ├── migrations/
│   │   └── seeds/
│   ├── modules/
│   │   ├── auth/                  # Module 1: Authentication & OTP
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── otp.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── jwt-refresh.strategy.ts
│   │   │   └── dto/
│   │   ├── users/                 # Module 2: User & Profile
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   └── dto/
│   │   ├── home/                  # Module 3: Home Dashboard
│   │   │   ├── home.module.ts
│   │   │   ├── home.controller.ts
│   │   │   └── home.service.ts
│   │   ├── categories/            # Module 4: Jewellery Categories
│   │   │   ├── categories.module.ts
│   │   │   ├── categories.controller.ts
│   │   │   ├── categories.service.ts
│   │   │   ├── entities/
│   │   │   │   └── category.entity.ts
│   │   │   └── dto/
│   │   ├── products/              # Module 5: Products & Catalogue
│   │   │   ├── products.module.ts
│   │   │   ├── products.controller.ts
│   │   │   ├── products.service.ts
│   │   │   ├── entities/
│   │   │   │   ├── product.entity.ts
│   │   │   │   └── product-image.entity.ts
│   │   │   └── dto/
│   │   ├── rates/                 # Module 6: Gold & Silver Rates
│   │   │   ├── rates.module.ts
│   │   │   ├── rates.controller.ts
│   │   │   ├── rates.service.ts
│   │   │   └── rate-provider.service.ts
│   │   ├── shop-rates/            # Module 7: Shop Rates
│   │   │   ├── shop-rates.module.ts
│   │   │   ├── shop-rates.controller.ts
│   │   │   ├── shop-rates.service.ts
│   │   │   └── entities/
│   │   │       └── shop-rate.entity.ts
│   │   ├── offers/                # Module 8: Offers & Promotions
│   │   │   ├── offers.module.ts
│   │   │   ├── offers.controller.ts
│   │   │   ├── offers.service.ts
│   │   │   ├── entities/
│   │   │   │   └── offer.entity.ts
│   │   │   └── dto/
│   │   ├── banners/               # Module 9: Banner Management
│   │   │   ├── banners.module.ts
│   │   │   ├── banners.controller.ts
│   │   │   ├── banners.service.ts
│   │   │   ├── entities/
│   │   │   │   └── banner.entity.ts
│   │   │   └── dto/
│   │   ├── enquiries/             # Module 10: Customer Enquiries
│   │   │   ├── enquiries.module.ts
│   │   │   ├── enquiries.controller.ts
│   │   │   ├── enquiries.service.ts
│   │   │   ├── entities/
│   │   │   │   └── enquiry.entity.ts
│   │   │   └── dto/
│   │   ├── notifications/         # Module 11: Notifications & FCM
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   ├── fcm.service.ts
│   │   │   ├── entities/
│   │   │   │   ├── notification.entity.ts
│   │   │   │   └── device-token.entity.ts
│   │   │   └── dto/
│   │   └── admin/                 # Module 12: Admin Auth & Management
│   │       ├── admin.module.ts
│   │       ├── admin.controller.ts
│   │       ├── admin.service.ts
│   │       ├── entities/
│   │       │   └── admin.entity.ts
│   │       └── dto/
│   └── shared/
│       ├── storage/               # Image upload service
│       ├── mailer/                # Email (if needed)
│       └── pagination/            # Pagination utility
├── docs/                          # Project documentation
├── test/                          # E2E tests
├── .env
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── nest-cli.json
├── package.json
└── tsconfig.json
```

---

## 4. Database Schema (PostgreSQL)

### 4.1 Entity Relationship Diagram

```
users
├── id (uuid, PK)
├── mobile (varchar, unique)
├── name (varchar, nullable)
├── email (varchar, nullable)
├── avatar (varchar, nullable)
├── isActive (boolean, default: true)
├── notificationPreferences (jsonb)
└── createdAt, updatedAt

admins
├── id (uuid, PK)
├── email (varchar, unique)
├── password (varchar, hashed)
├── name (varchar)
├── role (enum: super_admin | admin)
├── isActive (boolean, default: true)
└── createdAt, updatedAt

categories
├── id (uuid, PK)
├── name (varchar)
├── slug (varchar, unique)
├── image (varchar)
├── description (text, nullable)
├── isActive (boolean, default: true)
└── createdAt, updatedAt

products
├── id (uuid, PK)
├── name (varchar)
├── description (text)
├── price (decimal)
├── metal (enum: gold | silver | platinum)
├── purity (varchar) -- 22K, 18K, 925, etc.
├── weight (decimal, nullable)
├── categoryId (uuid, FK -> categories)
├── isPublished (boolean, default: false)
├── isFeatured (boolean, default: false)
├── isLatest (boolean, default: false)
└── createdAt, updatedAt

product_images
├── id (uuid, PK)
├── productId (uuid, FK -> products)
├── url (varchar)
├── sortOrder (int, default: 0)
└── createdAt

banners
├── id (uuid, PK)
├── title (varchar)
├── image (varchar)
├── link (varchar, nullable)
├── isActive (boolean, default: true)
├── sortOrder (int, default: 0)
└── createdAt, updatedAt

offers
├── id (uuid, PK)
├── title (varchar)
├── description (text, nullable)
├── image (varchar, nullable)
├── discount (varchar, nullable)
├── validFrom (timestamp, nullable)
├── validTo (timestamp, nullable)
├── isActive (boolean, default: true)
└── createdAt, updatedAt

shop_rates
├── id (uuid, PK)
├── metal (enum: gold | silver)
├── purity (varchar)
├── buyRate (decimal)
├── sellRate (decimal)
└── updatedAt

enquiries
├── id (uuid, PK)
├── referenceNumber (varchar, unique, auto-generated)
├── userId (uuid, FK -> users, nullable)
├── productId (uuid, FK -> products, nullable)
├── name (varchar)
├── mobile (varchar)
├── message (text)
├── status (enum: new | contacted | in_progress | closed)
└── createdAt, updatedAt

device_tokens
├── id (uuid, PK)
├── userId (uuid, FK -> users)
├── fcmToken (varchar)
├── platform (enum: ios | android)
└── createdAt, updatedAt

notifications
├── id (uuid, PK)
├── userId (uuid, FK -> users, nullable)
├── title (varchar)
├── body (text)
├── data (jsonb, nullable)
├── isRead (boolean, default: false)
└── createdAt

refresh_tokens
├── id (uuid, PK)
├── userId (uuid, FK -> users)
├── token (varchar, unique)
├── expiresAt (timestamp)
└── createdAt
```

---

## 5. Authentication Flow

### 5.1 Customer OTP Flow

```
Mobile App                NestJS API              MessageBot         Redis
    │                         │                       │                │
    │── POST /auth/send-otp ──>│                       │                │
    │   { mobile }            │── SMS API Call ───────>│                │
    │                         │<─ 200 OK ─────────────│                │
    │                         │── SET otp:{mobile} ──────────────────>│
    │                         │   TTL: 120s            │                │
    │<── { message: "sent" } ─│                       │                │
    │                         │                       │                │
    │── POST /auth/verify-otp ─>│                      │                │
    │   { mobile, otp }       │── GET otp:{mobile} ──────────────────>│
    │                         │<─ stored_otp ──────────────────────────│
    │                         │ [validate match]       │                │
    │                         │── DEL otp:{mobile} ──────────────────>│
    │                         │ [create/find user]     │                │
    │<─ { accessToken,        │                       │                │
    │     refreshToken }      │                       │                │
```

### 5.2 JWT Token Strategy

| Token | Expiry | Storage |
|-------|--------|---------|
| Access Token | 15 minutes | Mobile app memory |
| Refresh Token | 7 days | Secure storage (mobile keychain) + DB |

- Access token is short-lived; refresh token rotates on use.
- Refresh tokens stored in `refresh_tokens` table; invalidated on logout.

### 5.3 Admin Auth Flow

```
Admin (CMS)              NestJS API
    │                        │
    │─ POST /admin/auth/login ─>│
    │  { email, password }    │ [bcrypt compare]
    │<─ { accessToken,        │
    │     refreshToken }      │
    │                        │
    │─ GET /admin/dashboard ──>│ [JwtAuthGuard]
    │  Authorization: Bearer  │ [AdminGuard checks role]
    │<─ { stats }            │
```

---

## 6. API Security Architecture

### 6.1 Guards Layer

```
Request → JwtAuthGuard → RolesGuard → Controller
              │                │
              │ validates JWT   │ checks role (admin/customer)
              │                │
          401 Unauthorized  403 Forbidden
```

### 6.2 Guard Matrix

| Guard | Applied To | Purpose |
|-------|-----------|---------|
| `JwtAuthGuard` | Protected routes | Validates JWT access token |
| `AdminGuard` | `/admin/*` routes | Ensures user is admin role |
| `OptionalJwtGuard` | Semi-public routes | Attaches user if token present, not required |

### 6.3 Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /auth/send-otp` | 3 requests | Per hour per mobile |
| Public API endpoints | 100 requests | Per minute per IP |
| Admin API endpoints | 300 requests | Per minute per IP |

---

## 7. Caching Strategy (Redis)

| Data | Cache Key | TTL | Invalidation |
|------|-----------|-----|-------------|
| OTP codes | `otp:{mobile}` | 120s | Auto-expire |
| Refresh tokens | `rt:{userId}:{tokenId}` | 7 days | On logout |
| Live gold/silver rates | `rates:current` | 600s | On manual admin update |
| Home aggregate | `home:aggregate` | 300s | On content change |
| Featured products | `products:featured` | 300s | On product update |
| Active banners | `banners:active` | 300s | On banner update |

---

## 8. Image Storage

### Option A: Cloud Storage (Recommended)
```
Mobile/CMS      NestJS API          AWS S3 / Cloud Storage
    │                │                      │
    │─ POST /admin/products/:id/images ──>  │
    │                │── Upload file ──────>│
    │                │<─ { url } ───────────│
    │<─ { images: [{ id, url }] }           │
```

### Option B: Direct Server Storage
- Multer middleware for file upload
- Static file serving via `/uploads` path
- Less scalable; suitable for MVP

**Decision:** To be finalized before Phase 2 implementation.

---

## 9. Third-Party Integration Architecture

### 9.1 MessageBot SMS (OTP)
```
OtpService
  └── HttpService → MessageBot API
        POST https://api.messagebot.in/sms/send
        { to: mobile, message: "Your OTP is {otp}" }
```

### 9.2 Gold/Silver Rate Provider
```
RateProviderService
  └── HttpService → Rate Provider API
        GET https://rate-provider-api.com/rates
        → normalize response
        → cache in Redis (10 min)
        → return to clients
```

### 9.3 Firebase Cloud Messaging
```
FcmService
  └── firebase-admin SDK
        admin.messaging().send({
          token: deviceFcmToken,
          notification: { title, body },
          data: {}
        })
```

---

## 10. Deployment Architecture

```
Internet
    │
    ▼
[Nginx Reverse Proxy + SSL]
    │
    ▼
[NestJS App : Port 3000]
  PM2 / Docker Container
    │
    ├──── PostgreSQL : Port 5432
    ├──── Redis : Port 6379
    ├──── Firebase Admin SDK (external)
    ├──── MessageBot API (external)
    └──── Rate Provider API (external)
```

### Environment Variables

```env
# App
NODE_ENV=production
PORT=3000
API_PREFIX=api/v1

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=zewar_mahal
DB_USER=postgres
DB_PASS=secret

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_ACCESS_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# MessageBot
MESSAGEBOT_API_KEY=<key>
MESSAGEBOT_SENDER_ID=<id>

# Firebase
FIREBASE_PROJECT_ID=<id>
FIREBASE_PRIVATE_KEY=<key>
FIREBASE_CLIENT_EMAIL=<email>

# Rate Provider
RATE_PROVIDER_URL=<url>
RATE_PROVIDER_KEY=<key>

# Storage
STORAGE_TYPE=s3  # or local
AWS_BUCKET=<bucket>
AWS_REGION=<region>
AWS_ACCESS_KEY=<key>
AWS_SECRET_KEY=<secret>
```

---

## 11. Swagger API Documentation

- Available at: `GET /api` (development) or `/api/docs` (production, auth-protected)
- Tags: `auth`, `users`, `home`, `categories`, `products`, `rates`, `shop-rates`, `offers`, `banners`, `enquiries`, `notifications`, `admin`
- Bearer auth configured globally
- All DTOs decorated with `@ApiProperty()`

---

## 12. Error Handling

### Global Exception Filter
All errors are normalized to:
```json
{
  "statusCode": 400,
  "message": "Descriptive error message",
  "errors": ["field: specific error"],
  "path": "/api/v1/auth/login",
  "timestamp": "2026-10-15T14:00:00.000Z"
}
```

### HTTP Status Code Convention

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient role) |
| 404 | Resource Not Found |
| 409 | Conflict (duplicate, e.g., mobile already registered) |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |
