<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Cursor Cloud specific instructions

### Stack

TanStack Start (React 19 + Vite 8) with mock experiment data. Supabase is wired for auth routes (`/login`, OAuth consent) but the main workspace screens run without Supabase credentials.

### Commands

- Install: `npm ci`
- Dev server: `npm run dev` (listens on port 8080)
- Production build: `npm run build`
- Lint: `npm run lint` (or `npx eslint .`)

### End-to-end smoke test

1. Start the dev server and open `http://127.0.0.1:8080/`.
2. Confirm the Experiments dashboard lists mock experiments.
3. Click **New Experiment**, fill in a name, and advance through the setup steps (targets → variants → simulation).
4. Open a completed experiment from the dashboard to view mock results.

Optional Supabase secrets (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) are only required to exercise sign-in at `/login`.
