# HabitFlow — Habit Tracker

A responsive habit-tracking dashboard built with React + Vite + JavaScript, Tailwind CSS, Supabase, Recharts, Framer Motion and Three.js.

## 1. Requirements

Install:
- Node.js 20.19+ (or a current supported LTS version)
- VS Code
- A Supabase account (optional while exploring demo mode)

## 2. Open in VS Code

1. Extract `habitflow-tracker.zip`.
2. Open VS Code.
3. Select **File → Open Folder** and choose the extracted `habitflow-tracker` folder.
4. Open Terminal → New Terminal.
5. Run:

```bash
npm install
npm run dev
```

6. Open the local URL shown in the terminal, usually `http://localhost:5173`.

## 3. Connect Supabase backend

### Create a Supabase project
1. Go to https://supabase.com and create a project.
2. In the Supabase project, open **SQL Editor → New query**.
3. Copy all SQL from `supabase/schema.sql`, paste it, and click **Run**.
4. Open **Project Settings → API** (or **API Keys**).
5. Copy your Project URL and the `anon` / publishable key.

### Add environment variables
1. In the project root, copy `.env.example` and rename the copy to `.env`.
2. Add your values:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
```

3. Save `.env`.
4. Stop and restart the Vite server (`Ctrl + C`, then `npm run dev`).

**Important:** Never put a Supabase `service_role` or secret key in a Vite frontend or commit `.env` to GitHub. The anon/publishable key is designed for browser use when Row Level Security is correctly enabled.

### Authentication settings
- In Supabase → Authentication → Providers, ensure Email is enabled.
- For development, you may disable email confirmation temporarily. For a real deployment, keep email confirmation enabled and configure the correct Site URL and Redirect URLs under Authentication → URL Configuration.
- Add your local URL (`http://localhost:5173`) and deployed Vercel URL to allowed redirect URLs.

## 4. Deploy to Vercel

1. Push this folder to a GitHub repository (do not upload `node_modules`, `dist`, or `.env`).
2. In Vercel, import the GitHub repository.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
4. In Vercel → Project → Settings → Environment Variables, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Redeploy after adding variables.

## 5. Features

- Calendar Matrix with Done → Missed → Pending status cycling.
- Daily Focus checklist with selected-day controls.
- Insights, reference-style monthly days breakdown and streak display. The separate consistency-trend chart has been removed.
- Top Performing Habits only includes habits whose calculated completion rate is **greater than 85%** (not 85% exactly). Search filters the Daily Focus and Insights lists. Mark All as Completed updates every habit for the selected date in one batch.
- Need Improvement list includes habits at or below 85%.
- Add, edit and delete habits.
- Excel and PDF monthly exports.
- Supabase email/password authentication and password reset.
- Demo dashboard when Supabase is not configured.
- Responsive desktop, tablet and mobile layout.
- 3D animated orb scene and spring-animated raised buttons.

## 6. Important implementation notes

- Habit score is calculated as completed days divided by the total number of calendar days in the selected month (for example, 20/30 days = 67%). Pending and missed days remain part of the monthly denominator.
- Overall completion is the total completed habit-days divided by (number of habits × calendar days in the month). A day is completed only when every habit is done; missed only when every habit is missed; otherwise it is pending.
- Weekly habits are currently tracked with the same date-level interaction as daily habits. Weekly goal scheduling can be added as a next enhancement.
- Supabase stores habits and entries per authenticated user. The demo mode stores data in React state only; refreshing the page resets demo changes.
- Password minimum is 6 characters in the included sign-up form.
- The Three.js scene is decorative and automatically adapts to the viewport; it is not required for tracking functionality.

## 7. Project structure

```text
habitflow-tracker/
├── public/
├── src/
│   ├── components/
│   │   ├── Auth.jsx
│   │   ├── Button3D.jsx
│   │   ├── HabitDialog.jsx
│   │   ├── StatCard.jsx
│   │   └── ThreeScene.jsx
│   ├── lib/
│   │   ├── supabase.js
│   │   └── utils.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── supabase/schema.sql
├── .env.example
├── package.json
└── README.md
```

## Troubleshooting

- **Supabase not connecting:** check `.env` spelling, values and restart `npm run dev`.
- **Table not found:** run `supabase/schema.sql` in the correct Supabase project.
- **Signup confirmation redirect fails:** configure Site URL and Redirect URLs in Supabase Auth.
- **Vercel shows missing data:** add the two `VITE_` variables in Vercel and redeploy.
- **Build check:** run `npm run build` locally and inspect terminal errors.
