import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Button3D from "./Button3D";

const initial = { name: "", category: "Personal", frequency: "Daily", target: "1", description: "", icon: "✨", color: "#766BFF" };
export default function HabitDialog({ open, onClose, onSave, habit }) {
  const [form, setForm] = useState(initial);
  useEffect(() => { setForm(habit ? { ...initial, ...habit } : initial); }, [habit, open]);
  if (!open) return null;
  const change = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const submit = e => { e.preventDefault(); if (form.name.trim()) onSave({ ...form, name: form.name.trim() }); };
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <form className="dialog" onSubmit={submit}>
      <div className="dialog-head"><div><p className="eyebrow">MAKE IT HAPPEN</p><h2>{habit ? "Edit habit" : "Create a habit"}</h2></div><button type="button" className="icon-btn" onClick={onClose}><X size={18}/></button></div>
      <label>Habit name<input autoFocus value={form.name} onChange={e => change("name", e.target.value)} placeholder="e.g. Read 20 pages" required maxLength={70}/></label>
      <div className="form-grid">
        <label>Category<select value={form.category} onChange={e => change("category", e.target.value)}>{["Personal","Health","Learning","Fitness","Mindfulness","Work","Other"].map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Frequency<select value={form.frequency} onChange={e => change("frequency", e.target.value)}>{["Daily","Weekly"].map(x=><option key={x}>{x}</option>)}</select></label>
      </div>
      <div className="form-grid">
        <label>Daily target<input value={form.target} onChange={e => change("target", e.target.value)} placeholder="e.g. 20 pages"/></label>
        <label>Icon<select value={form.icon} onChange={e => change("icon", e.target.value)}>{["✨","📚","💧","🏃","🧘","🎧","💻","🌱","✍️","🌙","🎯"].map(x=><option key={x}>{x}</option>)}</select></label>
      </div>
      <label>Description<textarea value={form.description || ""} onChange={e => change("description", e.target.value)} placeholder="A small note about this habit..." rows="2"/></label>
      <div className="dialog-actions"><Button3D variant="ghost" onClick={onClose}>Cancel</Button3D><Button3D type="submit">{habit ? "Save changes" : "Add habit"} <span>↗</span></Button3D></div>
    </form>
  </div>;
}
