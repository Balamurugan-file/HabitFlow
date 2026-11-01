import React, { useEffect, useMemo, useState } from "react";

import {
  Activity,
  ArrowDownToLine,
  Award,
  BarChart3,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Flame,
  LayoutGrid,
  LogOut,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  X,
  RotateCcw,
  Pencil,
  Trash2,
  Moon,
  Sun,
  Zap,
} from "lucide-react";
import { addMonths, format, startOfMonth, subMonths } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { supabase, isSupabaseConfigured } from "./lib/supabase";
import { dateKey, getMonthDays, completionRate } from "./lib/utils";
import Auth from "./components/Auth";
import HabitDialog from "./components/HabitDialog";
import Button3D from "./components/Button3D";
import StatCard from "./components/StatCard";
import ThreeScene from "./components/ThreeScene";

const seedHabits = [
  {
    id: "h1",
    name: "Read Books",
    category: "Learning",
    frequency: "Daily",
    target: "20 pages",
    icon: "📚",
    color: "#F4A62A",
  },
  {
    id: "h2",
    name: "Read Newspaper",
    category: "Learning",
    frequency: "Daily",
    target: "15 minutes",
    icon: "📰",
    color: "#3999E8",
  },
  {
    id: "h3",
    name: "Listen Podcast",
    category: "Learning",
    frequency: "Daily",
    target: "20 minutes",
    icon: "🎧",
    color: "#A855F7",
  },
  {
    id: "h4",
    name: "Watch English Video",
    category: "Learning",
    frequency: "Daily",
    target: "20 minutes",
    icon: "🎥",
    color: "#10B981",
  },
  {
    id: "h5",
    name: "Learn New Skill",
    category: "Learning",
    frequency: "Weekly",
    target: "1 session",
    icon: "🧠",
    color: "#6366F1",
  },
  {
    id: "h6",
    name: "Drink Water (2L)",
    category: "Health",
    frequency: "Daily",
    target: "2 litres",
    icon: "💧",
    color: "#F43F5E",
  },
  {
    id: "h7",
    name: "No Social Media (1hr)",
    category: "Personal",
    frequency: "Daily",
    target: "1 hour",
    icon: "📵",
    color: "#F97316",
  },
  {
    id: "h8",
    name: "Sleep Before 11 PM",
    category: "Health",
    frequency: "Daily",
    target: "Before 11 PM",
    icon: "🌙",
    color: "#3B82F6",
  },
];
const statusCycle = ["done", "missed", "pending"];
const statusLabel = {
  done: "Done",
  missed: "Missed",
  pending: "Pending",
  hold: "On hold",
};
const colors = [
  "#766BFF",
  "#21C6A8",
  "#FFB84D",
  "#FF719A",
  "#45A3E8",
  "#A78BFA",
];
const today = new Date();

function App() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [demo, setDemo] = useState(!isSupabaseConfigured);
  const [habits, setHabits] = useState(seedHabits);
  const [entries, setEntries] = useState([]);
  const [activeTab, setActiveTab] = useState("matrix");
  const [month, setMonth] = useState(startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState(dateKey(today));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
      setDemo(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, next) => {
        setSession(next);
        setDemo(false);
      },
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) loadData();
  }, [session?.user?.id]);
  async function loadData() {
    const [{ data: h, error: he }, { data: e, error: ee }] = await Promise.all([
      supabase.from("habits").select("*").order("created_at"),
      supabase.from("habit_entries").select("*"),
    ]);
    if (!he && h) setHabits(h);
    if (!ee && e) setEntries(e);
  }
  const monthId = format(month, "yyyy-MM");
  const days = getMonthDays(month);
  const filteredHabits = habits.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase()),
  );
  const entryMap = useMemo(() => {
    const m = new Map();
    entries
      .filter((e) => e.date.startsWith(monthId))
      .forEach((e) => m.set(`${e.habit_id}_${e.date}`, e.status));
    return m;
  }, [entries, monthId]);
  const statusFor = (habitId, date) =>
    entryMap.get(`${habitId}_${date}`) || "pending";
  const monthStatuses = useMemo(() => {
    const perDay = Array.from({ length: days }, (_, i) => {
      const key = `${monthId}-${String(i + 1).padStart(2, "0")}`;
      const statuses = habits.map((h) => statusFor(h.id, key));
      const allDone =
        statuses.length > 0 && statuses.every((s) => s === "done");
      const allMissed =
        statuses.length > 0 && statuses.every((s) => s === "missed");
      return {
        date: key,
        status: allDone ? "done" : allMissed ? "missed" : "pending",
      };
    });
    return perDay;
  }, [habits, entries, monthId, days]);
  const completedDays = monthStatuses.filter((x) => x.status === "done").length;
  const missedDays = monthStatuses.filter((x) => x.status === "missed").length;
  const pendingDays = days - completedDays - missedDays;
  const allRates = habits.map((h) => {
    const doneCount = entries.filter(
      (e) =>
        e.habit_id === h.id &&
        e.date.startsWith(monthId) &&
        e.status === "done",
    ).length;
    return {
      ...h,
      doneCount,
      rate: days ? Math.round((doneCount / days) * 100) : 0,
    };
  });
  const overall =
    habits.length && days
      ? Math.round(
          (allRates.reduce((sum, h) => sum + h.doneCount, 0) /
            (habits.length * days)) *
            100,
        )
      : 0;
  const searchedRates = allRates.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase()),
  );
  const selectedCount = habits.filter(
    (h) => statusFor(h.id, selectedDate) === "done",
  ).length;
  const selectedPct = habits.length
    ? Math.round((selectedCount / habits.length) * 100)
    : 0;
  const topHabits = searchedRates
    .filter((h) => h.rate > 85)
    .sort((a, b) => b.rate - a.rate);
  const needWork = searchedRates
    .filter((h) => h.rate <= 85)
    .sort((a, b) => a.rate - b.rate);
  const chartData = [
    { name: "Done", value: completedDays, color: "#16B88A" },
    { name: "Pending", value: pendingDays, color: "#F5B942" },
    { name: "Missed", value: missedDays, color: "#F15B78" },
  ];

  function notify(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2400);
  }
  async function saveHabit(payload) {
    if (session?.user) {
      if (editing) {
        const { data, error } = await supabase
          .from("habits")
          .update(payload)
          .eq("id", editing.id)
          .select()
          .single();
        if (error) return notify(error.message);
        setHabits((prev) => prev.map((h) => (h.id === editing.id ? data : h)));
      } else {
        const { data, error } = await supabase
          .from("habits")
          .insert({ ...payload, user_id: session.user.id })
          .select()
          .single();
        if (error) return notify(error.message);
        setHabits((prev) => [...prev, data]);
      }
    } else {
      if (editing)
        setHabits((prev) =>
          prev.map((h) => (h.id === editing.id ? { ...h, ...payload } : h)),
        );
      else setHabits((prev) => [...prev, { ...payload, id: `h${Date.now()}` }]);
    }
    setDialogOpen(false);
    setEditing(null);
    notify(editing ? "Habit updated" : "Habit added");
  }
  async function setStatus(habit, date, status) {
    const old = statusFor(habit.id, date);
    const next =
      status ||
      statusCycle[(statusCycle.indexOf(old) + 1) % statusCycle.length];
    const previous = entries.find(
      (e) => e.habit_id === habit.id && e.date === date,
    );
    const optimistic = previous
      ? entries.map((e) => (e.id === previous.id ? { ...e, status: next } : e))
      : [
          ...entries,
          {
            id: `local-${habit.id}-${date}`,
            habit_id: habit.id,
            date,
            status: next,
          },
        ];
    setEntries(optimistic);
    if (session?.user) {
      const payload = {
        habit_id: habit.id,
        date,
        status: next,
        user_id: session.user.id,
      };
      const { data, error } = await supabase
        .from("habit_entries")
        .upsert(payload, { onConflict: "habit_id,date" })
        .select()
        .single();
      if (error) {
        setEntries((prev) =>
          prev.filter((e) => !(e.habit_id === habit.id && e.date === date)),
        );
        notify(error.message);
      } else
        setEntries((prev) => [
          ...prev.filter((e) => !(e.habit_id === habit.id && e.date === date)),
          data,
        ]);
    }
  }
  async function markAllCompleted(date) {
    if (!habits.length) return;
    const rows = habits.map((h) => ({
      id:
        entries.find((e) => e.habit_id === h.id && e.date === date)?.id ||
        `local-${h.id}-${date}`,
      habit_id: h.id,
      date,
      status: "done",
      ...(session?.user ? { user_id: session.user.id } : {}),
    }));
    setEntries((prev) => [
      ...prev.filter(
        (e) => !(e.date === date && habits.some((h) => h.id === e.habit_id)),
      ),
      ...rows,
    ]);
    if (session?.user) {
      const payload = rows.map(({ id, ...row }) => row);
      const { data, error } = await supabase
        .from("habit_entries")
        .upsert(payload, { onConflict: "habit_id,date" })
        .select();
      if (error) {
        notify(`Could not save all habits: ${error.message}`);
        await loadData();
        return;
      }
      setEntries((prev) => [
        ...prev.filter(
          (e) => !(e.date === date && habits.some((h) => h.id === e.habit_id)),
        ),
        ...(data || []),
      ]);
    }
    notify("All habits marked as completed");
  }
  async function deleteHabit(habit) {
    if (!confirm(`Delete "${habit.name}" and its history?`)) return;
    if (session?.user) {
      const { error } = await supabase
        .from("habits")
        .delete()
        .eq("id", habit.id);
      if (error) return notify(error.message);
    }
    setHabits((prev) => prev.filter((h) => h.id !== habit.id));
    setEntries((prev) => prev.filter((e) => e.habit_id !== habit.id));
    notify("Habit deleted");
  }
  async function signOut() {
    if (session) await supabase.auth.signOut();
    setSession(null);
    setDemo(false);
    setHabits(seedHabits);
    setEntries([]);
  }
  function exportExcel() {
    import("xlsx").then((XLSX) => {
      const rows = habits.map((h) => ({
        Habit: h.name,
        Category: h.category,
        Frequency: h.frequency,
        Target: h.target,
        Completion: `${completionRate(h, entries, monthId)}%`,
        ...Object.fromEntries(
          Array.from({ length: days }, (_, i) => [
            `${i + 1}`,
            statusFor(h.id, `${monthId}-${String(i + 1).padStart(2, "0")}`),
          ]),
        ),
      }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(rows),
        "Habit history",
      );
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet([
          {
            Month: format(month, "MMMM yyyy"),
            Habits: habits.length,
            CompletedDays: completedDays,
            PendingDays: pendingDays,
            MissedDays: missedDays,
            Completion: `${overall}%`,
          },
        ]),
        "Summary",
      );
      XLSX.writeFile(wb, `HabitFlow-${monthId}.xlsx`);
    });
  }
  async function exportPdf() {
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF();
    pdf.setFontSize(20);
    pdf.text("HabitFlow — Monthly Report", 15, 20);
    pdf.setFontSize(11);
    pdf.text(format(month, "MMMM yyyy"), 15, 29);
    pdf.text(
      `Habits: ${habits.length}   Overall completion: ${overall}%`,
      15,
      40,
    );
    pdf.text(
      `Completed days: ${completedDays}   Pending: ${pendingDays}   Missed: ${missedDays}`,
      15,
      49,
    );
    let y = 65;
    habits.forEach((h) => {
      pdf.text(`${h.name}  —  ${completionRate(h, entries, monthId)}%`, 15, y);
      y += 8;
      if (y > 280) {
        pdf.addPage();
        y = 20;
      }
    });
    pdf.save(`HabitFlow-${monthId}.pdf`);
  }

  if (!authReady)
    return (
      <div className="loading-screen">
        <div className="loader-orb" />
        Loading HabitFlow...
      </div>
    );
  if (isSupabaseConfigured && !session && !demo)
    return <Auth onDemo={() => setDemo(true)} />;

  return (
    <div className={dark ? "app-shell dark" : "app-shell"}>
      <div className="ambient-bg">
        <div />
        <div />
        <div />
      </div>
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-symbol">
            <Sparkles size={21} />
          </div>
          <div>
            <div className="brand-title">
              Habit<span>Flow</span>
              <em>From 2026</em>
            </div>
            <p>
              Discipline today, a better tomorrow ·{" "}
              <b>Small Habits, Big Changes</b>
            </p>
          </div>
        </div>
        <div className="top-actions">
          <button
            className="month-chip"
            onClick={() => setMonth(subMonths(month, 1))}
          >
            <CalendarDays size={14} />
            {format(month, "MMM yyyy")}
          </button>
          <button
            className="month-chip"
            onClick={() => setMonth(addMonths(month, 1))}
          >
            <CalendarDays size={14} />
            {format(addMonths(month, 1), "MMM yyyy")}
          </button>
          <Button3D
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus size={16} /> Add Habit
          </Button3D>
          <button
            className="icon-btn theme-toggle"
            title="Toggle theme"
            onClick={() => setDark((v) => !v)}
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button className="signout-btn" onClick={signOut}>
            <LogOut size={15} /> {session ? "Sign out" : "Demo"}
          </button>
        </div>
      </header>
      <nav className="nav-row">
        <div className="tabs">
          {[
            ["matrix", "Calendar Matrix", LayoutGrid],
            ["focus", "Daily Focus", Activity],
            ["insights", "Insights & Streaks", BarChart3],
            ["export", "Export", ArrowDownToLine],
          ].map(([id, label, Icon]) => (
            <button
              key={id}
              className={activeTab === id ? "tab active" : "tab"}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
        <label className="search-box">
          <Search size={15} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search habit..."
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X size={13} />
            </button>
          )}
        </label>
      </nav>
      <main className="main-content">
        <section className="stats-grid">
          <StatCard
            label="TOTAL HABITS"
            value={habits.length}
            note="Your daily commitments"
            icon={Target}
            tone="purple"
          />
          <StatCard
            label="COMPLETED DAYS"
            value={completedDays}
            note={`${completedDays} of ${days} days`}
            icon={CheckCircle2}
            tone="green"
          />
          <StatCard
            label="PENDING DAYS"
            value={pendingDays}
            note="Days still in progress"
            icon={Activity}
            tone="amber"
          />
          <StatCard
            label="MISSED DAYS"
            value={missedDays}
            note="A chance to restart"
            icon={Flame}
            tone="rose"
          />
          <div className="overall-card">
            <div className="overall-label">
              OVERALL COMPLETION <TrendingUp size={16} />
            </div>
            <strong>{overall}%</strong>
            <div className="overall-track">
              <span style={{ width: `${overall}%` }} />
            </div>
            <small>Monthly consistency</small>
          </div>
        </section>

        {activeTab === "matrix" && (
          <section className="panel matrix-panel">
            <div className="panel-heading">
              <div>
                <div className="section-kicker">
                  YOUR CONSISTENCY AT A GLANCE
                </div>
                <h2>
                  Daily Habit Matrix{" "}
                  <span className="month-pill">
                    {format(month, "MMMM yyyy")}
                  </span>
                </h2>
                <p>
                  Tap any cell to cycle through <b>Done → Missed → Pending</b>.
                </p>
              </div>
              <div className="legend">
                <span>
                  <i className="dot done" />
                  Done
                </span>
                <span>
                  <i className="dot missed" />
                  Missed
                </span>
                <span>
                  <i className="dot pending" />
                  Pending
                </span>
              </div>
            </div>
            <div className="matrix-wrap">
              <table className="matrix-table">
                <thead>
                  <tr>
                    <th className="num-col">#</th>
                    <th className="habit-col">HABIT NAME</th>
                    <th className="target-col">TARGET</th>
                    <th className="score-col">SCORE & DAYS</th>
                    {Array.from({ length: days }, (_, i) => (
                      <th key={i} className="day-head">
                        <span>
                          {format(
                            new Date(
                              month.getFullYear(),
                              month.getMonth(),
                              i + 1,
                            ),
                            "EEE",
                          )}
                        </span>
                        <b>{i + 1}</b>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredHabits.map((h, index) => (
                    <tr key={h.id}>
                      <td className="num-col">{index + 1}</td>
                      <td className="habit-col">
                        <div className="habit-name-cell">
                          <span
                            className="habit-emoji"
                            style={{ background: `${h.color || "#766BFF"}20` }}
                          >
                            {h.icon || "✨"}
                          </span>
                          <b>{h.name}</b>
                          <span className="row-actions">
                            <button
                              title="Edit"
                              onClick={() => {
                                setEditing(h);
                                setDialogOpen(true);
                              }}
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              title="Delete"
                              onClick={() => deleteHabit(h)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </span>
                        </div>
                      </td>
                      <td className="target-col">
                        <span className="target-pill">{h.frequency}</span>
                      </td>
                      <td className="score-col">
                        <div className="score-summary">
                          <b>{completionRate(h, entries, monthId, days)}%</b>
                          <span>
                            {allRates.find((x) => x.id === h.id)?.doneCount ||
                              0}
                            /{days}d
                          </span>
                        </div>
                        <div className="mini-progress">
                          <span
                            style={{
                              width: `${completionRate(h, entries, monthId, days)}%`,
                            }}
                          />
                        </div>
                      </td>
                      {Array.from({ length: days }, (_, i) => {
                        const key = `${monthId}-${String(i + 1).padStart(2, "0")}`;
                        const st = statusFor(h.id, key);
                        return (
                          <td key={key} className="day-cell">
                            <button
                              aria-label={`${h.name} ${key}: ${statusLabel[st]}`}
                              className={`status-cell ${st}`}
                              onClick={() => setStatus(h, key)}
                            >
                              {st === "done" ? (
                                <Check size={13} />
                              ) : st === "missed" ? (
                                <X size={13} />
                              ) : null}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="panel-foot">
              <span>{habits.length} active habits tracked</span>
              <span>Tip: use Daily Focus to update a selected date.</span>
            </div>
          </section>
        )}

        {activeTab === "focus" && (
          <section className="focus-view">
            <div className="date-picker-panel panel">
              <div>
                <div className="section-kicker">ONE DAY AT A TIME</div>
                <h2>Select Day for {format(month, "MMMM yyyy")}</h2>
              </div>
              <div className="date-strip">
                <button
                  className="date-arrow"
                  onClick={() => setMonth(subMonths(month, 1))}
                >
                  <ChevronLeft size={17} />
                </button>
                {Array.from({ length: days }, (_, i) => {
                  const d = new Date(
                      month.getFullYear(),
                      month.getMonth(),
                      i + 1,
                    ),
                    key = dateKey(d);
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedDate(key)}
                      className={`date-tile ${selectedDate === key ? "selected" : ""}`}
                    >
                      <small>{format(d, "EEE")}</small>
                      <b>{i + 1}</b>
                    </button>
                  );
                })}
                <button
                  className="date-arrow"
                  onClick={() => setMonth(addMonths(month, 1))}
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
            <div className="focus-banner">
              <div>
                <span className="date-badge">{selectedDate}</span>
                <h2>Daily Habit Checklist</h2>
                <p>
                  Completed {selectedCount} of {habits.length} habits (
                  {selectedPct}%)
                </p>
              </div>
              <div className="banner-progress">
                <div>
                  <span style={{ width: `${selectedPct}%` }} />
                </div>
                <Button3D onClick={() => markAllCompleted(selectedDate)}>
                  <Check size={15} /> Mark All as Completed
                </Button3D>
              </div>
            </div>

            <div className="focus-grid">
              {filteredHabits.map((h) => {
                const st = statusFor(h.id, selectedDate);

                return (
                  <article className="focus-card" key={h.id}>
                    <div className="focus-card-top">
                      <div className="focus-habit">
                        <span
                          className="habit-emoji"
                          style={{
                            background: `${h.color || "#766BFF"}20`,
                          }}
                        >
                          {h.icon || "✨"}
                        </span>

                        <div className="focus-habit-info">
                          <b>{h.name}</b>
                          <small>
                            {h.frequency} · Target {h.target || "—"}
                          </small>
                        </div>
                      </div>

                      <span className={`status-badge ${st}`}>
                        {statusLabel[st]}
                      </span>
                    </div>

                    <div className="focus-actions">
                      <Button3D
                        onClick={() => setStatus(h, selectedDate, "done")}
                      >
                        <Check size={14} /> Done
                      </Button3D>

                      <Button3D
                        variant="danger"
                        onClick={() => setStatus(h, selectedDate, "missed")}
                      >
                        <X size={14} /> Missed
                      </Button3D>

                      <Button3D
                        variant="ghost"
                        onClick={() => setStatus(h, selectedDate, "pending")}
                      >
                        <RotateCcw size={14} /> Reset
                      </Button3D>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === "insights" && (
          <section className="insights-view">
            <div className="insights-grid">
              <article className="panel performance-panel">
                <div className="panel-title">
                  <div>
                    <div className="section-kicker">MONTHLY OVERVIEW</div>
                    <h2>
                      <BarChart3 size={19} /> Habit Performance Breakdown
                    </h2>
                    <p>Completion for {format(month, "MMMM yyyy")}</p>
                  </div>
                </div>
                <div className="performance-list">
                  {searchedRates.map((h) => (
                    <div className="performance-item" key={h.id}>
                      <div>
                        <span>{h.name}</span>
                        <b>{h.rate}%</b>
                      </div>
                      <div className="performance-track">
                        <span
                          style={{
                            width: `${h.rate}%`,
                            background: h.color || "#766BFF",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </article>
              <article className="panel monthly-panel">
                <div className="section-kicker">MONTHLY SNAPSHOT</div>
                <h2>
                  <Target size={19} /> Monthly Days Breakdown
                </h2>
                <div className="days-breakdown">
                  <div className="days-breakdown-row completed">
                    <span>Completed Days</span>
                    <b>{completedDays}</b>
                  </div>
                  <div className="days-breakdown-row pending">
                    <span>Pending Days</span>
                    <b>{pendingDays}</b>
                  </div>
                  <div className="days-breakdown-row missed">
                    <span>Missed Days</span>
                    <b>{missedDays}</b>
                  </div>
                </div>
                <div className="monthly-total">
                  Overall monthly completion: <b>{overall}%</b>
                </div>
              </article>
            </div>
            <div className="insight-cards">
              <article className="insight-card top-card">
                <div className="insight-card-title">
                  <Trophy size={19} />
                  <h3>Top Performing Habits</h3>
                  <span className="threshold">Above 85%</span>
                </div>
                {topHabits.length ? (
                  topHabits.map((h) => (
                    <div className="rank-row" key={h.id}>
                      <span>
                        {h.icon} {h.name}
                      </span>
                      <b>{h.rate}%</b>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <Award size={30} />
                    <b>Your next win is waiting</b>
                    <span>
                      Habits appear here when completion is above 85%.
                    </span>
                  </div>
                )}
              </article>
              <article className="insight-card improve-card">
                <div className="insight-card-title">
                  <Zap size={19} />
                  <h3>Need Improvement</h3>
                </div>
                {needWork.length ? (
                  needWork.map((h) => (
                    <div className="rank-row" key={h.id}>
                      <span>
                        {h.icon} {h.name}
                      </span>
                      <b>{h.rate}%</b>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <CheckCircle2 size={30} />
                    <b>Everything is looking great!</b>
                  </div>
                )}
              </article>
              <article className="insight-card streak-card">
                <div className="insight-card-title">
                  <Flame size={19} />
                  <h3>Current Streaks</h3>
                </div>
                {searchedRates.map((h) => (
                  <div className="rank-row" key={h.id}>
                    <span>
                      {h.icon} {h.name}
                    </span>
                    <b>{streakFor(h, entries)} days</b>
                  </div>
                ))}
              </article>
            </div>
          </section>
        )}

        {activeTab === "export" && (
          <section className="panel export-panel">
            <div className="export-heading">
              <div className="export-icon">
                <ArrowDownToLine size={24} />
              </div>
              <div>
                <h2>Export your habit data</h2>
                <p>Download reports for {format(month, "MMMM yyyy")}.</p>
              </div>
            </div>
            <div className="export-stats">
              <div>
                <small>Habits tracked</small>
                <b>{habits.length}</b>
              </div>
              <div>
                <small>Days</small>
                <b>{days}</b>
              </div>
              <div>
                <small>Completion</small>
                <b>{overall}%</b>
              </div>
            </div>
            <div className="export-options">
              <article>
                <div className="file-icon excel">▦</div>
                <h3>Excel Workbook (.xlsx)</h3>
                <p>
                  History and summary sheets, including habit details and daily
                  statuses.
                </p>
                <Button3D onClick={exportExcel}>
                  <ArrowDownToLine size={15} /> Download Excel
                </Button3D>
              </article>
              <article>
                <div className="file-icon pdf">▤</div>
                <h3>PDF Report (.pdf)</h3>
                <p>Printable monthly habit summary and performance overview.</p>
                <Button3D onClick={exportPdf}>
                  <ArrowDownToLine size={15} /> Download PDF
                </Button3D>
              </article>
            </div>
          </section>
        )}
      </main>
      <footer className="footer">
        <span>HabitFlow · Small Habits, Big Changes</span>
        <span>
          <span className="online-dot" />{" "}
          {session
            ? "Synced with Supabase"
            : "Demo mode · Connect Supabase to save your account data"}
        </span>
      </footer>
      <HabitDialog
        open={dialogOpen}
        habit={editing}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSave={saveHabit}
      />
      {toast && (
        <div className="toast">
          <CheckCircle2 size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}

function streakFor(habit, entries) {
  const done = new Set(
    entries
      .filter((e) => e.habit_id === habit.id && e.status === "done")
      .map((e) => e.date),
  );
  let count = 0,
    d = new Date();
  for (let i = 0; i < 365; i++) {
    const key = dateKey(d);
    if (done.has(key)) {
      count++;
      d.setDate(d.getDate() - 1);
    } else if (i === 0) {
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return count;
}
export default App;
