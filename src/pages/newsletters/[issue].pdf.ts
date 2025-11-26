import type { APIRoute } from 'astro';
import { fetchNewsletters } from '../../lib/strapi';

export const prerender = true;

export async function getStaticPaths() {
  const newsletters = await fetchNewsletters();
  const STRAPI_URL = import.meta.env.STRAPI_URL?.replace(/\/$/, '') || '';

  return newsletters
    .map((n: any) => {
      // Handle potentially different Strapi versions (flat vs nested attributes)
      const pdfObj = n.PDF;
      const pdfRawUrl = pdfObj?.url;
      const issueNumber = n.Issue_Number;

      if (!pdfRawUrl || !issueNumber) return null;

      const pdfUrl = pdfRawUrl.startsWith('http') ? pdfRawUrl : `${STRAPI_URL}${pdfRawUrl}`;

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

    // Return the PDF body. Astro will save this as the static file content.
    return new Response(response.body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
      },
    });
  } catch (error) {
    console.error(`Error fetching PDF from ${pdfUrl}:`, error);
    return new Response('Error fetching PDF', { status: 500 });
  }
};
