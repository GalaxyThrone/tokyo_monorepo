/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        landing:
          "linear-gradient(0deg, rgba(56, 17, 139, 0.53), rgba(56, 17, 139, 0.53)), url(/brand/landing-bg.jpg)",
        "game-bg":
          "linear-gradient(0deg, rgba(83, 32, 147, 0.5), rgba(83, 32, 147, 0.5)), url(/brand/game.jpeg)",
        "bridge-bg":
          "linear-gradient(0deg, rgba(83, 32, 147, 0.5), rgba(83, 32, 147, 0.5)), url(/brand/bridge.jpeg)",
        "game-bg-2":
          "linear-gradient(0deg, rgba(83, 32, 147, 0.5), rgba(83, 32, 147, 0.5)), url(/brand/game-2.jpeg)",
      },
      fontFamily: {
        russo: ["Russo One"],
        orbitron: ["Orbitron"],
        openSans: ["Open Sans"],
        alienWars: ["Alien Wars"],
      },
    },
  },
  plugins: [],
};
