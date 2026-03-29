# Project Plan: ForgeGuard (Web Migration)
**Version:** 1.0
**Goal:** Migrate the "Personal Cyber Safety Coach" mobile app experience to a blazing fast, highly customizable Next.js web application.

## 1. Project Overview
ForgeGuard is a blazing fast Next.js web application designed to protect everyday users from phishing, scams, and risky links. We are extracting the core features and backend concepts from the existing Flutter application and migrating them into a modern, responsive, and customizable web environment.

## 2. Core Technical Strategy
- **Framework:** Next.js (React) for a blazing fast, server-rendered and statically optimized web experience.
- **Styling:** Tailwind CSS (or Custom CSS if preferred) for rapid, highly customizable UI development.
- **Backend/LLM Integration:** OpenRouter API to power the core assessment intelligence, extracting the structured JSON analysis logic from the original project.
- **Architecture:** API Routes in Next.js will proxy requests to OpenRouter to ensure API keys remain hidden and secure.

## 3. Feature Migration Checklist
- [ ] **Unified Input Interface:** A simple, friendly chat-style input bar at the bottom where users can type, paste text, paste a URL, or attach an image payload.
- [ ] **Risk Analysis Engine:** Integration with OpenRouter API. The system will prompt the LLM to return structured JSON detailing:
  - Risk Level (Safe / Suspicious / High Risk)
  - Top 3 Reasons
  - Action Checklist
  - 30-second Micro-lesson
- [ ] **Privacy & Redaction:** Client-side and server-side logic to redact PII (names, emails, phones) before sending payloads to the LLM. No data persistence.
- [ ] **Safety Guardrails:** Implement checks to politely refuse processing of malicious prompts (e.g., "help me make an even better phishing message").
- [ ] **Dynamic Result UI:** Animated risk badges, checklist rendering, and an educational micro-lesson card.
- [ ] **Export & Share (Stretch):** Provide a fast way to copy the results or generate a PDF report for High Risk items.

## 4. Next Steps
1. Initialize the Next.js project in the ForgeGuard repository.
2. Scaffold the fundamental UI components (Chat Input, Risk Badge, Analysis Results).
3. Implement the internal Next.js API route connecting to OpenRouter utilizing the engineered prompts from the Flutter project.
4. Integrate client-side input handling (file uploads, text pasting, link parsing) with the analysis API.
5. Polish the user experience to ensure the app is intuitive, warm, and exceptionally fast.
