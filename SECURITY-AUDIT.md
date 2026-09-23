# Timewell Production Security Audit

Audit date: 2026-09-23 (Asia/Taipei)
Scope: local `main` working tree prepared for the Timewell sharing release, Cloudflare build target, and Vercel/Nitro build target.

## Release summary

**No known dependency vulnerability remains in the audited tree.** Both the production-only and full npm audits report zero vulnerabilities after removing the unused Drizzle development-tool chain. No application API, Server Action, database call, authentication boundary, paid third-party API, or server-side user-input sink was found.

This release is suitable to deploy. A shared application-level security-header policy is now defined in `next.config.ts` and compiled into both deployment targets. Live response headers must still be checked after the new production deployment completes.

## Evidence

- `npm audit --omit=dev`: **0 vulnerabilities**.
- Full `npm audit`: **0 vulnerabilities**.
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

None found.

The previous security-header and legacy esbuild findings were remediated in the post-audit hardening pass. CSP, anti-framing, nosniff, referrer, and permissions policies now share one source of truth in `next.config.ts`; unused Drizzle/D1 tooling was removed.

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
- [x] Establish equivalent application security headers in both deployment builds; live-header verification follows deployment.
