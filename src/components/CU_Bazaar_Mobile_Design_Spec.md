# CU Bazaar — Premium Mobile-First Platform
## Complete iOS-Inspired Design System & Technical Specification

> **Document Version:** 1.0  
> **Platform:** Mobile-First (iOS Aesthetic Baseline)  
> **Product Type:** Social Commerce + Marketplace Hybrid  
> **Design Philosophy:** "Native app feel. Zero website compromise."

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Design Philosophy & Vision](#2-design-philosophy--vision)
3. [Design System Foundations](#3-design-system-foundations)
4. [App Architecture & Screen Map](#4-app-architecture--screen-map)
5. [Home Screen — Detailed Specification](#5-home-screen--detailed-specification)
6. [Navigation System](#6-navigation-system)
7. [Product Listing & Discovery](#7-product-listing--discovery)
8. [Product Detail Page](#8-product-detail-page)
9. [Cart & Checkout Flow](#9-cart--checkout-flow)
10. [User Profile & Dashboard](#10-user-profile--dashboard)
11. [Search Experience](#11-search-experience)
12. [Categories Section](#12-categories-section)
13. [Animation & Motion System](#13-animation--motion-system)
14. [Glassmorphism & Visual Effects](#14-glassmorphism--visual-effects)
15. [Component Library](#15-component-library)
16. [Micro-Interaction Catalog](#16-micro-interaction-catalog)
17. [Dark Mode System](#17-dark-mode-system)
18. [Accessibility Guidelines](#18-accessibility-guidelines)
19. [Performance Standards](#19-performance-standards)
20. [PWA Configuration](#20-pwa-configuration)
21. [Technical Stack Recommendations](#21-technical-stack-recommendations)
22. [Responsive Breakpoints & Device Targets](#22-responsive-breakpoints--device-targets)
23. [Gesture System](#23-gesture-system)
24. [Design Tokens Reference](#24-design-tokens-reference)

---

## 1. Executive Summary

CU Bazaar Mobile is a **premium social commerce platform** redesigned ground-up for mobile-first users. The experience is modeled after the polish and interaction quality of native iOS apps — not a web browser adaptation.

### Core Differentiators
| Feature | Traditional Mobile Web | CU Bazaar Mobile |
|---|---|---|
| Navigation | Top hamburger menu | Floating bottom dock |
| Layout | Stacked desktop sections | App-style widget modules |
| Product Browse | Grid/list pages | Stories + Carousels |
| Checkout | Multi-step pages | Slide-up drawer flow |
| Categories | Text list / flat grid | Circular iOS icon system |
| Search | Basic input field | Full-screen AI search overlay |
| Animations | CSS transitions | Spring physics + haptic-feel |

---

## 2. Design Philosophy & Vision

### 2.1 Core Principles

**1. Thumb-First Design**
Every interactive element must be reachable with the user's thumb in one-handed usage. Critical CTAs live in the bottom 40% of the screen. The floating nav, cart button, and primary actions are all thumb-accessible.

**2. Zero Friction Commerce**
Reduce cognitive load. Every screen should have one clear purpose and one obvious next action. Checkout should never require more than 3 taps from cart.

**3. Delight Over Function**
Small animations, satisfying micro-interactions, and contextual haptic responses (via Vibration API) make the app addictive. Every tap should feel rewarding.

**4. Premium Visual Language**
White space is generous. Typography is deliberate. Shadows are layered and soft. Glass effects are used contextually, not decoratively.

**5. Social Commerce DNA**
Products are shown in the context of people who love them. Seller stories, live commerce, community reviews, and social proof are woven into the browsing experience — not afterthoughts.

### 2.2 Mood Board Keywords
- `Frosted` `Floating` `Luminous` `Tactile` `Spatial` `Layered` `Alive`

### 2.3 Inspiration References
- Apple App Store (curation + cards)
- Instagram Shopping (social + visual commerce)
- Apple Wallet (glassmorphism + minimal data)
- iOS Control Center (floating glass panel system)
- Zara App (editorial product photography)
- Arc Browser (live interaction quality)

---

## 3. Design System Foundations

### 3.1 Color Palette

#### Light Mode (Primary)
```css
/* Brand */
--cu-primary:        #FF3B6B;      /* Hot pink — CTA, active states */
--cu-primary-light:  #FF6B95;      /* Hover/pressed variant */
--cu-secondary:      #7C3AED;      /* Purple — badges, premium tags */
--cu-accent:         #FF9500;      /* Orange — flash deals, urgency */
--cu-accent-green:   #34C759;      /* iOS green — success, in stock */

/* Neutrals */
--cu-bg-primary:     #FFFFFF;
--cu-bg-secondary:   #F2F2F7;      /* iOS system gray 6 */
--cu-bg-tertiary:    #E5E5EA;      /* iOS system gray 5 */
--cu-surface:        rgba(255,255,255,0.72);   /* Glassmorphism base */
--cu-surface-raised: rgba(255,255,255,0.90);

/* Text */
--cu-text-primary:   #1C1C1E;      /* iOS label */
--cu-text-secondary: #636366;      /* iOS secondary label */
--cu-text-tertiary:  #AEAEB2;      /* iOS tertiary label */
--cu-text-inverted:  #FFFFFF;

/* Borders */
--cu-border:         rgba(60,60,67,0.12);
--cu-separator:      rgba(60,60,67,0.08);

/* Shadows */
--shadow-sm:    0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
--shadow-md:    0 4px 12px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06);
--shadow-lg:    0 12px 32px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06);
--shadow-xl:    0 24px 48px rgba(0,0,0,0.14), 0 8px 16px rgba(0,0,0,0.08);
--shadow-glow:  0 0 24px rgba(255,59,107,0.30);
```

#### Dark Mode Overrides
```css
[data-theme="dark"] {
  --cu-bg-primary:     #000000;
  --cu-bg-secondary:   #1C1C1E;      /* iOS dark grouped bg */
  --cu-bg-tertiary:    #2C2C2E;
  --cu-surface:        rgba(30,30,32,0.80);
  --cu-text-primary:   #FFFFFF;
  --cu-text-secondary: #EBEBF5;
  --cu-border:         rgba(255,255,255,0.10);
}
```

---

### 3.2 Typography

```css
/* Display — Product titles, hero headers */
--font-display: 'SF Pro Display', 'Helvetica Neue', system-ui;

/* Body — Descriptions, UI labels */
--font-body: 'SF Pro Text', 'Helvetica Neue', system-ui;

/* Mono — Prices, codes, numeric data */
--font-mono: 'SF Mono', 'Menlo', monospace;

/* Scale — iOS-inspired */
--text-caption2:   11px / 1.3;
--text-caption1:   12px / 1.4;
--text-footnote:   13px / 1.4;
--text-subhead:    15px / 1.4;
--text-callout:    16px / 1.4;
--text-body:       17px / 1.5;
--text-headline:   17px / 1.4   font-weight: 600;
--text-title3:     20px / 1.3   font-weight: 400;
--text-title2:     22px / 1.3   font-weight: 700;
--text-title1:     28px / 1.2   font-weight: 700;
--text-large-title:34px / 1.1   font-weight: 700;
```

---

### 3.3 Spacing Scale

```
4px  → xs     (tight label gaps)
8px  → sm     (icon padding, small gaps)
12px → md-sm  (card inner padding)
16px → md     (standard component padding)
20px → md-lg  (section padding)
24px → lg     (generous component spacing)
32px → xl     (major section dividers)
48px → 2xl    (screen-level vertical rhythm)
64px → 3xl    (hero sections)
```

---

### 3.4 Border Radius System

```css
--radius-xs:   4px;    /* Chip inner elements */
--radius-sm:   8px;    /* Buttons, small chips */
--radius-md:   12px;   /* Cards, inputs */
--radius-lg:   16px;   /* Product cards, panels */
--radius-xl:   20px;   /* Modals, drawers */
--radius-2xl:  24px;   /* Feature cards */
--radius-full: 9999px; /* Pills, avatars, icons */
```

---

## 4. App Architecture & Screen Map

```
CU Bazaar App
│
├── Splash Screen               ← Logo + spring animation
│
├── Onboarding (3 screens)      ← Swipeable slides
│   ├── Welcome to CU Bazaar
│   ├── Discover Local Sellers
│   └── Shop. Connect. Save.
│
├── Auth Flow
│   ├── Phone / Email Login     ← Slide-up sheet
│   ├── OTP Verification        ← Animated digit inputs
│   └── Profile Setup           ← Minimal 2-step
│
└── Main App (Tab Bar)
    │
    ├── 🏠 Home Tab
    │   ├── Home Feed
    │   ├── Flash Deals Page
    │   ├── Featured Sellers Page
    │   └── Rewards / Wallet Card
    │
    ├── 🔍 Search Tab
    │   ├── Search Home (trending, history)
    │   ├── Results Page (filter drawer)
    │   └── Voice Search Overlay
    │
    ├── 🏷 Categories Tab
    │   ├── Category Grid
    │   └── Category Detail → Product List
    │
    ├── 🛒 Cart Tab
    │   ├── Cart Items
    │   ├── Saved for Later
    │   ├── Checkout Flow
    │   │   ├── Address Step
    │   │   ├── Payment Step
    │   │   └── Confirmation
    │   └── Order Tracking
    │
    └── 👤 Profile Tab
        ├── Dashboard
        ├── Orders
        ├── Wishlist
        ├── Wallet
        ├── Reviews
        ├── Notifications
        └── Settings
```

---

## 5. Home Screen — Detailed Specification

### 5.1 Structure Layout (Top → Bottom)

```
┌─────────────────────────────────────────┐
│  STATUS BAR (system)                    │
├─────────────────────────────────────────┤
│  HEADER MODULE                          │
│  ┌─ Greeting + Avatar  ── Bell Icon ─┐  │
│  │  "Good morning, Rahul 👋"         │  │
│  │  "What are you looking for today?"│  │
│  └────────────────────────────────────┘  │
├─────────────────────────────────────────┤
│  SEARCH BAR (glassmorphism, sticky)     │
│  ┌─🔍 Search products, sellers...──📷─┐│
│  └────────────────────────────────────┘│
├─────────────────────────────────────────┤
│  QUICK ACTION ICONS (2×4 grid)          │
│  📦 Orders  💳 Wallet  🎁 Offers  📍 Near│
│  🔥 Trending 👗 Fashion ⚡ Flash ⭐ Top │
├─────────────────────────────────────────┤
│  HERO BANNER CAROUSEL                   │
│  ┌────────────────────────────────────┐ │
│  │  Full-bleed gradient image card   │ │
│  │  with CTA overlay + timer         │ │
│  └────────────────────────────────────┘ │
│     ● ○ ○ ○   (dot pagination)          │
├─────────────────────────────────────────┤
│  CATEGORIES SCROLL (horizontal)         │
│  ⚽ Sports  👗 Fashion  🏠 Home  💄 Beauty│
├─────────────────────────────────────────┤
│  TRENDING PRODUCTS (swipeable cards)    │
│  ← [Card] [Card] [Card] →               │
├─────────────────────────────────────────┤
│  FLASH DEALS SECTION                   │
│  ⚡ FLASH DEALS  Ends in: 02:45:12      │
│  ← [Deal] [Deal] [Deal] →              │
├─────────────────────────────────────────┤
│  FEATURED SELLERS                       │
│  Stories-style horizontal row          │
│  [🏪 Seller] [🏪 Seller] [🏪 Seller]    │
├─────────────────────────────────────────┤
│  WALLET / REWARDS CARD                  │
│  ┌─ Glassmorphism gradient card ──────┐ │
│  │  💰 ₹2,450 Wallet  |  ⭐ 340 pts  │ │
│  └────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│  "JUST FOR YOU" FEED (infinite scroll)  │
│  [Product][Product]  ← 2-col masonry    │
├─────────────────────────────────────────┤
│  RECENTLY VIEWED                        │
├─────────────────────────────────────────┤
│  BOTTOM NAV BAR (floating)              │
└─────────────────────────────────────────┘
```

### 5.2 Header Module Specification

```
Height: 80px
Padding: 16px horizontal
Background: var(--cu-bg-primary)

Left side:
  - Avatar circle (36px), user photo or initials
  - Greeting text (--text-subhead, secondary color)
  - Name line (--text-headline, primary color)

Right side:
  - Notification bell (24px icon)
  - Red badge counter (pill, max 99+)
  - On tap: slide down notification drawer
```

### 5.3 Sticky Search Bar

```
Height: 48px
Border-radius: --radius-full (pill shape)
Background: var(--cu-bg-secondary) with blur
Backdrop-filter: blur(20px) saturate(180%)
Border: 1px solid var(--cu-border)

Behavior:
  - Sticky at 80px from top as user scrolls
  - On scroll-past: gains elevated shadow + opacity
  - On tap: full-screen search overlay animates in
  - Camera icon → barcode/image search
```

### 5.4 Quick Access Icons Grid

```
Layout: 4 columns × 2 rows
Icon size: 44px × 44px container
Icon visual: 28px SVG/emoji
Background: gradient circles (per category color)
Label: --text-caption1 below icon
Tap animation: spring scale 0.9 → 1.05 → 1.0

Icons set:
1. 📦 Orders         → gradient: #667eea → #764ba2
2. 💳 Wallet         → gradient: #f7971e → #ffd200
3. 🎁 Offers         → gradient: #f953c6 → #b91d73
4. 📍 Near Me        → gradient: #43e97b → #38f9d7
5. 🔥 Trending       → gradient: #fa709a → #fee140
6. 👗 Fashion        → gradient: #a18cd1 → #fbc2eb
7. ⚡ Flash Deals    → gradient: #f77062 → #fe5196
8. ⭐ Top Rated      → gradient: #ffd89b → #19547b
```

---

## 6. Navigation System

### 6.1 Floating Bottom Tab Bar

```css
/* Structure */
.bottom-nav {
  position: fixed;
  bottom: 20px;             /* Float above safe area */
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 420px;
  height: 68px;
  border-radius: 34px;      /* Full pill */
  
  /* Glassmorphism */
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.5);
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.12),
    0 2px 8px rgba(0,0,0,0.06),
    inset 0 1px 0 rgba(255,255,255,0.8);
  
  /* Layout */
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 8px;
  z-index: 1000;
  
  /* Safe area for iPhones */
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

### 6.2 Tab Item States

**Default state:**
```
Icon: 24px, gray (#AEAEB2)
Label: 10px, hidden (icon only)
```

**Active state:**
```
Icon: 24px, --cu-primary color
Label: 10px, visible below icon
Background: soft pink pill (32px × 32px, opacity 0.12)
Glow: 0 0 16px rgba(255,59,107,0.25)
Animation: spring scale pop on select
```

**Cart tab with badge:**
```
Badge: absolute top-right, red circle, 18px
Count: white, 10px, SF Pro Display
Animation: bounce + wiggle on item add
```

### 6.3 Tab Transition Animation

```
Screen change:
  - Outgoing: fade + translate(-10px) opacity 0
  - Incoming: fade + translate(10px→0) opacity 0→1
  - Duration: 280ms cubic-bezier(0.34, 1.56, 0.64, 1)

Icon tap:
  - Scale: 1 → 0.85 → 1.12 → 1.0
  - Duration: 350ms spring physics
```

---

## 7. Product Listing & Discovery

### 7.1 Layout Modes

**Grid Mode (Default):**
```
2-column masonry grid
Card gap: 12px
Side padding: 16px
Image aspect: 1:1.2 (portrait)
```

**List Mode:**
```
Full-width cards
Image: 100px × 100px left-aligned
Text block: right side (2/3 width)
Horizontal swipe → delete / wishlist
```

**Stories Mode (Discovery):**
```
Full-width immersive cards
Auto-advance with progress bar
Tap right/left to navigate
Swipe up → product detail sheet
```

### 7.2 Product Card Anatomy

```
┌──────────────────────┐
│  ┌────────────────┐  │
│  │  PRODUCT IMAGE │  │  ← Aspect 1:1.2, cover-fit
│  │                │  │
│  │  [BADGE]       │  │  ← "NEW" / "SALE" / "HOT" pill (top-left)
│  │         [❤️]   │  │  ← Wishlist (top-right, glassmorphism bg)
│  └────────────────┘  │
│                      │
│  Seller name         │  ← 11px, secondary text
│  Product name        │  ← 14px, 2-line clamp, semibold
│  ★★★★☆ (42)         │  ← Star rating + review count
│                      │
│  ₹1,299  ~~₹2,499~~ │  ← Price + strikethrough MRP
│  (48% off)           │  ← Discount badge, accent green
│                      │
│  [+ Add to Cart  ]   │  ← Floating rounded button, primary color
└──────────────────────┘

Card:
  border-radius: 16px
  background: --cu-bg-primary
  box-shadow: --shadow-md
  overflow: hidden

Tap animation:
  scale: 1 → 0.97
  shadow: md → sm
  duration: 120ms
  release: spring back
```

### 7.3 Filter & Sort Bottom Drawer

```
Trigger: "Filters" button → slide-up sheet
Sheet height: 70vh
Handle bar: 4px × 36px, rounded, gray, centered top

Sections:
  ├── Sort By (radio group, pill chips)
  ├── Price Range (dual-handle slider)
  ├── Category (multi-select chips)
  ├── Rating (star filter)
  ├── Distance (if Near Me active)
  └── Availability (In Stock toggle)

Bottom CTA:
  [Clear All]   [Show 1,284 Products →]
```

---

## 8. Product Detail Page

### 8.1 Layout Structure

```
┌─────────────────────────────────────────┐
│  BACK ←    [Product Name]    ⊞ Share    │  ← Floating navbar (glass)
├─────────────────────────────────────────┤
│  IMAGE GALLERY                          │
│  ┌────────────────────────────────────┐ │
│  │     Full-bleed product photo       │ │  ← 100vw × 72vw
│  │                                    │ │
│  │  ●○○○○  (dot indicator)           │ │
│  └────────────────────────────────────┘ │
│  Thumbnail strip (horizontal scroll)    │
├─────────────────────────────────────────┤
│  PRODUCT INFO CARD                      │
│  ┌────────────────────────────────────┐ │
│  │  [CATEGORY CHIP]  [IN STOCK ●]    │ │
│  │  Product Full Name (title2)        │ │
│  │  by Seller Name →                  │ │
│  │  ★★★★☆  4.2  (328 reviews)  →    │ │
│  │                                    │ │
│  │  ₹1,299                            │ │  ← Large price (title1)
│  │  ~~₹2,499~~ · 48% off             │ │
│  │  + Free delivery by Tomorrow       │ │
│  └────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│  VARIANTS (Size / Color)               │
│  ┌── Color ─────────────────────────┐  │
│  │  ● ● ● ● (color swatches)        │  │
│  └──────────────────────────────────┘  │
│  ┌── Size ──────────────────────────┐  │
│  │  [S] [M] [L] [XL] [XXL]         │  │
│  └──────────────────────────────────┘  │
├─────────────────────────────────────────┤
│  DESCRIPTION (collapsible)             │
│  SPECIFICATIONS (collapsible)          │
│  SELLER INFO (mini card)               │
│  REVIEWS (top 3 + see all)             │
│  RELATED PRODUCTS (horizontal scroll)  │
├─────────────────────────────────────────┤
│  STICKY BOTTOM ACTIONS                  │
│  ┌───────────────┬────────────────────┐ │
│  │ [❤️ Wishlist] │ [🛒 Add to Cart  ]│ │
│  └───────────────┴────────────────────┘ │
│            [⚡ Buy Now]                 │
└─────────────────────────────────────────┘
```

### 8.2 Image Gallery Interaction

```
Gesture support:
  - Horizontal swipe → next/prev image
  - Pinch-to-zoom → full screen zoom
  - Double-tap → 2x zoom with animation
  - Swipe down from full-screen → close

Zoom overlay:
  background: black
  close button: top-right X
  pinch min/max: 1x → 5x
```

### 8.3 Add to Cart Animation

```
Trigger: Tap "Add to Cart"
Animation sequence:
  1. Button shrinks + shows spinner (300ms)
  2. Product image flies up toward cart icon (400ms)
  3. Cart icon bounces + badge increments (200ms)
  4. Button changes to "Added ✓" (green state, 1.5s)
  5. Button resets to "Add to Cart" (fade, 500ms)
```

---

## 9. Cart & Checkout Flow

### 9.1 Cart Screen

```
┌─────────────────────────────────────────┐
│  ← My Cart               (3 items)      │
├─────────────────────────────────────────┤
│  SELLER GROUP 1                         │
│  🏪 Fashion Store  ✓ Verified           │
│                                         │
│  ┌─── Cart Item Card ──────────────┐   │
│  │ [IMG] Product Name (2 lines)    │   │
│  │       Variant: Red, L           │   │
│  │       ₹1,299                    │   │
│  │  [−] [  2  ] [+]   [🗑]        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  SELLER GROUP 2...                      │
├─────────────────────────────────────────┤
│  COUPONS                                │
│  [🏷 Apply Coupon Code         →]       │
├─────────────────────────────────────────┤
│  ORDER SUMMARY CARD (glass)             │
│  Subtotal              ₹3,847           │
│  Delivery              FREE             │
│  Discount (SAVE20)     −₹769           │
│  ─────────────────────────────          │
│  Total                 ₹3,078           │
├─────────────────────────────────────────┤
│  [    Proceed to Checkout (3 items)   ] │
└─────────────────────────────────────────┘
```

### 9.2 Cart Item Gestures

```
Swipe left on item card:
  → Reveals: [❤️ Save for Later] [🗑 Remove]
  → Red delete zone at full swipe

Swipe right on item card:
  → Reveals: [📋 Move to Wishlist]

Quantity long-press:
  → Number picker wheel (iOS-style picker)
```

### 9.3 Checkout Slide-Up Flow

```
Step 1: Delivery Address
  - Slide-up sheet (85vh)
  - Saved addresses as cards
  - "Add New Address" expandable form
  - Map pin location picker
  - CTA: "Deliver Here →"

Step 2: Payment
  - Continue in same sheet (slide left)
  - Saved cards (masked number)
  - UPI options (PhonePe, GPay, Paytm icons)
  - Wallet balance toggle
  - COD option
  - CTA: "Review Order →"

Step 3: Order Review (mini)
  - Summary of address + payment + items
  - Final total
  - CTA: "Place Order →"

Confirmation:
  - Full-screen celebration animation (Lottie)
  - Order ID card (glassmorphism)
  - "Track Order" CTA
  - "Continue Shopping" secondary
```

### 9.4 Express Checkout (Buy Now)

```
Trigger: "Buy Now" on product page
Flow: Single bottom sheet
  - Address (default/quick select)
  - Payment (last used auto-selected)
  - Place Order button
  - Total: 2 taps from product to ordered
```

---

## 10. User Profile & Dashboard

### 10.1 Profile Header

```
┌─────────────────────────────────────────┐
│  ┌────────────────────────────────────┐ │
│  │  GRADIENT HEADER BACKGROUND        │ │
│  │                                    │ │
│  │     [Avatar 80px]                  │ │
│  │     Rahul Sharma                   │ │
│  │     rahul@email.com                │ │
│  │     📍 Chandigarh · Member since   │ │
│  │         2022                       │ │
│  │                                    │ │
│  │  [Edit Profile]    [Settings ⚙]   │ │
│  └────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│  STATS ROW (glassmorphism cards)        │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌────┐ │
│  │  12  │  │  5   │  │  340 │  │ 4  │ │
│  │Orders│  │Saves │  │Points│  │Rev │ │
│  └──────┘  └──────┘  └──────┘  └────┘ │
├─────────────────────────────────────────┤
│  WALLET CARD (gradient glass)           │
│  ┌────────────────────────────────────┐ │
│  │  💰 CU Wallet                      │ │
│  │  ₹2,450.00          [Add Money +]  │ │
│  │                                    │ │
│  │  ⭐ 340 Reward Points              │ │
│  │  = ₹34 worth  [Redeem →]          │ │
│  └────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│  MENU ITEMS (list, iOS-style)           │
│  📦 My Orders                    →      │
│  ❤️ Wishlist (14)                →      │
│  📍 Saved Addresses              →      │
│  💳 Payment Methods              →      │
│  🔔 Notifications                →      │
│  🌟 Loyalty & Rewards            →      │
│  🆘 Help & Support               →      │
│  ⚙️ Settings                     →      │
│  🚪 Sign Out                            │
└─────────────────────────────────────────┘
```

---

## 11. Search Experience

### 11.1 Search Overlay (Full Screen)

```
Trigger: Tap any search bar
Animation: Search bar expands to full screen (300ms spring)

Layout:
  ┌─────────────────────────────────────┐
  │ ← [🔍 Search for anything...  ] 📷 │  ← Input with camera
  ├─────────────────────────────────────┤
  │  TRENDING SEARCHES                  │
  │  🔥 summer dresses                  │
  │  🔥 iPhone 15 case                  │
  │  🔥 running shoes under ₹2000       │
  ├─────────────────────────────────────┤
  │  YOUR RECENT SEARCHES               │
  │  🕐 blue denim jacket        ✕      │
  │  🕐 kitchen organizer set    ✕      │
  ├─────────────────────────────────────┤
  │  TOP CATEGORIES                     │
  │  [👗] [📱] [🏠] [💄] [⚽] [📚]     │
  └─────────────────────────────────────┘

While typing (live):
  - Suggestions dropdown (instant)
  - Product names, categories, sellers
  - Bold match highlighting
  - Clear button (×) in input
```

### 11.2 Voice Search

```
Trigger: Mic icon in search bar
Overlay: Full screen, dark blurred background
Center: Animated waveform visualization (SVG)
Text: "Listening..." → transcript appears live
Cancel: Tap anywhere outside waveform
```

### 11.3 Visual / Barcode Search

```
Trigger: Camera icon in search bar
Opens: Device camera with overlay UI
Modes:
  - Barcode scan (product lookup)
  - Image search (find similar products)
  - QR code (seller profile / deal link)
```

---

## 12. Categories Section

### 12.1 iOS App Icon Style Grid

```css
.category-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;       /* iOS icon squircle approx */
  background: linear-gradient(135deg, var(--cat-from), var(--cat-to));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 
    0 4px 12px rgba(0,0,0,0.15),
    0 1px 3px rgba(0,0,0,0.10);
}

.category-label {
  font-size: 11px;
  text-align: center;
  margin-top: 6px;
  color: var(--cu-text-secondary);
  max-width: 64px;
}
```

### 12.2 Category Color Map

```
Fashion:      #667eea → #764ba2  (Purple)
Electronics:  #2196F3 → #21CBF3  (Blue)
Home & Living:#43e97b → #38f9d7  (Green)
Beauty:       #f953c6 → #b91d73  (Pink)
Sports:       #fa709a → #fee140  (Orange-Pink)
Books:        #a1c4fd → #c2e9fb  (Soft Blue)
Food:         #ff9a9e → #fad0c4  (Salmon)
Toys:         #84fab0 → #8fd3f4  (Mint)
Automotive:   #30cfd0 → #330867  (Teal-Dark)
Health:       #a18cd1 → #fbc2eb  (Lavender)
Jewelry:      #ffd89b → #19547b  (Gold-Blue)
Travel:       #4facfe → #00f2fe  (Sky Blue)
```

### 12.3 Category Tap Behavior

```
On tap:
  1. Icon scales: 1 → 0.88 → 1.0 (spring, 250ms)
  2. Gradient ripple expands from tap point
  3. Page slides left to Category Detail
  4. Category color bleeds into detail page header
```

---

## 13. Animation & Motion System

### 13.1 Spring Physics Configuration

```javascript
// Primary spring (UI interactions)
const springConfig = {
  stiffness: 300,
  damping: 20,
  mass: 1
};

// Gentle spring (page transitions)
const gentleSpring = {
  stiffness: 180,
  damping: 24,
  mass: 1
};

// Bouncy spring (celebratory moments)
const bouncySpring = {
  stiffness: 400,
  damping: 12,
  mass: 0.8
};

// Snappy spring (quick feedback)
const snappySpring = {
  stiffness: 500,
  damping: 30,
  mass: 0.8
};
```

### 13.2 Standard Easing Curves

```css
--ease-spring:      cubic-bezier(0.34, 1.56, 0.64, 1);   /* Overshoot */
--ease-out-quart:   cubic-bezier(0.25, 1, 0.5, 1);        /* Fast-in, slow-out */
--ease-in-out:      cubic-bezier(0.4, 0, 0.2, 1);          /* Material */
--ease-out-expo:    cubic-bezier(0.19, 1, 0.22, 1);        /* Dramatic decel */
--ease-snappy:      cubic-bezier(0.2, 0, 0, 1);            /* Sharp, precise */
```

### 13.3 Screen Transition Types

| Transition | Used For | Animation |
|---|---|---|
| Push | Drill-down navigation | Slide left (new) / Stay (old) |
| Modal | Sheets, pickers | Slide up from bottom |
| Fade | Tab switch | Cross-fade |
| Scale | Alerts, dialogs | Scale up from 0.9 + fade |
| Flip | Card details | 3D flip (perspective 1000px) |
| Curl | iOS-style page peel | CSS 3D transform |

### 13.4 Scroll-Triggered Animations

```
Product cards entering viewport:
  - Initial: opacity 0, translateY(20px)
  - Final: opacity 1, translateY(0)
  - Stagger: 50ms per card
  - Threshold: 10% visibility

Section headers:
  - Initial: opacity 0, translateX(-16px)
  - Final: opacity 1, translateX(0)
  - Duration: 400ms ease-out

Hero banner:
  - Parallax scroll: translate(0, scrollY * 0.3)
```

### 13.5 Loading States

**Skeleton Screens (not spinners):**
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--cu-bg-secondary) 25%,
    var(--cu-bg-tertiary) 50%,
    var(--cu-bg-secondary) 75%
  );
  background-size: 400% 100%;
  animation: shimmer 1.8s infinite ease-in-out;
  border-radius: var(--radius-md);
}

@keyframes shimmer {
  0%   { background-position: 100% 50%; }
  100% { background-position: -100% 50%; }
}
```

---

## 14. Glassmorphism & Visual Effects

### 14.1 Glass Panel Recipe

```css
/* Standard glass card */
.glass-card {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.85),
    inset 0 -1px 0 rgba(255, 255, 255, 0.20);
  border-radius: var(--radius-xl);
}

/* Dark glass (for dark backgrounds) */
.glass-dark {
  background: rgba(0, 0, 0, 0.40);
  backdrop-filter: blur(24px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.30);
}

/* Tinted glass (branded) */
.glass-tinted {
  background: rgba(255, 59, 107, 0.12);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 59, 107, 0.20);
}
```

### 14.2 Dynamic Island Inspired Interaction

```
Used for: Order status updates, flash deal alerts, live price drops

Behavior:
  1. Compact pill at top (36px × 120px) — notification summary
  2. User tap → expands to rounded card (180px × 280px)
  3. Shows: product image, update text, CTA button
  4. Auto-dismisses after 5s with slide-up animation

CSS:
  position: fixed;
  top: env(safe-area-inset-top, 12px);
  left: 50%;
  transform: translateX(-50%);
  transition: all 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
  border-radius: 20px → 36px (on expand)
  overflow: hidden;
```

### 14.3 Background Effects

**Mesh Gradient (Home header):**
```css
.hero-mesh {
  background:
    radial-gradient(at 20% 20%, rgba(255,59,107,0.15) 0%, transparent 50%),
    radial-gradient(at 80% 10%, rgba(124,58,237,0.10) 0%, transparent 50%),
    radial-gradient(at 50% 80%, rgba(255,149,0,0.08) 0%, transparent 50%),
    #FFFFFF;
}
```

**Noise Texture Overlay:**
```css
.texture-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* SVG noise */
  opacity: 0.03;
  pointer-events: none;
}
```

---

## 15. Component Library

### 15.1 Buttons

```
Primary CTA:
  Height: 52px
  Radius: 14px (or full for pill)
  Background: linear-gradient(135deg, #FF3B6B, #FF6B95)
  Shadow: 0 4px 16px rgba(255,59,107,0.35)
  Text: 16px, 600 weight, white
  Active: scale(0.97) + shadow reduce

Secondary:
  Background: transparent
  Border: 1.5px solid --cu-border
  Text: --cu-text-primary

Ghost / Link:
  No border, no background
  Text: --cu-primary color

Icon Button:
  Size: 40px × 40px
  Radius: full
  Background: --cu-bg-secondary
```

### 15.2 Form Inputs

```css
.mobile-input {
  height: 52px;
  border-radius: 12px;
  background: var(--cu-bg-secondary);
  border: 1.5px solid transparent;
  padding: 0 16px;
  font-size: 16px;  /* Prevents iOS zoom on focus */
  
  transition: border-color 200ms, background 200ms, box-shadow 200ms;
}

.mobile-input:focus {
  background: var(--cu-bg-primary);
  border-color: var(--cu-primary);
  box-shadow: 0 0 0 4px rgba(255,59,107,0.12);
  outline: none;
}
```

### 15.3 Modal / Bottom Sheet

```
Trigger: Slide up from bottom
Backdrop: rgba(0,0,0,0.5) + blur(4px)
Sheet:
  background: --cu-bg-primary
  border-radius: 24px 24px 0 0
  max-height: 90vh
  overflow: auto with momentum scrolling (-webkit-overflow-scrolling: touch)
  Handle: 4px × 36px pill at top
  padding-bottom: env(safe-area-inset-bottom)

Dismiss:
  - Drag down handle
  - Tap backdrop
  - Velocity threshold: > 500px/s triggers dismiss
  - Position threshold: > 60% of height triggers dismiss
```

### 15.4 Toast Notifications

```
Position: Top (below Dynamic Island area)
Duration: 3000ms
Slide direction: Down + fade in
Exit: Slide up + fade out

Variants:
  Success: Green left border + ✓ icon
  Error:   Red left border + ✗ icon
  Info:    Blue left border + ℹ icon
  Warning: Orange left border + ⚠ icon

Style: Glassmorphism card, shadow-lg
```

---

## 16. Micro-Interaction Catalog

| Trigger | Animation | Duration | Feel |
|---|---|---|---|
| Button tap | Scale 0.95 → release spring | 300ms | Tactile press |
| Icon tap | Scale 0.85 → 1.1 → 1.0 | 350ms | Bouncy |
| Wishlist add | Heart fill + scale burst | 400ms | Delightful |
| Add to cart | Product flies to cart | 500ms | Rewarding |
| Pull-to-refresh | Spinner + spring snap | 600ms | Natural |
| Swipe delete | Red zone reveal | Continuous | Satisfying |
| Star rating tap | Stars fill one by one | 300ms stagger | Fun |
| Image zoom | Smooth spring zoom | 400ms | Premium |
| Coupon apply | Confetti burst | 500ms | Celebratory |
| Order placed | Lottie celebration | 2000ms | Memorable |
| Flash deal timer | Digit flip animation | Per second | Urgency |
| Notification badge | Bounce + scale | 400ms | Attention |
| Loading skeleton | Shimmer wave | 1800ms loop | Patient |
| Tab switch | Glow pulse on icon | 300ms | App-native |
| Scroll header | Compact + blur increase | Continuous | Polished |

---

## 17. Dark Mode System

### 17.1 Auto Dark Mode

```javascript
// Respect system preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
document.documentElement.dataset.theme = prefersDark.matches ? 'dark' : 'light';

// Listen for changes
prefersDark.addEventListener('change', e => {
  document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
});
```

### 17.2 Dark Mode Adjustments

- Images: slight brightness reduction (95%) + contrast boost (105%)
- Shadows: reduced opacity (dark surfaces need less shadow)
- Glass: darker base with more blur compensation
- Borders: white at low opacity instead of gray
- Status bar: light content mode

### 17.3 Per-Component Dark Rules

```css
[data-theme="dark"] .product-card {
  background: var(--cu-bg-secondary);
  box-shadow: 0 4px 12px rgba(0,0,0,0.40);
}

[data-theme="dark"] .bottom-nav {
  background: rgba(20,20,22,0.85);
  border-color: rgba(255,255,255,0.08);
}

[data-theme="dark"] .glass-card {
  background: rgba(30,30,32,0.80);
  border-color: rgba(255,255,255,0.10);
}
```

---

## 18. Accessibility Guidelines

### 18.1 Touch Target Sizes
```
Minimum tap target: 44px × 44px (Apple HIG standard)
Recommended: 48px × 48px
Small icons must have invisible padding extending tap area
```

### 18.2 Text Contrast
```
Body text on white: minimum 4.5:1 (WCAG AA)
Large text (18px+): minimum 3:1
CTA buttons: minimum 3:1
```

### 18.3 Motion Sensitivity
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 18.4 Screen Reader Support
```
- aria-label on all icon-only buttons
- aria-live for dynamic cart count updates
- role="dialog" on all sheets/modals
- focus trap in open modals
- Skip navigation link at top of DOM
```

---

## 19. Performance Standards

### 19.1 Core Web Vitals Targets

| Metric | Target | Max Acceptable |
|---|---|---|
| LCP (Largest Contentful Paint) | < 1.5s | 2.5s |
| FID / INP | < 50ms | 200ms |
| CLS (Cumulative Layout Shift) | < 0.05 | 0.1 |
| TTFB | < 400ms | 800ms |
| FCP | < 1.0s | 1.8s |

### 19.2 Image Optimization

```
- WebP format with AVIF fallback
- Responsive srcset for all product images
- Lazy loading: loading="lazy" + Intersection Observer
- Placeholder: dominant color extraction
- Compression: 80% quality WebP
- CDN delivery with edge caching
- Thumbnail: 200×200, Product: 800×800, Hero: 1200×630
```

### 19.3 CSS Performance

```
- CSS containment: contain: content on cards
- will-change: transform on animated elements (use sparingly)
- GPU-composited animations only: transform + opacity
- Avoid animating: width, height, top, left (causes reflow)
- Use translate3d() to force GPU layer
```

### 19.4 JavaScript Optimization

```
- Code splitting per route (dynamic imports)
- Critical JS inline, non-critical deferred
- React: virtual list for long product feeds (react-window)
- Image carousel: IntersectionObserver-based lazy render
- Debounce search input: 300ms
- Throttle scroll handlers: requestAnimationFrame
```

---

## 20. PWA Configuration

### 20.1 Manifest

```json
{
  "name": "CU Bazaar",
  "short_name": "CU Bazaar",
  "description": "Premium mobile shopping marketplace",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFFFFF",
  "theme_color": "#FF3B6B",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/72.png",   "sizes": "72x72",   "type": "image/png" },
    { "src": "/icons/192.png",  "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/512.png",  "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "screenshots": [
    { "src": "/screenshots/home.webp",    "sizes": "390x844", "type": "image/webp", "form_factor": "narrow" },
    { "src": "/screenshots/product.webp", "sizes": "390x844", "type": "image/webp", "form_factor": "narrow" }
  ],
  "categories": ["shopping"],
  "prefer_related_applications": false
}
```

### 20.2 Service Worker Strategy

```
App Shell: Cache-first (HTML, CSS, JS, fonts)
API data: Network-first with stale-while-revalidate
Product images: Cache-first, 30-day TTL
Search results: Network-only
Cart/Order data: Network-only (no cache — accuracy critical)
```

### 20.3 Offline Experience

```
Offline page:
  - Show cached recently viewed products
  - Show saved wishlist from local storage
  - Clear "No Internet" notice with offline icon
  - "Retry" button with auto-check on reconnect
  - Toast on reconnect: "You're back online ✓"
```

---

## 21. Technical Stack Recommendations

### 21.1 Frontend Framework Options

| Option | Pros | Cons | Rating |
|---|---|---|---|
| **Next.js + React** | SSR/ISR, large ecosystem, Vercel deploy | Bundle size | ⭐⭐⭐⭐⭐ |
| React + Vite | Fast HMR, minimal setup | Manual SSR | ⭐⭐⭐⭐ |
| Vue 3 + Nuxt | Good DX, smaller bundle | Smaller ecosystem | ⭐⭐⭐⭐ |
| SvelteKit | Tiny runtime, fast | Less mature | ⭐⭐⭐ |

**Recommendation: Next.js 14+ with App Router**

### 21.2 Animation Libraries

```
Primary:   Framer Motion (React spring physics, gestures)
Secondary: GSAP (complex sequences, ScrollTrigger)
Lottie:    lottie-react (celebration animations)
CSS:       Native for simple transitions
```

### 21.3 State Management

```
UI State:     Zustand (lightweight, no boilerplate)
Server State: TanStack Query (caching, refetching, pagination)
Cart:         Zustand + localStorage persist
Auth:         NextAuth.js
```

### 21.4 Key Libraries

```json
{
  "framer-motion":     "^11.x",   // Animations
  "zustand":           "^4.x",    // State
  "@tanstack/react-query": "^5.x", // Data fetching
  "react-hot-toast":   "^2.x",    // Toast notifications
  "lottie-react":      "^2.x",    // Celebration animations
  "react-window":      "^1.x",    // Virtualized lists
  "swiper":            "^11.x",   // Carousels
  "use-gesture":       "^10.x",   // Touch gestures
  "sharp":             "^0.x",    // Image optimization (server)
  "workbox-webpack-plugin": "^7.x" // PWA / Service Worker
}
```

---

## 22. Responsive Breakpoints & Device Targets

### 22.1 Breakpoint System

```css
/* Mobile First */
/* xs:  0px+    — base mobile (iPhone SE) */
/* sm:  375px+  — standard iPhone */
/* md:  430px+  — iPhone Pro Max / large Android */
/* lg:  768px+  — iPad / tablet */
/* xl:  1024px+ — desktop (full redesign) */

@media (min-width: 375px) { /* Standard mobile */ }
@media (min-width: 430px) { /* Large phone */ }
@media (min-width: 768px) { /* Tablet — hybrid layout */ }
@media (min-width: 1024px){ /* Desktop — full desktop UI */ }
```

### 22.2 Primary Device Targets

| Device | Width | Notes |
|---|---|---|
| iPhone SE (3rd gen) | 375px | Minimum supported |
| iPhone 15 / 15 Pro | 393px | Primary design target |
| iPhone 15 Plus / Pro Max | 430px | Large phone |
| Samsung Galaxy S24 | 360px | Android primary |
| Pixel 8 | 412px | Android secondary |
| iPad Mini | 744px | Tablet (adapted layout) |

### 22.3 Safe Area Handling

```css
/* Account for notch, Dynamic Island, home indicator */
.screen-container {
  padding-top: env(safe-area-inset-top);
  padding-bottom: calc(env(safe-area-inset-bottom) + 88px); /* + nav height */
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

---

## 23. Gesture System

### 23.1 Supported Gestures

| Gesture | Element | Action |
|---|---|---|
| Swipe left | Cart item | Reveal delete/save |
| Swipe right | Cart item | Move to wishlist |
| Swipe left | Notification | Dismiss |
| Pull down | Any scrollable | Refresh |
| Swipe left/right | Product images | Gallery navigate |
| Pinch | Product image | Zoom |
| Double-tap | Product image | 2× zoom toggle |
| Long-press | Product card | Quick preview modal |
| Swipe down | Bottom sheet | Dismiss |
| Swipe left/right | Onboarding | Next/prev slide |
| Swipe up | Product card (stories) | View detail |
| Tap + hold | Add button | Quick size picker |

### 23.2 Gesture Implementation

```javascript
// Using @use-gesture/react
import { useSwipeable } from 'react-swipeable';
import { useDrag, usePinch } from '@use-gesture/react';

// Pull-to-refresh
const [pulling, setPulling] = useState(false);
const bind = useDrag(({ offset: [, y], last }) => {
  if (y > 80 && !pulling) {
    setPulling(true);
    triggerRefresh();
  }
  if (last) setPulling(false);
}, { axis: 'y', from: [0, 0] });
```

---

## 24. Design Tokens Reference

### 24.1 Complete Token Table

```css
:root {
  /* Colors */
  --color-brand:         #FF3B6B;
  --color-brand-dark:    #CC2253;
  --color-brand-light:   #FF6B95;
  --color-brand-subtle:  rgba(255,59,107,0.10);
  --color-success:       #34C759;
  --color-warning:       #FF9500;
  --color-error:         #FF3B30;
  --color-info:          #007AFF;

  /* Spacing */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* Duration */
  --duration-instant: 100ms;
  --duration-fast:    200ms;
  --duration-normal:  300ms;
  --duration-slow:    500ms;
  --duration-slower:  700ms;

  /* Z-index layers */
  --z-base:      0;
  --z-raised:    10;
  --z-dropdown:  100;
  --z-sticky:    200;
  --z-overlay:   300;
  --z-modal:     400;
  --z-toast:     500;
  --z-nav:       600;
  --z-dynamic:   700;  /* Dynamic Island inspired */
}
```

---

## Appendix A — Page-Specific Checklist

### ✅ Home Screen
- [ ] Greeting header with avatar
- [ ] Sticky glassmorphism search bar
- [ ] Quick access 4×2 icon grid
- [ ] Auto-playing banner carousel (3-5 slides)
- [ ] Category horizontal scroll (iOS icons)
- [ ] Trending products swipeable row
- [ ] Flash deals with countdown timer
- [ ] Featured sellers stories row
- [ ] Wallet/rewards glass card
- [ ] Personalized "For You" feed
- [ ] Floating bottom navigation

### ✅ Product Card
- [ ] Rounded corners (16px)
- [ ] Wishlist heart (glassmorphism bg)
- [ ] Discount badge (if applicable)
- [ ] Rating stars
- [ ] Strikethrough MRP
- [ ] Add to cart floating button
- [ ] Tap animation (spring scale)

### ✅ Navigation
- [ ] Floating pill dock
- [ ] 5 tabs: Home, Search, Categories, Cart, Profile
- [ ] Active glow + label
- [ ] Cart badge counter
- [ ] Safe area padding

---

## Appendix B — Naming Conventions

```
Components:  PascalCase          (ProductCard, BottomNav)
CSS classes: kebab-case          (product-card, bottom-nav)
CSS vars:    --cu-[scope]-[property]  (--cu-primary, --cu-surface)
Files:       kebab-case          (product-card.tsx)
Animations:  camelCase           (springFadeIn, slideUpSheet)
Z-index:     --z-[layer]         (--z-modal, --z-nav)
```

---

*Document maintained by: CU Bazaar Design System Team*  
*Last updated: 2025 · Version 1.0*  
*Next review: Quarterly*
