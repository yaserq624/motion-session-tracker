# Motion Session Tracker

Motion Session Tracker is my individual ED2 web app, inspired by our Human Joint Keypoint Estimation senior project. It organizes sample motion recording sessions and tracks whether each session is planned, recorded, or reviewed. This is a session planning prototype; it does not analyze video or estimate joint positions.

**Live app:** https://yaser-motion-session-tracker.netlify.app

**Demo video (unlisted YouTube):** ADD_VIDEO_LINK_HERE

## Features

- Register, log in, and log out
- Create a motion session with a title, activity, date, status, and notes
- View saved sessions and refresh the list
- Edit or delete a session
- Keep each user's sessions separate with database access rules

Use only sample or non-identifying information. This prototype is not intended for patient records.

## Technologies

- HTML, CSS, and JavaScript for the interface
- Vite for local development and building the site
- Supabase Authentication for accounts
- Supabase Postgres for storing sessions
- Row Level Security policies so users can access only their own sessions
- Git and GitHub for version control
- Netlify for deployment

I used AI assistance to create the initial code and documentation, then configured the database and deployment, tested the features, and managed the GitHub repository.

## How to run locally

1. Clone this repository and open it in a terminal.
2. Run `npm install`.
3. Create a Supabase project and run the SQL in `schema.sql` using its SQL Editor.
4. Copy `.env.example` to a new file named `.env`.
5. Put your Supabase Project URL and publishable key in `.env` using the variable names shown in `.env.example`. Do not use a secret or service-role key.
6. Run `npm run dev` and open the local URL shown in the terminal.

The `.env` file is excluded from GitHub. The deployed app uses the same two variable names in Netlify's environment settings.

## Database and access control

The `sessions` table stores the session title, activity, date, status, notes, creation time, and the ID of the user who created it. The policies in `schema.sql` restrict reading, creating, editing, and deleting records to the signed-in owner.

## Project files

- `src.js` — registration, login, logout, and session operations
- `style.css` — page design and responsive layout
- `schema.sql` — database table and access policies
- `index.html` — page entry point
- `package.json` — dependencies and development commands

## Demo

The unlisted video linked above shows the deployed app, account access, creating and managing sessions, data persistence, the Supabase table, and a short walkthrough of the project files.
