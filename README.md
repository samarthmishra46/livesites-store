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
- `lib/ai-assistant/`: provider interface (`types.ts`), the mock, ElevenLabs voice and Anam avatar providers; `useAssistant.ts` picks one
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

### Live avatar (Phase 2B)

The card can show a lip-synced face instead of the portrait. **Anam** renders the video. The
browser holds the ElevenLabs conversation itself and pipes the agent's voice into Anam, which
sends back video with that audio in sync. Prompt, tools, validation and the OpenAI brain are
untouched.

```
mic ──16kHz PCM──► ElevenLabs agent ──► /api/agent/llm ──► OpenAI
                         │ voice (PCM)      │ client tool calls
                         ▼                  ▼
                   Anam (lip-sync)    runAgentTool → useActionDispatcher
                         │
                         ▼ video + audio (WebRTC)
                  <video> in the card
```

1. Create an API key at [lab.anam.ai](https://lab.anam.ai) and put it in `ANAM_API_KEY`.
2. Pick a **Cara 4** avatar from the Lab's Avatars page and put its id in `NEXT_PUBLIC_ANAM_AVATAR_ID`.
3. `npm run agent:sync` — sets the agent's audio to PCM 16 kHz both ways and enables the
   client events this path needs, `client_tool_call` above all.
4. Set `NEXT_PUBLIC_ASSISTANT_PROVIDER=anam` and restart.

`/api/agent/avatar-session` mints both halves in one round trip: an Anam audio-passthrough
token and a short-lived ElevenLabs signed URL. Neither API key reaches the browser.

The card's poster — the still shown before the stream arrives, and behind the launcher and the
"video paused" state — is the avatar's own image, derived from the id:
`https://lab.anam.ai/api/avatars/<id>/image/landscape`. It's the *landscape* crop on purpose:
Cara 4 renders live video at 1152×768, so the same 3:2 source keeps the face exactly as framed
when the video takes over. (The avatar's `videoUrl`/`idleVideoUrl` are presigned and expire
hourly, so they can't be used as a static source.) `lab.anam.ai` is allowed in
`next.config.ts`; switching `NEXT_PUBLIC_ASSISTANT_PROVIDER` back to `elevenlabs` or `mock`
restores the bundled stylist portrait.

Anam also offers a server-side ElevenLabs connector, which is one hop shorter. It is not used
here because it bridges audio only: `sendUserMessage()` and `addContext()` land in Anam's own
session record and never reach the agent, which would cost this build both its typed fallback
and the agent's awareness of the page.

Optional: `ANAM_REGION=us|eu` pins the engine region; leave it empty for automatic routing.
Sessions are billed per minute by Anam, on top of ElevenLabs and OpenAI usage. Recording is
off (`sessionReplay.enableSessionReplay: false`); turning it on in the session route also
turns on Lab transcripts, which are useful when debugging a session.

### Keeping it fast

Measured on a real session, the avatar is not the bottleneck — ElevenLabs reports TTS first
byte at ~100 ms and the first video frame lands ~4 s after the opening click. A turn is
dominated by `/api/agent/llm`: ~1 s warm, but over 3 s on a cold serverless start, and a turn
that calls a tool pays for two LLM round trips (~2.4 s) because the agent speaks after acting.

What the build does about the parts it controls:

- the SDK, the session token and the signed URL are fetched on idle, so the first click costs
  only handshakes; `<link rel="preconnect">` warms the TLS connection before that
- the server reuses keep-alive sockets for the ElevenLabs and Anam calls, and pins IPv4 so a
  stalled AAAA lookup can't add 15 s
- audio is PCM 16 kHz end to end, so nothing resamples on the way through, and the agent runs
  `eleven_flash_v2` with `optimize_streaming_latency: 3`
- `/api/agent/llm` streams OpenAI's SSE straight through behind a static, cacheable system
  prompt — watch `[agent-llm] … ttft=…` in the server log
- replies stream into the card as they're spoken, and tools that need no answer are
  fire-and-forget, so the page moves while the agent is still talking

Worth doing if turn latency matters: keep the deployment warm (cold starts dominate the first
turn), host it near OpenAI, and keep replies short. `NEXT_PUBLIC_AGENT_DEBUG=1` shows the
measured turn latency on the card.

Switching to `NEXT_PUBLIC_ASSISTANT_PROVIDER=elevenlabs` gives voice only, with no video
costs; `mock` runs the UI with no keys at all.

# livesites-store
