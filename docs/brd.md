# Business Requirements Document (BRD)
## Zewar Mahal — Jewellery Application

---

## 1. Executive Summary

**Project Name:** Zewar Mahal Jewellery Application  
**Document Type:** Business Requirements Document  
**Version:** 1.0  
**Date:** October 2026  
**Prepared For:** Zewar Mahal  
**Scope:** React Native Mobile App · NestJS Backend API · CMS Web Application  

Zewar Mahal requires a full-stack digital platform consisting of a customer-facing React Native mobile application, a NestJS-powered REST API backend, and a CMS web application for internal management. The platform will enable customers to browse jewellery catalogues, check live gold and silver rates, submit enquiries, and receive push notifications — while giving admins complete control via a CMS dashboard.

---

## 2. Business Objectives

| # | Objective |
|---|-----------|
| BO-01 | Provide customers with a seamless jewellery browsing experience via a mobile app |
| BO-02 | Display live and shop-specific Gold & Silver rates to customers |
| BO-03 | Enable customers to enquire about products directly from the app |
| BO-04 | Allow admins to manage the entire catalogue, banners, offers, and rates via a CMS |
| BO-05 | Deliver push notifications to customers for offers, rates, and announcements |
| BO-06 | Provide a secure, OTP-based authentication system for customers |
| BO-07 | Ensure scalability and maintainability for future feature additions |

---

## 3. Stakeholders

| Role | Responsibility |
|------|---------------|
| Business Owner (Zewar Mahal) | Final approval, requirement sign-off |
| Development Team | Backend (NestJS), Mobile (React Native), CMS (Web) |
| Admin Users | CMS operators — manage catalogue, rates, offers, banners |
| Customers | End-users of the mobile application |

---

## 4. Business Scope

### 4.1 In-Scope Features

| Module | Description |
|--------|-------------|
| Authentication & OTP | Mobile OTP login via SMS (MessageBot integration) |
| User & Profile Management | Customer profile view and edit |
| Home Dashboard | Aggregated homepage content |
| Jewellery Categories | Category listing and management |
| Jewellery Catalogue & Products | Full product catalogue with filters, search, gallery |
| Gold & Silver Rates | Live rates via third-party provider |
| My / Shop Rates | Zewar Mahal's own custom rates |
| Hisaabwala Calculator | Local jewellery calculation tool (no backend unless history approved) |
| Offers & Promotions | Active offers for customers |
| Banner Management | CMS-managed promotional banners |
| Customer Enquiries | Product enquiry submission and tracking |
| Notifications & FCM | Firebase-based push notifications |
| Admin Auth & User Management | CMS admin login and user oversight |
| Privacy Policy & Terms | Static or CMS-managed legal pages |
| Image Storage | Product and banner image upload and storage |

### 4.2 Out-of-Scope (MVP Exclusions)

| Feature | Reason |
|---------|--------|
| Jewellery Reordering | Excluded from agreed scope |
| Pehchaan Card | Excluded from agreed scope |
| Payment Gateway | Excluded from agreed scope |
| MCX API | Excluded from agreed scope |
| Calculator History | Only if separately approved |
| Account Deletion | Optional — only if approved |
| Dynamic Legal Page Management | Only if explicitly approved |
| Rate History | Only if explicitly required |

---

## 5. Functional Requirements Summary

### 5.1 Customer Mobile App Requirements

- **BR-01:** Customers must be able to register and login using their mobile number via OTP.
- **BR-02:** Customers must be able to view and edit their profile.
- **BR-03:** Customers must see a rich homepage with banners, featured products, latest designs, and active offers.
- **BR-04:** Customers must be able to browse the jewellery catalogue with filters (category, metal, purity, sort, page, limit).
- **BR-05:** Customers must be able to search products by name or keyword.
- **BR-06:** Customers must see live Gold & Silver rates.
- **BR-07:** Customers must see Zewar Mahal's own shop rates.
- **BR-08:** Customers must be able to submit product enquiries.
- **BR-09:** Customers must receive push notifications via Firebase Cloud Messaging.
- **BR-10:** Customers must be able to manage notification preferences.

### 5.2 Admin CMS Requirements

- **BR-11:** Admins must be able to login securely to the CMS.
- **BR-12:** Admins must be able to manage jewellery categories (CRUD + activate/deactivate).
- **BR-13:** Admins must be able to manage products (CRUD + publish/unpublish + images).
- **BR-14:** Admins must be able to manage banners (CRUD + activate/deactivate).
- **BR-15:** Admins must be able to manage offers (CRUD + activate/deactivate).
- **BR-16:** Admins must be able to view and update gold/silver rates.
- **BR-17:** Admins must be able to manage Zewar Mahal's shop rates.
- **BR-18:** Admins must be able to view and update customer enquiries with status tracking.
- **BR-19:** Admins must be able to send targeted push notifications.
- **BR-20:** Admins must be able to view dashboard statistics and manage users.

---

## 6. Non-Functional Requirements

| Requirement | Detail |
|-------------|--------|
| **Performance** | API responses under 300ms for standard queries; paginated list endpoints |
| **Security** | JWT-based auth; admin routes protected by role-based guards; no secrets in mobile app |
| **Scalability** | Horizontally scalable NestJS service; stateless API design |
| **Reliability** | FCM integration for push notifications; OTP via MessageBot SMS |
| **Maintainability** | Modular NestJS architecture; consistent error response format |
| **Data Integrity** | Input validation on all endpoints; consistent error responses |
| **Image Storage** | Configurable: direct NestJS upload or signed cloud storage URLs |

---

## 7. Third-Party Integrations

| Service | Required | Purpose |
|---------|----------|---------|
| Gold & Silver Rate Provider | Yes | Live metal rates |
| MessageBot | Yes | SMS OTP delivery |
| Firebase Cloud Messaging (FCM) | Yes | Push notifications |
| Firebase Crashlytics | Yes | Mobile crash monitoring (SDK only, no custom API) |
| Payment Gateway | No | Excluded from MVP scope |
| MCX API | No | Excluded from MVP scope |

---

## 8. Assumptions & Constraints

- OTP is delivered via MessageBot SMS service only.
- Calculator logic runs locally on mobile; no backend needed unless history storage is approved.
- Rate history is optional; only implement if explicitly required.
- The agreed gold & silver rate provider will be confirmed before implementation.
- Image storage strategy (direct upload vs. signed URL) to be finalized before implementation.
- Legal pages (Privacy Policy, Terms) are static by default; dynamic CMS editing only if approved.

---

## 9. Success Criteria

| Criterion | Metric |
|-----------|--------|
| All core APIs live and tested | 100% of in-scope endpoints implemented |
| Mobile app can authenticate users | OTP login works end-to-end |
| Admin can manage full catalogue | CRUD for products, categories, banners, offers |
| Push notifications delivered | FCM integration working |
| Live rates visible | Gold/Silver rate provider integrated |
| Enquiries tracked | Status workflow: New > Contacted > In Progress > Closed |
