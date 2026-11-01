# HabitFlow — Habit Tracker

A responsive habit-tracking dashboard built with React + Vite + JavaScript, Tailwind CSS, Supabase, Recharts, Framer Motion and Three.js.

## 1. Requirements

Install:
- Node.js 20.19+ (or a current supported LTS version)
- VS Code
- A Supabase account (optional while exploring demo mode)

## 2. Features

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

## 3. Important implementation notes

- Habit score is calculated as completed days divided by the total number of calendar days in the selected month (for example, 20/30 days = 67%). Pending and missed days remain part of the monthly denominator.
- Overall completion is the total completed habit-days divided by (number of habits × calendar days in the month). A day is completed only when every habit is done; missed only when every habit is missed; otherwise it is pending.
- Weekly habits are currently tracked with the same date-level interaction as daily habits. Weekly goal scheduling can be added as a next enhancement.
- Supabase stores habits and entries per authenticated user. The demo mode stores data in React state only; refreshing the page resets demo changes.
- Password minimum is 6 characters in the included sign-up form.
- The Three.js scene is decorative and automatically adapts to the viewport; it is not required for tracking functionality.

## 4. Project structure

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
