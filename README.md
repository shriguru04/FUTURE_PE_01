<<<<<<< HEAD
# CopyCraft AI: AI Website Copy Generator for Local Businesses

**Future Interns Prompt Engineering Internship, Task 1**

CopyCraft AI turns a few facts about a local business into a structured first draft of its website copy: homepage, About Us, services, calls to action and a contact section. Copy is editable, exportable and saved locally. It works fully offline in **demo mode** (no API key) and can optionally use a real AI provider through a small server-side proxy.

> **Honesty note.** Demo mode assembles copy from built-in templates and your inputs. It is *not* a language model, and every demo result is labelled as such in the UI. Generated copy is a draft: check every statement is true for the business before publishing.

## Table of contents

1. [Problem statement](#problem-statement)
2. [Objectives](#objectives)
3. [Target audience](#target-audience)
4. [Features](#features)
5. [Technology stack](#technology-stack)
6. [System architecture](#system-architecture)
7. [Prompt engineering methodology](#prompt-engineering-methodology)
8. [Example prompts](#example-prompts)
9. [Sample input and generated output](#sample-input-and-generated-output)
10. [Before and after](#before-and-after-why-structured-prompts-help)
11. [Install and run](#install-and-run)
12. [Environment variables](#environment-variables)
13. [Demo mode](#demo-mode)
14. [Enabling AI mode](#enabling-ai-mode)
15. [Testing methodology](#testing-methodology)
16. [Limitations](#limitations)
17. [Future enhancements](#future-enhancements)
18. [Screenshots](#screenshots)
19. [Project structure](#project-structure)
20. [Publishing to GitHub](#publishing-to-github)

## Problem statement

Local businesses (salons, cafes, clinics, gyms, small agencies, tutors, consultants) often launch websites with vague or copied text because they cannot afford a copywriter. Asking a general AI tool for "website copy" without context tends to return generic text, and can invent experience, prices, awards or guarantees the business cannot back up.

## Objectives

- Collect the right business context with a validated, well-explained form.
- Convert that context into **structured, section-specific prompts** built dynamically from user input.
- Generate category- and tone-specific copy, with a **reliable demo mode** that never depends on an unavailable API.
- Keep output **honest**: no invented credentials, reviews, awards, prices or guarantees; extra care for healthcare.
- Make output **editable, exportable and recoverable** (copy, `.txt`/`.md` download, local drafts).
- Document the prompt engineering approach and verify behaviour with automated checks.

## Target audience

Owners and staff of small local businesses, freelancers and consultants, and the students or junior marketers helping them. Supported categories: salon, cafe, clinic, agency, gym, retail, education, consulting, other.

## Features

- Landing page with an interactive product preview (business type and tone selectors driven by the real demo engine), benefits, feature grid, workflow, categories, before/after examples, sample output, FAQ and footer.
- **Generator** with 12 input fields, validation, character limits, helper text, examples and reset.
- Five output tabs: **Homepage, About Us, Services, Calls to Action, Contact Section**.
- Edit any generated line; copy a section or everything; download `.txt` or `.md`.
- **Section-level regeneration** that never overwrites other sections (and asks before discarding your edits).
- **View generated prompt** panel with copy button.
- Searchable **template library** (8 templates) that prefills the generator.
- Features, How It Works and About pages, including an animated workflow diagram.
- Save and restore **drafts** locally; the workspace auto-persists in the browser.
- Light/dark theme, toasts, skeleton loaders, animated progress, typing preview, counters, FAQ accordion, animated modals, dropdown and mobile menu.
- Accessibility: semantic landmarks, skip link, labelled inputs, visible focus, keyboard-operable tabs, focus-managed modals, `prefers-reduced-motion` support, error and success cues that do not rely on colour alone.
- Page-specific titles, meta descriptions and Open Graph tags; route-level lazy loading.

## Technology stack

| Area | Choice |
|---|---|
| Framework | React 18 + Vite |
| Language | JavaScript (ES modules) |
| Styling | Tailwind CSS with CSS-variable design tokens (light + dark) |
| Animation | Framer Motion (`MotionConfig reducedMotion="user"`) |
| Icons | Lucide React |
| Routing | React Router v6 |
| Persistence | `localStorage` (no accounts) |
| Optional backend | Zero-dependency Node HTTP proxy (`server/proxy.mjs`) |

React Hook Form was considered and left out: validation is shared with the server through one plain module, so an extra dependency was unnecessary.

## System architecture

```
 Browser (React)                                          Optional server
 ┌────────────────────────────────────────────────┐       ┌──────────────────────┐
 │ GeneratorForm -> WorkspaceContext (state)       │       │ server/proxy.mjs     │
 │        │                                        │       │  - validates again   │
 │        v                                        │       │  - rebuilds prompt   │
 │ services/contentGenerator.js                    │ POST  │  - holds API key     │
 │  1 validateProfile (sanitise + limits)          │ ────> │  - rate limits       │
 │  2 buildPrompt(section)  <- promptBuilder.js    │profile│  - calls provider    │
 │  3a mode "demo": demoEngine.js (offline)        │ <──── │                      │
 │  3b mode "ai":   POST to proxy ─────────────────┼───────┘  returns { text }    │
 │  4 validateSectionContent + normalise           │                              
 │        v                                        │
 │ GeneratedContent (editable) -> exportService    │
 │ storage.js (localStorage: workspace, drafts)    │
 └────────────────────────────────────────────────┘
```

Key rules enforced in code:

- **No secrets in the browser.** The only browser-visible variable is the proxy URL. Provider keys exist only in the server process.
- **Demo is never disguised as AI.** If AI mode is selected but unavailable, the app shows an error and offers to switch; it does not silently fall back.
- **Service layer is UI-free.** `generateWebsiteCopy({ businessProfile, section, provider, mode })` can be reused or swapped without touching components.
- **Safe rendering.** All text is rendered by React as text; inputs and model output are stripped of markup and unknown fields are dropped.

## Prompt engineering methodology

Every prompt has the same blocks, assembled from the form at generation time (`src/services/promptBuilder.js`):

1. **ROLE**: an experienced website copywriter specialising in the selected category.
2. **BUSINESS CONTEXT**: name, category, location, description, services, audience, customer problem, unique selling proposition.
3. **WRITING REQUIREMENTS**: tone, language, conversion goal, keywords.
4. **TASK**: a separate task per section (Homepage, About Us, Services, Calls to Action, Contact) with its own length limits.
5. **OUTPUT REQUIREMENTS and RESPONSE FORMAT**: shared quality rules (no invented credentials, reviews, awards, prices or guarantees; avoid unsupported claims; avoid jargon) plus a strict JSON schema for the section so output can be validated and rendered predictably.

Clinic prompts add a healthcare rule: no outcome promises, cures, diagnostic or treatment claims.

**Why this should improve results**

- **Relevance:** the model receives who the customers are, what problem they have and what makes the business different, so copy is about *this* business instead of "a salon".
- **Tone consistency:** tone is an explicit requirement repeated in every section prompt, so the homepage, services and CTAs sound like one brand.
- **Output quality and safety:** explicit "do not invent" rules discourage fabricated claims, and a fixed JSON schema makes malformed or incomplete responses detectable (they are rejected, not displayed).
- **Reusability:** the prompt is a pure function of the inputs, so it can be inspected, copied and reused with any model.

These are design rationales, not measured results. No claim is made about conversion rates or search ranking.

## Example prompts

**Homepage prompt** (fictional salon from the template library):

```text
ROLE:
Act as an experienced website copywriter specializing in salon businesses.

BUSINESS CONTEXT:
Business name: Petal & Comb
Category: Salon
Location: Koregaon Park, Pune
Description: A small neighbourhood salon offering hair, skin and nail services in a relaxed space.
Services: Haircut and styling, Hair colour, Facial, Manicure
Target audience: Working professionals who want reliable appointments
Customer problem: Hard to find a salon that fits around a busy schedule
Unique selling proposition: Early-morning and evening appointments

WRITING REQUIREMENTS:
Brand tone: Friendly
Language: English
Conversion goal: Book appointments
Keywords: hair salon

TASK (Homepage):
Write the homepage copy: a hero headline, a supporting subheadline, a main and a secondary call to action, a short value proposition, 3-4 key benefits, and suggested section headings for the page.

OUTPUT REQUIREMENTS:
* Use clear and natural language.
* Write for the specified target audience.
* Communicate genuine customer benefits.
* Use concise and persuasive headlines.
* Produce a clear value proposition.
* Create relevant calls to action.
* Adapt wording to the selected business category.
* Avoid unnecessary jargon.
* Avoid unsupported claims.
* Do not invent business credentials, reviews, awards, prices, or guarantees.
* Do not repeat the same content unnecessarily.
* Return content in a predictable, structured format.
* The headline must be under 12 words. The subheadline must be one or two sentences.

RESPONSE FORMAT:
Return only valid JSON, with no markdown fences and no commentary, matching this shape: {"heroHeadline": string, "subheadline": string, "primaryCta": string, "secondaryCta": string, "valueProposition": string, "keyBenefits": string[], "sectionHeadings": string[]}
Write all string values in English.
```

**Services prompt for a clinic** (note the extra healthcare rule):

```text
ROLE:
Act as an experienced website copywriter specializing in clinic businesses.

BUSINESS CONTEXT:
Business name: Riverside Family Clinic
Category: Clinic
Location: Kothrud, Pune
Description: A family clinic offering consultations and routine check-ups with appointments by request.
Services: General consultations, Routine health check-ups, Vaccination appointments, Follow-up visits
Target audience: Families and older adults in the neighbourhood
Customer problem: Long waits and unclear information before appointments
Unique selling proposition: Plain-language explanations at every visit

WRITING REQUIREMENTS:
Brand tone: Trustworthy
Language: English
Conversion goal: Book appointments
Keywords: family clinic

TASK (Services):
Write one entry per listed service. Each entry has a service name, a short description, the customer benefit, and an optional call to action.

OUTPUT REQUIREMENTS:
* Use clear and natural language.
* Write for the specified target audience.
* Communicate genuine customer benefits.
* Use concise and persuasive headlines.
* Produce a clear value proposition.
* Create relevant calls to action.
* Adapt wording to the selected business category.
* Avoid unnecessary jargon.
* Avoid unsupported claims.
* Do not invent business credentials, reviews, awards, prices, or guarantees.
* Do not repeat the same content unnecessarily.
* Return content in a predictable, structured format.
* Use only the services listed. Keep each description under 40 words.
* Healthcare rule: do not promise outcomes, cures or results, do not make diagnostic or treatment claims, and do not imply medical advice. Describe care, access and information only.

RESPONSE FORMAT:
Return only valid JSON, with no markdown fences and no commentary, matching this shape: {"services": [{"name": string, "description": string, "benefit": string, "cta": string}]}
Write all string values in English.
```

## Sample input and generated output

Output below was produced by running this repository's **demo engine** (not an AI model) on the fictional salon template.

**Input**

| Field | Value |
|---|---|
| Business name | Petal & Comb |
| Category | Salon |
| Location | Koregaon Park, Pune |
| Description | A small neighbourhood salon offering hair, skin and nail services in a relaxed space. |
| Services | Haircut and styling, Hair colour, Facial, Manicure |
| Audience | Working professionals who want reliable appointments |
| Problem | Hard to find a salon that fits around a busy schedule |
| USP | Early-morning and evening appointments |
| Tone / Goal / Language | Friendly / Book appointments / English |
| Keywords | hair salon |

**Homepage output**

- **Headline:** Welcome to Petal & Comb, where you leave feeling like yourself
- **Subheadline:** Petal & Comb is here for working professionals who want reliable appointments. We know the frustration: hard to find a salon that fits around a busy schedule. Early-morning and evening appointments.
- **Primary CTA:** Book Your Visit | **Secondary CTA:** View Our Services
- **Value proposition:** At Petal & Comb, we want working professionals who want reliable appointments to feel at ease. That means appointments planned around what you want, and people who are glad you came in. Looking for hair salon in Koregaon Park, Pune? You are in the right place.
- **Key benefits:**
  - A consultation before every service
  - Appointments planned around your preferences
  - A relaxed space to unwind
  - Advice you can use at home
- **Suggested section headings:** Hair salon in Koregaon Park, Pune, Why Clients Choose Us, Your First Visit, Book an Appointment, Find Us

**Services output (first two)**

- **Haircut and styling**: Haircut and styling, planned around your preferences and your routine. Come in and see for yourself. *Benefit:* So you know how to look after it at home. *CTA:* Book Haircut and styling
- **Hair colour**: Hair colour with time to talk through the details first. Come in and see for yourself. *Benefit:* So the result suits your day-to-day life. *CTA:* Book Hair colour

**Calls to action:** primary "Book Your Visit", secondary "View Our Services", contact "Say Hello", booking "Book Your Appointment", enquiry "Ask About a Service".

**Same salon, different tones (headline only)**

| Tone | Headline |
|---|---|
| Professional | Petal & Comb: hair and beauty care in Koregaon Park, Pune |
| Premium | Hair and beauty care, considered in every detail |
| Energetic | Refresh your look with Petal & Comb! |
| Minimalist | Petal & Comb. Hair and beauty care in Koregaon Park, Pune. |

**Different categories, same engine**

- Cafe: "Looking for coffee, food and a place to sit in Baner, Pune? Daily Grind is here to help"
- Clinic: "Clear, respectful healthcare in Kothrud, Pune you can rely on"

## Before and after: why structured prompts help

The "vague prompt" outputs below are **illustrative examples of the generic or over-claiming text a one-line prompt tends to invite**. They are hand-written, not captured from a specific model. The "structured prompt" outputs are real output of this repository's demo engine for the fictional template businesses.

### Example 1: Salon

| | Vague prompt | Structured prompt (this app) |
|---|---|---|
| **Input** | `Write website copy for a salon.` | Name, location, description, services, audience, problem, USP, tone (**friendly**), goal (**appointments**) |
| **Output** | "Welcome to our salon! We offer a wide range of services at great prices. Our experienced team is the best in town. Contact us today!" | "Welcome to Petal & Comb, where you leave feeling like yourself. Petal & Comb is here for working professionals who want reliable appointments. We know the frustration: hard to find a salon that fits around a busy schedule. Early-morning and evening appointments." |
| **Assessment** | Generic; invents experience, pricing and rankings. | Specific to the audience and goal, tone-matched, limited to facts the user supplied |

### Example 2: Gym

| | Vague prompt | Structured prompt (this app) |
|---|---|---|
| **Input** | `Write homepage text for a gym.` | Name, location, description, services, audience, problem, USP, tone (**energetic**), goal (**visits**) |
| **Output** | "Transform your body and achieve your dream physique with our state-of-the-art equipment. Join today for guaranteed results!" | "Start moving with Ironleaf Fitness!. Made for beginners and returning gym-goers. A beginner orientation for new members. Let's make it happen!" |
| **Assessment** | Promises guaranteed results; ignores who the gym is for. | Specific to the audience and goal, tone-matched, limited to facts the user supplied |

### Example 3: Clinic

| | Vague prompt | Structured prompt (this app) |
|---|---|---|
| **Input** | `Write a homepage for a clinic.` | Name, location, description, services, audience, problem, USP, tone (**trustworthy**), goal (**appointments**) |
| **Output** | "Our expert doctors cure your problems quickly with the latest treatments. Book now for guaranteed relief!" | "Clear, respectful healthcare in Kothrud, Pune you can rely on. Riverside Family Clinic serves families and older adults in the neighbourhood with clear information and respectful care. We know the frustration: long waits and unclear information before appointments. Plain-language explanations at every visit." |
| **Assessment** | Makes medical claims and outcome promises. | Specific to the audience and goal, tone-matched, limited to facts the user supplied |

## Install and run

Requirements: Node.js 20.6 or newer and npm.

```bash
git clone <your-repository-url>
cd copycraft-ai
npm install
npm run dev        # http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run build` / `npm run preview` | Production build and local preview |
| `npm test` | Engine tests and template validation (plain Node, no browser) |
| `npm run server` | Optional AI proxy on port 8787 |

Single-page-app routing: `public/_redirects` (Netlify) and `vercel.json` (Vercel) rewrite all paths to `index.html` so deep links such as `/generator` work.

## Environment variables

Demo mode needs **none**. See `.env.example`.

| Variable | Where read | Purpose |
|---|---|---|
| `VITE_AI_PROXY_URL` | Browser (public) | URL of your proxy, e.g. `/api/generate`. Unset = AI mode disabled. **Never put a provider key here.** |
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` | Server only | Provider keys used by `server/proxy.mjs` |
| `ANTHROPIC_MODEL` / `OPENAI_MODEL` | Server only | Optional model overrides |
| `PORT` | Server only | Proxy port (default 8787) |

`.env` is git-ignored.

## Demo mode

Demo mode is the default and works with no network and no key. The engine (`src/services/demoEngine.js`) composes copy from three layers: **category data** (what the business does, benefits, service phrasing, form labels), **tone frames** (headline, subheadline and CTA styles for seven tones) and **your inputs** (name, location, audience, problem, USP, keywords, goal). Different categories and tones therefore produce visibly different output.

- Results are labelled "Demo mode: no AI model was used".
- Demo mode writes **English only**; other languages require AI mode.
- A short (~0.4 s) pause is added per section so the progress UI is visible. No network call occurs.
- Nothing is sent to any server.

## Enabling AI mode

1. Copy `.env.example` to `.env`, set `VITE_AI_PROXY_URL=/api/generate` and add `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`.
2. Run `npm run server` in one terminal and `npm run dev` in another (Vite forwards `/api` to the proxy).
3. In the generator, switch **Demo to AI** and pick a provider.

The browser sends the validated profile; the proxy validates it again, **builds the prompt itself**, calls the provider and returns text. The client parses the JSON, checks it against the section schema, sanitises it and renders it as plain text.

> **Status:** the proxy's validation and error paths were exercised locally without a key. Calls to real providers have **not** been tested during development; confirm model names and responses with your own key.

## Testing methodology

**Automated (`npm test`)**, plain Node with no dependencies:

- every combination of category, tone, conversion goal and section generates content that passes the section schema;
- cafe and clinic output differ; all seven tones produce distinct headlines; regeneration changes wording;
- empty form, invalid enum values, over-length fields and HTML injection are rejected or stripped;
- AI mode without a proxy fails with a clear error and does **not** fall back to demo; non-English in demo mode is refused;
- demo output is labelled; clinic output carries the healthcare notice;
- demo output never contains guarantee, award, certification, price or medical-claim patterns;
- prompts contain every required block, differ per section and change with inputs;
- `.txt` and `.md` exports are labelled and include only generated sections;
- all 8 templates pass form validation.

At the time this README was written these checks passed. They cover the logic layer only.

**Manual QA checklist.** The React UI has **not** been run in a browser by its author, so no results are recorded. Run each case and record your own result:

| # | Scenario | Result |
|---|---|---|
| 1 | Generate homepage copy for a salon | |
| 2 | Generate homepage copy for a cafe | |
| 3 | Generate services content for a clinic | |
| 4 | Change tone and regenerate | |
| 5 | Submit an empty form (errors shown, focus moves to the first error) | |
| 6 | Generate each section independently | |
| 7 | Edit a generated headline | |
| 8 | Copy an individual section | |
| 9 | Download all content as `.txt` and `.md` | |
| 10 | Save a draft, reset, restore it | |
| 11 | Switch light/dark theme and reload | |
| 12 | Visit every route and a bad URL | |
| 13 | Use the generator at 320, 375, 768, 1024, 1440 px | |
| 14 | Very long business name and description | |
| 15 | Invalid and missing values | |
| 16 | Generation error (select AI mode with no server) | |
| 17 | Demo mode with no `.env` | |
| 18 | Search the built bundle for any API key (`grep -r "sk-" dist`) | |
| 19 | Keyboard-only run through the generator; enable reduced motion | |

## Limitations

- Demo copy is template-composed; wording can be repetitive across similar inputs and may read awkwardly if inputs are not phrased naturally.
- Demo benefits describe typical good practice for a category and may not be true of a specific business. They must be reviewed.
- English only in demo mode.
- No automated browser or UI tests; no content-quality scoring beyond pattern checks.
- AI provider integration has not been tested against live APIs.
- Data lives in one browser; clearing site data deletes drafts.
- No SEO or conversion measurement. Nothing here shows improved rankings or conversions.

## Future enhancements

- Browser tests (Playwright) and accessibility audits in CI.
- More providers behind the same proxy contract; streaming responses.
- Multi-language demo templates.
- Side-by-side tone comparison and variant history per section.
- Optional rubric-based quality scoring of generated copy.
- Export to HTML snippets and CMS-friendly formats.

## Screenshots

Add your own after running the app (none are included because none were captured during development):

| Screen | File |
|---|---|
| Home (light) | `docs/screenshots/home-light.png` |
| Home (dark) | `docs/screenshots/home-dark.png` |
| Generator with output | `docs/screenshots/generator.png` |
| Prompt preview | `docs/screenshots/prompt-preview.png` |
| Templates | `docs/screenshots/templates.png` |
| Mobile generator | `docs/screenshots/mobile-generator.png` |

## Project structure

```
copycraft-ai/
├── public/                 favicon, SPA redirects
├── server/proxy.mjs        optional AI proxy (keys stay here)
├── scripts/                test-engine.mjs, check-templates.mjs
├── src/
│   ├── components/         Navbar, Footer, Button, AnimatedSection, GeneratorForm,
│   │                       GeneratedContent, SectionViews, PromptPreview, Modal,
│   │                       Toast, Skeleton, Accordion, ProductPreview, ...
│   ├── context/            Theme, Toast, Workspace (generator state)
│   ├── data/               options.js, businessTemplates.js, content.js
│   ├── hooks/              useDocumentMeta, useTyping, useCountUp
│   ├── pages/              Home, Generator, Templates, Features, HowItWorks, About, NotFound
│   ├── services/           promptBuilder, contentGenerator, demoEngine, validation, exportService
│   ├── utils/              storage, clipboard, objectPath
│   └── App.jsx  main.jsx  index.css
├── .env.example  vercel.json  tailwind.config.js  vite.config.js
└── README.md
```

## Publishing to GitHub

```bash
git init
git add .
git commit -m "CopyCraft AI: website copy generator (Future Interns Task 1)"
git branch -M main
git remote add origin https://github.com/<your-username>/copycraft-ai.git
git push -u origin main
```

Check that `.env` is not tracked (`git status` should not list it).

**Repository information** (fill in):

- Repository: `https://github.com/<your-username>/copycraft-ai`
- Live demo (optional, e.g. Vercel or Netlify): `<url>`
- Author: `<your name>`
- Internship: Future Interns, Prompt Engineering, Task 1

---

*All business names, locations and example outputs in this project are fictional and illustrative. Nothing here is a customer testimonial or a measured result.*
=======
# FUTURE_PE_01
Ai Website Copy Generator for Local Businesses- Future Interns Prompt Engineering Task

