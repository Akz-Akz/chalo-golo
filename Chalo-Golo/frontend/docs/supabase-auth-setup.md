# Supabase Auth Setup (Google + OTP)

Use this checklist so `AuthPage` works correctly in production.

## 1) Enable providers

In Supabase Dashboard -> Authentication -> Providers:

- Enable **Google**
- Enable **Email** (OTP / magic link)

## 2) Configure Google OAuth

In Google Cloud Console:

- Create OAuth client (Web Application)
- Add authorized redirect URI:
  - `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`

Then in Supabase Google provider settings:

- Paste Google client ID
- Paste Google client secret

## 3) Configure Redirect URLs

In Supabase Dashboard -> Authentication -> URL Configuration:

- Site URL:
  - `https://your-frontend-domain.com`
- Additional redirect URLs:
  - `http://localhost:5173`
  - `https://your-frontend-domain.com/`

## 4) Email OTP template/settings

In Supabase Dashboard -> Authentication -> Email Templates / Settings:

- Ensure OTP sign-in email template is enabled
- Decide whether your passwordless email flow should send a 6-digit code, a magic link, or both
- Keep OTP expiry short (recommended 10-15 minutes)
- Chalo Golo's auth UI now supports both code-entry and email-link completion flows

## 5) Frontend env vars

Set these in your deployment provider:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ROADMAP_API_URL` (your roadmap backend endpoint)

## 6) Runtime checks

- Google login: click "Continue with Google", complete OAuth, return to app and session should hydrate.
- OTP login: enter email, receive code, enter 6 digits, verify, then proceed to onboarding/dashboard.
