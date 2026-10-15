# Functional Requirements Document (FRD)
## Zewar Mahal — NestJS Backend API

---

**Version:** 1.0  
**Date:** October 2026  
**Total APIs:** 63 endpoints across 15 modules  

---

## API Summary Overview

| # | Module | Total Endpoints |
|---|--------|----------------|
| 1 | Authentication & OTP | 5 |
| 2 | User & Profile | 5 |
| 3 | Home Dashboard | 5 |
| 4 | Jewellery Categories | 6 |
| 5 | Jewellery Catalogue & Products | 11 |
| 6 | Gold & Silver Rates | 4 |
| 7 | My / Shop Rates | 3 |
| 8 | Offers & Promotions | 6 |
| 9 | Banner Management | 4 |
| 10 | Customer Enquiries | 5 |
| 11 | Notifications & FCM | 6 |
| 12 | Admin Auth & User Management | 7 |
| **Total** | | **67** |

---

## Module 1 — Authentication & OTP

**Base Path:** `/auth`  
**Description:** Handles customer authentication using mobile number and OTP via MessageBot SMS.

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/auth/send-otp` | Public | Send OTP to mobile number via MessageBot |
| POST | `/auth/verify-otp` | Public | Verify OTP and return JWT tokens |
| POST | `/auth/refresh-token` | Public | Refresh access token using refresh token |
| POST | `/auth/logout` | Customer | End user session (invalidate refresh token) |
| GET | `/auth/me` | Customer | Get currently authenticated user details |

### FR-AUTH-01: Send OTP
- **Input:** `{ mobile: string }` — 10-digit mobile number
- **Action:** Trigger OTP via MessageBot SMS API
- **Output:** `{ message: "OTP sent", expiresIn: 120 }` (seconds)
- **Rules:** Rate-limit to prevent OTP abuse; OTP valid for 2 minutes

### FR-AUTH-02: Verify OTP
- **Input:** `{ mobile: string, otp: string }`
- **Action:** Validate OTP, create/login user, issue JWT access + refresh tokens
- **Output:** `{ accessToken, refreshToken, user: { id, name, mobile } }`

### FR-AUTH-03: Refresh Token
- **Input:** `{ refreshToken: string }`
- **Output:** `{ accessToken, refreshToken }`

### FR-AUTH-04: Logout
- **Auth:** Bearer token required
- **Action:** Invalidate refresh token

### FR-AUTH-05: Get Me
- **Auth:** Bearer token required
- **Output:** Full user profile object

---

## Module 2 — User & Profile

**Base Path:** `/users`  
**Description:** Customer profile and notification preference management.

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/users/profile` | Customer | Retrieve customer profile |
| PUT | `/users/profile` | Customer | Update customer details |
| DELETE | `/users/account` | Customer | Request account deletion (if approved) |
| GET | `/users/notification-preferences` | Customer | Retrieve notification preferences |
| PUT | `/users/notification-preferences` | Customer | Update notification preferences |

### FR-USER-01: Get Profile
- **Output:** `{ id, name, mobile, email, avatar, createdAt }`

### FR-USER-02: Update Profile
- **Input:** `{ name?, email?, avatar? }`
- **Rules:** Mobile number is immutable (used for OTP identity)

### FR-USER-03: Get Notification Preferences
- **Output:** `{ offers: bool, rates: bool, enquiries: bool, general: bool }`

### FR-USER-04: Update Notification Preferences
- **Input:** `{ offers?: bool, rates?: bool, enquiries?: bool, general?: bool }`

---

## Module 3 — Home Dashboard

**Base Path:** `/home`, `/banners`, `/products`, `/offers`  
**Description:** Aggregated and individual homepage content endpoints.

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/home` | Public | Aggregate homepage content in one request |
| GET | `/banners` | Public | Retrieve active banners |
| GET | `/products/featured` | Public | Retrieve featured products |
| GET | `/products/latest` | Public | Retrieve latest designs |
| GET | `/offers/active` | Public | Retrieve active offers |

### FR-HOME-01: Home Aggregate
- **Output:** `{ banners[], featuredProducts[], latestProducts[], activeOffers[], currentRates }`
- **Purpose:** Single call to reduce mobile app round-trips on app launch

---

## Module 4 — Jewellery Categories

**Base Path:** `/categories`, `/admin/categories`  
**Description:** Public category browsing and admin CRUD management.

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/categories` | Public | Retrieve all active categories |
| GET | `/categories/:id` | Public | Retrieve category details |
| POST | `/admin/categories` | Admin | Create new category |
| PUT | `/admin/categories/:id` | Admin | Update category details |
| PATCH | `/admin/categories/:id/status` | Admin | Activate or deactivate category |
| DELETE | `/admin/categories/:id` | Admin | Delete category (if no product references) |

### FR-CAT-01: List Categories
- **Output:** Array of `{ id, name, image, slug, isActive, productCount }`

### FR-CAT-02: Category Details
- **Output:** `{ id, name, image, slug, description, isActive, products[] }`

### FR-CAT-03: Create Category (Admin)
- **Input:** `{ name, image, slug, description?, isActive? }`

### FR-CAT-04: Delete Category (Admin)
- **Rules:** Reject if category has associated products

---

## Module 5 — Jewellery Catalogue & Products

**Base Path:** `/products`, `/admin/products`  
**Description:** Full product catalogue with filtering, search, gallery, and admin CRUD.

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/products` | Public | Paginated catalogue; supports filters and sorting |
| GET | `/products/:id` | Public | Retrieve product details and image URLs |
| GET | `/products/search` | Public | Search products by name or keyword |
| GET | `/products/featured` | Public | Retrieve featured products |
| GET | `/products/latest` | Public | Retrieve latest products |
| POST | `/admin/products` | Admin | Create product |
| PUT | `/admin/products/:id` | Admin | Update product |
| PATCH | `/admin/products/:id/status` | Admin | Publish or unpublish product |
| DELETE | `/admin/products/:id` | Admin | Delete product |
| POST | `/admin/products/:id/images` | Admin | Add product images |
| DELETE | `/admin/products/:id/images/:imageId` | Admin | Remove product image |

### FR-PROD-01: List Products (Catalogue)
- **Query Params:** `category`, `metal` (gold/silver/platinum), `purity` (22K/18K etc), `sort` (price_asc/price_desc/newest), `page`, `limit`
- **Output:** Paginated: `{ data: Product[], total, page, limit }`

### FR-PROD-02: Product Details
- **Output:** `{ id, name, description, price, metal, purity, weight, categoryId, images: string[], isPublished, isFeatured, createdAt }`
- **Note:** Full-screen gallery uses returned image URLs; no separate gallery API needed

### FR-PROD-03: Search Products
- **Query Params:** `q` (search term), `page`, `limit`
- **Output:** Paginated product list matching name or keyword

### FR-PROD-04: Add Product Images (Admin)
- **Input:** Multipart form data with image files, or presigned URL strategy
- **Output:** `{ images: [{ id, url }] }`

---

## Module 6 — Gold & Silver Rates

**Base Path:** `/rates`, `/admin/rates`  
**Description:** Live metal rates from third-party provider with optional manual override.

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/rates/current` | Public | Retrieve current Gold and Silver rates |
| GET | `/rates/history` | Public | Rate history (only if required) |
| GET | `/admin/rates` | Admin | Retrieve rates for admin management |
| PUT | `/admin/rates` | Admin | Manually update rates (if permitted) |

### FR-RATES-01: Current Rates
- **Output:** `{ gold: { rate, unit, updatedAt }, silver: { rate, unit, updatedAt } }`
- **Note:** NestJS normalizes and optionally caches provider responses

---

## Module 7 — My / Shop Rates

**Base Path:** `/shop/rates`, `/admin/shop/rates`  
**Description:** Zewar Mahal's own custom shop rates (separate from live metal rates).

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/shop/rates` | Public | Retrieve Zewar Mahal's own rates |
| PUT | `/admin/shop/rates` | Admin | Update shop rates |
| GET | `/shop/rates/share` | Public | Return share-ready rate information (if needed) |

### FR-SHOP-01: Shop Rates
- **Output:** `{ rates: [{ metal, purity, buyRate, sellRate, updatedAt }] }`
- **Note:** Native mobile sharing can share displayed rates; no separate server-side share endpoint required unless approved

---

## Module 8 — Offers & Promotions

**Base Path:** `/offers`, `/admin/offers`  
**Description:** Customer-facing offers and admin CRUD management.

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/offers` | Public | Retrieve all offers |
| GET | `/offers/:id` | Public | Retrieve offer details |
| POST | `/admin/offers` | Admin | Create offer |
| PUT | `/admin/offers/:id` | Admin | Update offer |
| PATCH | `/admin/offers/:id/status` | Admin | Activate or deactivate offer |
| DELETE | `/admin/offers/:id` | Admin | Delete offer |

### FR-OFFER-01: List Offers
- **Output:** `{ data: Offer[], total }`

### FR-OFFER-02: Offer Details
- **Output:** `{ id, title, description, image, discount, validFrom, validTo, isActive }`

---

## Module 9 — Banner Management

**Base Path:** `/admin/banners`  
**Description:** CMS-managed promotional banners (public banner listing in Home module).

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/admin/banners` | Admin | Create banner |
| PUT | `/admin/banners/:id` | Admin | Update banner |
| PATCH | `/admin/banners/:id/status` | Admin | Activate or deactivate banner |
| DELETE | `/admin/banners/:id` | Admin | Delete banner |

### FR-BANNER-01: Banner Object
- **Fields:** `{ id, title, image, link?, isActive, sortOrder, createdAt }`

---

## Module 10 — Customer Enquiries

**Base Path:** `/enquiries`, `/users/enquiries`, `/admin/enquiries`  
**Description:** Product enquiry submission, customer history, and admin management.

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/enquiries` | Customer | Submit a product enquiry |
| GET | `/users/enquiries` | Customer | Retrieve customer's own enquiries |
| GET | `/admin/enquiries` | Admin | Retrieve all enquiries (paginated) |
| GET | `/admin/enquiries/:id` | Admin | Retrieve enquiry details |
| PATCH | `/admin/enquiries/:id/status` | Admin | Update enquiry status |

### FR-ENQ-01: Submit Enquiry
- **Input:** `{ productId?, name, mobile, message }`
- **Output:** `{ id, referenceNumber, status: "New", createdAt }`
- **Note:** Response includes backend-generated reference number; shown on success screen

### FR-ENQ-02: Enquiry Statuses
- **Workflow:** `New` → `Contacted` → `In Progress` → `Closed`

---

## Module 11 — Notifications & FCM

**Base Path:** `/notifications`, `/admin/notifications`  
**Description:** Firebase Cloud Messaging integration for push notifications.

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/notifications/devices` | Customer | Register device FCM token |
| DELETE | `/notifications/devices/:id` | Customer | Remove registered device |
| GET | `/notifications` | Customer | Retrieve customer notifications |
| PATCH | `/notifications/:id/read` | Customer | Mark notification as read |
| POST | `/admin/notifications/send` | Admin | Send push notification |
| GET | `/admin/notifications` | Admin | Retrieve notification history |

### FR-NOTIF-01: Device Registration
- **Input:** `{ fcmToken: string, platform: "ios" | "android" }`

### FR-NOTIF-02: Send Push Notification (Admin)
- **Input:** `{ title, body, data?, targetAll?: bool, userIds?: string[] }`

---

## Module 12 — Admin Authentication & User Management

**Base Path:** `/admin/auth`, `/admin/dashboard`, `/admin/users`  
**Description:** CMS admin login, dashboard stats, and user oversight.

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/admin/auth/login` | Public | Admin login (email + password) |
| POST | `/admin/auth/logout` | Admin | Admin logout |
| GET | `/admin/auth/me` | Admin | Retrieve current admin details |
| GET | `/admin/dashboard` | Admin | Retrieve CMS dashboard statistics |
| GET | `/admin/users` | Admin | List registered customers |
| GET | `/admin/users/:id` | Admin | Retrieve customer details |
| PATCH | `/admin/users/:id/status` | Admin | Activate or deactivate a user |

### FR-ADMIN-01: Admin Login
- **Input:** `{ email: string, password: string }`
- **Output:** `{ accessToken, refreshToken, admin: { id, name, email, role } }`

### FR-ADMIN-02: Dashboard Stats
- **Output:** `{ totalUsers, totalProducts, totalEnquiries, activeOffers, todayEnquiries }`

---

## Global API Standards

### Request Headers
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

### Paginated Response Format
```json
{
  "data": [],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": ["field: error description"],
  "timestamp": "2026-10-15T14:00:00Z"
}
```

### Implementation Notes
- Protect all `/admin/*` routes with JWT guard + Admin role guard
- Use pagination for catalogue, user, enquiry, and notification lists
- Validate all request payloads using NestJS `class-validator` DTOs
- Keep API credentials on the server; never embed provider secrets in the mobile app
- Finalize request/response schemas with the team before implementation
