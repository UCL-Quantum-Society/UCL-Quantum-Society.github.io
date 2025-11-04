import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'static' | 'server',
  site: 'https://uclquantumsociety.co.uk/',

  adapter: vercel(),
});
