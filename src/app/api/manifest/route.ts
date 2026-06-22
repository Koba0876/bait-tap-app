import { getProfile } from '@/lib/profile';

// Per-profile web app manifest. Each card links to /api/manifest?slug=<slug>
// so that when someone installs it, the home-screen icon opens THAT person's
// page (e.g. Koba's install opens /koba, not the default).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') ?? 'melina';
  const profile = getProfile(slug);

  const manifest = {
    name: profile ? `${profile.name} · ${profile.company}` : 'Bait Society',
    short_name: profile?.name ?? 'Bait Society',
    description: profile?.tagline ?? 'Tap or scan to connect',
    start_url: profile ? profile.slug : '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
