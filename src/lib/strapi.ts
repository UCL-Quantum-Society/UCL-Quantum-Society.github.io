// src/lib/strapi.ts
const STRAPI_URL = import.meta.env.STRAPI_URL?.replace(/\/$/, '') || '';
const STRAPI_API_TOKEN = import.meta.env.STRAPI_API_TOKEN;

export type StrapiFile = {
  data: null | {
    id: number;
    attributes: { url: string; name: string; mime: string };
  };
};

export type Newsletter = {
  id: number;
  documentId: string;
  Name: string;
  Release_Date: string; // "YYYY-MM-DD"
  Issue_Number: number;
  PDF?: {
    url: string; // already absolute in your payload
    mime: string;
    name: string;
  } | null;
};

function absoluteUrl(pathOrUrl: string) {
  if (!pathOrUrl) return '';
  return pathOrUrl.startsWith('http') ? pathOrUrl : `${STRAPI_URL}${pathOrUrl}`;
}

export async function fetchNewsletters(): Promise<Newsletter[]> {
  const params = new URLSearchParams({
    'sort[0]': 'Release_Date:desc',
    'populate[0]': 'PDF',
    publicationState: 'live',
    'pagination[pageSize]': '20',
  });

  const res = await fetch(`${STRAPI_URL}/api/newsletters?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Strapi fetch failed: ${res.status} ${text}`);
  }
  const json = await res.json();
  return json.data as Newsletter[];
}

export function getPdfUrl(n: Newsletter) {
  const url = n.PDF?.url || '';
  return absoluteUrl(url);
}
