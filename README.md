# VISTAP

A standalone "tap-to-share" digital business card. Melina (Producer, Bait
Society) shares all her links by **tapping a physical NFC card** to someone's
phone, or by **showing the on-screen QR code**. Works on any modern iPhone or
Android — no app required on the other person's phone.

This is its own self-contained Next.js app (no scheduler code). The home page
**is** the profile.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

## Deploy

Push this repo to GitHub and connect it to **Netlify** or **Vercel** as a new
site. Build command `npm run build`, framework auto-detected (Next.js). Point a
domain at it (e.g. `tap.baitsociety.ai`). The NFC cards and QR code resolve to
whatever domain it's served from — no hardcoded host.

## Why it works this way

An iPhone **cannot** push a website to another phone just by touching phones —
Apple does not let third-party apps emulate an NFC tag, and Bluetooth has the
same restriction. So, like Popl / V1CE / commercial "tap" cards, VISTAP uses:

1. One web page (the home page) holding all the links.
2. Sharing via **physical NFC cards** programmed once to open that page, **and**
   an on-screen **QR code** fallback. Every card/QR points at the same page, so
   you never reprogram a card when a link changes — only edit the config.

## Editing links & contact details

Everything is in **`src/lib/vistap.ts`** (the `melina` profile):

- `links[]` — the buttons (label, description, icon, destination URL).
- `contact` — name/title/email/phone/website used for the "Save my contact" card.
- `avatar` — the round image at the top (`/Logo_Bird_BS_480.png`).

Currently set: society site (`https://www.baitsociety.ai`), showreel
(`https://www.baitsociety.ai/reel`), booking (the scheduler app), and the
contact card (Melina Mignani · melina@baitsociety.ai · +39 329 106 1147).
The **Book a meeting** link points at the separate scheduler app — update it in
`src/lib/vistap.ts` if that URL changes.

## Programming the physical NFC cards

Buy blank **NTAG213/215/216** NFC cards or stickers. Program them once:

1. Install **NFC Tools** (free, iOS & Android) by wakdev.
2. **Write → Add a record → URL/URI** → enter your deployed site URL
   (e.g. `https://tap.baitsociety.ai`).
3. **Write**, then hold a blank card to the top of the phone.
4. (Optional) **Other → Lock tag** to make it read-only.

Tapping that card to any iPhone (iOS 13+, no app) or NFC Android opens the page.

## Using it day-to-day

- **With a card:** tap the card to the other phone → page opens.
- **Without a card:** open the page, tap **Show QR**, let them scan it.
- **AirDrop / Messages:** tap **Share**.
- **Save contact:** the button downloads a vCard that adds Melina to their phone.
