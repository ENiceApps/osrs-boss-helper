# Security Policy

This document describes what data OSRS Boss Helper handles, how it's protected,
and how to report a vulnerability. The OSRS community cares deeply about the
safety of third-party tools, and so do we — this is meant to be auditable.

## Reporting a vulnerability

Please report security issues **privately** so they can be fixed before public
disclosure:

- Email: **eliezer.d.nunez@gmail.com** (subject line starting with `SECURITY:`)

Please don't open a public GitHub issue for a vulnerability. We aim to
acknowledge reports within a few days. Responsible disclosure is appreciated and
credited.

## The short version

**There is no backend that stores or receives your game data.** The optional
RuneLite plugin writes your bank to a local file on your own computer; the web
app reads that file directly in your browser. Your bank, skills, and GP never
leave your machine.

## What we are NOT

- We **never** ask for, receive, or store your Jagex account credentials or
  RuneScape password. There is no login of any kind.
- The RuneLite plugin **only reads** game state and **makes no network
  requests**. It cannot modify your bank or anything else in the client.
- No advertising, no third-party analytics, no tracking pixels.

## What data is involved, and where it lives

| Data | Source | Where it lives |
|------|--------|----------------|
| Bank/inventory/worn item IDs + quantities | RuneLite plugin (opt-in) | a local file: `<RuneLite dir>/osrs-boss-helper/bank.json` |
| Combat skill levels, GP, character name | RuneLite plugin (opt-in) | same local file |
| The file's contents, while you use the app | read by your browser | in-memory in the browser tab only; never uploaded |

The web app is fully usable on a **sample bank** with no plugin and no file.
Your real data is only involved if you install the plugin and connect the file.

## The only things the server does

When deployed, the Next.js app exposes exactly three endpoints, none of which
touch your game data:

- `GET /api/prices` and `GET /api/mapping` — read-only proxies to the public
  OSRS Wiki prices API. They exist so the browser doesn't call the wiki directly
  and so the wiki-required `User-Agent` is attached server-side. They are locked
  to the wiki's host (no arbitrary URLs).
- `POST /api/feedback` — relays the optional in-app feedback form (your message
  plus an optional reply email) to the maintainer via email. It carries no game
  data and is rate-limited per IP to deter spam.

## How it's protected

- **No data exfiltration.** The plugin has no network code; the app has no
  endpoint that accepts a bank. There is nothing to intercept or breach.
- **Local file reads** use the browser's File System Access API: you explicitly
  pick the file, and the page can only read the handle you granted.
- **Read-only wiki proxies** are restricted to the wiki's fixed host (no SSRF).
- **Conservative security headers** (`X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`, HSTS) are set in `next.config.ts`.
- **Secrets** (only the optional Resend feedback key) live in environment
  variables and are never committed (`.env*` is gitignored).

### Known limitations (documented honestly)

- The feedback rate limiter is **best-effort and in-memory**. On a serverless
  host (e.g. Vercel) instances don't share memory, so it deters casual spam but
  is not a hard global cap. Back it with a shared store (Upstash / Vercel KV) for
  a high-traffic deployment.
- No full Content-Security-Policy yet (the UI uses some inline styles); a CSP
  with nonces is tracked as future work.

## Self-hosting

The app is fully client-side apart from the wiki proxies and feedback relay, so
you can host it anywhere static-friendly. Your bank file is read locally in the
browser regardless of where the app is hosted — even the public deployment never
receives it.

## Scope

In scope: this repository (the web app and the bundled RuneLite plugin).
Out of scope: the OSRS Wiki APIs we proxy, and any fork or third-party
deployment we don't control.
