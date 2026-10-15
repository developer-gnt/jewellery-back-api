# Development Memory & Context
## Zewar Mahal — NestJS Backend

> This file serves as the **living memory** of the project — tracking decisions made, patterns established, gotchas discovered, and context every developer needs to know when picking up this codebase.

---

## Project Identity

| Field | Value |
|-------|-------|
| Project | Zewar Mahal Jewellery Application |
| Repo | `jewellew-back-api` |
| Framework | NestJS 10.x |
| Language | TypeScript 5.x |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Node Version | 20 LTS |
| Base API Prefix | `/api/v1` |
| Swagger | `/api` (dev) |
| Total APIs | 67 endpoints across 12 modules |

---

## Key Architectural Decisions

### ADR-001: ORM Choice — TypeORM
- **Decision:** Use TypeORM with PostgreSQL
- **Reason:** NestJS-native integration, decorator-based entities, migration support
- **Alternative Considered:** Prisma (more type-safe but less NestJS-native at time of decision)

### ADR-002: Auth Strategy — JWT (Access + Refresh)
- **Decision:** Dual-token strategy: short-lived access token (15 min) + long-lived refresh token (7 days)
- **Reason:** Balance between security and UX; OTP-based login means no password reset flows needed
- **OTP Storage:** Redis with 120-second TTL
- **Refresh tokens:** Stored in `refresh_tokens` DB table; deleted on logout

### ADR-003: Admin vs. Customer — Separate Auth
- **Decision:** Admins have a separate `admins` table and login via email/password (not OTP)
- **Reason:** Admins are internal staff; OTP login not appropriate; password-based login with bcrypt
- **Admin JWT:** Same JWT strategy but role claim = `admin`

### ADR-004: Caching — Redis for Rates and Home
- **Decision:** Cache `/rates/current` (10 min TTL) and `/home` (5 min TTL) in Redis
- **Reason:** Rate provider API has call limits; home aggregate is expensive multi-query
- **Invalidation:** Manual update of rates or content triggers cache invalidation

### ADR-005: Image Storage — TBD
- **Decision:** PENDING — either direct Multer upload to server or presigned S3 URLs
- **Action Required:** Confirm with client before Phase 2 implementation
- **Impact:** Affects product image endpoints and banner image endpoints

### ADR-006: Calculator — No Backend API
- **Decision:** Hisaabwala calculator runs 100% on-device (React Native)
- **Reason:** No persistent history required in MVP scope
- **Future:** If history approval is given, add `POST /calculator/history` and `GET /calculator/history`

### ADR-007: Rate History — Optional
- **Decision:** `GET /rates/history` endpoint created but feature-flagged
- **Reason:** Client requirement is only for current rates; history is optional
- **Status:** Implement stub, leave empty/disabled unless client confirms

### ADR-008: Mandatory Database Migrations
- **Decision:** All database schema changes must be executed strictly via TypeORM migration files (`src/database/migrations/`).
- **Reason:** Enforce reproducible, version-controlled database changes across environments and avoid data loss from `synchronize: true`.
- **Requirement:** Every migration must provide both `up()` and `down()` methods and be tested before committing.

### ADR-009: Governance & Living Memory Protocol
- **Decision:** Mandatory adherence to [`rule.md`](file:///c:/Gnt-codebase/jewellery-back-api/rule.md) for all tasks.
- **Rules:**
  1. Any architectural changes, patterns, gotchas must be recorded in `docs/memory.md`.
  2. Every phase and endpoint completion must be updated in `docs/phases.md` and `docs/api-list.md`.
  3. Migration scripts configured: `npm run migration:run`, `migration:revert`, `migration:generate`.

### ADR-010: Containerization, CI/CD & Production Topology
- **Decision:** Dual deployment support — Docker containerization with `docker-compose.yml` and native PM2 clustering (`ecosystem.config.cjs`).
- **CI/CD:** GitHub Actions (`.github/workflows/ci.yml`) runs automated lint, build, TypeORM migrations, unit tests, and E2E tests against PostgreSQL and Redis service containers.
- **Reverse Proxy:** Nginx configuration (`nginx/nginx.conf`) handles SSL termination, gzip compression, body size limit (20MB), and rate limiting.

---

## Module Registration Order (app.module.ts)

Modules should be imported in this order to avoid circular dependencies:

```
1. ConfigModule (global)
2. TypeOrmModule (global)
3. RedisModule (global)
4. AuthModule
5. UsersModule
6. AdminModule
7. CategoriesModule
8. ProductsModule
9. HomeModule
10. RatesModule
11. ShopRatesModule
12. OffersModule
13. BannersModule
14. EnquiriesModule
15. NotificationsModule
```

---

## Guard Usage Patterns

```typescript
// Public endpoint — no guard needed (default)
@Get('/rates/current')
getRates() {}

// Customer-authenticated endpoint
@UseGuards(JwtAuthGuard)
@Get('/users/profile')
getProfile() {}

// Admin-only endpoint
@UseGuards(JwtAuthGuard, AdminGuard)
@Post('/admin/products')
createProduct() {}
```

**Remember:** Never use `@Public()` decorator on admin routes. Always use both `JwtAuthGuard` AND `AdminGuard` for admin routes.

---

## DTO Validation Patterns

Always use `class-validator` decorators + `class-transformer`:

```typescript
// Example: CreateProductDto
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Gold Necklace' })
  name: string;

  @IsEnum(['gold', 'silver', 'platinum'])
  @ApiProperty({ enum: ['gold', 'silver', 'platinum'] })
  metal: string;

  @IsOptional()
  @IsString()
  purity?: string;
}
```

Global `ValidationPipe` is enabled in `main.ts` with `whitelist: true, forbidNonWhitelisted: true`.

---

## Pagination Pattern

Use shared `PaginationDto` for all paginated endpoints:

```typescript
// PaginationDto
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// Response shape
{
  data: T[],
  total: number,
  page: number,
  limit: number,
  totalPages: number
}
```

---

## OTP Flow — Critical Notes

- OTP is stored in Redis as key `otp:{mobile}` with 120-second TTL
- OTP is **deleted from Redis immediately** after successful verification (single-use)
- Rate limit OTP sends to **3 per hour per mobile number** using `@nestjs/throttler`
- MessageBot API key must NEVER be logged or exposed
- If MessageBot is unavailable, return 503 with user-friendly message

---

## Enquiry Reference Number Format

Auto-generated reference number format:
```
ZM-{YEAR}{MONTH}{DAY}-{6-DIGIT-RANDOM}
Example: ZM-20261015-483920
```

Implementation:
```typescript
const ref = `ZM-${format(new Date(), 'yyyyMMdd')}-${Math.floor(100000 + Math.random() * 900000)}`;
```

---

## FCM Integration Notes

- Use `firebase-admin` npm package (server-side SDK)
- Store Firebase credentials in environment variables, never in code
- Device tokens stored in `device_tokens` table (one user can have multiple devices)
- On FCM error `registration-token-not-registered`, automatically delete that device token
- Multicast messaging for broadcast (up to 500 tokens per request)

---

## Scope Exclusions — DO NOT IMPLEMENT

> These are explicitly out of scope for MVP. Do not implement unless client provides written approval:

| Feature | Exclusion Reason |
|---------|-----------------|
| Payment Gateway | Explicitly excluded |
| MCX API | Explicitly excluded |
| Jewellery Reordering | Excluded |
| Pehchaan Card | Excluded |
| Calculator History | Optional — needs approval |
| Account Deletion API | Optional — needs approval |
| Dynamic Legal Pages CMS | Optional — needs approval |
| Rate History | Optional — needs approval |

---

## Known Gotchas & Watch-outs

### 1. Mobile Number Identity
- Customer's mobile number is their unique identity — it is **immutable** after registration
- Never allow changing mobile number via `/users/profile` update

### 2. Soft Delete vs Hard Delete
- **Products:** Soft delete only (mark `isDeleted = true`) — preserve order history linkage
- **Categories:** Hard delete only if no products are linked; reject with 409 otherwise
- **Users:** Soft delete for account deletion

### 3. Gold Rate Caching
- The rate provider may have rate limits or downtime
- Always return cached rate if provider is down
- Log provider errors; do not surface raw provider errors to client

### 4. Admin Seeding
- Initial admin account must be seeded via migration/seed script
- Never expose admin creation via a public API endpoint

### 5. Image URLs
- Always store full URL (including base URL) in DB, not relative paths
- This allows switching storage providers without DB migration

### 6. Token Blacklisting
- On logout, delete the refresh token from DB
- Access tokens are short-lived (15 min) and not blacklisted (stateless JWT)
- For immediate access token revocation, consider Redis blacklist if required

### 7. Node 24 ESM & Type-Stripping
- In Node.js 24+, native TypeScript type-stripping fails on TypeScript `enum` syntax (`SyntaxError: TypeScript enum is not supported in strip-only mode`).
- **Pattern:** Always use `as const` object maps instead:
  ```typescript
  export const AdminRole = { SUPER_ADMIN: 'super_admin', ADMIN: 'admin' } as const;
  export type AdminRole = (typeof AdminRole)[keyof typeof AdminRole];
  ```

### 8. Testing & Postman Collections
- E2E test suites reside in `test/*.e2e-spec.ts`.
- Postman collection resides in `test/postman_collection.json` with pre-configured variables (`{{baseUrl}}`, `{{adminAccessToken}}`).

## Environment Setup (Local Dev)

```bash
# 1. Clone repo
git clone <repo-url>
cd jewellew-back-api

# 2. Install dependencies
npm install

# 3. Copy env
cp .env.example .env
# Fill in values

# 4. Start services
docker-compose up -d  # Starts PostgreSQL + Redis

# 5. Run migrations
npm run migration:run

# 6. Seed admin
npm run seed:admin

# 7. Start dev server
npm run start:dev

# API running at: http://localhost:3000/api/v1
# Swagger at:     http://localhost:3000/api
```

---

## NPM Scripts Reference

| Script | Purpose |
|--------|---------|
| `npm run start:dev` | Start with hot reload |
| `npm run start:prod` | Start production build |
| `npm run build` | Compile TypeScript |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run test:cov` | Run tests with coverage |
| `npm run migration:generate -- --name=MigrationName` | Generate migration |
| `npm run migration:run` | Run pending migrations |
| `npm run migration:revert` | Revert last migration |
| `npm run seed:admin` | Seed initial admin account |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier format |

---

## API Versioning

- All routes prefixed with `/api/v1`
- Configured in `main.ts`:
```typescript
app.setGlobalPrefix('api/v1');
```
- Future version: `/api/v2` — keep `v1` running for backward compatibility

---

## Contact & Ownership

| Role | Contact |
|------|---------|
| Project Owner | Zewar Mahal |
| Backend Lead | — |
| Last Updated | October 2026 |
| Document Version | 1.0 |
