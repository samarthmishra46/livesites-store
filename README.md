# Livesites AI UI Kit

This package contains the implementation instructions and visual references for the Livesites AI fashion storefront.

## Files

- `CLAUDE.md` — persistent project instructions for Claude Code.
- `PHASE_1_PROMPT.md` — build the complete UI and mock interactions.
- `PHASE_2_PROMPT.md` — connect the AI shopping assistant and structured website actions.
- `assets/reference-full.jpg` — supplied 900×1600 reference screenshot.
- `assets/*-reference.jpg` — crops extracted from the supplied screenshot for easier implementation.

## How to use with Claude Code

1. Create a new Next.js project or open your existing Next.js project.
2. Copy `CLAUDE.md` into the project root.
3. Copy the `assets` directory into the project root.
4. Give Claude Code the contents of `PHASE_1_PROMPT.md`.
5. Let Claude implement and verify Phase 1.
6. Run the project and compare it against `assets/reference-full.jpg`.
7. Iterate on spacing/typography/positioning before adding AI functionality.
8. Only after the UI is approved, give Claude `PHASE_2_PROMPT.md`.

## Recommended initial setup

If starting from scratch:

```bash
npx create-next-app@latest livesites-ai --typescript --tailwind --eslint --app
cd livesites-ai
npm install lucide-react
npm run dev
```

Keep the project dependency-light until the UI is complete.

## Important

The screenshot is the supplied visual reference. The crop files are derived from that screenshot and are intended to make implementation easier. For production, replace any reference-only crops with properly licensed/generated source assets where necessary.

## Running the app (Phase 1)

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint && npx tsc --noEmit && npm run build
```

Where things live:

- `app/`: routes (home, shop, product detail, wishlist, account, about, pricing, terms, privacy, shipping-returns, contact)
- `components/`: `home/`, `product/`, `navigation/`, `layout/`, `cart/`, `ai-assistant/`, `ui/`
- `data/`: mock products and site copy
- `lib/store/`: wishlist, bag, colour selection and UI state (localStorage-backed)
- `lib/actions/`: the single action dispatcher (`useActionDispatcher`) shared by the UI and, in Phase 2, the assistant
- `lib/ai-assistant/`: provider interface (`types.ts`) and the Phase 1 mock provider; swap the provider in `useAssistant.ts`
- `scripts/`: Python scripts that derive `public/images/` from `assets/reference-full.jpg`
  (`pip install numpy opencv-python-headless`, then run `clean-reference-images.py` followed by `recolor-variants.py`)

The imagery is cropped from the low-resolution reference screenshot, so replace it with licensed high-resolution photography before launch.
# livesites-store
