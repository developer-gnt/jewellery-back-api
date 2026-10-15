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
| Admin Login | `POST /admin/auth/login` | To Do |
| Admin Logout | `POST /admin/auth/logout` | To Do |
| Admin Me | `GET /admin/auth/me` | To Do |
| Dashboard Stats | `GET /admin/dashboard` | To Do |
| List Users | `GET /admin/users` | To Do |
| User Details | `GET /admin/users/:id` | To Do |
| Toggle User Status | `PATCH /admin/users/:id/status` | To Do |

**Tasks:**
- [ ] Admin entity (separate from customer users)
- [ ] Admin JWT strategy with role guard
- [ ] Dashboard stats aggregation query
- [ ] Admin seeder for initial admin account

### Phase 5 Deliverables
- [ ] Admin can login to CMS securely
- [ ] Dashboard statistics working
- [ ] Admin can view and manage customer accounts

---

## Phase 6 — Integration, Testing & QA

**Duration:** 2 weeks  

### Sprint 6A — Integration Testing

| Task | Description |
|------|-------------|
| Unit Tests | Jest unit tests for all services |
| E2E Tests | NestJS E2E tests for critical flows (auth, products, enquiries) |
| Postman Collection | Full API collection with example requests/responses |
| Swagger Completion | All endpoints documented with request/response schemas |
| MessageBot Integration Test | OTP send/receive end-to-end |
| FCM Integration Test | Push notification delivery test |
| Rate Provider Test | Live rate fetch and caching verification |

### Sprint 6B — Security & Performance

| Task | Description |
|------|-------------|
| Auth guard audit | Verify all admin routes protected |
| Rate limiting | `@nestjs/throttler` on public endpoints |
| Input validation | DTO validation coverage review |
| SQL injection / NoSQL injection | Query parameter sanitization |
| Image upload security | File type and size validation |
| Performance profiling | Identify N+1 queries; add select optimizations |
| Redis caching validation | Home, rates caching working correctly |

---

## Phase 7 — Deployment & Go-Live

**Duration:** 1 week  

| Task | Description |
|------|-------------|
| Production environment | VPS / Cloud setup (e.g., AWS, DigitalOcean, Hostinger) |
| CI/CD pipeline | GitHub Actions or equivalent |
| Database migrations | Production DB migration and seed |
| SSL / HTTPS | Nginx reverse proxy with SSL |
| Environment secrets | Secure secrets management (no .env in repo) |
| Health monitoring | Uptime monitoring setup |
| Go-live checklist | Final smoke test of all 67 endpoints |

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
