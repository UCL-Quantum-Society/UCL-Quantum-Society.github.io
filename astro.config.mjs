import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "static",
  site: "http://uclquantumsociety.co.uk/",

  vite: {
    plugins: [tailwindcss()],
  },
});
