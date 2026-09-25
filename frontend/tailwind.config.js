/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0F172A",
          700: "#334155",
          500: "#64748B",
        },
        brand: {
          50: "#EFF6FF",
          500: "#0E46A3",
          600: "#0B3782",
        },
        teal: {
          50: "#F0FDFA",
          600: "#0D9488",
          700: "#0F766E",
        },
      },
      fontFamily: {
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.06)",
        lift: "0 10px 40px rgba(14,70,163,0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
