'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar.jsx';
import { dataStore } from '../../services/dataStore.js';
import { showToast } from '../../components/Toast.jsx';

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    setContacts(dataStore.state.contacts || []);
  }, []);

  const handleBroadcast = () => {
    showToast('💚 Voice broadcast sent: "I am feeling happy and resting well." Everyone is notified!', 'heart', 6000);
  };

  return (
    <div className="min-h-screen bg-[#ebffe7] text-[#032109]">
      <Navbar activeView="elder" />

      <main className="w-full pt-24 pb-28">
        <div className="w-full max-w-[76rem] mx-auto px-4 sm:px-6 flex flex-col gap-6">
          {/* Back button */}
          <div>
            <button
              onClick={() => router.push('/elder-dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#0d631b] font-bold text-sm shadow-sm border border-[#cdf2cb] hover:bg-[#d9fdd6] transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              <span>Back to Home</span>
            </button>
          </div>

          {/* Header Banner */}
          <div className="card-tactile relative bg-[#d9fdd6] rounded-3xl p-6 sm:p-10 overflow-hidden shadow-md border border-[#cdf2cb]">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white text-[#0d631b] mb-3 shadow-sm border border-[#cdf2cb]">
                  <span className="material-symbols-outlined text-xl text-[#0d631b]">family_restroom</span>
                  <span className="text-xs font-bold uppercase tracking-wide">
                    Aapnar Aapon Manuh · Your Loved Ones
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#032109] tracking-tight mb-2">
                  People who care for you
                </h1>
                <p className="text-base sm:text-xl text-[#40493d]">
                  Tap any card to call or send a gentle voice message
                </p>
              </div>

              {/* Broadcast Button */}
              <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
                <button
                  onClick={handleBroadcast}
                  className="btn-tactile btn-primary flex items-center gap-3 px-6 py-4 rounded-full text-base sm:text-lg font-extrabold shadow-lg cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-2xl">volunteer_activism</span>
                  <span>Send &ldquo;I am doing well&rdquo; to Everyone</span>
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a3f69c] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#a3f69c]"></span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Contacts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map((contact, idx) => (
              <div
                key={idx}
                className="card-tactile bg-white rounded-3xl p-6 shadow-md border border-[#cdf2cb] flex flex-col justify-between space-y-6"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border border-[#cdf2cb] bg-white shadow-sm"
                      src={contact.avatar}
                      alt={contact.name}
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#006e1c] border-2 border-white"></span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0d631b] uppercase tracking-wider block">
                      {contact.relation}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#032109] mt-0.5">
                      {contact.name}
                    </h3>
                    <p className="text-xs text-[#40493d] mt-0.5">{contact.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-[#cdf2cb]">
                  <a
                    href={`tel:${contact.phone}`}
                    className="btn-tactile btn-primary flex-1 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-xl">call</span>
                    <span>Call Now</span>
                  </a>
                  <button
                    onClick={() => showToast(`🎙️ Recording voice note for ${contact.name}...`, 'info')}
                    type="button"
                    className="btn-tactile btn-secondary flex-1 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 bg-[#d3f8d0] text-[#032109] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xl">mic</span>
                    <span>Voice Note</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
