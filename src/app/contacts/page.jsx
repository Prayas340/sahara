'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar.jsx';
import ContactModal from '../../components/ContactModal.jsx';
import SendSafeMessageModal from '../../components/SendSafeMessageModal.jsx';
import { dataStore } from '../../services/dataStore.js';
import { showToast } from '../../components/Toast.jsx';

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [patient, setPatient] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState(null);
  const [isSafeMessageModalOpen, setIsSafeMessageModalOpen] = useState(false);

  useEffect(() => {
    const syncContacts = () => {
      const current = dataStore.getContacts ? dataStore.getContacts() : (dataStore.state?.contacts || []);
      setContacts([...current]);
      if (dataStore.state?.patient) {
        setPatient(dataStore.state.patient);
      }
    };
    syncContacts();

    // Also fetch cloud contacts if needed
    if (typeof window !== 'undefined') {
      const elderId = dataStore.state?.patient?.id || dataStore.state?.patient?.phone;
      if (elderId) {
        fetch(`/api/contacts?elderId=${encodeURIComponent(elderId)}`)
          .then(res => res.json())
          .then(data => {
            if (data?.contacts && Array.isArray(data.contacts) && data.contacts.length > 0) {
              dataStore.saveContacts(data.contacts);
            }
          })
          .catch(() => {});
      }
    }

    window.addEventListener('sahara:datastore-change', syncContacts);
    window.addEventListener('sahara:state-change', syncContacts);
    return () => {
      window.removeEventListener('sahara:datastore-change', syncContacts);
      window.removeEventListener('sahara:state-change', syncContacts);
    };
  }, []);

  const handleOpenAddContact = () => {
    setContactToEdit(null);
    setIsContactModalOpen(true);
  };

  const handleOpenEditContact = (c) => {
    setContactToEdit(c);
    setIsContactModalOpen(true);
  };

  const handleSaveContact = (contactData) => {
    if (contactData.id) {
      dataStore.updateContact(contactData.id, contactData);
      showToast(`Contact "${contactData.name}" updated successfully!`, 'success');
    } else {
      dataStore.addContact(contactData);
      showToast(`Contact "${contactData.name}" added successfully!`, 'success');
    }
    const updated = dataStore.getContacts ? dataStore.getContacts() : (dataStore.state?.contacts || []);
    setContacts([...updated]);
    setIsContactModalOpen(false);
  };

  const handleDeleteContact = (contactId, contactName) => {
    if (typeof window !== 'undefined' && window.confirm(`Are you sure you want to remove "${contactName}" from your contacts?`)) {
      dataStore.deleteContact(contactId);
      const updated = dataStore.getContacts ? dataStore.getContacts() : (dataStore.state?.contacts || []);
      setContacts([...updated]);
      showToast(`Contact "${contactName}" removed.`, 'info');
    }
  };

  const handleWhatsAppContact = (contact) => {
    if (!contact?.phone) {
      showToast('No phone number saved for this contact.', 'error');
      return;
    }
    let digits = contact.phone.replace(/\D/g, '');
    if (digits.length === 10) digits = `91${digits}`;
    if (digits.length < 10) {
      showToast('Invalid phone number format for WhatsApp.', 'error');
      return;
    }
    const elderName = patient?.honorific || patient?.name || 'Our elder';
    const city = patient?.city || 'Kolkata';
    const msg = encodeURIComponent(`Namaste! 🙏 Update from Sahara Care: ${elderName} is safe, healthy, and doing well today in ${city}. 🌿`);
    window.open(`https://wa.me/${digits}?text=${msg}`, '_blank', 'noopener,noreferrer');
    showToast(`Opening WhatsApp for ${contact.name}...`, 'info');
  };

  return (
    <div className="min-h-screen bg-[#ebffe7] text-[#032109]">
      <Navbar activeView="elder" />

      <main className="w-full pt-24 pb-28">
        <div className="w-full max-w-[76rem] mx-auto px-4 sm:px-6 flex flex-col gap-6">
          {/* Back button and Add contact */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/elder-dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#0d631b] font-bold text-sm shadow-sm border border-[#cdf2cb] hover:bg-[#d9fdd6] transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              <span>Back to Home</span>
            </button>

            <button
              onClick={handleOpenAddContact}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#0d631b] font-bold text-sm shadow-sm border border-[#cdf2cb] hover:bg-[#d9fdd6] transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-lg">person_add</span>
              <span>+ Add Loved One</span>
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
                  Tap WhatsApp to send instant safe message, or call directly anytime
                </p>
              </div>

              {/* Broadcast Button */}
              <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
                <button
                  onClick={() => setIsSafeMessageModalOpen(true)}
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

          {/* Contacts Grid or Empty State */}
          {contacts.length === 0 ? (
            <div className="card-tactile bg-white rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-md border border-[#cdf2cb] space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-[#d9fdd6] text-[#0d631b] flex items-center justify-center mx-auto text-3xl font-extrabold shadow-sm">
                <span className="material-symbols-outlined text-4xl">contacts_product</span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#032109]">No Loved Ones or Emergency Contacts Added Yet</h2>
              <p className="text-sm text-[#40493d]">
                Customize your contacts list with family members, your personal caregiver, and doctors to enable 1-tap WhatsApp updates and direct emergency calling.
              </p>
              <button
                onClick={handleOpenAddContact}
                type="button"
                className="btn-tactile btn-primary inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold shadow-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">person_add</span>
                <span>+ Add First Contact</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contacts.map((contact, idx) => (
                <div
                  key={contact.id || idx}
                  className="card-tactile bg-white rounded-3xl p-6 shadow-md border border-[#cdf2cb] flex flex-col justify-between space-y-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <img
                          className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border border-[#cdf2cb] bg-white shadow-sm"
                          src={contact.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'}
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
                        <p className="text-xs font-semibold text-[#0d631b] mt-0.5">{contact.phone}</p>
                        <p className="text-xs text-[#40493d] mt-0.5">{contact.location}</p>
                      </div>
                    </div>

                    {/* Edit and delete icons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditContact(contact)}
                        title="Edit Contact"
                        type="button"
                        className="p-2 rounded-xl bg-white text-[#0d631b] hover:bg-[#d9fdd6] border border-[#cdf2cb] shadow-xs transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteContact(contact.id, contact.name)}
                        title="Delete Contact"
                        type="button"
                        className="p-2 rounded-xl bg-white text-red-600 hover:bg-red-50 border border-red-200 shadow-xs transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#cdf2cb]">
                    <a
                      href={`tel:${contact.phone}`}
                      className="btn-tactile btn-primary py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-base sm:text-lg">call</span>
                      <span>Call</span>
                    </a>

                    <button
                      onClick={() => handleWhatsAppContact(contact)}
                      type="button"
                      className="btn-tactile py-3 rounded-2xl bg-[#25D366] hover:bg-[#128C7E] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1 shadow-sm cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-base sm:text-lg">chat</span>
                      <span>WhatsApp</span>
                    </button>

                    <button
                      onClick={() => showToast(`🎙️ Recording voice note for ${contact.name}...`, 'info')}
                      type="button"
                      className="btn-tactile btn-secondary py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 bg-[#d3f8d0] text-[#032109] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base sm:text-lg">mic</span>
                      <span>Voice</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSave={handleSaveContact}
        contactToEdit={contactToEdit}
        patientCity={patient?.city}
      />

      <SendSafeMessageModal
        isOpen={isSafeMessageModalOpen}
        onClose={() => setIsSafeMessageModalOpen(false)}
        contacts={contacts}
        elderName={patient?.honorific || patient?.name}
        elderLocation={patient?.city || 'Kolkata'}
      />
    </div>
  );
}
