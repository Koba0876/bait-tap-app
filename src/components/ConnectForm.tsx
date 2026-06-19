'use client';

import { useCallback, useState } from 'react';
import { Send, X, Check } from 'lucide-react';

type Status = 'idle' | 'sending' | 'done' | 'error';

const EMPTY = { name: '', email: '', phone: '', company: '' };

/**
 * "Share your details" — lets the person tapping the card send their own
 * contact info back to the card owner. Submissions go to Netlify Forms (the
 * hidden static form lives in public/__forms.html for build-time detection).
 *
 * The inputs use autocomplete hints + matching input types so phones offer the
 * visitor's saved contact in the keyboard suggestion bar: one tap fills the
 * whole form from their own address book — fast and typo-free.
 */
export default function ConnectForm({ recipientFirstName }: { recipientFirstName: string }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [form, setForm] = useState(EMPTY);

  const update =
    (key: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const close = useCallback(() => {
    setOpen(false);
    // Reset after the modal animates away so it's fresh next time.
    setTimeout(() => {
      setStatus('idle');
      setForm(EMPTY);
    }, 200);
  }, []);

  const submit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setStatus('sending');
      try {
        // A ready-to-save link for the card owner: tapping it in the
        // notification email downloads this person's .vcf to their phone.
        const saveContactLink =
          window.location.origin +
          '/api/contact-vcard?' +
          new URLSearchParams(form).toString();
        const body = new URLSearchParams({
          'form-name': 'connect',
          ...form,
          save_contact: saveContactLink,
        }).toString();
        const res = await fetch('/__forms.html', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
        });
        if (!res.ok) throw new Error(`Unexpected status ${res.status}`);
        setStatus('done');
      } catch {
        setStatus('error');
      }
    },
    [form],
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 w-full rounded-xl px-4 py-[clamp(0.5rem,1.4svh,0.7rem)] text-left border border-neutral-800 bg-neutral-900/80 text-neutral-100 hover:bg-neutral-800 transition-colors"
      >
        <Send className="h-5 w-5 shrink-0 text-neutral-300" />
        <span className="flex flex-col">
          <span className="font-semibold text-[15px] leading-tight">Share your details</span>
          <span className="text-xs leading-tight text-neutral-400">
            Send {recipientFirstName} your contact
          </span>
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
          onClick={close}
        >
          <div
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-sm relative max-h-[90svh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={close}
              className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-200"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {status === 'done' ? (
              <div className="flex flex-col items-center text-center py-6">
                <div className="h-14 w-14 rounded-full bg-green-500/15 flex items-center justify-center mb-4">
                  <Check className="h-7 w-7 text-green-400" />
                </div>
                <p className="text-neutral-100 font-semibold text-lg">Sent!</p>
                <p className="text-neutral-400 text-sm mt-1">
                  {recipientFirstName} now has your details.
                </p>
                <button
                  onClick={close}
                  className="mt-6 rounded-xl bg-white text-neutral-900 font-medium px-6 py-2.5 hover:bg-neutral-200 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-3">
                <div className="mb-1">
                  <p className="text-neutral-100 font-semibold text-lg">Share your details</p>
                  <p className="text-neutral-400 text-sm">
                    Send your contact to {recipientFirstName}. Tap the autofill suggestion
                    above your keyboard to fill it instantly.
                  </p>
                </div>

                {/* Honeypot: hidden from people, tempting to bots. */}
                <input
                  type="text"
                  name="bot-field"
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                  onChange={() => {}}
                />

                <input
                  type="text"
                  required
                  placeholder="Full name"
                  autoComplete="name"
                  value={form.name}
                  onChange={update('name')}
                  className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
                />
                <input
                  type="email"
                  required
                  inputMode="email"
                  placeholder="Email"
                  autoComplete="email"
                  value={form.email}
                  onChange={update('email')}
                  className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
                />
                <input
                  type="tel"
                  inputMode="tel"
                  placeholder="Phone"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={update('phone')}
                  className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
                />
                <input
                  type="text"
                  placeholder="Company / role"
                  autoComplete="organization"
                  value={form.company}
                  onChange={update('company')}
                  className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
                />

                {status === 'error' && (
                  <p className="text-sm text-red-400">
                    Something went wrong — please try again.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="mt-1 flex items-center justify-center gap-2 w-full rounded-xl bg-white text-neutral-900 font-semibold py-3 hover:bg-neutral-200 transition-colors disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {status === 'sending' ? 'Sending…' : 'Send to ' + recipientFirstName}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
