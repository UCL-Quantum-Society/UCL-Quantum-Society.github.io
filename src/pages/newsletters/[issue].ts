// src/pages/newsletters/[issue].ts
import type { APIRoute } from 'astro';
import { fetchNewsletterURL } from '../../lib/strapi';

const STRAPI_URL = import.meta.env.STRAPI_URL!;
const STRAPI_API_TOKEN = import.meta.env.STRAPI_API_TOKEN!;

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  // Get the issue number from the URL
  const issue = params.issue!;
  const url = await fetchNewsletterURL(issue);

  // Redirect to the PDF URL
  const headers = new Headers({
    'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    Location: url.toString(),
  });
  return new Response(null, { status: 302, headers });
};
