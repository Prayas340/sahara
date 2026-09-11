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
      ? 'flex flex-col items-center justify-center py-1.5 px-2.5 sm:px-3.5 rounded-xl bg-[#006e1c] text-white font-extrabold text-[11px] shadow-xs cursor-pointer shrink-0 whitespace-nowrap transition-all active:scale-95'
      : 'flex flex-col items-center justify-center py-1.5 px-2.5 sm:px-3.5 rounded-xl text-[#40493d] hover:bg-[#ebffe7] hover:text-[#006e1c] font-bold text-[11px] transition-colors cursor-pointer shrink-0 whitespace-nowrap';
  };

  const handleSelectTab = (tabName) => {
    if (onSelectTab) onSelectTab(tabName);
    try {
      window.dispatchEvent(new CustomEvent('sahara:portal-tab-change', {
        detail: { tab: tabName, layout: 'caregiver-dashboard' }
      }));
    } catch (e) {}
  };

  const handleEmergencyAlert = () => {
    showToast('🚨 Emergency alert dispatched to primary family members and doctors!', 'error', 6000);
  };

  return (
    <>
      {/* Mobile Sub-Navigation Bar (strictly positioned below the fixed navbar, responsive on all devices) */}
      <div className="lg:hidden fixed top-16 sm:top-20 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#cdf2cb] px-2 py-1.5 shadow-xs overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-around sm:justify-center max-w-lg mx-auto gap-1 sm:gap-3">
          <button
            type="button"
            className={getMobileTabClass('overview')}
            onClick={() => handleSelectTab('overview')}
          >
            <span className="material-symbols-outlined text-lg">space_dashboard</span>
            <span>{t.overviewShort || 'Overview'}</span>
          </button>
          <button
            type="button"
            className={getMobileTabClass('memories')}
            onClick={() => handleSelectTab('memories')}
          >
            <span className="material-symbols-outlined text-lg">leaderboard</span>
            <span>{t.scoresShort || 'Scores'}</span>
          </button>
          <button
            type="button"
            className={getMobileTabClass('routine')}
            onClick={() => handleSelectTab('routine')}
          >
            <span className="material-symbols-outlined text-lg">schedule</span>
            <span>{t.routineShort || 'Routine'}</span>
          </button>
          <button
            type="button"
            className={getMobileTabClass('contacts')}
            onClick={() => handleSelectTab('contacts')}
          >
            <span className="material-symbols-outlined text-lg">contact_phone</span>
            <span>{t.contactsShort || 'Contacts'}</span>
          </button>
          <button
            type="button"
            className={getMobileTabClass('report')}
            onClick={() => handleSelectTab('report')}
          >
            <span className="material-symbols-outlined text-lg">summarize</span>
            <span>{t.reportShort || 'Report'}</span>
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
            onClick={() => handleSelectTab('overview')}
          >
            <span className="material-symbols-outlined text-2xl">space_dashboard</span>
            <span>{t.tabOverview || 'Caregiver Overview'}</span>
          </button>
          <button
            type="button"
            className={getSidebarLinkClass('memories')}
            onClick={() => handleSelectTab('memories')}
          >
            <span className="material-symbols-outlined text-2xl">leaderboard</span>
            <span>{t.tabGameScores || 'Patient Game Score'}</span>
          </button>
          <button
            type="button"
            className={getSidebarLinkClass('routine')}
            onClick={() => handleSelectTab('routine')}
          >
            <span className="material-symbols-outlined text-2xl">schedule</span>
            <span>{t.tabRoutine || 'Daily Rhythm & Routine'}</span>
          </button>
          <button
            type="button"
            className={getSidebarLinkClass('contacts')}
            onClick={() => handleSelectTab('contacts')}
          >
            <span className="material-symbols-outlined text-2xl">contact_phone</span>
            <span>{t.tabContacts || 'Family Contact'}</span>
          </button>
          <button
            type="button"
            className={getSidebarLinkClass('report')}
            onClick={() => handleSelectTab('report')}
          >
            <span className="material-symbols-outlined text-2xl">summarize</span>
            <span>{t.tabReport || 'AI Report Generator'}</span>
          </button>
        </nav>
      </aside>
    </>
  );
}
