import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import ProfileCard from '@/components/ProfileCard';
import { getProfile, profiles } from '@/lib/profile';

// Only the profiles defined in the registry are valid; any other path 404s.
export const dynamicParams = false;

export const viewport: Viewport = { themeColor: '#0a0a0a' };

export function generateStaticParams() {
  return Object.keys(profiles).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = getProfile(slug);
  if (!profile) return {};
  return {
    title: `${profile.name} · ${profile.company}`,
    description: profile.tagline ?? `${profile.role} · ${profile.company}`,
    // Per-profile manifest so an install opens THIS person's page.
    manifest: `/api/manifest?slug=${slug}`,
    appleWebApp: {
      capable: true,
      title: profile.name,
      statusBarStyle: 'black-translucent',
    },
    icons: {
      icon: '/icon-192.png',
      apple: '/apple-touch-icon.png',
    },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = getProfile(slug);
  if (!profile) notFound();
  return <ProfileCard profile={profile} />;
}
