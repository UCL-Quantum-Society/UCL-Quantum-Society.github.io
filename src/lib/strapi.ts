// src/lib/strapi.ts
const STRAPI_URL = import.meta.env.STRAPI_URL?.replace(/\/$/, '') || '';
const STRAPI_API_TOKEN = import.meta.env.STRAPI_API_TOKEN;

const urlCache = new Map<string, { url: URL; expires: number }>();
const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes

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
  Release_Date: string;
  Issue_Number: number;
  PDF?: {
    url: string;
    mime: string;
    name: string;
  } | null;
};

export type Resource = {
  name: string;
  description: string;
  link: string;
  tags: [ResourceTag];
  type: [ResourceType];
  media?: {
    url: string;
    mime: string;
    name: string;
  } | null;
};

export type ResourceTag = {
  name: string;
};

export type ResourceType = {
  name: string;
};

export async function fetchNewsletterURL(issue: number | string): Promise<URL> {
  // Ensure issue is a string for searchParams
  const issueStr = String(issue);

  // Check cache first
  const cached = urlCache.get(issueStr);
  if (cached && Date.now() < cached.expires) {
    return cached.url;
  }

  // Build the URL to fetch the newsletter
  const url = new URL(`${STRAPI_URL}/api/newsletters`);
  url.searchParams.set('filters[Issue_Number][$eq]', issueStr);
  url.searchParams.set('populate', 'PDF');
  url.searchParams.set('publicationState', 'live');
  url.searchParams.set('pagination[pageSize]', '1');

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
  });
  if (!res.ok) throw new Error('Not found');
  const json = await res.json();
  const item = Array.isArray(json) ? json[0] : json?.data?.[0];

  // Strapi v4: file is usually under item.PDF or item.attributes.PDF
  const pdf = item?.PDF ?? item?.attributes?.PDF;
  const pdfUrl = pdf?.url ?? pdf?.data?.attributes?.url;
  if (!pdfUrl) throw new Error('No PDF');

  const finalUrl = new URL(pdfUrl.startsWith('http') ? pdfUrl : `${STRAPI_URL}${pdfUrl}`);

  // Update cache
  urlCache.set(issueStr, { url: finalUrl, expires: Date.now() + CACHE_DURATION });

  return finalUrl;
}

export async function fetchNewsletters(): Promise<Newsletter[]> {
  const params = new URLSearchParams({
    'sort[0]': 'Issue_Number:desc',
    'populate[0]': 'PDF',
    publicationState: 'live',
    'pagination[pageSize]': '100',
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
  const url = '/newsletters/' + n.Issue_Number;
  return url;
}

export async function fetchResources(): Promise<Resource[]> {
  const params = new URLSearchParams({
    'sort[0]': 'publishedAt:desc',
    'populate[0]': 'media',
    'populate[1]': 'tags',
    'populate[2]': 'type',
    publicationState: 'live',
    'pagination[pageSize]': '100',
  });

  const res = await fetch(`${STRAPI_URL}/api/resources?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Strapi fetch failed: ${res.status} ${text}`);
  }
  const json = await res.json();
  return json.data as Resource[];
}
