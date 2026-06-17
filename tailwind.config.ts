import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202A",
        graphite: "#34404A",
        mist: "#F5F7FA",
        panel: "#FFFFFF",
        line: "#D9E1E8",
        signal: "#1B7F6E",
        cobalt: "#2457A6",
        amber: "#B76E22",
      },
      boxShadow: {
        panel: "0 18px 45px rgba(23, 32, 42, 0.08)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "Segoe UI",
          "Microsoft YaHei",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
