# Timewell Production Security Audit

Audit date: 2026-09-23 (Asia/Taipei)
Scope: local `main` working tree prepared for the Timewell sharing release, Cloudflare build target, and Vercel/Nitro build target.

## Release summary

**No Critical vulnerability remains in the audited dependency tree.** The production dependency audit reports zero vulnerabilities after applying npm's non-breaking security updates. The full tree reports four Moderate findings, all in the unused Drizzle development CLI's legacy esbuild chain. No application API, Server Action, database call, authentication boundary, paid third-party API, or server-side user-input sink was found.

This release is suitable to deploy with the limitations below documented. The main remaining production-hardening item is to establish and verify a consistent security-header policy on both hosting targets. That item is not a Critical blocker for this static, local-first timer release, but it should be completed before adding server endpoints or authentication.

## Evidence

- `npm audit --omit=dev`: **0 vulnerabilities**.
- Full `npm audit`: **4 Moderate**, all through `drizzle-kit -> @esbuild-kit/esm-loader -> esbuild`.
- `npm test`: 23/23 passing.
- `npm run lint`: passing.
- No `app/api/**`, `pages/api/**`, `route.ts`, or `"use server"` entry exists.
- No application `process.env`, `NEXT_PUBLIC_*`, external fetch, SQL, shell, or raw user-controlled HTML path was found.
- `.env*`, private keys, deployment outputs, archives, and local tool state are ignored by Git.

## A. Critical Issues

None found.

The previous Critical framework finding was remediated by upgrading the compatible runtime set to Next.js 16.3.5, React/React DOM 19.3.0, and `react-server-dom-webpack` 19.3.0, together with Vinext 1.0.0-beta.10 and its Vite/RSC tooling.

## B. High Issues

None found in the current production dependency audit or application code.

## C. Medium Issues

### M-01 — Application security headers are not explicitly standardized across both hosts

- **Severity:** Medium
- **Location:** deployment configuration; no shared header policy is currently defined
- **Evidence:** Repository configuration does not define a common CSP, `X-Content-Type-Options`, `Referrer-Policy`, or `Permissions-Policy` policy for both Cloudflare and Vercel.
- **Reason:** Platform defaults may differ. Explicit headers reduce the impact of a future XSS or framing regression.
- **Attack scenario:** A future feature adds an unsafe rendering sink and browsers receive no restrictive CSP from one deployment target.
- **Remediation:** Add and live-test an equivalent policy on both hosts. Start with `default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a restrictive Permissions Policy. Validate audio, hydration, and social images before enforcement.
- **Must fix now:** No for the present local-only data model; yes before introducing APIs, authentication, or sensitive data.

### M-02 — Legacy esbuild remains in an unused development-tool chain

- **Severity:** Medium
- **Location:** `package-lock.json`, via `drizzle-kit -> @esbuild-kit/esm-loader -> @esbuild-kit/core-utils -> esbuild`
- **Evidence:** Full `npm audit` reports four Moderate findings. `npm audit --omit=dev` reports zero vulnerabilities. npm only proposes a forced breaking downgrade of Drizzle Kit.
- **Reason:** The advisory concerns an exposed esbuild development server. Timewell does not invoke Drizzle Kit in production and does not expose this development server.
- **Attack scenario:** A developer deliberately runs the affected legacy development server on a network-accessible interface and visits a malicious site.
- **Remediation:** Keep development servers loopback-only. Remove Drizzle tooling in a separate cleanup if database tooling remains unused, or upgrade when its dependency chain is patched. Do not use `npm audit fix --force` because it proposes a breaking downgrade.
- **Must fix now:** No. Not reachable in production.

## D. Low Issues

### L-01 — Dormant chart component uses raw style HTML

- **Severity:** Low
- **Location:** `components/ui/chart.tsx`
- **Evidence:** The reusable chart style component uses `dangerouslySetInnerHTML`; no current application route imports it and no user input reaches it.
- **Remediation:** Validate chart identifiers and colors before any future dynamic use, or replace the raw style generator.
- **Must fix now:** No; currently unreachable.

### L-02 — Archived local text fields have no explicit maximum length

- **Severity:** Low
- **Location:** `components/timer/custom-timer-form.tsx`, `app/anything/page.tsx`
- **Evidence:** Values remain in the browser and React escapes them, but unusually large pasted values could degrade that user's local browser experience.
- **Remediation:** Add state-layer and UI length limits if these fields become a supported primary workflow.
- **Must fix now:** No.

## E. Informational

- Timewell has no login, admin route, hidden mutation endpoint, API route, or Server Action.
- Timer and focus records remain in LocalStorage; they are not transmitted by the new share feature.
- Completion sharing includes only a rounded duration. It excludes the user's timer label and focus purpose.
- Web Share falls back to clipboard copy and treats user cancellation as a no-op.
- No tracked `.env` file or client-exposed secret configuration was found.
- The supplied Vercel deployment previously required Vercel authentication. Anonymous accessibility and final live response headers must be checked on the newly deployed production URL.

## Security verification after deployment

1. Request `/`, `/timer`, `/focus`, `/records`, and `/anything` anonymously and require controlled 2xx responses.
2. Inspect the document response headers, not a Vercel login redirect.
3. Confirm `/og-timewell.png` returns an image and page metadata resolves to the production HTTPS URL.
4. Enter HTML-looking text as a custom timer name and verify it renders only as text.
5. Verify sharing never includes custom timer names, focus purposes, records, or LocalStorage content.
6. Verify nonexistent API and malformed paths return controlled 4xx responses without stack traces or local paths.

## 上線前 10 項 Checklist

- [x] Upgrade Next.js and the React/RSC runtime set to patched compatible versions.
- [x] Upgrade Vinext, Vite, Cloudflare Vite plugin, and Wrangler as a compatible set.
- [x] Require zero Critical vulnerabilities.
- [x] Require zero production dependency vulnerabilities from `npm audit --omit=dev`.
- [x] Run unit/regression tests.
- [x] Run lint.
- [x] Rebuild both Cloudflare and Vercel targets after the final source changes.
- [ ] Verify all five routes, OG metadata/image, and share fallback on the final deployment.
- [ ] Confirm the intended Vercel production URL is anonymously accessible.
- [ ] Establish and verify equivalent security headers on both hosting targets before adding server-side or sensitive features.
