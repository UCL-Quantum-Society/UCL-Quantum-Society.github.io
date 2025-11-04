// src/pages/newsletters/[issue].ts
import type { APIRoute } from 'astro';
import { fetchNewsletterURL } from '../../lib/strapi';

export const prerender = false;

const notFoundHtml = (issue: string) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Newsletter Not Found</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root { color-scheme: light dark; }
      body { margin:0; padding:2rem; font:16px/1.5 system-ui,-apple-system,Segoe UI,Roboto; }
      .wrap { max-width:720px; margin:auto; }
      h1 { margin:0 0 .5rem; font-size:1.5rem; }
      p { margin:.25rem 0; opacity:.85; }
      a { text-decoration:underline; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <h1>Issue not found</h1>
      <p>We couldn’t find newsletter issue <strong>${issue}</strong>.</p>
      <p><a href="/">Back Home</a></p>
    </div>
  </body>
</html>`;

export const GET: APIRoute = async ({ params }) => {
  const issue = params.issue ?? '';

  try {
    const url = await fetchNewsletterURL(issue);

    return new Response(null, {
      status: 302,
      headers: {
        Location: url.toString(),
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch {
    return new Response(notFoundHtml(issue), {
      status: 404,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }
};
