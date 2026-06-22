import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProfileCard from '@/components/ProfileCard';
import { getProfile, profiles } from '@/lib/profile';

// Only the profiles defined in the registry are valid; any other path 404s.
export const dynamicParams = false;

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
