# Beat Store — Full Application Specification

**Document Type:** Product Specification  
**Version:** 1.0  
**Status:** Final

---

## 1. Project Overview

A single-producer beat store where a music producer lists his beats for sale. Customers can browse the catalogue, listen to watermarked audio previews, download the watermarked MP3 for testing, and purchase a license to receive a clean WAV file via email. The producer manages everything through a private admin dashboard.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Database | Neon Postgres + Prisma ORM |
| Authentication | Clerk |
| File Storage | Supabase Storage |
| Payments | Paystack |
| Email | Resend |
| Deployment | Vercel |

---

## 3. User Roles

| Role | Description |
|---|---|
| **Producer (Admin)** | Single user. Full access to admin dashboard. Manages beats, orders, promotions, and storefront. |
| **Registered Customer** | Created an account. Can purchase, access order history, and re-download purchases from their dashboard. |
| **Guest Customer** | No account. Can purchase via guest checkout. Receives download link via email only. |

---

## 4. Feature Modules

---

### 4.1 Beat Catalogue (Public Storefront)

The public-facing page where customers browse and discover beats.

**Each beat listing displays:**
- Beat title
- Genre / mood tags
- BPM
- Key
- Cover artwork
- Price(s) in USD — Non-exclusive price, Exclusive price, or both
- "SOLD" badge if exclusive has been purchased
- Discount badge if a promotion is active

**Audio Preview:**
- An embedded audio player streams the watermarked MP3 directly on the page
- The watermarked MP3 is also available as a free download from the beat listing
- The watermark is the producer's tag mixed into the audio at intervals, making the file unusable for commercial release without purchase

**Filtering & Search:**
- Filter by genre, mood, BPM range, key
- Search by beat title

---

### 4.2 Licensing Model

Each beat can be listed under one, two, or all three license types. The producer configures this per beat.

#### License Types

| License | Description |
|---|---|
| **Non-Exclusive** | Multiple customers can purchase. Beat stays listed. Producer sets a price and an optional sales cap. |
| **Exclusive** | One buyer only. Beat is removed from the storefront immediately after purchase. Producer sets a price. |
| **Both** | Beat is listed at two price points. Exclusive purchase removes the beat from sale; existing non-exclusive holders are grandfathered and retain their rights. |

#### Non-Exclusive Sales Cap
- The producer can optionally set a maximum number of non-exclusive sales per beat
- Once the cap is reached, the non-exclusive option is no longer shown
- If exclusive is also listed, it remains available after the cap is hit

#### Exclusive Purchase Transparency
- The exclusive listing always shows the number of non-exclusive licenses already sold
- Example: *"12 non-exclusive licenses already sold"*
- This allows the exclusive buyer to make an informed decision

#### License Conflict Resolution
- Exclusive purchase does **not** void existing non-exclusive licenses
- All prior non-exclusive holders retain their rights permanently
- The beat is simply removed from the store going forward — no new licenses of any type are issued

---

### 4.3 Purchase Flow

#### Guest Checkout
1. Customer selects a license type and clicks "Buy"
2. Customer enters name and email address
3. Paystack payment modal opens
4. On payment confirmation, system generates a signed WAV download link (48hr expiry, max 3 download attempts)
5. Resend delivers an order confirmation email containing the download link

#### Registered Customer Checkout
1. Customer is already logged in
2. Selects license type and clicks "Buy"
3. Paystack payment modal opens
4. On payment confirmation, system records the purchase to the customer's account
5. Download link is emailed and also accessible permanently from the customer's dashboard

#### Currency
- All prices displayed in USD
- Paystack processes the charge and settles to the producer in GHS at the current exchange rate

#### Payment Processing
- Paystack handles all card processing (Visa, Mastercard, Verve)
- International cards are supported with international payments enabled on the Paystack dashboard
- No payment data is stored by the application — Paystack handles all sensitive card data

---

### 4.4 Download & File Delivery

#### WAV File (Purchased)
- Stored in Supabase Storage as a private (non-public) object
- Delivered via a signed URL generated server-side after payment confirmation
- Signed URL constraints: **48-hour expiry**, **maximum 3 download attempts**
- Download attempt count is tracked in the database per order

#### Watermarked MP3 (Free)
- Stored in Supabase Storage
- Publicly accessible — direct download from the beat listing page
- Contains producer's audio tag mixed into the beat

#### Lost Download Link (Guest Customers)
- Customer navigates to a "Resend my download link" page
- Customer provides their email address and order reference number
- System verifies the match against the orders table
- If verified, a new signed URL is generated and emailed (resets the 48hr window, attempt count carries over)
- Order reference is included in the original purchase confirmation email

---

### 4.5 Customer Accounts

#### Registration
- Optional — customers can checkout as guests
- Account creation available before or after purchase
- Post-purchase account creation links the guest order to the new account if emails match

#### Customer Dashboard
- Order history — all purchases with beat title, license type, date, amount paid
- Re-download — permanent re-download access for all purchased WAVs (new signed URL generated on each request, 48hr window)
- Account settings — name, email, password

---

### 4.6 Promotions

All promotions are off by default. The producer activates them from the admin dashboard on a per-beat or store-wide basis.

#### Discount Codes
- Producer creates a code with a percentage or fixed USD discount
- Code has an optional expiry date and optional usage limit
- Applied at checkout — customer enters the code before payment
- Discount is reflected in the Paystack charge amount

#### Beat Giveaways
- Producer sets a beat's price to $0
- Customer "purchases" for free, goes through the normal checkout flow without a payment step
- Receives the WAV download link via email as normal

#### Bulk Discounts
- Producer sets a rule: *"Buy X or more beats in one order, get Y% off"*
- Applied automatically at checkout when the cart meets the threshold
- Bulk discount and discount code can stack or be set as mutually exclusive — producer's choice per promotion

---

### 4.7 Admin Dashboard

Access restricted to the producer only via Clerk authentication.

#### Beat Management
- Upload a new beat (cover art, watermarked MP3, clean WAV, metadata)
- Edit beat details (title, BPM, key, genre, tags, artwork)
- Configure licensing: enable/disable license types, set prices, set non-exclusive sales cap
- Unpublish / republish a beat (hide from storefront without deleting)
- Delete a beat

#### Order Management
- Full order list with filters (date range, beat, license type, status)
- Order detail view: customer info, beat purchased, license type, amount paid, download attempt count

#### Promotions Management
- Create, edit, activate, deactivate, and delete discount codes
- Configure bulk discount rules
- Set individual beats as free (giveaway mode)

#### Storefront Management
- Edit store name, producer bio, social links, profile photo
- Configure featured beats (pinned to top of catalogue)

#### Analytics
- Total revenue (all time and monthly)
- Per-beat performance: preview count vs purchase count (conversion rate)
- Per-beat license breakdown: number of non-exclusive vs exclusive sales
- Recent orders list (last 10)

---

## 5. Email Notifications (via Resend)

| Trigger | Recipient | Content |
|---|---|---|
| Successful purchase | Customer | Order confirmation, beat title, license type, amount paid, order reference, WAV download link |
| Resend download link request | Customer | New WAV download link |
| New order | Producer | Notification of sale — beat title, license type, amount, customer email |

---

## 6. Database Schema (Logical)

### Beats
| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| title | String | |
| bpm | Integer | |
| key | String | |
| genre | String | |
| tags | String[] | |
| coverUrl | String | Supabase Storage URL |
| mp3Url | String | Watermarked MP3 — public |
| wavUrl | String | Clean WAV — private |
| nonExclusiveEnabled | Boolean | |
| nonExclusivePrice | Decimal | USD |
| nonExclusiveCap | Integer | Nullable — null means no cap |
| exclusiveEnabled | Boolean | |
| exclusivePrice | Decimal | USD |
| exclusiveSold | Boolean | Default false |
| published | Boolean | Controls storefront visibility |
| createdAt | DateTime | |

### Customers
| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| clerkId | String | Nullable — null for guest orders |
| email | String | |
| name | String | |
| createdAt | DateTime | |

### Orders
| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| reference | String | Unique — shown to customer for link recovery |
| customerId | UUID | FK → Customers |
| beatId | UUID | FK → Beats |
| licenseType | Enum | NON_EXCLUSIVE / EXCLUSIVE |
| amountUsd | Decimal | |
| paystackReference | String | For verification |
| downloadAttempts | Integer | Default 0 |
| linkExpiresAt | DateTime | 48hr from generation |
| createdAt | DateTime | |

### DiscountCodes
| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| code | String | Unique |
| type | Enum | PERCENTAGE / FIXED |
| value | Decimal | % or USD amount |
| usageLimit | Integer | Nullable |
| usageCount | Integer | Default 0 |
| expiresAt | DateTime | Nullable |
| active | Boolean | |

### BulkDiscountRules
| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| minQuantity | Integer | Minimum beats in cart |
| discountPercent | Decimal | |
| stackable | Boolean | Whether it stacks with discount codes |
| active | Boolean | |

---

## 7. Build Phases

### Phase 1 — Foundation
- Next.js project setup, Clerk authentication, Neon + Prisma setup, Supabase Storage buckets, environment configuration

### Phase 2 — Beat Management & Storefront
- Admin: beat upload (artwork, MP3, WAV), metadata form, licensing configuration
- Public: beat catalogue page, audio player, watermarked MP3 download, beat detail page

### Phase 3 — Purchase Flow & Delivery
- Guest and registered customer checkout
- Paystack integration (payment + webhook verification)
- Signed URL generation
- Resend email delivery (purchase confirmation + download link)
- Lost link recovery flow

### Phase 4 — Customer Accounts & Promotions
- Customer registration and dashboard
- Order history and re-download
- Discount codes
- Bulk discount rules
- Giveaway (free beat) flow

### Phase 5 — Admin Dashboard Polish & Analytics
- Order management table
- Storefront settings
- Featured beats
- Analytics dashboard (revenue, conversion, license breakdown, recent orders)

---

## 8. Key Business Rules

1. A beat cannot be listed with no license type enabled
2. Exclusive purchase immediately sets `exclusiveSold = true` and `published = false` on the beat
3. Existing non-exclusive orders on an exclusively sold beat are not affected
4. Non-exclusive sales are blocked once `nonExclusiveCap` is reached (if set)
5. A signed WAV URL is only generated after Paystack webhook confirms payment — never before
6. Download attempt count is incremented on every signed URL access; access is blocked after 3 attempts
7. The resend link flow carries over the existing download attempt count — it does not reset to 0
8. Guest orders are linked to a registered account if the customer later registers with the same email
9. The producer's admin account is the only account with access to the admin dashboard — no other roles exist
10. Discount codes and bulk discounts can be set to stack or be mutually exclusive per promotion configuration