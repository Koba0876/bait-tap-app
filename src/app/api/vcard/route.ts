import { buildVCard, melina } from '@/lib/vistap';

// Returns Melina's contact card so anyone who taps "Save my contact" gets a
// native Add-to-Contacts prompt on iPhone and Android.
export async function GET() {
  const vcard = buildVCard(melina);
  return new Response(vcard, {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': 'attachment; filename="melina.vcf"',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
