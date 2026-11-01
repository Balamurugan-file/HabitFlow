import React from "react";
import { motion } from "framer-motion";
export default function Button3D({ children, onClick, variant = "primary", className = "", type = "button", disabled = false }) {
  return <motion.button type={type} disabled={disabled} onClick={onClick}
    whileHover={disabled ? {} : { y: -3, scale: 1.015 }}
    whileTap={disabled ? {} : { y: 2, scale: .98 }}
    transition={{ type: "spring", stiffness: 420, damping: 18 }}
    className={`btn3d btn-${variant} ${className}`}>
    {children}
  </motion.button>;
}
