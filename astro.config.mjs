import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless'; // or '@astrojs/vercel/edge'

export default defineConfig({
  output: 'static' | 'server',
  site: 'https://uclquantumsociety.co.uk/',

  adapter: vercel({}), // serverless runtime on Vercel
});
