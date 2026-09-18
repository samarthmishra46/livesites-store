# Claude Code Prompt — PHASE 2: Connect the AI Shopping Assistant

Read `CLAUDE.md` and the completed Phase 1 implementation first.

Do not redesign the UI. Phase 2 is about functionality and integration.

## Goal

Turn the floating AI assistant into an interactive shopping agent that can understand a user's fashion request and control the website.

The assistant should be capable of:
- asking the shopper questions
- recommending products
- explaining product differences
- navigating pages
- opening products
- scrolling the page
- filtering products
- searching products
- adding/removing wishlist items
- adding products to cart
- opening cart
- taking the shopper to checkout
- directing the shopper to About, Terms, Shipping/Returns, Account, etc.
- maintaining conversational context during the session

## Critical architecture

Do NOT allow the LLM to directly manipulate arbitrary DOM selectors.

Use a safe structured action layer:

```ts
type AssistantAction =
  | { type: "scroll"; direction: "up" | "down"; amount?: number }
  | { type: "navigate"; href: string }
  | { type: "open_product"; productSlug: string }
  | { type: "add_to_wishlist"; productId: string }
  | { type: "remove_from_wishlist"; productId: string }
  | { type: "add_to_cart"; productId: string; quantity?: number }
  | { type: "remove_from_cart"; productId: string }
  | { type: "filter_products"; category?: string; color?: string; size?: string; maxPrice?: number }
  | { type: "search"; query: string }
  | { type: "open_shop" }
  | { type: "open_wishlist" }
  | { type: "open_account" }
  | { type: "open_cart" };
```

Create a central dispatcher:

`lib/assistant/dispatchAssistantAction.ts`

Only allow actions in this whitelist.

## Shopping conversation

The assistant should start naturally, for example:

"Hi! I'm your personal shopping assistant. Are you looking for something for work, a date, everyday wear, or a special occasion?"

Then collect useful preferences:
- occasion
- category
- size
- preferred colors
- fit
- budget
- style
- material
- availability

Do not interrogate the user with a long form. Ask one or two useful questions at a time.

Then recommend products from the actual product dataset.

## Product grounding

The assistant must never invent:
- product names
- prices
- sizes
- colors
- availability
- materials
- discounts

Give the model structured product data or retrieval results.

Create a clean product context format.

## Avatar integration

Keep the avatar provider behind an adapter.

Example:

```ts
interface AvatarProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  startSession(): Promise<void>;
  endSession(): Promise<void>;
  sendUserMessage(message: string): Promise<void>;
  onTranscript(cb: (text: string) => void): () => void;
  onAssistantMessage(cb: (text: string) => void): () => void;
  onAction(cb: (action: AssistantAction) => void): () => void;
}
```

Create:

`lib/avatar/AvatarProvider.ts`

Then create one provider implementation at a time.

The UI should not care whether the provider is:
- a realtime voice/avatar API
- WebRTC
- a hosted avatar service
- a custom video/voice pipeline

Keep provider-specific code out of ecommerce components.

## User controls

The floating assistant must support:
- mute microphone
- camera/video toggle if supported by provider
- close
- minimize
- reconnect
- transcript toggle
- assistant volume control if supported
- drag/reposition

The UI must clearly show connection/session state:
- connecting
- live
- muted
- disconnected
- error

## Navigation and page control

When the assistant says it will show a product:
1. dispatch `open_product`
2. navigate to the product page
3. optionally scroll to the relevant section

When it says it will show more options:
1. navigate to `/shop`
2. apply structured filters
3. scroll to the results

When it recommends a product, show the same product card/detail UI used by human users.

## Persistence

Use localStorage initially for:
- cart
- wishlist
- assistant preferences
- recent conversation summary if useful

Keep persistence behind small helper functions so it can later be replaced with a backend.

## Security

Never expose private API keys in browser code.

If the chosen avatar/LLM provider requires a secret:
- create a Next.js Route Handler/server-side endpoint
- keep the secret server-side
- issue short-lived client tokens where supported
- validate all tool/action inputs

## Phase 2 acceptance criteria

A user can:
1. open the assistant
2. speak/type a request
3. receive a response
4. see the assistant recommend real products
5. ask for another option
6. have the assistant navigate to a product
7. have the assistant scroll/filter the shop
8. add an item to wishlist
9. add an item to cart
10. open cart
11. continue browsing while the assistant remains available
12. minimize/reopen the assistant
13. mute/unmute the microphone
14. close the assistant

Do not change the visual identity from Phase 1.
