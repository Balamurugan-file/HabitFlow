import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) { return twMerge(clsx(inputs)); }

export function monthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}
export function dateKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
export function completionRate(habit, entries, month, totalDays) {
  const doneCount = entries.filter(e => e.habit_id === habit.id && e.date.startsWith(month) && e.status === "done").length;
  const days = totalDays || (() => {
    const [year, monthNumber] = month.split("-").map(Number);
    return new Date(year, monthNumber, 0).getDate();
  })();
  return days ? Math.round(doneCount / days * 100) : 0;
}
export function getMonthDays(date) {
  const year = date.getFullYear(), month = date.getMonth();
  return new Date(year, month + 1, 0).getDate();
}
