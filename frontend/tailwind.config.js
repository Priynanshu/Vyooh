/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        prime: {
          bg:          "#0F171E",
          surface:     "#1A242F",
          elevated:    "#243040",
          border:      "#2F4050",
          accent:      "#00A8E1",
          accentDark:  "#0085B3",
          accentLight: "#33BCEB",
          text:        "#F2F2F2",
          muted:       "#8197A4",
          subtle:      "#536878",
          success:     "#2ECC71",
          warning:     "#F39C12",
          danger:      "#E74C3C",
        },
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"],
        display: ["'Inter'", "sans-serif"],
      },
      backgroundImage: {
        "hero-fade":    "linear-gradient(to right, #0F171E 35%, rgba(15,23,30,0.6) 65%, transparent 100%)",
        "hero-bottom":  "linear-gradient(to top, #0F171E 0%, rgba(15,23,30,0.4) 40%, transparent 100%)",
        "card-fade":    "linear-gradient(to top, #0F171E 0%, rgba(15,23,30,0.8) 40%, transparent 100%)",
        "nav-fade":     "linear-gradient(to bottom, rgba(15,23,30,0.98) 0%, rgba(15,23,30,0) 100%)",
        "prime-accent": "linear-gradient(135deg, #00A8E1 0%, #0085B3 100%)",
      },
      animation: {
        "fade-in":      "fadeIn 0.4s ease-out forwards",
        "slide-up":     "slideUp 0.35s ease-out forwards",
        "slide-right":  "slideRight 0.3s ease-out forwards",
        "scale-in":     "scaleIn 0.25s ease-out forwards",
        "shimmer":      "shimmer 2s infinite linear",
        "pulse-prime":  "pulsePrime 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:     { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp:    { "0%": { opacity: 0, transform: "translateY(16px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        slideRight: { "0%": { opacity: 0, transform: "translateX(-16px)" }, "100%": { opacity: 1, transform: "translateX(0)" } },
        scaleIn:    { "0%": { opacity: 0, transform: "scale(0.95)" }, "100%": { opacity: 1, transform: "scale(1)" } },
        shimmer:    { "0%": { backgroundPosition: "-1000px 0" }, "100%": { backgroundPosition: "1000px 0" } },
        pulsePrime: { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.6 } },
      },
      boxShadow: {
        "prime":       "0 4px 24px rgba(0, 168, 225, 0.15)",
        "prime-hover": "0 8px 32px rgba(0, 168, 225, 0.25)",
        "card":        "0 2px 16px rgba(0, 0, 0, 0.5)",
        "card-hover":  "0 8px 32px rgba(0, 0, 0, 0.7)",
      },
      borderRadius: {
        "prime": "4px",
      },
    },
  },
  plugins: [],
};
