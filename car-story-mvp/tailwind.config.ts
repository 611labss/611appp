import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta concesionario premium
        sand: "#E9E3D7",      // beige cálido base
        bone: "#F4F0E8",      // crema claro
        clay: "#CFC6B6",      // gris cálido medio
        ink: "#1A1714",       // casi negro cálido
        graphite: "#3A352E",  // texto secundario
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
