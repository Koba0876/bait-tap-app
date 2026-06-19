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
  icon: 'globe' | 'calendar' | 'play' | 'contact' | 'instagram' | 'link';
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
    /** Personal LinkedIn profile URL — shown as a labelled link in the contact. */
    linkedin?: string;
    /** Instagram profile URL — shown as a labelled link in the contact. */
    instagram?: string;
  };
}

// ---------------------------------------------------------------------------
// EDIT BELOW — replace the placeholder values with Melina's real details.
// Lines marked TODO are placeholders that should be confirmed before use.
// ---------------------------------------------------------------------------

export const melina: Profile = {
  slug: '/',
  name: 'Melina Mignani',
  role: 'Executive Producer',
  company: 'Bait Society',
  tagline: 'Executive Producer · Bait Society',
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
      id: 'instagram',
      label: 'Instagram',
      description: '@bait.society',
      icon: 'instagram',
      href: 'https://www.instagram.com/bait.society',
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
    title: 'Executive Producer',
    email: 'melina@baitsociety.ai',
    phone: '+39 329 106 1147',
    website: 'https://www.baitsociety.ai',
    linkedin: 'https://www.linkedin.com/in/melina-mignani-30b33225/',
    instagram: 'https://www.instagram.com/bait.society',
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
  // Social profiles use Apple's grouped item/X-ABLabel convention so iOS
  // Contacts shows a proper "LinkedIn"/"Instagram" label; other apps still
  // read each line as a tappable URL.
  let socialGroup = 0;
  if (contact.linkedin) {
    socialGroup += 1;
    lines.push(`item${socialGroup}.URL:${contact.linkedin}`);
    lines.push(`item${socialGroup}.X-ABLabel:LinkedIn`);
  }
  if (contact.instagram) {
    socialGroup += 1;
    lines.push(`item${socialGroup}.URL:${contact.instagram}`);
    lines.push(`item${socialGroup}.X-ABLabel:Instagram`);
  }
  lines.push('END:VCARD');
  return lines.join('\r\n');
}

/**
 * Build a vCard (.vcf) for an arbitrary person captured via the "Share your
 * details" form. Used by the /api/contact-vcard route so the lead-notification
 * email can carry a one-tap "save to phone" link for each new contact.
 */
export function buildContactVCard(input: {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
}): string {
  const parts = input.name.trim().split(/\s+/);
  const firstName = parts[0] ?? input.name;
  const lastName = parts.slice(1).join(' ');
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${lastName};${firstName};;;`,
    `FN:${input.name}`,
  ];
  if (input.company) lines.push(`ORG:${input.company}`);
  if (input.email) lines.push(`EMAIL;TYPE=WORK:${input.email}`);
  if (input.phone) lines.push(`TEL;TYPE=CELL:${input.phone}`);
  lines.push('END:VCARD');
  return lines.join('\r\n');
}
