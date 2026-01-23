import type { APIRoute } from 'astro';
import { fetchNewsletters } from '../../lib/strapi';

export const prerender = true;

export async function getStaticPaths() {
  const newsletters = await fetchNewsletters();
  const STRAPI_URL = import.meta.env.STRAPI_URL?.replace(/\/$/, '') || '';

  return newsletters
    .map((n: any) => {
      const pdfObj = n.PDF;
      const pdfRawUrl = pdfObj?.url;
      const issueNumber = n.Issue_Number;

      if (!pdfRawUrl || !issueNumber) return null;

      const pdfUrl = pdfRawUrl.startsWith('http') ? pdfRawUrl : `${STRAPI_URL}${pdfRawUrl}`;
      console.log(`[Newsletters] Processing issue ${issueNumber} (id: ${n.id}): ${pdfUrl}`);
      return {
        params: { issue: String(issueNumber) },
        props: { pdfUrl },
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);
}

export const GET: APIRoute = async ({ props }) => {
  const { pdfUrl } = props;

  try {
    const response = await fetch(pdfUrl);

    if (!response.ok) {
      return new Response('Failed to fetch PDF during build', { status: 404 });
    }

    // Read the body as an ArrayBuffer to ensure we have the full content
    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
      },
    });
  } catch (error) {
    console.error(`Error fetching PDF from ${pdfUrl}:`, error);
    return new Response('Error fetching PDF', { status: 500 });
  }
};
