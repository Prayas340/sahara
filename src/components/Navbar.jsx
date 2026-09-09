'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/authService.js';
import { dataStore } from '../services/dataStore.js';
import { showToast } from './Toast.jsx';

export default function Navbar({ activeView = 'elder' }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [patient, setPatient] = useState({});
  const [caregiver, setCaregiver] = useState({});
  const [currentLang, setCurrentLang] = useState('English');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const syncData = () => {
      setUser(authService.getCurrentUser());
      setPatient(dataStore.getPatient ? dataStore.getPatient() : (dataStore.state.patient || {}));
      setCaregiver(dataStore.getCaregiver ? dataStore.getCaregiver() : (dataStore.state.caregiver || {}));
      setCurrentLang(dataStore.getLanguage ? dataStore.getLanguage() : 'English');
    };

    syncData();
    window.addEventListener('sahara:auth-change', syncData);
    window.addEventListener('sahara:datastore-change', syncData);

    return () => {
      window.removeEventListener('sahara:auth-change', syncData);
      window.removeEventListener('sahara:datastore-change', syncData);
    };
  }, []);

  const isCaregiver = activeView === 'caregiver' || user?.role === 'caregiver';
  const effectiveName = isCaregiver ? (user?.name || 'Caregiver') : (patient?.name || user?.name || '');
  const elderDisplayName = !isCaregiver && patient?.honorific ? patient.honorific : (patient?.name ? `${patient.name.split(' ')[0]} ji` : (user?.honorific || (effectiveName ? `${effectiveName.split(' ')[0]} ji` : 'Sanctuary')));

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setCurrentLang(newLang);
    dataStore.setLanguage(newLang);
    showToast(`Language set to: ${newLang}`, 'info');
  };

  const handleBrandClick = () => {
    if (isCaregiver) {
      router.push('/caregiver-dashboard');
    } else {
      router.push('/elder-dashboard');
    }
  };

  const handleSignOut = async () => {
    const wasCaregiver = isCaregiver;
    setIsUserMenuOpen(false);
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem('sahara_signed_out', 'true');
    }
    await authService.signOut();
    showToast('Signed out of Sahara safely.', 'info');
    if (wasCaregiver) {
      window.location.href = '/caregiver-login';
    } else {
      window.location.href = '/';
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#ebffe7]/90 backdrop-blur-xl border-b border-[#cdf2cb] shadow-[0_2px_12px_rgba(23,53,27,0.06)]">
        <div className="h-20 max-w-[80rem] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          {/* Brand Logo & Name */}
          <div
            onClick={handleBrandClick}
            className="flex items-center gap-3 shrink-0 cursor-pointer select-none"
          >
            <img
              alt="Sahara Brand Logo"
              className="h-9 w-9 object-contain rounded-full bg-white shadow-sm p-1"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuADfY8uUCdflx3PxgJV8n5Rdy5e1UqyJi1RpuX07Bmc9r6hn23Klt8mhC0O57Dlsy0AoO2Zfur4kxn9yueS6kMU1-B3o_rUnCtsYE80rKVOILi3Gl6wxP62ffyGjvNMaoafsux-4Nu3YfcznSLtBj71fvQApLWucdiSJyE4VD5KSm1AryUPF0ooW09SbgA3OdWj_0EfL0E3tOmeMY4frF7WwHEp3O9blDcLXakfekbdhrlgiYNNcO0c2Q"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-xl text-[#0d631b] leading-tight tracking-tight">Sahara</span>
              <span className="hidden sm:inline-block text-xs text-[#40493d] font-semibold leading-none">
                Everyday Cognitive & Caregiver Companion
              </span>
            </div>
          </div>

          {/* Center View Indicator (Strictly Isolated) */}
          {isCaregiver ? (
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#cdf2cb] shadow-xs text-xs sm:text-sm font-extrabold text-[#0d631b]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#006e1c] animate-pulse"></span>
              <span className="material-symbols-outlined text-base">health_and_safety</span>
              <span>Caregiver Portal · Monitoring {patient?.name || 'Loved One'}</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#cdf2cb] shadow-xs text-xs sm:text-sm font-extrabold text-[#0d631b]">
              <span className="material-symbols-outlined text-base text-[#0d631b]">spa</span>
              <span>{elderDisplayName}&apos;s Sanctuary</span>
            </div>
          )}

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="relative flex items-center bg-white px-2 py-1 rounded-full shadow-sm border border-[#cdf2cb]">
              <span className="material-symbols-outlined text-[#0d631b] text-base mr-1">translate</span>
              <select
                value={currentLang}
                onChange={handleLanguageChange}
                className="bg-transparent text-xs font-bold text-[#032109] focus:outline-none cursor-pointer pr-1"
              >
                <option value="English">English</option>
                <option value="हिंदी">हिंदी (Hindi)</option>
                <option value="অসমীয়া">অসমীয়া (Assamese)</option>
                <option value="বাংলা">বাংলা (Bengali)</option>
                <option value="মৈতৈলোন্">ꯃꯤꯇꯩꯂꯣꯟ (Manipuri)</option>
              </select>
            </div>

            {/* Avatar & User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                type="button"
                className="w-9 h-9 rounded-full ring-2 ring-[#d9fdd6] overflow-hidden flex items-center justify-center bg-white shadow-sm hover:ring-[#2e7d32] transition-all cursor-pointer"
              >
                <img
                  alt="Profile"
                  className="w-full h-full object-cover bg-white"
                  src={user?.avatar || '/avatar.png'}
                />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 text-sm">
                  <div className="p-2 border-b border-gray-100">
                    <p className="font-bold text-gray-800">{isCaregiver ? (user?.name || 'Caregiver') : (patient?.name || user?.name || 'Sahara Member')}</p>
                    <p className="text-xs text-gray-500">
                      {isCaregiver ? 'Caregiver Companion' : 'Mild Cognitive Support'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      if (isCaregiver) {
                        router.push('/caregiver-dashboard?tab=contacts');
                      } else {
                        router.push('/contacts');
                      }
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#ebffe7] text-[#0d631b] font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">family_restroom</span>
                    Family Contacts
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
