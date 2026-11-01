import React, { useState } from "react";
import { Sparkles, Mail, Lock, UserRound } from "lucide-react";
import ThreeScene from "./ThreeScene";
import Button3D from "./Button3D";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export default function Auth({ onDemo }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(e) {
    e.preventDefault(); setMessage("");
    if (!isSupabaseConfigured) { setMessage("Add your Supabase URL and anon/publishable key to .env to enable account access."); return; }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
        if (error) throw error;
        setMessage("Account created. Check your email to confirm your address, then sign in.");
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
        if (error) throw error;
        setMessage("Password reset email sent. Check your inbox.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) { setMessage(err.message || "Something went wrong."); }
    finally { setBusy(false); }
  }
  return <main className="auth-screen">
    <ThreeScene/>
    <div className="auth-glow glow-one"/><div className="auth-glow glow-two"/>
    <section className="auth-card">
      <div className="brand-mark"><Sparkles size={22}/></div>
      <div className="brand-name">Habit<span>Flow</span><small>2026 EDITION</small></div>
      <p className="auth-tagline">Small habits. Big changes.</p>
      <div className="auth-heading"><h1>{mode === "login" ? "Welcome back" : mode === "signup" ? "Start your journey" : "Reset password"}</h1><p>{mode === "login" ? "Your next great day starts here." : "Make progress, one day at a time."}</p></div>
      <form onSubmit={submit} className="auth-form">
        {mode === "signup" && <label><UserRound size={17}/><input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" required/></label>}
        <label><Mail size={17}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" required/></label>
        {mode !== "reset" && <label><Lock size={17}/><input type="password" minLength="6" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (minimum 6 characters)" required/></label>}
        {message && <div className="auth-message">{message}</div>}
        <Button3D type="submit" className="auth-submit" disabled={busy}>{busy ? "Please wait..." : mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"} <span>→</span></Button3D>
      </form>
      {mode === "login" && <button className="text-link" onClick={()=>{setMode("reset");setMessage("");}}>Forgot password?</button>}
      <div className="auth-switch">{mode === "login" ? "New to HabitFlow?" : "Already have an account?"} <button onClick={()=>{setMode(mode==="login"?"signup":"login");setMessage("");}}>{mode==="login"?"Create account":"Sign in"}</button></div>
      <div className="auth-divider"><span>OR</span></div>
      <button className="demo-link" onClick={onDemo}>Explore demo dashboard <span>↗</span></button>
      <p className="auth-foot">Private by design · Your habits belong to you</p>
    </section>
  </main>;
}
