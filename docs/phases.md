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
- [ ] Running NestJS server on port 3000
- [ ] Database connected and schema migratable
- [ ] Swagger docs accessible at `/api`
- [ ] Docker Compose working locally
- [ ] `.env.example` committed to repo

---

## Phase 1 — Authentication, Users & Core Foundation

**Duration:** 2 weeks  
**APIs:** 10 endpoints (Auth + User modules)  

### Sprint 1A — Authentication Module (Week 2)

| API | Endpoint | Status |
|-----|----------|--------|
| Send OTP | `POST /auth/send-otp` | To Do |
| Verify OTP | `POST /auth/verify-otp` | To Do |
| Refresh Token | `POST /auth/refresh-token` | To Do |
| Logout | `POST /auth/logout` | To Do |
| Get Me | `GET /auth/me` | To Do |

**Dependencies:**
- MessageBot SMS service credentials
- `users` database table / collection
- OTP TTL management (Redis or DB)
- JWT access + refresh token strategy

**Tasks:**
- [ ] OTP generation logic (6-digit random)
- [ ] MessageBot SMS API integration service
- [ ] OTP storage with TTL (Redis recommended)
- [ ] JWT strategy (access token: 15min, refresh: 7 days)
- [ ] Refresh token rotation
- [ ] Rate limiting on `send-otp` (e.g., max 3/hour per mobile)

### Sprint 1B — User & Profile Module (Week 3)

| API | Endpoint | Status |
|-----|----------|--------|
| Get Profile | `GET /users/profile` | To Do |
| Update Profile | `PUT /users/profile` | To Do |
| Delete Account | `DELETE /users/account` | To Do |
| Get Notification Preferences | `GET /users/notification-preferences` | To Do |
| Update Notification Preferences | `PUT /users/notification-preferences` | To Do |

**Tasks:**
- [ ] User entity / schema with profile fields
- [ ] Profile update DTO with validation
- [ ] Notification preferences sub-schema
- [ ] Soft delete for account deletion

### Phase 1 Deliverables
- [ ] Customer can OTP-login and receive JWT
- [ ] Customer can view and edit their profile
- [ ] Auth guards working on protected routes
- [ ] All 10 endpoints tested with Postman / Jest

---

## Phase 2 — Catalogue & Content APIs

**Duration:** 2 weeks  
**APIs:** 22 endpoints (Home + Categories + Products)  

### Sprint 2A — Categories Module (Week 4)

| API | Endpoint | Status |
|-----|----------|--------|
| List Categories | `GET /categories` | To Do |
| Category Details | `GET /categories/:id` | To Do |
| Create Category | `POST /admin/categories` | To Do |
| Update Category | `PUT /admin/categories/:id` | To Do |
| Toggle Status | `PATCH /admin/categories/:id/status` | To Do |
| Delete Category | `DELETE /admin/categories/:id` | To Do |

**Tasks:**
- [ ] Category entity with image support
- [ ] Admin guard on admin routes
- [ ] Slug generation
- [ ] Prevent deletion if products are linked

### Sprint 2B — Products Module (Week 4-5)

| API | Endpoint | Status |
|-----|----------|--------|
| List Products | `GET /products` | To Do |
| Product Details | `GET /products/:id` | To Do |
| Search Products | `GET /products/search` | To Do |
| Featured Products | `GET /products/featured` | To Do |
| Latest Products | `GET /products/latest` | To Do |
| Create Product | `POST /admin/products` | To Do |
| Update Product | `PUT /admin/products/:id` | To Do |
| Toggle Status | `PATCH /admin/products/:id/status` | To Do |
| Delete Product | `DELETE /admin/products/:id` | To Do |
| Add Images | `POST /admin/products/:id/images` | To Do |
| Remove Image | `DELETE /admin/products/:id/images/:imageId` | To Do |

**Tasks:**
- [ ] Product entity: name, description, metal, purity, weight, price, categoryId
- [ ] Query filter builder (category, metal, purity, sort)
- [ ] Pagination service
- [ ] Full-text search implementation
- [ ] Image upload service (Multer + storage strategy)
- [ ] Featured / Latest flags on product

### Sprint 2C — Home Dashboard Module (Week 5)

| API | Endpoint | Status |
|-----|----------|--------|
| Home Aggregate | `GET /home` | To Do |
| Active Banners | `GET /banners` | To Do |
| Featured Products | `GET /products/featured` | To Do |
| Latest Products | `GET /products/latest` | To Do |
| Active Offers | `GET /offers/active` | To Do |

**Tasks:**
- [ ] Home service aggregating all data in parallel (Promise.all)
- [ ] Cache home response (TTL: 5 min) using Redis

### Phase 2 Deliverables
- [ ] Full product catalogue browsable with filters
- [ ] Search working
- [ ] Admin can manage categories and products
- [ ] Home endpoint returns aggregated data

---

## Phase 3 — Rates, Offers & Banners

**Duration:** 1 week  
**APIs:** 13 endpoints  

### Sprint 3A — Rates Module

| API | Endpoint | Status |
|-----|----------|--------|
| Current Rates | `GET /rates/current` | To Do |
| Rate History | `GET /rates/history` | To Do |
| Admin Get Rates | `GET /admin/rates` | To Do |
| Admin Update Rates | `PUT /admin/rates` | To Do |
| Shop Rates | `GET /shop/rates` | To Do |
| Update Shop Rates | `PUT /admin/shop/rates` | To Do |
| Share Rates | `GET /shop/rates/share` | To Do |

**Tasks:**
- [ ] Gold/Silver rate provider integration (HTTP service)
- [ ] Rate normalization and caching (Redis, TTL: 10 min)
- [ ] Manual override logic for admin
- [ ] Shop rates separate entity

### Sprint 3B — Offers & Banners Module

| API | Endpoint | Status |
|-----|----------|--------|
| List Offers | `GET /offers` | To Do |
| Offer Details | `GET /offers/:id` | To Do |
| Create Offer | `POST /admin/offers` | To Do |
| Update Offer | `PUT /admin/offers/:id` | To Do |
| Toggle Offer Status | `PATCH /admin/offers/:id/status` | To Do |
| Delete Offer | `DELETE /admin/offers/:id` | To Do |
| Create Banner | `POST /admin/banners` | To Do |
| Update Banner | `PUT /admin/banners/:id` | To Do |
| Toggle Banner Status | `PATCH /admin/banners/:id/status` | To Do |
| Delete Banner | `DELETE /admin/banners/:id` | To Do |

### Phase 3 Deliverables
- [ ] Live gold/silver rates fetched from provider
- [ ] Shop rates manageable via admin
- [ ] Offers and banners fully manageable via CMS

---

## Phase 4 — Enquiries & Notifications

**Duration:** 1 week  
**APIs:** 11 endpoints  

### Sprint 4A — Enquiries Module

| API | Endpoint | Status |
|-----|----------|--------|
| Submit Enquiry | `POST /enquiries` | To Do |
| My Enquiries | `GET /users/enquiries` | To Do |
| All Enquiries (Admin) | `GET /admin/enquiries` | To Do |
| Enquiry Details (Admin) | `GET /admin/enquiries/:id` | To Do |
| Update Status (Admin) | `PATCH /admin/enquiries/:id/status` | To Do |

**Tasks:**
- [ ] Enquiry entity with reference number generation
- [ ] Status state machine: New → Contacted → In Progress → Closed
- [ ] Paginated admin enquiry list with filters

### Sprint 4B — Notifications & FCM Module

| API | Endpoint | Status |
|-----|----------|--------|
| Register Device | `POST /notifications/devices` | To Do |
| Remove Device | `DELETE /notifications/devices/:id` | To Do |
| Get Notifications | `GET /notifications` | To Do |
| Mark Read | `PATCH /notifications/:id/read` | To Do |
| Send Notification (Admin) | `POST /admin/notifications/send` | To Do |
| Notification History (Admin) | `GET /admin/notifications` | To Do |

**Tasks:**
- [ ] Firebase Admin SDK setup
- [ ] FCM token storage per user (multi-device)
- [ ] Push notification service with broadcast and targeted send
- [ ] Notification entity for history and read tracking

### Phase 4 Deliverables
- [ ] Customers can submit and track enquiries
- [ ] FCM push notifications working (iOS & Android)
- [ ] Admin can send broadcasts and view history

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
| Unit Tests | Vitest unit tests for Admin Controller & Service | Done |
| E2E Tests | NestJS E2E tests for Admin CMS & Health check (`test/admin.e2e-spec.ts`, `test/app.e2e-spec.ts`) | Done |
| Postman Collection | Full API collection with dynamic token scripts (`test/postman_collection.json`) | Done |
| Swagger Completion | Admin endpoints documented with request/response schemas | Done |
| MessageBot Integration Test | OTP send/receive end-to-end | Pending Phase 1 |
| FCM Integration Test | Push notification delivery test | Pending Phase 4 |
| Rate Provider Test | Live rate fetch and caching verification | Pending Phase 3 |

### Sprint 6B — Security & Performance

| Task | Description | Status |
|------|-------------|--------|
| Auth guard audit | Verify all admin routes protected by `JwtAuthGuard` + `AdminGuard` | Done |
| Rate limiting | `@nestjs/throttler` configured on public endpoints | Done |
| Input validation | DTO validation coverage (`whitelist: true, forbidNonWhitelisted: true`) | Done |
| SQL injection sanitization | TypeORM parameter binding used across all queries | Done |
| Image upload security | File type and size validation | Pending Phase 2 |
| Performance profiling | Query optimization & select fields | Ongoing |
| Redis caching validation | Home, rates caching working correctly | Pending Phase 2 & 3 |

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
| M5: Admin CMS complete | Week 8 | 63 |
| M6: Tested and documented | Week 10 | 63 |
| M7: Production deployment | Week 11 | 63 |
