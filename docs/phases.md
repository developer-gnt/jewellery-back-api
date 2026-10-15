# Project Phases
## Zewar Mahal — NestJS Backend Development

---

**Version:** 1.0  
**Date:** October 2026  
**Total APIs:** 67 endpoints across 12 modules  
**Methodology:** Agile / Sprint-based delivery  

---

## Phase Overview

```
Phase 0: Project Setup & Infrastructure     [Week 1]
Phase 1: Auth, Users & Core Foundation     [Week 2-3]
Phase 2: Catalogue & Content APIs          [Week 4-5]
Phase 3: Rates, Offers & Banners           [Week 6]
Phase 4: Enquiries & Notifications         [Week 7]
Phase 5: Admin CMS APIs                    [Week 8]
Phase 6: Integrations & Testing            [Week 9-10]
Phase 7: Deployment & Go-Live              [Week 11]
```

---

## Phase 0 — Project Setup & Infrastructure

**Duration:** 1 week  
**Goal:** Bootstrap the NestJS project with all foundational tooling, database, and configuration.

### Tasks

| Task | Description | Priority |
|------|-------------|----------|
| NestJS project initialization | `nest new jewellew-back-api` with recommended config | High |
| TypeScript & ESLint setup | Strict mode, prettier, path aliases | High |
| Database setup | PostgreSQL (or MongoDB) + TypeORM / Mongoose | High |
| Environment configuration | `.env` with validation using `@nestjs/config` + Joi | High |
| Docker setup | `docker-compose.yml` for local dev (DB + Redis + API) | High |
| JWT auth module scaffold | `@nestjs/jwt` + `@nestjs/passport` packages | High |
| Swagger / OpenAPI | `@nestjs/swagger` setup with bearer auth | Medium |
| Global pipes & filters | `ValidationPipe`, `AllExceptionsFilter`, response interceptor | High |
| Logging | Winston or Pino logger integration | Medium |
| Health check endpoint | `GET /health` for uptime monitoring | Medium |

### Deliverables
- [x] Running NestJS server on port 3000
- [x] Database connected and schema migratable via TypeORM migrations
- [x] Swagger docs accessible at `/api`
- [x] Docker setup removed as requested
- [x] `.env.example` committed to repo

---

## Phase 1 — Authentication, Users & Core Foundation

**Duration:** 2 weeks  
**APIs:** 10 endpoints (Auth + User modules)  

### Sprint 1A — Authentication Module (Week 2)

| API | Endpoint | Status |
|-----|----------|--------|
| Send OTP | `POST /auth/send-otp` | Done |
| Verify OTP | `POST /auth/verify-otp` | Done |
| Refresh Token | `POST /auth/refresh-token` | Done |
| Logout | `POST /auth/logout` | Done |
| Get Me | `GET /auth/me` | Done |

**Dependencies:**
- MessageBot SMS service credentials
- `users` database table / collection
- OTP TTL management (Redis or DB)
- JWT access + refresh token strategy

**Tasks:**
- [x] OTP generation logic (6-digit random)
- [x] MessageBot SMS API integration service
- [x] OTP storage with TTL (Redis + memory fallback)
- [x] JWT strategy (access token: 15min, refresh: 7 days)
- [x] Refresh token rotation
- [x] Rate limiting on `send-otp` (max 5 per 10min per mobile)

### Sprint 1B — User & Profile Module (Week 3)

| API | Endpoint | Status |
|-----|----------|--------|
| Get Profile | `GET /users/profile` | Done |
| Update Profile | `PUT /users/profile` | Done |
| Delete Account | `DELETE /users/account` | Done |
| Get Notification Preferences | `GET /users/notification-preferences` | Done |
| Update Notification Preferences | `PUT /users/notification-preferences` | Done |

**Tasks:**
- [x] User entity / schema with profile fields
- [x] Profile update DTO with validation
- [x] Notification preferences sub-schema
- [x] Soft delete for account deletion

### Phase 1 Deliverables
- [x] Customer can OTP-login and receive JWT
- [x] Customer can view and edit their profile
- [x] Auth guards working on protected routes
- [x] All 10 endpoints tested with Vitest unit test suite

---

## Phase 2 — Catalogue & Content APIs

**Duration:** 2 weeks  
**APIs:** 22 endpoints (Home + Categories + Products)  

### Sprint 2A — Categories Module (Week 4)

| API | Endpoint | Status |
|-----|----------|--------|
| List Categories | `GET /categories` | Done |
| Category Details | `GET /categories/:id` | Done |
| Create Category | `POST /admin/categories` | Done |
| Update Category | `PUT /admin/categories/:id` | Done |
| Toggle Status | `PATCH /admin/categories/:id/status` | Done |
| Delete Category | `DELETE /admin/categories/:id` | Done |

**Tasks:**
- [x] Category entity with image support
- [x] Admin guard on admin routes
- [x] Slug generation
- [x] Prevent deletion if products are linked

### Sprint 2B — Products Module (Week 4-5)

| API | Endpoint | Status |
|-----|----------|--------|
| List Products | `GET /products` | Done |
| Product Details | `GET /products/:id` | Done |
| Search Products | `GET /products/search` | Done |
| Featured Products | `GET /products/featured` | Done |
| Latest Products | `GET /products/latest` | Done |
| Create Product | `POST /admin/products` | Done |
| Update Product | `PUT /admin/products/:id` | Done |
| Toggle Status | `PATCH /admin/products/:id/status` | Done |
| Delete Product | `DELETE /admin/products/:id` | Done |
| Add Images | `POST /admin/products/:id/images` | Done |
| Remove Image | `DELETE /admin/products/:id/images/:imageId` | Done |

**Tasks:**
- [x] Product entity: name, description, metal, purity, weight, price, categoryId
- [x] Query filter builder (category, metal, purity, sort)
- [x] Pagination service
- [x] Full-text search implementation
- [x] Image gallery management
- [x] Featured / Latest flags on product

### Sprint 2C — Home Dashboard Module (Week 5)

| API | Endpoint | Status |
|-----|----------|--------|
| Home Aggregate | `GET /home` | Done |
| Active Banners | `GET /banners` | Done |
| Featured Products | `GET /products/featured` | Done |
| Latest Products | `GET /products/latest` | Done |
| Active Offers | `GET /offers/active` | Done |

**Tasks:**
- [x] Home service aggregating all data in parallel (Promise.all)
- [x] Cache home response (TTL: 5 min) with memory/Redis caching

### Phase 2 Deliverables
- [x] Full product catalogue browsable with filters
- [x] Search working
- [x] Admin can manage categories and products
- [x] Home endpoint returns aggregated data

---

## Phase 3 — Rates, Offers & Banners

**Duration:** 1 week  
**APIs:** 17 endpoints  

### Sprint 3A — Rates Module

| API | Endpoint | Status |
|-----|----------|--------|
| Current Rates | `GET /rates/current` | Done |
| Rate History | `GET /rates/history` | Done |
| Admin Get Rates | `GET /admin/rates` | Done |
| Admin Update Rates | `PUT /admin/rates` | Done |
| Shop Rates | `GET /shop/rates` | Done |
| Update Shop Rates | `PUT /admin/shop/rates` | Done |
| Share Rates | `GET /shop/rates/share` | Done |

**Tasks:**
- [x] Gold/Silver rate provider integration (HTTP service)
- [x] Rate normalization and caching (Redis/memory, TTL: 10 min)
- [x] Manual override logic for admin
- [x] Shop rates separate entity

### Sprint 3B — Offers & Banners Module

| API | Endpoint | Status |
|-----|----------|--------|
| List Offers | `GET /offers` | Done |
| Offer Details | `GET /offers/:id` | Done |
| Create Offer | `POST /admin/offers` | Done |
| Update Offer | `PUT /admin/offers/:id` | Done |
| Toggle Offer Status | `PATCH /admin/offers/:id/status` | Done |
| Delete Offer | `DELETE /admin/offers/:id` | Done |
| Create Banner | `POST /admin/banners` | Done |
| Update Banner | `PUT /admin/banners/:id` | Done |
| Toggle Banner Status | `PATCH /admin/banners/:id/status` | Done |
| Delete Banner | `DELETE /admin/banners/:id` | Done |

### Phase 3 Deliverables
- [x] Live gold/silver rates fetched from provider
- [x] Shop rates manageable via admin
- [x] Offers and banners fully manageable via CMS

---

## Phase 4 — Enquiries & Notifications

**Duration:** 1 week  
**APIs:** 11 endpoints  

### Sprint 4A — Enquiries Module

| API | Endpoint | Status |
|-----|----------|--------|
| Submit Enquiry | `POST /enquiries` | Done |
| My Enquiries | `GET /users/enquiries` | Done |
| All Enquiries (Admin) | `GET /admin/enquiries` | Done |
| Enquiry Details (Admin) | `GET /admin/enquiries/:id` | Done |
| Update Status (Admin) | `PATCH /admin/enquiries/:id/status` | Done |

**Tasks:**
- [x] Enquiry entity with reference number generation
- [x] Status state machine: New → Contacted → In Progress → Closed
- [x] Paginated admin enquiry list with filters

### Sprint 4B — Notifications & FCM Module

| API | Endpoint | Status |
|-----|----------|--------|
| Register Device | `POST /notifications/devices` | Done |
| Remove Device | `DELETE /notifications/devices/:id` | Done |
| Get Notifications | `GET /notifications` | Done |
| Mark Read | `PATCH /notifications/:id/read` | Done |
| Send Notification (Admin) | `POST /admin/notifications/send` | Done |
| Notification History (Admin) | `GET /admin/notifications` | Done |

**Tasks:**
- [x] Firebase Admin SDK / FCM service setup
- [x] FCM token storage per user (multi-device)
- [x] Push notification service with broadcast and targeted send
- [x] Notification entity for history and read tracking

### Phase 4 Deliverables
- [x] Customers can submit and track enquiries
- [x] FCM push notifications working (iOS & Android)
- [x] Admin can send broadcasts and view history

---

## Phase 5 — Admin CMS APIs

**Duration:** 1 week  
**APIs:** 7 endpoints  

| API | Endpoint | Status |
|-----|----------|--------|
| Admin Login | `POST /admin/auth/login` | Done |
| Admin Logout | `POST /admin/auth/logout` | Done |
| Admin Me | `GET /admin/auth/me` | Done |
| Dashboard Stats | `GET /admin/dashboard` | Done |
| List Users | `GET /admin/users` | Done |
| User Details | `GET /admin/users/:id` | Done |
| Toggle User Status | `PATCH /admin/users/:id/status` | Done |

**Tasks:**
- [x] Admin entity (separate from customer users)
- [x] Admin JWT strategy with role guard
- [x] Dashboard stats aggregation query
- [x] Admin seeder for initial admin account
- [x] Migration file created for admins, users, and refresh_tokens

### Phase 5 Deliverables
- [x] Admin can login to CMS securely
- [x] Dashboard statistics working
- [x] Admin can view and manage customer accounts

---

## Phase 6 — Integration, Testing & QA

**Duration:** 2 weeks  

### Sprint 6A — Integration Testing
 
| Task | Description | Status |
|------|-------------|--------|
| Unit Tests | Vitest unit tests for all services & controllers (63 tests) | Done |
| E2E Tests | NestJS E2E tests for Admin CMS & Health check (`test/admin.e2e-spec.ts`, `test/app.e2e-spec.ts`) | Done |
| Postman Collection | Full API collection with dynamic token scripts (`test/postman_collection.json`) | Done |
| Swagger Completion | All 67 endpoints documented with schemas & bearer auth | Done |
| MessageBot Integration Test | Live SMS OTP send/receive validation with live vendor API key | Pending Live Credentials |
| FCM Integration Test | Push notification delivery test with live Firebase Service Account | Pending Live Credentials |
| Rate Provider Test | Live rate fetch and caching verification with live provider API key | Pending Live Credentials |
 
### Sprint 6B — Security & Performance
 
| Task | Description | Status |
|------|-------------|--------|
| Auth guard audit | Verify all admin routes protected by `JwtAuthGuard` + `AdminGuard` | Done |
| Rate limiting | `@nestjs/throttler` configured on public endpoints (100 req/60s) + OTP throttling | Done |
| Input validation | DTO validation coverage (`whitelist: true, forbidNonWhitelisted: true`) | Done |
| SQL injection sanitization | TypeORM parameter binding used across all queries | Done |
| Image upload security | File type and size validation (local & cloud storage options) | Done |
| Performance profiling | Query optimization & select fields | Ongoing |
| Redis caching validation | Home, rates caching with memory/Redis fallback | Done |

---

## Phase 7 — Deployment & Go-Live

**Duration:** 1 week  

| Task | Description | Status |
|------|-------------|--------|
| Containerization | Multi-stage Dockerfile (`Dockerfile`) & `.dockerignore` | Done |
| Orchestration | `docker-compose.yml` (API + Postgres 16 + Redis 7 + volumes + healthchecks) | Done |
| CI/CD pipeline | GitHub Actions workflows (`.github/workflows/ci.yml` & `deploy.yml`) | Done |
| Process management | PM2 cluster configuration (`ecosystem.config.cjs`) | Done |
| Production DB migrations | Scripted via `npm run migration:run` against PostgreSQL | Done |
| SSL / HTTPS Reverse Proxy | Nginx configuration with SSL, gzip & rate limiting (`nginx/nginx.conf`) | Done |
| Health monitoring | Docker & NestJS `/api/v1/health` heartbeat | Done |

---

## Risk & Dependency Tracker

| Risk | Mitigation |
|------|-----------|
| MessageBot SMS credits / API availability | Test early in Phase 1; have fallback |
| Gold/Silver rate provider API access | Confirm credentials before Phase 3 |
| Firebase project setup | Setup in Phase 0 alongside project init |
| Image storage decision (local vs. cloud) | Decide in Phase 0; affects Phase 2 |
| Database choice (SQL vs. NoSQL) | Decide in Phase 0; commit early |
| OTP rate-limit abuse | Redis-based OTP throttling in Phase 1 |

---

## Milestone Summary

| Milestone | Target Week | APIs Completed |
|-----------|-------------|---------------|
| M0: Project bootstrapped | Week 1 | 0 |
| M1: Auth + User complete | Week 3 | 10 |
| M2: Catalogue complete | Week 5 | 32 |
| M3: Rates, Offers, Banners complete | Week 6 | 45 |
| M4: Enquiries + Notifications complete | Week 7 | 56 |
| M5: Admin CMS complete | Week 8 | 67 |
| M6: Tested and documented | Week 10 | 67 |
| M7: Production deployment | Week 11 | 67 |
