import { buildContactVCard } from '@/lib/profile';

// Builds a .vcf on the fly from the details a visitor submitted via the
// "Share your details" form. The lead-notification email contains a link to
// this route, so the card owner can one-tap save the person to their phone.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name')?.trim();
  if (!name) {
    return new Response('Missing name', { status: 400 });
  }
  const vcard = buildContactVCard({
    name,
    email: searchParams.get('email')?.trim() || undefined,
    phone: searchParams.get('phone')?.trim() || undefined,
    company: searchParams.get('company')?.trim() || undefined,
  });
  const filename =
    name.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '') || 'contact';
  return new Response(vcard, {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}.vcf"`,
    },
  });
}
