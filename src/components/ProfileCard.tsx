'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Globe,
  CalendarDays,
  PlayCircle,
  Instagram,
  MessageCircle,
  UserPlus,
  Link as LinkIcon,
  QrCode,
  Share2,
  Download,
  X,
  Check,
} from 'lucide-react';
import Logo from '@/components/Logo';
import ConnectForm from '@/components/ConnectForm';
import type { Profile, ProfileLink } from '@/lib/profile';

const ICONS = {
  globe: Globe,
  calendar: CalendarDays,
  play: PlayCircle,
  instagram: Instagram,
  whatsapp: MessageCircle,
  contact: UserPlus,
  link: LinkIcon,
} as const;

export default function ProfileCard({ profile }: { profile: Profile }) {
  // URL slug segment without the leading slash, e.g. "melina".
  const slug = profile.slug.replace(/^\//, '');
  const [pageUrl, setPageUrl] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<{
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: string }>;
  } | null>(null);

  useEffect(() => {
    // The QR + share always target THIS page, so the URL is whatever domain
    // the page is served from — no hardcoded host needed.
    setPageUrl(window.location.origin + profile.slug);
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, [profile.slug]);

  // Make the card installable: register the service worker (Android requires
  // one before offering "Add to Home Screen") and capture the install prompt
  // so the Install button can fire it.
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(
        e as unknown as {
          prompt: () => Promise<void>;
          userChoice: Promise<{ outcome: string }>;
        },
      );
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

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

  const handleInstall = useCallback(async () => {
    // Android / desktop Chrome: fire the real install prompt.
    if (installPrompt) {
      await installPrompt.prompt();
      try {
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') setInstallPrompt(null);
      } catch {
        /* user dismissed — nothing to do */
      }
      return;
    }
    // iOS Safari has no install API — guide the user through the Share sheet.
    // Other desktop browsers: fall back to the bookmark shortcut.
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isIOS) {
      setHint('To add to your Home Screen: tap the Share button, then “Add to Home Screen.”');
    } else {
      const isMac = /Mac/.test(navigator.platform);
      setHint(`To save this page, press ${isMac ? '⌘' : 'Ctrl'} + D to bookmark it.`);
    }
    setTimeout(() => setHint(null), 6000);
  }, [installPrompt]);

  const initials = profile.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="relative h-[100svh] overflow-hidden bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center px-5 py-[clamp(0.75rem,3svh,1.75rem)]">
      {/* Soft atmospheric glow — adds depth without taking vertical space */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(255,255,255,0.07),transparent_55%)]"
      />

      <div className="relative w-full max-w-sm flex flex-col items-center gap-[clamp(0.5rem,1.8svh,1rem)]">
        {/* Avatar */}
        <div className="h-[clamp(4rem,11svh,5.25rem)] w-[clamp(4rem,11svh,5.25rem)] rounded-full overflow-hidden ring-2 ring-neutral-800 bg-black flex items-center justify-center">
          {profile.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar}
              alt={profile.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-2xl font-semibold text-neutral-400">{initials}</span>
          )}
        </div>

        {/* Identity */}
        <div className="flex flex-col items-center text-center">
          <h1 className="text-[clamp(1.15rem,2.6svh,1.5rem)] font-semibold tracking-tight leading-none">
            {profile.name}
          </h1>
          <p className="text-[clamp(0.8rem,1.7svh,0.9rem)] text-neutral-400 mt-1">
            {profile.tagline ?? `${profile.role} · ${profile.company}`}
          </p>
        </div>

        {/* Links — "Share your details" leads the list */}
        <div className="w-full flex flex-col gap-2">
          <ConnectForm
            recipientFirstName={profile.nickname ?? profile.name.split(' ')[0]}
            profileName={profile.name}
            formName={`connect-${slug}`}
          />
          {profile.links.map((link) => (
            <ProfileButton
              key={link.id}
              link={link}
              vcardHref={`/api/vcard?slug=${slug}`}
            />
          ))}
        </div>

        {/* Share actions */}
        <div className="w-full grid grid-cols-3 gap-2">
          <button
            onClick={() => setShowQr(true)}
            className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-neutral-700 bg-neutral-900/80 px-2 py-2.5 text-[13px] font-medium hover:bg-neutral-800 transition-colors"
          >
            <QrCode className="h-4 w-4 shrink-0" /> Show QR
          </button>
          {canShare ? (
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-neutral-700 bg-neutral-900/80 px-2 py-2.5 text-[13px] font-medium hover:bg-neutral-800 transition-colors"
            >
              <Share2 className="h-4 w-4 shrink-0" /> Share
            </button>
          ) : (
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-neutral-700 bg-neutral-900/80 px-2 py-2.5 text-[13px] font-medium hover:bg-neutral-800 transition-colors"
            >
              {copied ? <Check className="h-4 w-4 shrink-0 text-green-400" /> : <LinkIcon className="h-4 w-4 shrink-0" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
          <button
            onClick={handleInstall}
            className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-neutral-700 bg-neutral-900/80 px-2 py-2.5 text-[13px] font-medium hover:bg-neutral-800 transition-colors"
          >
            <Download className="h-4 w-4 shrink-0" /> Install
          </button>
        </div>

        {/* Brand mark — at the bottom */}
        <div className="flex flex-col items-center gap-1">
          <Logo className="h-[clamp(1.1rem,2.8svh,1.5rem)] w-auto opacity-90" />
          <p className="text-[11px] tracking-wide text-neutral-600">Tap. Connect. — Bait Tap App</p>
        </div>
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

      {/* Install / save hint toast (iOS A2HS steps, or desktop bookmark shortcut) */}
      {hint && (
        <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-6 pointer-events-none">
          <div className="pointer-events-auto max-w-xs rounded-xl bg-white text-neutral-900 text-sm font-medium px-4 py-3 shadow-lg text-center">
            {hint}
          </div>
        </div>
      )}
    </main>
  );
}

function ProfileButton({ link, vcardHref }: { link: ProfileLink; vcardHref: string }) {
  const Icon = ICONS[link.icon] ?? LinkIcon;
  const isExternal = link.href.startsWith('http');
  const isVCard = link.href === 'vcard';
  const href = isVCard ? vcardHref : link.href;

  const base =
    'flex items-center gap-3 w-full rounded-xl px-4 py-[clamp(0.5rem,1.4svh,0.7rem)] transition-colors border';
  const styles = link.primary
    ? 'bg-white text-neutral-900 border-white hover:bg-neutral-200'
    : 'bg-neutral-900/80 text-neutral-100 border-neutral-800 hover:bg-neutral-800';

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={`${base} ${styles}`}
    >
      <Icon className={`h-5 w-5 shrink-0 ${link.primary ? 'text-neutral-900' : 'text-neutral-300'}`} />
      <span className="flex flex-col">
        <span className="font-semibold text-[15px] leading-tight">{link.label}</span>
        {link.description && (
          <span className={`text-xs leading-tight ${link.primary ? 'text-neutral-600' : 'text-neutral-400'}`}>
            {link.description}
          </span>
        )}
      </span>
    </a>
  );
}
