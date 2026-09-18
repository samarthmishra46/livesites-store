# Claude Code Prompt — PHASE 1: Pixel-Accurate UI

You are working in a Next.js + TypeScript + Tailwind project.

Read `CLAUDE.md` first.

## Goal

Recreate the supplied fashion ecommerce reference as a polished responsive website.

The reference image is:

`assets/reference-full.jpg`

Use these extracted references when useful:

- `assets/hero-reference.jpg`
- `assets/avatar-reference.jpg`
- `assets/linen-blazer-reference.jpg`
- `assets/silk-slip-dress-reference.jpg`
- `assets/recommendation-avatar-reference.jpg`
- `assets/recommendation-bag-reference.jpg`
- `assets/mobile-header-reference.jpg`
- `assets/mobile-bottom-nav-reference.jpg`
- `assets/content-reference.jpg`

The screenshot is 900×1600 and should be treated as the primary visual reference.

## Product concept

Brand: `Livesites`

Fashion collection/label shown in the reference: `AURORA`

Hero copy:
- AURORA
- Timeless Style for Brighter Days
- Elevated essentials for a more confident you.
- Shop the Collection →

Benefits:
- Free shipping on orders over $100
- Sustainably made for a brighter tomorrow
- Easy returns within 30 days

Featured section:
- Featured for You
- View All →

Products visible in the reference:
- Linen Blazer — $129
- Silk Slip Dress — $149

Recommendation:
- Recommended for you
- Pairs perfectly with our linen blazer
- A versatile look for work or weekends.

## Build these routes

1. `/` — Home
2. `/shop` — Shop
3. `/shop/linen-blazer` — Product detail
4. `/shop/silk-slip-dress` — Product detail
5. `/wishlist` — Wishlist
6. `/account` — Account
7. `/about` — About Us
8. `/pricing` — Pricing
9. `/terms` — Terms & Conditions
10. `/privacy` — Privacy
11. `/shipping-returns` — Shipping & Returns
12. `/contact` — Contact

Also make cart UI available from the header/avatar recommendation flow, even if it is initially mock/local state.

## HOME PAGE — match the screenshot

### Mobile

Top:
- browser-like screenshot is only a reference; DO NOT recreate the browser chrome.
- app/site header begins at the Livesites logo.
- Livesites wordmark at left.
- search icon
- bag/cart icon with badge `2`
- hamburger icon

Hero:
- large cream/neutral fashion image
- editorial text on the left
- large serif heading split into 3 lines:
  `Timeless`
  `Style for`
  `Brighter Days`
- small AURORA label
- thin horizontal rule
- supporting copy
- black rounded CTA
- floating AI assistant card overlapping the hero on the right

AI assistant:
- portrait/video frame
- `Live` pill with green dot
- close icon
- translucent/soft card
- speech bubble:
  `How can I help you today?`
- bottom circular controls:
  microphone
  video/camera
  screen/chat-style control
- it must be movable
- include subtle shadow and backdrop blur

Benefits row:
Three equal columns separated by thin vertical rules.

Featured products:
Two-column mobile product grid.
Each card:
- rounded image
- heart icon in upper-right
- product name
- price
- small color swatches

Recommendation card:
- horizontal rounded card
- small female avatar
- eyebrow `Recommended for you`
- title `Pairs perfectly with our linen blazer`
- subtitle
- small product/bag image on right
- chevron

Bottom navigation:
Fixed to bottom.
Exactly four items:
- Home
- Shop
- Wishlist
- Account

Use icons similar to the reference.
Active Home should be visually stronger/darker.
Respect mobile safe-area inset.

### Desktop

Do not simply stretch the mobile screenshot.

Create a premium desktop version using the same design language:
- centered max-width content
- generous margins
- horizontal desktop header
- larger hero composition
- editorial copy and image composition
- floating assistant remains attached to the content/hero area and can be dragged
- featured products use 3–4 columns where appropriate
- recommendation card remains below featured content
- mobile bottom nav is replaced by desktop navigation/header controls
- preserve the same typography, spacing rhythm, colors and imagery

The desktop design should feel like the same site at a larger breakpoint.

## Components to build

Create reusable components such as:

- `SiteHeader`
- `MobileBottomNav`
- `DesktopNav`
- `HeroSection`
- `BenefitsStrip`
- `FeaturedProducts`
- `ProductCard`
- `ColorSwatches`
- `RecommendationCard`
- `AIAssistant`
- `AIAssistantControls`
- `PageContainer`
- `SectionHeading`
- `Footer`
- `ProductGallery`
- `ProductInfo`
- `WishlistButton`
- `CartDrawer`

## State

Phase 1 can use local React state/localStorage:
- wishlist
- cart
- assistant open/minimized
- assistant microphone on/off
- assistant camera on/off
- assistant position
- selected product/color

No backend is required.

## Visual implementation rules

Use the reference image as the source of truth.

Approximate visual tokens, then tune against the screenshot:
- page background: warm ivory
- card/image background: slightly darker warm neutral
- primary text: near-black
- secondary text: warm gray
- border: light warm gray
- CTA: near-black
- CTA text: white
- accent status: green for Live

Use a serif display font for the hero heading and a clean sans-serif for body/UI. If network font loading is not desired, use a high-quality system fallback.

Avoid excessive rounded cards. The screenshot uses rounded image containers and a few rounded floating UI elements, while the overall page remains editorial and clean.

## Interaction polish

Add subtle:
- hover states
- focus states
- active states
- card lift/scale only where appropriate
- image hover zoom on desktop
- smooth scrolling
- drawer animation
- assistant open/minimize animation
- assistant drag interaction

Do not over-animate.

## Acceptance criteria

The result should be recognizable from the screenshot immediately.

A reviewer comparing the app to the reference should see:
- same overall hierarchy
- same header
- same hero composition
- same product card structure
- same benefits strip
- same recommendation card
- same mobile bottom navigation
- same floating AI assistant concept
- same warm luxury-fashion visual language

Run:
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

Fix all errors before finishing.

Do not implement Phase 2 yet.
