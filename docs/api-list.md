# API List — Verification Checklist
## Zewar Mahal — NestJS Backend

> Use this file to track implementation and testing status of every API endpoint.  
> Update `Status` as work progresses: `[ ]` To Do → `[x]` Done

---

**Total APIs: 67 endpoints across 12 modules**

---

## Module 1 — Authentication & OTP (`/auth`)

| # | Method | Endpoint | Purpose | Status |
|---|--------|----------|---------|--------|
| 1 | POST | `/auth/send-otp` | Send OTP to mobile number | [x] |
| 2 | POST | `/auth/verify-otp` | Verify OTP and authenticate user | [x] |
| 3 | POST | `/auth/refresh-token` | Refresh access token | [x] |
| 4 | POST | `/auth/logout` | End user session | [x] |
| 5 | GET | `/auth/me` | Get authenticated user details | [x] |

**Subtotal: 5**

---

## Module 2 — User & Profile (`/users`)

| # | Method | Endpoint | Purpose | Status |
|---|--------|----------|---------|--------|
| 6 | GET | `/users/profile` | Retrieve customer profile | [x] |
| 7 | PUT | `/users/profile` | Update customer details | [x] |
| 8 | DELETE | `/users/account` | Request account deletion | [x] |
| 9 | GET | `/users/notification-preferences` | Retrieve notification preferences | [x] |
| 10 | PUT | `/users/notification-preferences` | Update notification preferences | [x] |

**Subtotal: 5**

---

## Module 3 — Home Dashboard (`/home`, `/banners`, `/products`, `/offers`)

| # | Method | Endpoint | Purpose | Status |
|---|--------|----------|---------|--------|
| 11 | GET | `/home` | Aggregate homepage content in one request | [x] |
| 12 | GET | `/banners` | Retrieve active banners | [x] |
| 13 | GET | `/products/featured` | Retrieve featured products | [x] |
| 14 | GET | `/products/latest` | Retrieve latest designs | [x] |
| 15 | GET | `/offers/active` | Retrieve active offers | [x] |

**Subtotal: 5**

---

## Module 4 — Jewellery Categories (`/categories`, `/admin/categories`)

| # | Method | Endpoint | Purpose | Status |
|---|--------|----------|---------|--------|
| 16 | GET | `/categories` | Retrieve active categories | [x] |
| 17 | GET | `/categories/:id` | Retrieve category details | [x] |
| 18 | POST | `/admin/categories` | Create category | [x] |
| 19 | PUT | `/admin/categories/:id` | Update category | [x] |
| 20 | PATCH | `/admin/categories/:id/status` | Activate / deactivate category | [x] |
| 21 | DELETE | `/admin/categories/:id` | Delete category | [x] |

**Subtotal: 6**

---

## Module 5 — Jewellery Catalogue & Products (`/products`, `/admin/products`)

| # | Method | Endpoint | Purpose | Status |
|---|--------|----------|---------|--------|
| 22 | GET | `/products` | Paginated catalogue; supports filters & sorting | [x] |
| 23 | GET | `/products/:id` | Retrieve product details and image URLs | [x] |
| 24 | GET | `/products/search` | Search products by name or keyword | [x] |
| 25 | GET | `/products/featured` | Retrieve featured products | [x] |
| 26 | GET | `/products/latest` | Retrieve latest products | [x] |
| 27 | POST | `/admin/products` | Create product | [x] |
| 28 | PUT | `/admin/products/:id` | Update product | [x] |
| 29 | PATCH | `/admin/products/:id/status` | Publish / unpublish product | [x] |
| 30 | DELETE | `/admin/products/:id` | Delete product | [x] |
| 31 | POST | `/admin/products/:id/images` | Add product images | [x] |
| 32 | DELETE | `/admin/products/:id/images/:imageId` | Remove product image | [x] |

**Subtotal: 11**

---

## Module 6 — Gold & Silver Rates (`/rates`, `/admin/rates`)

| # | Method | Endpoint | Purpose | Status |
|---|--------|----------|---------|--------|
| 33 | GET | `/rates/current` | Retrieve current Gold and Silver rates | [x] |
| 34 | GET | `/rates/history` | Rate history (optional) | [x] |
| 35 | GET | `/admin/rates` | Retrieve rates for admin management | [x] |
| 36 | PUT | `/admin/rates` | Manually update rates | [x] |

**Subtotal: 4**

---

## Module 7 — My / Shop Rates (`/shop/rates`, `/admin/shop/rates`)

| # | Method | Endpoint | Purpose | Status |
|---|--------|----------|---------|--------|
| 37 | GET | `/shop/rates` | Retrieve Zewar Mahal's own rates | [x] |
| 38 | PUT | `/admin/shop/rates` | Update shop rates | [x] |
| 39 | GET | `/shop/rates/share` | Return share-ready rate information | [x] |

**Subtotal: 3**

---

## Module 8 — Offers & Promotions (`/offers`, `/admin/offers`)

| # | Method | Endpoint | Purpose | Status |
|---|--------|----------|---------|--------|
| 40 | GET | `/offers` | Retrieve all offers | [x] |
| 41 | GET | `/offers/:id` | Retrieve offer details | [x] |
| 42 | POST | `/admin/offers` | Create offer | [x] |
| 43 | PUT | `/admin/offers/:id` | Update offer | [x] |
| 44 | PATCH | `/admin/offers/:id/status` | Activate / deactivate offer | [x] |
| 45 | DELETE | `/admin/offers/:id` | Delete offer | [x] |

**Subtotal: 6**

---

## Module 9 — Banner Management (`/admin/banners`)

| # | Method | Endpoint | Purpose | Status |
|---|--------|----------|---------|--------|
| 46 | POST | `/admin/banners` | Create banner | [x] |
| 47 | PUT | `/admin/banners/:id` | Update banner | [x] |
| 48 | PATCH | `/admin/banners/:id/status` | Activate / deactivate banner | [x] |
| 49 | DELETE | `/admin/banners/:id` | Delete banner | [x] |

**Subtotal: 4**

---

## Module 10 — Customer Enquiries (`/enquiries`, `/users/enquiries`, `/admin/enquiries`)

| # | Method | Endpoint | Purpose | Status |
|---|--------|----------|---------|--------|
| 50 | POST | `/enquiries` | Submit a product enquiry | [x] |
| 51 | GET | `/users/enquiries` | Retrieve customer's own enquiries | [x] |
| 52 | GET | `/admin/enquiries` | Retrieve all enquiries (paginated) | [x] |
| 53 | GET | `/admin/enquiries/:id` | Retrieve enquiry details | [x] |
| 54 | PATCH | `/admin/enquiries/:id/status` | Update enquiry status | [x] |

**Subtotal: 5**

---

## Module 11 — Notifications & FCM (`/notifications`, `/admin/notifications`)

| # | Method | Endpoint | Purpose | Status |
|---|--------|----------|---------|--------|
| 55 | POST | `/notifications/devices` | Register device FCM token | [x] |
| 56 | DELETE | `/notifications/devices/:id` | Remove registered device | [x] |
| 57 | GET | `/notifications` | Retrieve customer notifications | [x] |
| 58 | PATCH | `/notifications/:id/read` | Mark notification as read | [x] |
| 59 | POST | `/admin/notifications/send` | Send push notification | [x] |
| 60 | GET | `/admin/notifications` | Retrieve notification history | [x] |

**Subtotal: 6**

---

## Module 12 — Admin Authentication & User Management (`/admin/auth`, `/admin/users`)

| # | Method | Endpoint | Purpose | Status |
|---|--------|----------|---------|--------|
| 61 | POST | `/admin/auth/login` | Admin login | [ ] |
| 62 | POST | `/admin/auth/logout` | Admin logout | [ ] |
| 63 | GET | `/admin/auth/me` | Retrieve current admin details | [ ] |
| 64 | GET | `/admin/dashboard` | Retrieve CMS dashboard statistics | [ ] |
| 65 | GET | `/admin/users` | List registered customers | [ ] |
| 66 | GET | `/admin/users/:id` | Retrieve customer details | [ ] |
| 67 | PATCH | `/admin/users/:id/status` | Activate / deactivate a user | [ ] |

**Subtotal: 7**

---

## Grand Total Summary

| Module | Endpoints | Done | Remaining |
|--------|-----------|------|-----------|
| 1. Auth & OTP | 5 | 0 | 5 |
| 2. User & Profile | 5 | 0 | 5 |
| 3. Home Dashboard | 5 | 0 | 5 |
| 4. Categories | 6 | 0 | 6 |
| 5. Products & Catalogue | 11 | 0 | 11 |
| 6. Gold & Silver Rates | 4 | 0 | 4 |
| 7. Shop Rates | 3 | 0 | 3 |
| 8. Offers & Promotions | 6 | 0 | 6 |
| 9. Banner Management | 4 | 0 | 4 |
| 10. Customer Enquiries | 5 | 0 | 5 |
| 11. Notifications & FCM | 6 | 0 | 6 |
| 12. Admin Auth & Users | 7 | 0 | 7 |
| **TOTAL** | **67** | **0** | **67** |

---

## Auth Legend

| Symbol | Meaning |
|--------|---------|
| 🌐 Public | No authentication required |
| 🔐 Customer | Requires customer JWT (`Authorization: Bearer <token>`) |
| 🛡️ Admin | Requires admin JWT + Admin role guard |

### Auth Map

| # | Endpoint | Auth |
|---|----------|------|
| 1 | POST `/auth/send-otp` | 🌐 Public |
| 2 | POST `/auth/verify-otp` | 🌐 Public |
| 3 | POST `/auth/refresh-token` | 🌐 Public |
| 4 | POST `/auth/logout` | 🔐 Customer |
| 5 | GET `/auth/me` | 🔐 Customer |
| 6 | GET `/users/profile` | 🔐 Customer |
| 7 | PUT `/users/profile` | 🔐 Customer |
| 8 | DELETE `/users/account` | 🔐 Customer |
| 9 | GET `/users/notification-preferences` | 🔐 Customer |
| 10 | PUT `/users/notification-preferences` | 🔐 Customer |
| 11 | GET `/home` | 🌐 Public |
| 12 | GET `/banners` | 🌐 Public |
| 13 | GET `/products/featured` | 🌐 Public |
| 14 | GET `/products/latest` | 🌐 Public |
| 15 | GET `/offers/active` | 🌐 Public |
| 16 | GET `/categories` | 🌐 Public |
| 17 | GET `/categories/:id` | 🌐 Public |
| 18 | POST `/admin/categories` | 🛡️ Admin |
| 19 | PUT `/admin/categories/:id` | 🛡️ Admin |
| 20 | PATCH `/admin/categories/:id/status` | 🛡️ Admin |
| 21 | DELETE `/admin/categories/:id` | 🛡️ Admin |
| 22 | GET `/products` | 🌐 Public |
| 23 | GET `/products/:id` | 🌐 Public |
| 24 | GET `/products/search` | 🌐 Public |
| 25 | GET `/products/featured` | 🌐 Public |
| 26 | GET `/products/latest` | 🌐 Public |
| 27 | POST `/admin/products` | 🛡️ Admin |
| 28 | PUT `/admin/products/:id` | 🛡️ Admin |
| 29 | PATCH `/admin/products/:id/status` | 🛡️ Admin |
| 30 | DELETE `/admin/products/:id` | 🛡️ Admin |
| 31 | POST `/admin/products/:id/images` | 🛡️ Admin |
| 32 | DELETE `/admin/products/:id/images/:imageId` | 🛡️ Admin |
| 33 | GET `/rates/current` | 🌐 Public |
| 34 | GET `/rates/history` | 🌐 Public |
| 35 | GET `/admin/rates` | 🛡️ Admin |
| 36 | PUT `/admin/rates` | 🛡️ Admin |
| 37 | GET `/shop/rates` | 🌐 Public |
| 38 | PUT `/admin/shop/rates` | 🛡️ Admin |
| 39 | GET `/shop/rates/share` | 🌐 Public |
| 40 | GET `/offers` | 🌐 Public |
| 41 | GET `/offers/:id` | 🌐 Public |
| 42 | POST `/admin/offers` | 🛡️ Admin |
| 43 | PUT `/admin/offers/:id` | 🛡️ Admin |
| 44 | PATCH `/admin/offers/:id/status` | 🛡️ Admin |
| 45 | DELETE `/admin/offers/:id` | 🛡️ Admin |
| 46 | POST `/admin/banners` | 🛡️ Admin |
| 47 | PUT `/admin/banners/:id` | 🛡️ Admin |
| 48 | PATCH `/admin/banners/:id/status` | 🛡️ Admin |
| 49 | DELETE `/admin/banners/:id` | 🛡️ Admin |
| 50 | POST `/enquiries` | 🔐 Customer |
| 51 | GET `/users/enquiries` | 🔐 Customer |
| 52 | GET `/admin/enquiries` | 🛡️ Admin |
| 53 | GET `/admin/enquiries/:id` | 🛡️ Admin |
| 54 | PATCH `/admin/enquiries/:id/status` | 🛡️ Admin |
| 55 | POST `/notifications/devices` | 🔐 Customer |
| 56 | DELETE `/notifications/devices/:id` | 🔐 Customer |
| 57 | GET `/notifications` | 🔐 Customer |
| 58 | PATCH `/notifications/:id/read` | 🔐 Customer |
| 59 | POST `/admin/notifications/send` | 🛡️ Admin |
| 60 | GET `/admin/notifications` | 🛡️ Admin |
| 61 | POST `/admin/auth/login` | 🌐 Public |
| 62 | POST `/admin/auth/logout` | 🛡️ Admin |
| 63 | GET `/admin/auth/me` | 🛡️ Admin |
| 64 | GET `/admin/dashboard` | 🛡️ Admin |
| 65 | GET `/admin/users` | 🛡️ Admin |
| 66 | GET `/admin/users/:id` | 🛡️ Admin |
| 67 | PATCH `/admin/users/:id/status` | 🛡️ Admin |

---

_Last updated: October 2026 | v1.0_
