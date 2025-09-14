import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "static",
  site: "https://UCL-Quantum-Society.github.io/",

  vite: {
    plugins: [tailwindcss()],
  },
});
