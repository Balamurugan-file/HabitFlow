/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "Plus Jakarta Sans", "system-ui", "sans-serif"] },
      colors: {
        ink: "#172554", brand: "#635BFF", mint: "#10B981",
        canvas: "#F5F7FF", line: "#E5EAF5"
      },
      boxShadow: {
        soft: "0 12px 35px rgba(39, 55, 110, .08)",
        lift: "0 8px 0 rgba(61, 69, 150, .12), 0 14px 24px rgba(61, 69, 150, .12)"
      }
    }
  },
  plugins: []
};
