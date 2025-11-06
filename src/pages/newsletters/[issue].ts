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

export const GET: APIRoute = async ({ params, request }) => {
  const issue = params.issue ?? '';

  try {
    // Your helper that resolves to the actual Strapi file URL.
    const url = await fetchNewsletterURL(issue);

    // Optional: get a nice human filename (e.g., "UCLQ-Newsletter-42.pdf")
    // If you already have this in Strapi, use it; otherwise hardcode a pattern.
    const fileName = `newsletter-${issue}.pdf`;

    // Forward Range header for streaming/seek support in browsers
    const range = request.headers.get('range') ?? undefined;

    // If your Strapi file is private, include the Bearer token here
    const upstream = await fetch(url, {
      headers: {
        ...(range ? { Range: range } : {}),
      },
    });

    if (upstream.status === 404) {
      return new Response(notFoundHtml(issue), {
        status: 404,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      });
    }

    // Copy important headers from Strapi, but override what we need
    const headers = new Headers(upstream.headers);

    // Force correct content type (Strapi usually sets this already)
    headers.set('Content-Type', 'application/pdf');

    // Nice filename; "inline" so it opens in-browser, "attachment" to force download
    headers.set('Content-Disposition', `inline; filename="${fileName.replace(/"/g, '')}"`);

    // Hide origin by removing any Location header and cross origin leaks
    headers.delete('Location');

    // Cache at the edge but allow background revalidation
    headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');

    // Ensure range support headers pass through
    // (Strapi/your storage should already send Accept-Ranges, Content-Range, Content-Length on 206)
    // Just don’t strip them.

    return new Response(upstream.body, {
      status: upstream.status, // 200 or 206 if range
      headers,
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
