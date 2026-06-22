import { buildVCard, getProfile, melina } from '@/lib/profile';

// Returns a profile's contact card so anyone who taps "Save my contact" gets a
// native Add-to-Contacts prompt on iPhone and Android. The slug picks the
// person (e.g. /api/vcard?slug=koba); defaults to Melina for older links.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') ?? 'melina';
  const profile = getProfile(slug) ?? melina;
  const vcard = buildVCard(profile);
  const filename = (profile.contact.firstName || slug)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
  return new Response(vcard, {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}.vcf"`,
      // Per-slug response — must NOT be CDN-cached (Netlify durable cache keys
      // on path only, so caching would serve one person's card for all slugs).
      'Cache-Control': 'no-store',
    },
  });
}
