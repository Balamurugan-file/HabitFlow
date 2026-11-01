import React from "react";
import { motion } from "framer-motion";
export default function StatCard({ label, value, note, icon: Icon, tone = "purple" }) {
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
    className={`stat-card tone-${tone}`}>
    <div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={17}/></span></div>
    <div className="stat-value">{value}</div>
    {note && <div className="stat-note">{note}</div>}
  </motion.div>;
}
