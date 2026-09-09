'use client';

import { useState, useEffect } from 'react';

export default function ContactModal({ isOpen, onClose, onSave, contactToEdit, patientCity }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('Family Member');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (contactToEdit) {
      setName(contactToEdit.name || '');
      setPhone(contactToEdit.phone || '');
      setRelation(contactToEdit.relation || 'Family Member');
      setLocation(contactToEdit.location || `Lives in ${patientCity || 'Kolkata'}`);
    } else {
      setName('');
      setPhone('+91 ');
      setRelation('Family Member');
      setLocation(`Lives in ${patientCity || 'Kolkata'}`);
    }
  }, [contactToEdit, isOpen, patientCity]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      alert('Please enter a name for the contact.');
      return;
    }
    if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 10) {
      alert('Please enter a valid phone number (at least 10 digits).');
      return;
    }

    onSave({
      id: contactToEdit?.id,
      name: cleanName,
      phone: cleanPhone,
      relation: relation.trim() || 'Family Member',
      location: location.trim() || `Lives in ${patientCity || 'Kolkata'}`,
      status: contactToEdit?.status || 'Available',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#cdf2cb] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#cdf2cb] mb-5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#d9fdd6] text-[#0d631b] material-symbols-outlined text-2xl">
              {contactToEdit ? 'edit' : 'person_add'}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#032109]">
              {contactToEdit ? 'Edit Contact & Loved One' : 'Add Emergency Contact & Loved One'}
            </h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-full text-[#40493d] hover:bg-[#ebffe7] hover:text-[#0d631b] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#40493d] uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Anil Dey, Dr. Sen, Pooja Borah"
              required
              className="w-full px-4 py-3 rounded-xl bg-[#ebffe7]/50 border border-[#cdf2cb] text-[#032109] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#0d631b] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#40493d] uppercase tracking-wider mb-1">
              Phone Number (WhatsApp & Direct Call) *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              required
              className="w-full px-4 py-3 rounded-xl bg-[#ebffe7]/50 border border-[#cdf2cb] text-[#032109] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#0d631b] focus:bg-white transition-all"
            />
            <span className="text-[11px] text-[#40493d] mt-1 block">
              Used for 1-tap direct calling and sending WhatsApp Safe Messages.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#40493d] uppercase tracking-wider mb-1">
                Relationship / Role
              </label>
              <input
                type="text"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                placeholder="e.g. Son, Daughter, Family Doctor"
                className="w-full px-4 py-3 rounded-xl bg-[#ebffe7]/50 border border-[#cdf2cb] text-[#032109] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#0d631b] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#40493d] uppercase tracking-wider mb-1">
                Location / Notes
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kolkata · Calls daily"
                className="w-full px-4 py-3 rounded-xl bg-[#ebffe7]/50 border border-[#cdf2cb] text-[#032109] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#0d631b] focus:bg-white transition-all"
              />
            </div>
          </div>



          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#cdf2cb] mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#cdf2cb] text-[#40493d] font-bold text-sm hover:bg-[#ebffe7] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0d631b] hover:bg-[#006e1c] text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">save</span>
              <span>{contactToEdit ? 'Save Changes' : 'Add Contact'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
