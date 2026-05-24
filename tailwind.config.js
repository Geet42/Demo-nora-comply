/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper:      "#f4f8fd",
        bone:       "#e8f2fc",
        line:       "#c8ddf2",
        line2:      "#aacbec",
        ink:        "#0a1628",
        ink2:       "#2a4a72",
        muted:      "#5c85b8",

        bronze:        "#4a90d9",
        "bronze-deep": "#2563b0",
        "bronze-soft": "#8bb8e8",

        sage:       "#5c9e8a",
        clay:       "#7bafd4",

        glacier: {
          deep:   "#0a1628",
          navy:   "#0f2240",
          mid:    "#1a3a6b",
          blue:   "#2563b0",
          light:  "#4a90d9",
          ice:    "#8bb8e8",
          snow:   "#e8f2fc",
          white:  "#f4f8fd",
          mist:   "#cde0f4",
        },

        coal:       "#070e1c",
        coal2:      "#0d1a30",
        coal3:      "#122040",
        ash:        "#1e3358",
        ash2:       "#2a4470",
        cream:      "#dceeff",
        cream2:     "#9bbce0",
        dim:        "#5a7fa8",

        warn:       "#e0a84a",
        danger:     "#d45a5a",
      },
      fontFamily: {
        sans:    ["'Inter'", "ui-sans-serif", "system-ui"],
        display: ["'Fraunces'", "ui-serif", "Georgia"],
        mono:    ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        soft:  "0 1px 2px rgba(10,22,40,0.04), 0 8px 24px -12px rgba(10,22,40,0.10)",
        lift:  "0 4px 8px rgba(10,22,40,0.06), 0 24px 48px -16px rgba(10,22,40,0.18)",
        card:  "0 1px 0 rgba(10,22,40,0.04), 0 12px 30px -18px rgba(10,22,40,0.10)",
        blue:  "0 4px 20px -4px rgba(37,99,176,0.4)",
      },
      borderRadius: { "2.5xl": "1.25rem" },
    },
  },
  plugins: [],
};
