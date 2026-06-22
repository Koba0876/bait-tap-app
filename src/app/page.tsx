import { redirect } from 'next/navigation';

// No card lives at the root — send visitors to the primary profile. Each
// person's NFC card / QR points at their own /<slug> page directly.
export default function Home() {
  redirect('/melina');
}
