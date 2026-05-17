'use client';

import { useState } from 'react';

export default function VendorBookPage() {
  const [submitted, setSubmitted] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch('/vendor/book/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: form.get('address'),
        unit: form.get('unit'),
        trade: form.get('trade'),
        vendor: form.get('vendor'),
        when: form.get('when'),
      }),
    });
    const j = await res.json();
    setSubmitted(j.confirmationNumber);
  }

  return (
    <main style={{ maxWidth: 480, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>Vendor Booking Portal</h1>
      {submitted ? (
        <div>
          <h2>Booking confirmed</h2>
          <p>
            Confirmation number: <strong>{submitted}</strong>
          </p>
          <p>Vendor: Ricky&apos;s Heating &amp; Air</p>
        </div>
      ) : (
        <form onSubmit={onSubmit}>
          <p>
            <label>
              Address
              <br />
              <input name="address" required style={{ width: '100%' }} />
            </label>
          </p>
          <p>
            <label>
              Unit
              <br />
              <input name="unit" style={{ width: '100%' }} />
            </label>
          </p>
          <p>
            <label>
              Trade
              <br />
              <input name="trade" required style={{ width: '100%' }} />
            </label>
          </p>
          <p>
            <label>
              Vendor
              <br />
              <input name="vendor" required style={{ width: '100%' }} />
            </label>
          </p>
          <p>
            <label>
              When
              <br />
              <input name="when" required style={{ width: '100%' }} />
            </label>
          </p>
          <button type="submit">Book</button>
        </form>
      )}
    </main>
  );
}
