'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Globe,
  CalendarDays,
  PlayCircle,
  Instagram,
  UserPlus,
  Link as LinkIcon,
  QrCode,
  Share2,
  X,
  Check,
} from 'lucide-react';
import Logo from '@/components/Logo';
import { melina, type ProfileLink } from '@/lib/profile';

const ICONS = {
  globe: Globe,
  calendar: CalendarDays,
  play: PlayCircle,
  instagram: Instagram,
  contact: UserPlus,
  link: LinkIcon,
} as const;

export default function MelinaProfile() {
  const profile = melina;
  const [pageUrl, setPageUrl] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    // The QR + share always target THIS page, so the URL is whatever domain
    // the page is served from — no hardcoded host needed.
    setPageUrl(window.location.origin + profile.slug);
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, [profile.slug]);

  // Generate the QR image lazily, only once the user opens the panel.
  useEffect(() => {
    if (!showQr || !pageUrl || qrDataUrl) return;
    let cancelled = false;
    import('qrcode').then((QRCode) => {
      QRCode.toDataURL(pageUrl, {
        width: 640,
        margin: 1,
        color: { dark: '#0a0a0a', light: '#ffffff' },
      }).then((url) => {
        if (!cancelled) setQrDataUrl(url);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [showQr, pageUrl, qrDataUrl]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} · ${profile.company}`,
          text: `Connect with ${profile.name} at ${profile.company}`,
          url: pageUrl,
        });
      } catch {
        /* user dismissed the share sheet — nothing to do */
      }
    }
  }, [pageUrl, profile.name, profile.company]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — ignore */
    }
  }, [pageUrl]);

  const initials = profile.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center px-5 py-10">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Brand */}
        <Logo className="h-10 w-auto mb-8" />

        {/* Avatar */}
        <div className="h-28 w-28 rounded-full overflow-hidden ring-2 ring-neutral-800 bg-black flex items-center justify-center mb-5">
          {profile.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar}
              alt={profile.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-3xl font-semibold text-neutral-400">{initials}</span>
          )}
        </div>

        {/* Identity */}
        <h1 className="text-2xl font-semibold tracking-tight">{profile.name}</h1>
        <p className="text-neutral-400 mt-1">{profile.tagline ?? `${profile.role} · ${profile.company}`}</p>

        {/* Links */}
        <div className="w-full mt-8 flex flex-col gap-3">
          {profile.links.map((link) => (
            <ProfileButton key={link.id} link={link} />
          ))}
        </div>

        {/* Share actions */}
        <div className="w-full mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowQr(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900 py-3 text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            <QrCode className="h-4 w-4" /> Show QR
          </button>
          {canShare ? (
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900 py-3 text-sm font-medium hover:bg-neutral-800 transition-colors"
            >
              <Share2 className="h-4 w-4" /> Share
            </button>
          ) : (
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900 py-3 text-sm font-medium hover:bg-neutral-800 transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <LinkIcon className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy link'}
            </button>
          )}
        </div>

        <p className="text-xs text-neutral-600 mt-10">Tap. Connect. — Bait Tap App</p>
      </div>

      {/* QR overlay */}
      {showQr && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
          onClick={() => setShowQr(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-xs flex flex-col items-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQr(false)}
              className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-700"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <p className="text-neutral-900 font-semibold mb-1">Scan to connect</p>
            <p className="text-neutral-500 text-xs mb-4 text-center">
              Point any phone camera at this code
            </p>
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="QR code" className="w-56 h-56" />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-neutral-400 text-sm">
                Generating…
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function ProfileButton({ link }: { link: ProfileLink }) {
  const Icon = ICONS[link.icon] ?? LinkIcon;
  const isExternal = link.href.startsWith('http');
  const isVCard = link.href === 'vcard';
  const href = isVCard ? '/api/vcard' : link.href;

  const base =
    'flex items-center gap-4 w-full rounded-2xl px-5 py-4 transition-colors border';
  const styles = link.primary
    ? 'bg-white text-neutral-900 border-white hover:bg-neutral-200'
    : 'bg-neutral-900 text-neutral-100 border-neutral-800 hover:bg-neutral-800';

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={`${base} ${styles}`}
    >
      <Icon className={`h-6 w-6 shrink-0 ${link.primary ? 'text-neutral-900' : 'text-neutral-300'}`} />
      <span className="flex flex-col">
        <span className="font-semibold leading-tight">{link.label}</span>
        {link.description && (
          <span className={`text-sm ${link.primary ? 'text-neutral-600' : 'text-neutral-400'}`}>
            {link.description}
          </span>
        )}
      </span>
    </a>
  );
}
