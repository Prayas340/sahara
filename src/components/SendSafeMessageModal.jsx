'use client';

import { useState } from 'react';
import { showToast } from './Toast.jsx';

export default function SendSafeMessageModal({ isOpen, onClose, contacts, elderName, elderLocation }) {
  const defaultPreset = `Namaste! 🙏 Update from Sahara Care: ${elderName || 'Our elder'} is safe, healthy, and doing well today in ${elderLocation || 'Kolkata'}. 🌿`;
  const [customMessage, setCustomMessage] = useState(defaultPreset);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Clean phone number for WhatsApp wa.me link
  const formatWhatsAppUrl = (phone) => {
    if (!phone) return null;
    let digits = phone.replace(/\D/g, '');
    // If 10-digit Indian number without country code
    if (digits.length === 10) {
      digits = `91${digits}`;
    }
    if (digits.length < 10) return null;
    const encodedText = encodeURIComponent(customMessage);
    return `https://wa.me/${digits}?text=${encodedText}`;
  };

  const handleCopyMessage = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(customMessage);
      setCopied(true);
      showToast('Safe update message copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenPrimaryWhatsApp = () => {
    // Find the first valid contact
    const validContact = (contacts || []).find(c => c.phone && c.phone.replace(/\D/g, '').length >= 10);
    if (validContact) {
      const url = formatWhatsAppUrl(validContact.phone);
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
        showToast(`Opening WhatsApp for ${validContact.name}...`, 'info');
      }
    } else {
      showToast('No valid contact phone number available for WhatsApp.', 'error');
    }
  };

  const validContacts = (contacts || []).filter(c => c.phone && c.phone !== '108');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#cdf2cb] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#cdf2cb] mb-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-[#25D366]/15 text-[#128C7E] flex items-center justify-center">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.588-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.632.062-1.924-.469-1.554-.64-2.56-2.226-2.637-2.329-.077-.102-.631-.839-.631-1.6 0-.76.398-1.134.542-1.288.143-.155.312-.193.417-.193.104 0 .208.001.299.006.095.006.223-.036.348.266.13.313.442 1.077.481 1.155.039.078.065.169.013.273-.051.104-.078.169-.155.26-.078.091-.163.203-.233.273-.078.077-.16.161-.068.32.091.156.406.67 871 1.085.598.532 1.102.697 1.259.774.156.078.247.065.338-.039.091-.104.39-.455.494-.611.104-.156.208-.13.349-.078.143.052.909.429 1.065.507.156.078.26.117.299.182.039.065.039.377-.105.782z"/>
              </svg>
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#032109]">
                Send &ldquo;{elderName?.split(' ')[0] || 'Elder'} is Safe&rdquo;
              </h2>
              <p className="text-xs text-[#40493d]">
                Redirect to WhatsApp to send an instant care safety message to loved ones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-full text-[#40493d] hover:bg-[#ebffe7] hover:text-[#0d631b] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Message Editor */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-[#40493d] uppercase tracking-wider">
              Preset WhatsApp Message (Editable)
            </label>
            <button
              type="button"
              onClick={handleCopyMessage}
              className="text-xs font-bold text-[#0d631b] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
          </div>
          <textarea
            rows="3"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="w-full p-3.5 rounded-2xl bg-[#ebffe7]/60 border border-[#cdf2cb] text-[#032109] font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0d631b] focus:bg-white resize-none transition-all shadow-inner"
          />
        </div>

        {/* Contacts List with WhatsApp Redirects */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 mb-4">
          <span className="text-xs font-bold text-[#40493d] uppercase tracking-wider block">
            Select Contact to Send on WhatsApp ({validContacts.length}):
          </span>

          {validContacts.length === 0 ? (
            <div className="p-4 rounded-2xl bg-[#ebffe7] text-center text-xs text-[#40493d]">
              No contacts with phone numbers saved yet. Please add a contact first.
            </div>
          ) : (
            validContacts.map((c, i) => {
              const waUrl = formatWhatsAppUrl(c.phone);
              return (
                <div
                  key={c.id || i}
                  className="p-3.5 rounded-2xl border border-[#cdf2cb] bg-white hover:bg-[#ebffe7]/40 flex items-center justify-between gap-3 transition-colors shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-11 h-11 rounded-xl object-cover border border-[#cdf2cb] bg-white shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-extrabold text-[#032109] truncate">{c.name}</h4>
                      <p className="text-xs text-[#0d631b] font-semibold truncate">{c.relation}</p>
                      <p className="text-[11px] text-[#40493d] truncate">{c.phone}</p>
                    </div>
                  </div>

                  <a
                    href={waUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!waUrl) {
                        e.preventDefault();
                        showToast(`Invalid phone number for ${c.name}.`, 'error');
                      } else {
                        showToast(`Redirecting to WhatsApp for ${c.name}...`, 'success');
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all shrink-0 cursor-pointer ${
                      waUrl
                        ? 'bg-[#25D366] hover:bg-[#20bd5a] active:scale-95'
                        : 'bg-gray-300 pointer-events-none cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.588-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.632.062-1.924-.469-1.554-.64-2.56-2.226-2.637-2.329-.077-.102-.631-.839-.631-1.6 0-.76.398-1.134.542-1.288.143-.155.312-.193.417-.193.104 0 .208.001.299.006.095.006.223-.036.348.266.13.313.442 1.077.481 1.155.039.078.065.169.013.273-.051.104-.078.169-.155.26-.078.091-.163.203-.233.273-.078.077-.16.161-.068.32.091.156.406.67 871 1.085.598.532 1.102.697 1.259.774.156.078.247.065.338-.039.091-.104.39-.455.494-.611.104-.156.208-.13.349-.078.143.052.909.429 1.065.507.156.078.26.117.299.182.039.065.039.377-.105.782z"/>
                    </svg>
                    <span>Send WhatsApp</span>
                  </a>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#cdf2cb] gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[#cdf2cb] text-[#40493d] font-bold text-xs sm:text-sm hover:bg-[#ebffe7] transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleOpenPrimaryWhatsApp}
            className="btn-tactile btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold shadow-md cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.588-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.632.062-1.924-.469-1.554-.64-2.56-2.226-2.637-2.329-.077-.102-.631-.839-.631-1.6 0-.76.398-1.134.542-1.288.143-.155.312-.193.417-.193.104 0 .208.001.299.006.095.006.223-.036.348.266.13.313.442 1.077.481 1.155.039.078.065.169.013.273-.051.104-.078.169-.155.26-.078.091-.163.203-.233.273-.078.077-.16.161-.068.32.091.156.406.67 871 1.085.598.532 1.102.697 1.259.774.156.078.247.065.338-.039.091-.104.39-.455.494-.611.104-.156.208-.13.349-.078.143.052.909.429 1.065.507.156.078.26.117.299.182.039.065.039.377-.105.782z"/>
            </svg>
            <span>Launch Primary WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
