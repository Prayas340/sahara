import './styles/main.css';
import { authService } from './services/authService.js';
import { initAccessibilitySettings } from './utils/speech.js';
import { renderWelcomePhoneLogin } from './views/WelcomePhoneLogin.js';
import { renderOtpVerification } from './views/OtpVerification.js';
import { renderUserDetailsSetup } from './views/UserDetailsSetup.js';
import { renderElderDashboard } from './views/ElderDashboard.js';
import { renderCaregiverDashboard } from './views/CaregiverDashboard.js';
import { renderMemoryMatchGame } from './views/MemoryMatchGame.js';
import { renderCaregiverContacts } from './views/CaregiverContacts.js';
import { renderCaregiverLogin } from './views/CaregiverLogin.js';

class SaharaApp {
  constructor() {
    this.appContainer = document.getElementById('app');
    this.currentView = 'welcome-login';
    this.viewParams = {};

    this.init();
  }

  init() {
    initAccessibilitySettings();

    // Lock mobile zoom (prevent pinch-to-zoom and double-tap zoom)
    if (typeof window !== 'undefined') {
      const preventGesture = (e) => e.preventDefault();
      document.addEventListener('gesturestart', preventGesture, { passive: false });
      document.addEventListener('gesturechange', preventGesture, { passive: false });
      document.addEventListener('gestureend', preventGesture, { passive: false });
      document.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches.length > 1) {
          e.preventDefault();
        }
      }, { passive: false });

      let lastTap = 0;
      document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTap <= 300) {
          if (e.target && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
            e.preventDefault();
          }
        }
        lastTap = now;
      }, { passive: false });
    }

    // Determine initial route based on session or hash
    const user = authService.getCurrentUser();
    const hash = window.location.hash.replace('#', '');

    if (user?.role === 'caregiver') {
      // Strict Caregiver Portal: Never load elder views
      if (['caregiver-memories', 'memory-game'].includes(hash)) {
        this.currentView = 'caregiver-dashboard';
        this.viewParams = { tab: 'memories' };
      } else if (['caregiver-routine', 'routine'].includes(hash)) {
        this.currentView = 'caregiver-dashboard';
        this.viewParams = { tab: 'routine' };
      } else if (['caregiver-contacts', 'contacts'].includes(hash)) {
        this.currentView = 'caregiver-dashboard';
        this.viewParams = { tab: 'contacts' };
      } else {
        this.currentView = 'caregiver-dashboard';
        this.viewParams = { tab: 'overview' };
      }
    } else if (user?.role === 'elder') {
      // Strict Elder Portal: Never load caregiver views
      this.currentView = ['contacts', 'memory-game', 'elder-dashboard'].includes(hash) ? hash : 'elder-dashboard';
    } else if (hash === 'caregiver-login') {
      this.currentView = 'caregiver-login';
    } else if (['welcome-login', 'otp-verify', 'profile-setup'].includes(hash)) {
      this.currentView = hash;
    } else {
      this.currentView = 'welcome-login';
    }

    // Listen for auth state changes
    window.addEventListener('sahara:auth-change', (e) => {
      const activeUser = e.detail?.user;
      if (!activeUser) {
        if (this.currentView === 'caregiver-login') {
          this.navigate('caregiver-login');
        } else if (!['welcome-login', 'otp-verify', 'profile-setup'].includes(this.currentView)) {
          this.navigate('welcome-login');
        }
      }
    });

    // Listen for hash change in browser URL
    window.addEventListener('hashchange', () => {
      const h = window.location.hash.replace('#', '');
      if (h && h !== this.currentView) {
        this.navigate(h);
      }
    });

    // Real-time synchronization: re-render dashboard views when data changes
    const onLiveSync = () => {
      if (this.currentView === 'elder-dashboard' || this.currentView === 'caregiver-dashboard' || (typeof this.currentView === 'string' && this.currentView.startsWith('caregiver-'))) {
        this.render();
      }
    };
    window.addEventListener('sahara:medicines-change', onLiveSync);
    window.addEventListener('sahara:datastore-change', onLiveSync);
    window.addEventListener('storage', (e) => {
      if (!e.key || e.key.includes('medicines') || e.key.includes('sahara_app_state') || e.key.includes('contacts')) {
        onLiveSync();
      }
    });

    this.render();
  }

  navigate(viewName, params = {}) {
    const user = authService.getCurrentUser();

    // Strict portal separation:
    // Caregiver cannot view elder portal; Elder cannot view caregiver portal
    if (user?.role === 'caregiver') {
      if (viewName === 'memory-game' || viewName === 'caregiver-memories') {
        viewName = 'caregiver-dashboard';
        params = { tab: 'memories' };
      } else if (viewName === 'contacts' || viewName === 'caregiver-contacts') {
        viewName = 'caregiver-dashboard';
        params = { tab: 'contacts' };
      } else if (viewName === 'caregiver-routine' || viewName === 'routine') {
        viewName = 'caregiver-dashboard';
        params = { tab: 'routine' };
      } else if (['elder-dashboard', 'welcome-login', 'otp-verify', 'profile-setup'].includes(viewName)) {
        viewName = 'caregiver-dashboard';
        params = { tab: 'overview' };
      }
    } else if (user?.role === 'elder' && ['caregiver-dashboard', 'caregiver-login', 'caregiver-memories', 'caregiver-routine', 'caregiver-contacts'].includes(viewName)) {
      viewName = 'elder-dashboard';
    }

    this.currentView = viewName;
    this.viewParams = params;
    
    if (user?.role === 'caregiver' && params?.tab && params.tab !== 'overview') {
      window.location.hash = `caregiver-${params.tab}`;
    } else {
      window.location.hash = viewName;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.render();
  }

  render() {
    if (!this.appContainer) return;

    let viewHtml = '';
    const onNavigate = (view, params) => this.navigate(view, params);
    const user = authService.getCurrentUser();

    switch (this.currentView) {
      case 'welcome-login':
        viewHtml = renderWelcomePhoneLogin(onNavigate);
        break;
      case 'otp-verify':
        viewHtml = renderOtpVerification(onNavigate, this.viewParams);
        break;
      case 'profile-setup':
        viewHtml = renderUserDetailsSetup(onNavigate, this.viewParams);
        break;
      case 'elder-dashboard':
        viewHtml = renderElderDashboard(onNavigate);
        break;
      case 'caregiver-dashboard':
        viewHtml = renderCaregiverDashboard(onNavigate, this.viewParams);
        break;
      case 'caregiver-memories':
        viewHtml = renderCaregiverDashboard(onNavigate, { tab: 'memories' });
        break;
      case 'caregiver-routine':
        viewHtml = renderCaregiverDashboard(onNavigate, { tab: 'routine' });
        break;
      case 'caregiver-contacts':
        viewHtml = renderCaregiverDashboard(onNavigate, { tab: 'contacts' });
        break;
      case 'memory-game':
        if (user?.role === 'caregiver') {
          viewHtml = renderCaregiverDashboard(onNavigate, { tab: 'memories' });
        } else {
          viewHtml = renderMemoryMatchGame(onNavigate);
        }
        break;
      case 'contacts':
        if (user?.role === 'caregiver') {
          viewHtml = renderCaregiverDashboard(onNavigate, { tab: 'contacts' });
        } else {
          viewHtml = renderCaregiverContacts(onNavigate);
        }
        break;
      case 'caregiver-login':
        viewHtml = renderCaregiverLogin(onNavigate);
        break;
      default:
        viewHtml = renderWelcomePhoneLogin(onNavigate);
    }

    this.appContainer.innerHTML = viewHtml;
  }
}

// Start application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.saharaApp = new SaharaApp();
});
