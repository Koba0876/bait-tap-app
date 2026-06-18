// Bait Tap App — Melina's tap-to-share profile configuration.
//
// This is the ONE place to edit Melina's links and contact details.
// After changing anything here, redeploy. The physical NFC cards and the
// on-screen QR code both point at the SAME page, so you never need to
// reprogram a card just because a link changed — only edit it here.

export interface ProfileLink {
  /** Stable id, used for React keys. */
  id: string;
  /** Button label shown to the person tapping. */
  label: string;
  /** Short helper line under the label. */
  description?: string;
  /** lucide-react icon name handled in the page. */
  icon: 'globe' | 'calendar' | 'play' | 'contact' | 'link';
  /**
   * Destination. Use a full https:// URL for external links, a leading "/"
   * for internal pages (e.g. the booking page), or the special value
   * "vcard" to trigger the save-to-contacts download.
   */
  href: string;
  /** Highlight as the primary call-to-action. */
  primary?: boolean;
}

export interface Profile {
  /** URL path this profile lives at, e.g. "/melina". NFC cards point here. */
  slug: string;
  name: string;
  role: string;
  company: string;
  /** Short tagline under the name. */
  tagline?: string;
  /** Optional avatar image in /public. Falls back to initials if omitted. */
  avatar?: string;
  links: ProfileLink[];
  /** Used to build the downloadable contact card (.vcf). */
  contact: {
    firstName: string;
    lastName?: string;
    organization: string;
    title: string;
    email?: string;
    phone?: string;
    website?: string;
  };
}

// ---------------------------------------------------------------------------
// EDIT BELOW — replace the placeholder values with Melina's real details.
// Lines marked TODO are placeholders that should be confirmed before use.
// ---------------------------------------------------------------------------

export const melina: Profile = {
  slug: '/',
  name: 'Melina Mignani',
  role: 'Producer',
  company: 'Bait Society',
  tagline: 'Producer · Bait Society',
  avatar: '/Logo_Bird_BS_480.png',
  links: [
    {
      id: 'website',
      label: 'Bait Society',
      description: 'Visit our website',
      icon: 'globe',
      href: 'https://www.baitsociety.ai',
      primary: true,
    },
    {
      id: 'reel',
      label: 'Showreel',
      description: 'Watch our latest work',
      icon: 'play',
      href: '/reel',
    },
    {
      id: 'book',
      label: 'Book a meeting',
      description: 'Find a time on the calendar',
      icon: 'calendar',
      // Booking lives in the separate scheduler app — edit this to your URL.
      href: 'https://meeting-scheduler-bait-society.netlify.app/meeting',
    },
    {
      id: 'contact',
      label: 'Save my contact',
      description: 'Add Melina to your phone',
      icon: 'contact',
      href: 'vcard',
    },
  ],
  contact: {
    firstName: 'Melina',
    lastName: 'Mignani',
    organization: 'Bait Society',
    title: 'Producer',
    email: 'melina@baitsociety.ai',
    phone: '+39 329 106 1147',
    website: 'https://www.baitsociety.ai',
  },
};

/** Build an RFC-6350 vCard (.vcf) string from a profile's contact details. */
export function buildVCard(profile: Profile): string {
  const { contact, name } = profile;
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${contact.lastName ?? ''};${contact.firstName};;;`,
    `FN:${name}`,
    `ORG:${contact.organization}`,
    `TITLE:${contact.title}`,
  ];
  if (contact.email) lines.push(`EMAIL;TYPE=WORK:${contact.email}`);
  if (contact.phone) lines.push(`TEL;TYPE=CELL:${contact.phone}`);
  if (contact.website) lines.push(`URL:${contact.website}`);
  lines.push('END:VCARD');
  return lines.join('\r\n');
}
