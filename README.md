# Shivraj Perkar · Portfolio

Live at **https://shivrajperkar.vercel.app** — React 19, Tailwind CSS, Framer Motion.

## Projects update themselves from GitHub

Every public, non-fork repository on [github.com/Aurialedge](https://github.com/Aurialedge) appears in the Projects section automatically.

| Layer | When | What it does |
| --- | --- | --- |
| **Live fetch** (`src/lib/github.js`) | Each visit (cached 30 min per session) | One call to the GitHub API for the latest repo list, languages and push times. New repos show up without a redeploy. |
| **Build snapshot** (`scripts/fetch-github.js`) | Before every `npm run build` | Saves all repos and a summary of each README to `src/data/github-snapshot.json`. Used for README-based descriptions and as a fallback if the API is rate-limited. |
| **Daily rebuild** (`.github/workflows/refresh-portfolio.yml`) | 08:00 IST daily | Calls a Vercel deploy hook so the snapshot stays fresh. Needs the `VERCEL_DEPLOY_HOOK` repo secret; it skips itself until that is set. |

A project's description comes from, in order: the curated entry in `src/data/projects.js`, then the repo's GitHub description, then its README summary.

**To make a new project look good, add a description (and topics) to the repo on GitHub.** It flows through automatically.

## Editing content

- `src/data/profile.js`: bio, experience, skills, achievements, certifications (all from the resume).
- `src/data/projects.js`: featured projects, demo videos (YouTube IDs), live links, categories, hidden repos.
- `public/Shivraj_Perkar_Resume.pdf`: the downloadable resume. Replace this file to update it.

## Contact form

Uses EmailJS when `REACT_APP_EMAILJS_SERVICE_ID`, `REACT_APP_EMAILJS_TEMPLATE_ID` and `REACT_APP_EMAILJS_PUBLIC_KEY` are set (locally in `.env`, and in Vercel → Settings → Environment Variables). Without them, the form opens the visitor's mail app instead.

## Scripts

```bash
npm start            # dev server
npm run build        # syncs GitHub snapshot, then builds
npm run sync:github  # refresh the snapshot only (set GITHUB_TOKEN to avoid rate limits)
```
