# Project Instructions

## Purpose and Architecture

This repository is a React and TypeScript CV website with a Netlify serverless chat assistant.

- `src/main.tsx` hydrates the prerendered markup and registers the global providers. `src/App.tsx` composes the CV page from its components.
- `src/static/cv.json` supplies the structured CV displayed by the site; its shape is defined in `src/types/cv.ts`.
- The chat UI calls `netlify/functions/chat.ts`. The function embeds questions with Gemini, retrieves up to eight chunks from the Pinecone `cv-docs` namespace, and generates responses with Gemini with Groq as a `GROQ_API_KEY`-configured fallback. MongoDB provides conversation history and rate limiting.
- `data/MASTER_DATA.md` is the source of truth for experience and achievements. `data/SKILLS.md` is the skills reference. `data/CHUNKS.json` is the structured content seeded into Pinecone; see `data/RAG_STRUCTURE.md` for its format and retrieval notes.
- `scripts/seed-pinecone.ts` rebuilds the Pinecone namespace by deleting its current records and uploading embeddings from `data/CHUNKS.json`. Run it only when intentionally refreshing the index.
- `src/components/`, `src/hooks/`, `src/lib/`, and `src/providers/` contain UI, shared hooks/utilities, and app state respectively. `netlify/functions/_lib/` contains server-side database and rate-limit helpers.

When factual CV content changes, update the relevant authored data and each representation that serves it (the website JSON and/or RAG chunks). Keep chunk metadata and IDs aligned with the format in `data/RAG_STRUCTURE.md`.

## Working in This Repository

- Follow the existing React, TypeScript, and Biome conventions. Use tabs in TypeScript files and double quotes; check `biome.json` for the exact rules.
- `yarn.lock` is the dependency lockfile. Use the scripts in `package.json`: `yarn dev` for the Vite app, `npx netlify dev` when working with Netlify functions locally, `yarn build` for type-checking and production build, and `yarn lint` for linting.
- `yarn build` also prerenders the CV: `vite.prerender.config.ts` builds `src/prerender.tsx` for Node and `scripts/prerender.mjs` injects the markup into `dist/index.html`, inlining the stylesheet. Anything the first render depends on must be available at build time and identical on the client: read stored preferences and `window`/`localStorage` only in effects, not during render, and let the bootstrap script in `index.html` apply the stored theme and glass classes before first paint.
- Keep `docx`, `react-markdown`, and Grafana Faro dynamically imported (`src/hooks/use-menu.tsx`, `src/components/chat/message-bubble.tsx`, `src/main.tsx`); importing them statically puts them back on the critical path.
- `yarn seed` requires the configured Gemini and Pinecone credentials and replaces the contents of the `cv-docs` namespace. Do not run it as a routine build or expose credentials in source control.
- Keep server-only credentials and integrations in Netlify functions or scripts; browser code must not receive secrets.
- Before changing a behavior, trace its nearby caller and owner. Prefer the existing component, hook, utility, or function boundary, and preserve the API unless the task requires changing it.

## Keeping These Instructions Current

When a project change makes this file inaccurate or changes a project-wide fact agents rely on, update `AGENTS.md` in the same change. In particular, review it when changing the app entry points or major data flow, data ownership, serverless integrations, deployment/runtime configuration, environment requirements, security boundaries, package scripts, or repository conventions. Ordinary feature, content, and bug-fix work does not require an instruction edit unless it changes one of those facts or establishes a reusable project-wide rule.

Keep this file concise: remove stale guidance, and point to the owning code, config, or documentation instead of copying details that can be looked up there. Before finishing a change that affects project guidance, verify every referenced path and command against the repository.
