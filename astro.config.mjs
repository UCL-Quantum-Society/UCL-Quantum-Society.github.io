import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless'; // or '@astrojs/vercel/edge'

export default defineConfig({
  output: 'hybrid', // allows static + SSR/ISR
  site: 'https://uclquantumsociety.co.uk/',

  adapter: vercel({}), // serverless runtime on Vercel
});
