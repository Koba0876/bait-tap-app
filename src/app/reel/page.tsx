import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Showreel · Bait Society',
};

// Fullscreen Vimeo player. The Showreel button links here so the reel opens
// filling the whole screen and starts playing immediately.
export default function ReelPage() {
  const src =
    'https://player.vimeo.com/video/1162982253?h=e8fb8fffef' +
    '&autoplay=1&title=0&byline=0&portrait=0&playsinline=1';
  return (
    <main className="fixed inset-0 bg-black">
      <iframe
        src={src}
        title="Bait Society Showreel"
        className="absolute inset-0 h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </main>
  );
}
