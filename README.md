# Resume Tailor Replica — Full AI Version

This version turns the replica into a real one-click resume tailoring application.

## What works
- Candidate profile with work history, dates, titles, education, and per-company sentence counts
- Job-description input and optional company override
- One-click **Tailor Resume** generation
- Server-side OpenAI API integration (API key is never exposed to the browser)
- ATS-focused summary, skills, job titles, and tailored experience content
- Structured JSON output and live resume preview
- Import/export of profile data
- Downloadable resume JSON
- Browser Print / Save as PDF
- Manual AI prompt + JSON paste workflow remains available as a fallback
- Local browser autosave
- Security-clearance / on-site-only blocking rule is retained

## Requirements
- Node.js 18 or newer
- An OpenAI API key with API billing enabled

## Run with real AI
macOS / Linux:
```bash
cd resume-tailor-replica
export OPENAI_API_KEY="YOUR_KEY_HERE"
export OPENAI_MODEL="gpt-6-sol"
npm start
```

Windows PowerShell:
```powershell
cd resume-tailor-replica
$env:OPENAI_API_KEY="YOUR_KEY_HERE"
$env:OPENAI_MODEL="gpt-6-sol"
npm start
```

Then open:
`http://localhost:8080`

## Test without spending API credits
```bash
npm run dev:mock
```
This runs the complete browser/server flow with sample generated content.

## Environment variables
Copy `.env.example` as a reference. This zero-dependency server reads environment variables directly; it intentionally does not load `.env` files by itself.

- `OPENAI_API_KEY` — required for real generation
- `OPENAI_MODEL` — optional; defaults to `gpt-6-sol`
- `PORT` — optional; defaults to `8080`
- `MOCK_AI=1` — optional local test mode

## Deployment
This project needs a Node server because the API key must remain private. Deploy it to a Node-capable host (for example Render, Railway, Fly.io, a VPS, or another service that can run `npm start`) and configure `OPENAI_API_KEY` in the host's secret/environment settings.

Do **not** deploy only the static files to GitHub Pages if you want one-click AI tailoring; GitHub Pages cannot securely hold a server-side API key.

## Privacy
Profile data is stored locally in the browser. When you click **Tailor Resume**, the candidate profile fields needed for tailoring and the pasted job description are sent to your server and then to the configured OpenAI API. This replica does not include the original site's Discord webhook/IP telemetry behavior.

## Notes on result quality
The prompt mirrors the original workflow closely but also adds a plausibility rule to reduce fabricated credentials or employers. AI-generated resume content should still be reviewed for factual accuracy before use.
