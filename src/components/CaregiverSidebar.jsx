'use client';

import { useTranslation } from '../utils/i18n.js';
import { showToast } from './Toast.jsx';

export default function CaregiverSidebar({ activeTab, onSelectTab, patient }) {
  const { t } = useTranslation();

  const getSidebarLinkClass = (tabName) => {
    const isActive = activeTab === tabName;
    return isActive
      ? 'sidebar-link active flex items-center px-4 py-3 rounded-2xl bg-[#006e1c] text-white font-bold gap-3 shadow-md transition-all cursor-pointer'
      : 'sidebar-link flex items-center px-4 py-3 rounded-2xl text-[#40493d] hover:bg-[#cdf2cb] hover:text-[#032109] font-semibold gap-3 transition-colors cursor-pointer';
  };

  const getMobileTabClass = (tabName) => {
    const isActive = activeTab === tabName;
    return isActive
      ? 'flex flex-col items-center py-2 px-3 rounded-xl bg-[#006e1c] text-white font-bold text-xs shadow-sm cursor-pointer'
      : 'flex flex-col items-center py-2 px-3 rounded-xl text-[#40493d] hover:bg-[#cdf2cb] font-semibold text-xs transition-colors cursor-pointer';
  };

  const handleEmergencyAlert = () => {
    showToast('🚨 Emergency alert dispatched to primary family members and doctors!', 'error', 6000);
  };

  return (
    <>
      {/* Mobile Sub-Navigation Bar (always visible on smaller screens so navigation never vanishes) */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#cdf2cb] px-2 py-1.5 shadow-sm">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          <button
            type="button"
            className={getMobileTabClass('overview')}
            onClick={() => onSelectTab('overview')}
          >
            <span className="material-symbols-outlined text-xl">space_dashboard</span>
            <span>{t.tabOverview || 'Overview'}</span>
          </button>
          <button
            type="button"
            className={getMobileTabClass('memories')}
            onClick={() => onSelectTab('memories')}
          >
            <span className="material-symbols-outlined text-xl">leaderboard</span>
            <span>{t.tabGameScores || 'Game Score'}</span>
          </button>
          <button
            type="button"
            className={getMobileTabClass('routine')}
            onClick={() => onSelectTab('routine')}
          >
            <span className="material-symbols-outlined text-xl">schedule</span>
            <span>{t.tabRoutine || 'Routine'}</span>
          </button>
          <button
            type="button"
            className={getMobileTabClass('contacts')}
            onClick={() => onSelectTab('contacts')}
          >
            <span className="material-symbols-outlined text-xl">contact_phone</span>
            <span>{t.tabContacts || 'SOS & Family'}</span>
          </button>
        </div>
      </div>

      {/* Persistent Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-[#d9fdd6] flex-col pt-6 pb-8 px-4 border-r border-[#cdf2cb] shadow-sm shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
        {/* Active Patient Card */}
        <div className="mb-6 p-3.5 bg-white rounded-2xl shadow-sm border border-[#cdf2cb]">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                alt={patient?.name || 'Patient'}
                className="w-11 h-11 rounded-xl object-cover border border-[#cdf2cb]"
                src={patient?.avatar || '/avatar.png'}
              />
              <span className="w-3 h-3 rounded-full bg-[#006e1c] absolute -bottom-0.5 -right-0.5 border-2 border-white"></span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-[#032109] truncate">{patient?.name || 'Sahara Member'}</p>
              <p className="text-[11px] text-[#40493d] truncate">{patient?.status || patient?.problemStatement || 'Mild Cognitive Support Mode'}</p>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-[#ebffe7] flex items-center justify-between text-[11px] text-[#40493d]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006e1c]"></span>Live Connected
            </span>
            <span className="font-bold text-[#0d631b]">{patient?.city || 'Local'}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2">
          <button
            type="button"
            className={getSidebarLinkClass('overview')}
            onClick={() => onSelectTab('overview')}
          >
            <span className="material-symbols-outlined text-2xl">space_dashboard</span>
            <span>{t.tabOverview || 'Caregiver Overview'}</span>
          </button>
          <button
            type="button"
            className={getSidebarLinkClass('memories')}
            onClick={() => onSelectTab('memories')}
          >
            <span className="material-symbols-outlined text-2xl">leaderboard</span>
            <span>{t.tabGameScores || 'Patient Game Score'}</span>
          </button>
          <button
            type="button"
            className={getSidebarLinkClass('routine')}
            onClick={() => onSelectTab('routine')}
          >
            <span className="material-symbols-outlined text-2xl">schedule</span>
            <span>{t.tabRoutine || 'Daily Rhythm & Routine'}</span>
          </button>
          <button
            type="button"
            className={getSidebarLinkClass('contacts')}
            onClick={() => onSelectTab('contacts')}
          >
            <span className="material-symbols-outlined text-2xl">contact_phone</span>
            <span>{t.tabContacts || 'Doctor & Family SOS'}</span>
          </button>
        </nav>

        {/* Bottom Emergency Button */}
        <div className="pt-4 mt-auto">
          <button
            onClick={handleEmergencyAlert}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#ffdad6] text-[#93000a] rounded-2xl font-bold text-sm border border-red-200 hover:bg-red-200 transition-all shadow-sm cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-xl">emergency_share</span>
            <span>One-Tap Emergency Alert</span>
          </button>
        </div>
      </aside>
    </>
  );
}
