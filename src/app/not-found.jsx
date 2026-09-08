'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#ebffe7] flex items-center justify-center p-4">
      <div className="card-tactile bg-white p-8 rounded-3xl text-center max-w-md border border-[#cdf2cb] space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#d9fdd6] text-[#0d631b] flex items-center justify-center mx-auto text-3xl font-extrabold">
          🌿
        </div>
        <h2 className="text-2xl font-extrabold text-[#032109]">Page Not Found</h2>
        <p className="text-sm text-[#40493d]">
          The sanctuary room you are looking for does not exist or has moved softly.
        </p>
        <Link
          href="/"
          className="btn-tactile btn-primary inline-flex py-3 px-6 rounded-full text-sm font-bold"
        >
          Return to Sanctuary
        </Link>
      </div>
    </div>
  );
}
