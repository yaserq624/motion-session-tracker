# Motion Session Tracker

A small ED2 prototype for the Human Joint Keypoint Estimation project. Users can register, log in, create motion session records, view them, edit them, delete them, and log out. Each user sees only their own records. This is a planning tracker, not a motion estimation system or a medical record application. Use sample or non-identifying data.

**Deployed app:** Add your Netlify URL here after deployment.

**Unlisted demo video:** Add your YouTube URL here after uploading.

## Technologies

Vite, vanilla JavaScript, CSS, Supabase Auth and Postgres with Row Level Security, GitHub, Netlify. AI assisted the initial code and documentation; the student should review, configure, test, and explain the result.

## Setup

1. Create a free Supabase project. Open **SQL Editor**, paste `schema.sql`, and run it once.
2. In **Project Settings → API**, copy the **Project URL** and **publishable key** (or legacy anon key). Never copy a `service_role` or secret key into this frontend.
3. Copy `.env.example` to `.env`, replacing its two placeholders. `.env` is ignored by Git.
4. Install Node.js, then run `npm install` and `npm run dev`. Open the local URL printed by Vite.
5. Register with an email and password. Depending on the Supabase project's email confirmation setting, confirm the email before login. Create, refresh, edit, and delete a sample session.
6. Run `npm run build` to create `dist/`.

## Deploy

Create a Netlify site from the public GitHub repo. Set build command `npm run build` and publish directory `dist`. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` under the site's environment variables, then deploy. The publishable key is designed for browser use; data access is restricted by the SQL policies. In Supabase **Authentication → URL Configuration**, set the Site URL to the deployed Netlify URL and add it as a redirect URL so email confirmation returns to the deployed site. Test registration, login, CRUD, and logout on the deployed site.

## Database design

`sessions` stores title, activity, date, status, notes, owner ID, and created time. Four Row Level Security policies limit select, insert, update, and delete to the signed in owner. The browser never uses an admin key.

## Demo outline (3–5 minutes)

- Show the deployed Netlify URL and explain the project idea.
- Register a demo user and confirm email if required, then log in.
- Create a sample session, refresh to show persistence, edit its status, then delete it.
- Show the `sessions` table in Supabase and explain that each user sees their own rows.
- Briefly show `src.js`, `style.css`, `schema.sql`, and the README on GitHub, then log out.

## Submission

Paste the **public GitHub repository URL** into Canvas. Check that the README has both the deployed app URL and the unlisted YouTube demo URL.
