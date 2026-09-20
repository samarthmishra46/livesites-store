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
- `lib/ai-assistant/`: provider interface (`types.ts`), the mock provider and the ElevenLabs voice provider; `useAssistant.ts` picks one
- `lib/agent/`: what the agent knows and can do — site map, tools, system prompt, page context, section spotlight
- `scripts/`: Python scripts that derive `public/images/` from `assets/reference-full.jpg`
  (`pip install numpy opencv-python-headless`, then run `clean-reference-images.py` followed by `recolor-variants.py`),
  plus `sync-agent.ts` and `check-agent.ts` for the live agent

The imagery is cropped from the low-resolution reference screenshot, so replace it with licensed high-resolution photography before launch.

## Live agent (Phase 2A: voice)

The floating card is a voice agent: **ElevenLabs Agents** listens, handles turn-taking and interruptions, and speaks;
each reply is written by **OpenAI** through our own endpoint. The agent moves the site with client tools that run
through the same action dispatcher as the UI.

```
Browser card ──WebRTC voice──► ElevenLabs agent ──each turn──► /api/agent/llm ──► OpenAI (+ Livesites system prompt)
     ▲   tool calls (highlight_section, open_product, add_to_cart…) ◄──┘
     └── runAgentTool → useActionDispatcher
/api/agent/session → short-lived conversation token (keys stay on the server)
```

### Set up

1. `cp .env.example .env.local` and fill in `OPENAI_API_KEY`, `ELEVENLABS_API_KEY` and a random `AGENT_LLM_SECRET`
   (`openssl rand -hex 32`).
2. ElevenLabs calls our LLM endpoint from its cloud, so it needs a public https URL. In development, run a tunnel,
   e.g. `cloudflared tunnel --url http://localhost:3000`, and put that URL in `AGENT_PUBLIC_URL`
   (in production, use the deployed site's URL).
3. `npm run agent:sync` — creates the LLM secret, the tools and the agent in ElevenLabs and prints
   `ELEVENLABS_LLM_SECRET_ID` and `ELEVENLABS_AGENT_ID`. Add both to `.env.local`, then run it again whenever you
   change tools, the greeting or the tunnel URL.
4. `npm run dev`. The first click or key press anywhere starts the conversation (browsers only allow audio after
   a user gesture); if the microphone is blocked, the agent continues as a typed chat.

Set `NEXT_PUBLIC_ASSISTANT_PROVIDER=mock` to run the site without any keys.

### How the agent knows the site

- Every region is tagged `data-agent-section="<id>"` (policy pages use their heading ids). `lib/agent/siteMap.ts`
  lists them with what each contains; structured copy comes from `data/`, so it can't drift from the pages.
  When you add or change a section, update the site map and run `npm run agent:check`.
- `lib/agent/knowledge.ts` builds the system prompt (persona, rules, catalogue, site map). It's static, so OpenAI
  caches it; live state — current page, section on screen, bag, wishlist — is sent as silent contextual updates.
- `lib/agent/tools.ts` defines every tool once: the schema ElevenLabs sees and strict validation against real
  sections, products, sizes and colours.

### Latency

UI actions run locally and are instant. A spoken reply is network + end-of-turn detection + OpenAI's first token
+ ElevenLabs' first audio, typically about 0.8–1.2 s. `NEXT_PUBLIC_AGENT_DEBUG=1` shows the measured
delay on the card, and the server logs OpenAI time-to-first-token per turn (`[agent-llm] … ttft=…`).
To go faster: host the app near ElevenLabs' region (US), keep `OPENAI_MODEL` a fast non-reasoning model, and keep
replies short.

### Try tools without voice (development)

In the browser console: `livesitesAgent.run("highlight_section", { section_id: "shipping.returns" })`, or
`livesitesAgent.context()` to see what the agent is told about the page.

### Next: live avatar (Phase 2B)

HeyGen LiveAvatar (stock avatar) via its ElevenLabs connector. It becomes one more provider,
`lib/ai-assistant/liveAvatarProvider.ts`, reusing the same agent, tools and UI; ElevenLabs' own Avatars only make
pre-rendered videos, so they can't be used live.
# livesites-store
