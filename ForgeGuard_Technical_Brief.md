# ForgeGuard Technical Brief

## 1. Executive Summary (What is being done)

ForgeGuard is a consumer-focused cybersecurity assistant designed for everyday users who are not security experts. The product helps users quickly assess suspicious messages, links, and screenshots, then provides plain-language guidance on what to do next.

The core problem it solves is decision paralysis during potential scams: users often receive alarming content (phishing emails, urgent texts, suspicious URLs) and need immediate, understandable triage. ForgeGuard combines:

- AI risk classification (Safe / Suspicious / High Risk)
- concrete next-step actions
- lightweight educational coaching ("microLesson")
- a local, privacy-conscious analytics layer for personal threat awareness

The current architecture supports a freemium demo model:

- Guest / Free users can run scans
- Pro users unlock the Security Analytics command center with persistent local history and proactive alerting

---

## 2. Authentication & Tiering (How login works)

### Clerk integration

Authentication is integrated with Clerk and initialized at the app layout level via `ClerkProvider`.

- Layout provider: `src/app/[locale]/layout.tsx`
- Middleware integration: `src/middleware.ts`
- Tier resolver hook: `src/hooks/useUserTier.ts`
- Tier mapping logic: `src/lib/auth/tier.ts`

The middleware uses `clerkMiddleware` while keeping core UI routes public (Guest Mode). API routes are passed through so Clerk session context is available server-side for authenticated operations.

### Tier model and enforcement

Tier resolution is metadata-driven:

- no Clerk user -> `Guest`
- Clerk user with `publicMetadata.tier === 'pro'` (case-insensitive) -> `Pro`
- otherwise -> `Free`

This logic is centralized in `resolveUserTier()` (`src/lib/auth/tier.ts`) and consumed through `useUserTier()`.

### Free vs Pro behavior

- **Guest / Free**:
  - can access and use scan flow
  - sees upgrade lock state in Security Analytics
  - can sign in via Clerk modal from sidebar and other gated areas
- **Pro**:
  - full Security Analytics dashboard
  - local history-driven KPI and threat log
  - threshold warning banner and one-click emergency action plan

### Demo upgrade path

The app includes a demo-only upgrade endpoint:

- `POST /api/account/tier` -> `src/app/api/account/tier/route.ts`
- requires authenticated user
- currently only accepts `tier: 'pro'`
- writes `publicMetadata.tier = 'pro'` via Clerk server SDK

The sidebar "Subscribe Now" flow calls this endpoint, then reloads the Clerk user object.

---

## 3. The AI Engine (How the AI works & which LLM is used)

### Scan API route

All scan requests are handled by:

- `src/app/api/analyze/route.ts` (`POST /api/analyze`)

### LLM provider and model

The backend calls OpenRouter with an API key from environment:

- header: `Authorization: Bearer ${process.env.OPENROUTER_API_KEY}`
- endpoint: `https://openrouter.ai/api/v1/chat/completions`
- model: `google/gemini-2.5-flash`
- temperature: `0.1`

### Input pipeline by type

Frontend payload type is generated in `src/components/ChatInput.tsx`:

- `text`: direct text analysis
- `url`: URL-specific prompt + deterministic URL heuristics
- `image`: image + OCR text (via Tesseract.js) sent to API
- `pdf`: payload type supported in frontend typing, handled as generic text/entity branch in API prompt logic

### OCR flow for screenshots

For image uploads/pastes:

1. client runs OCR (`tesseract.js`) in `ChatInput`
2. OCR output is redacted client-side
3. API request includes both image and extracted text
4. backend sends multimodal-style message payload to OpenRouter

---

## 4. Flagging Logic & Heuristics (On what basis it flags)

### Required LLM response schema

The system prompt enforces JSON output with these fields:

- `risk`: `Safe | Suspicious | High Risk`
- `confidence`: numeric 0–100
- `topReasons`: string array
- `actions`: string array
- `microLesson`: short educational text
- `references`: URL array (intended for Safe/Suspicious)

After model response parsing, backend also appends:

- `inputPreview`
- `inputType`

### Deterministic malicious-intent guardrail (pre-LLM)

Before calling the model, the route checks explicit malicious intent patterns (e.g., "create phishing", "optimize scam", "how to hack").

If matched, it returns a deterministic block result immediately:

- `risk: "High Risk"`
- `confidence: 100`
- explanatory `topReasons`, `actions`, `microLesson`
- `_blocked: true`

This is rule-based, not model-dependent.

### URL-specific technical heuristics

For URL scans, deterministic checks compute `urlHeuristicScore` and flags, including:

- raw IP hostname
- excessive subdomains
- very long URLs
- suspicious TLDs (`xyz`, `top`, `pw`, `tk`, `ml`, `ga`, `cf`, `gq`, `cn`, `cc`)
- punycode hostnames (`xn--`)
- `@` obfuscation
- non-HTTPS protocol

Post-LLM, a conservative floor is applied:

- score >= 5 -> minimum `High Risk`
- score >= 2 -> minimum `Suspicious`
- else -> `Safe`

If floor > model risk, backend escalates risk/confidence and prepends heuristic reason/action text.

### Parsing robustness

The route extracts JSON from model output using a first-`{` / last-`}` regex match, then `JSON.parse`s it.

---

## 5. Privacy-by-Design & Redaction

### Client-side PII redaction before analysis

PII redaction is performed on the client before `/api/analyze` calls:

- utility: `src/lib/utils/redactor.ts`
- call site: `src/components/ChatInput.tsx`

Current redaction patterns include:

- email addresses
- phone numbers
- SSNs
- basic credit-card-like sequences
- simple name-introduction heuristic (`"My name is ..."`, `"I am ..."`, etc.)

For image scans, OCR text is redacted before being sent to the backend.

### Local storage architecture for scan history

Security Analytics persistence uses a client-only hook:

- `src/hooks/useScanHistory.ts`
- storage key: `forgeguard:scan-history`

Data lifecycle:

1. successful `/api/analyze` response is received in `src/app/[locale]/page.tsx`
2. `addScan(scanResult)` is called
3. hook prepends a record with:
   - generated `id`
   - `scannedAt` timestamp
   - full returned scan payload fields
4. updated array is written to `localStorage`

This keeps personal scan history on-device/browser profile, avoiding server-side profile storage for analytics in the current implementation.

### Privacy positioning notes

- Strong point for demo: history remains local to the user device session/profile.
- Practical caveat: `localStorage` is persistent but not encrypted; device/browser access controls still matter.

---

## 6. The Proactive Threshold Alert

The proactive vulnerability banner is implemented in the Pro Security Analytics dashboard:

- component: `src/app/[locale]/reports/page.tsx`

Trigger logic:

- compute `threatsBlocked = count(history where risk === "High Risk")`
- if `threatsBlocked >= 3`, render the banner

Banner behavior/content:

- headline: `⚠️ High Targeting Volume Detected`
- body: explains repeated severe threats can indicate active scam-list targeting (e.g., breach exposure)
- CTA: `View Action Plan`
- CTA route: `/{locale}/emergency` (Emergency Toolkit)

This creates an "everyday-user" escalation mechanism by converting repeated high-risk events into an immediate guided intervention path.

---

## Current-State Snapshot (Code Freeze)

At freeze time, ForgeGuard is operating as a working end-to-end demo stack:

- Clerk-authenticated freemium UX with metadata-driven Pro gating
- live OpenRouter LLM analysis (`google/gemini-2.5-flash`)
- deterministic anti-abuse and URL hardening logic in backend
- client-side PII redaction prior to model submission
- local-only persistent scan telemetry for dashboarding
- threshold-based proactive warning with emergency playbook routing

This positions the project as both technically credible (real model inference + layered safeguards) and product-legible (clear value to non-expert users under cyber stress).
