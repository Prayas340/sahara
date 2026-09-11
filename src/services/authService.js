import { getSupabase } from './supabase.js';
import { dataStore } from './dataStore.js';
import { auth as firebaseClientAuth, googleProvider, db, normalizeElderId } from '../lib/firebaseClient.js';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

const SESSION_STORAGE_USER = 'sahara_active_user';
const SESSION_STORAGE_SANDBOX_OTP = 'sahara_sandbox_otp';
const STORAGE_KEY_REGISTERED_CAREGIVERS = 'sahara_registered_caregivers';

export const authService = {
  // Current active user
  getCurrentUser() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(SESSION_STORAGE_USER);
        if (stored) {
          const user = JSON.parse(stored);
          if (user && (!user.avatar || user.avatar.includes('AB6AXuAFC'))) {
            user.avatar = '/avatar.png';
            localStorage.setItem(SESSION_STORAGE_USER, JSON.stringify(user));
          }
          return user;
        }
      }
    } catch (e) {
      console.warn('Error reading stored user', e);
    }
    return null;
  },

  // Save active user
  setCurrentUser(user) {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (user) {
        // Check if a DIFFERENT user is signing in — if so, clear the previous user's medicine/routine cache
        try {
          const prevUser = JSON.parse(localStorage.getItem(SESSION_STORAGE_USER) || 'null');
          const prevId = prevUser?.id || prevUser?.email || prevUser?.phone;
          const newId = user?.id || user?.email || user?.phone;
          if (prevId && newId && prevId !== newId) {
            // Different user — purge all medicine/routine localStorage to prevent cross-account leaks
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
              const k = localStorage.key(i);
              if (k && (k.startsWith('sahara_medicines') || k.startsWith('sahara_app_state') || k.startsWith('sahara_game_scores'))) {
                keysToRemove.push(k);
              }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));
          }
        } catch (e) {}
        localStorage.setItem(SESSION_STORAGE_USER, JSON.stringify(user));
      } else {
        // Sign out — clear medicine/routine cache entirely so next user starts clean
        try {
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && (k.startsWith('sahara_medicines') || k.startsWith('sahara_app_state') || k.startsWith('sahara_game_scores'))) {
              keysToRemove.push(k);
            }
          }
          keysToRemove.forEach(k => localStorage.removeItem(k));
        } catch (e) {}
        localStorage.removeItem(SESSION_STORAGE_USER);
      }
      window.dispatchEvent(new CustomEvent('sahara:auth-change', { detail: { user } }));
    }
  },

  // Update profile avatar for active user and sync to database
  updateAvatar(avatarUrl) {
    const user = this.getCurrentUser();
    if (user) {
      user.avatar = avatarUrl;
      this.setCurrentUser(user);
    }
    const patient = dataStore.getPatient ? dataStore.getPatient() : (dataStore.state.patient || {});
    if (patient && typeof patient === 'object') {
      patient.avatar = avatarUrl;
      dataStore.setPatient(patient);
      
      // Async sync to server database
      if (typeof window !== 'undefined' && window.fetch) {
        const caregiverEmail = dataStore.state.caregiver?.email || user?.email || '';
        fetch('/api/auth/elder-save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            elderProfile: { ...patient, avatar: avatarUrl },
            caregiverEmail,
          }),
        }).catch(err => console.warn('Avatar database sync error:', err));
      }
    }
    return user;
  },

  // Update profile for active user
  updateUserProfile({ name, age, location, city, state }) {
    const user = this.getCurrentUser() || {
      id: 'user_' + Date.now().toString(36),
      role: 'elder',
      caregiver: 'Riya Borah (Daughter)',
      authProvider: 'sahara-flow',
      avatar: '/avatar.png',
    };
    if (name && name.trim()) {
      user.name = name.trim();
    }
    if (age !== undefined && age !== '') {
      const numAge = parseInt(age, 10);
      if (!isNaN(numAge)) user.age = numAge;
    }
    if (location && location.trim()) user.location = location.trim();
    if (city && city.trim()) user.city = city.trim();
    if (state && state.trim()) user.state = state.trim();
    this.setCurrentUser(user);
    return user;
  },

  // Send Real SMS OTP to phone using Firebase Phone Authentication
  async sendPhoneOtp(rawPhone) {
    const cleanDigits = String(rawPhone || '').replace(/\D/g, '');
    let formattedPhone = '';
    if (cleanDigits.length === 10) {
      formattedPhone = `+91${cleanDigits}`;
    } else if (cleanDigits.length === 12 && cleanDigits.startsWith('91')) {
      formattedPhone = `+${cleanDigits}`;
    } else if (cleanDigits.length >= 10) {
      formattedPhone = cleanDigits.startsWith('+') ? cleanDigits : `+${cleanDigits}`;
    } else {
      return {
        success: false,
        message: 'Please enter a valid 10-digit mobile phone number.',
      };
    }

    if (!firebaseClientAuth) {
      return {
        success: false,
        message: 'Firebase client authentication is not initialized. Please try again.',
      };
    }

    try {
      const { RecaptchaVerifier, signInWithPhoneNumber } = await import('firebase/auth');

      // Ensure recaptcha container exists in DOM
      if (typeof document !== 'undefined' && !document.getElementById('recaptcha-container')) {
        const container = document.createElement('div');
        container.id = 'recaptcha-container';
        document.body.appendChild(container);
      }

      // Initialize or reuse invisible reCAPTCHA verifier
      if (!window.saharaRecaptchaVerifier) {
        window.saharaRecaptchaVerifier = new RecaptchaVerifier(firebaseClientAuth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {},
          'expired-callback': () => {
            console.warn('[reCAPTCHA] expired, resetting');
            try {
              window.saharaRecaptchaVerifier?.clear();
            } catch (e) {}
            window.saharaRecaptchaVerifier = null;
          },
        });
      }

      const confirmationResult = await signInWithPhoneNumber(
        firebaseClientAuth,
        formattedPhone,
        window.saharaRecaptchaVerifier
      );

      // Store confirmation result
      window.saharaPhoneConfirmation = confirmationResult;
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem('sahara_pending_phone', formattedPhone);
      }

      return {
        success: true,
        formattedPhone,
        message: `Real SMS verification code sent to ${formattedPhone}! Please check your messages.`,
      };
    } catch (err) {
      console.error('[Firebase Phone Auth error]:', err);
      try {
        window.saharaRecaptchaVerifier?.clear();
      } catch (e) {}
      window.saharaRecaptchaVerifier = null;

      let userMsg = 'Unable to send SMS verification code.';
      if (err.code === 'auth/invalid-phone-number') {
        userMsg = 'Invalid phone number format. Please check your 10-digit mobile number.';
      } else if (err.code === 'auth/too-many-requests') {
        userMsg = 'Too many SMS requests sent from this device. Please wait a moment before trying again.';
      } else if (err.code === 'auth/quota-exceeded') {
        userMsg = 'Daily SMS quota exceeded. Please try again later or sign in with Google.';
      } else if (err.code === 'auth/captcha-check-failed') {
        userMsg = 'Security verification failed. Please check your internet connection.';
      } else if (err.code === 'auth/billing-not-enabled') {
        userMsg = 'Phone authentication requires Firebase project billing or test numbers in console.';
      } else if (err.message) {
        userMsg = err.message;
      }

      return {
        success: false,
        error: err,
        code: err.code,
        message: userMsg,
      };
    }
  },

  // Check if elder user exists in database / Firestore
  async checkElderUser(rawIdentifier) {
    try {
      const res = await fetch('/api/auth/elder-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: rawIdentifier }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[authService] checkElderUser network notice:', err);
    }
    return { exists: false, isNewUser: true };
  },

  // Verify Real Firebase 6-Digit SMS OTP
  async verifyOtp(rawPhone, otpToken) {
    const cleanDigits = String(rawPhone || '').replace(/\D/g, '');
    let formattedPhone = cleanDigits.length === 10
      ? `+91${cleanDigits}`
      : (cleanDigits.startsWith('91') ? `+${cleanDigits}` : `+${cleanDigits}`);

    const token = String(otpToken || '').trim();
    if (!token || token.length < 4) {
      return {
        success: false,
        message: 'Please enter the 6-digit verification code sent to your phone messages.',
      };
    }

    // 1. Verify with real Firebase confirmationResult if active
    if (typeof window !== 'undefined' && window.saharaPhoneConfirmation) {
      try {
        const userCredential = await window.saharaPhoneConfirmation.confirm(token);
        const fbUser = userCredential.user;
        console.log('[Firebase Phone Auth] Real SMS OTP confirmed for:', fbUser.phoneNumber);
      } catch (fbErr) {
        console.warn('[Firebase Phone Auth] Confirm error:', fbErr.code, fbErr.message);
        let errorMsg = 'Invalid verification code. Please check your SMS messages.';
        if (fbErr.code === 'auth/invalid-verification-code') {
          errorMsg = 'Incorrect SMS verification code. Please check the 6-digit code received in your messages.';
        } else if (fbErr.code === 'auth/code-expired') {
          errorMsg = 'The SMS verification code has expired. Please click "Resend SMS Code".';
        }
        return {
          success: false,
          error: fbErr,
          message: errorMsg,
        };
      }
    } else {
      // Allow testing fallback code if no active session
      if (token !== '5432' && token !== '123456' && token !== '482910') {
        return {
          success: false,
          message: 'SMS verification session not found. Please click "Change Number" or "Resend SMS Code" to receive a fresh SMS.',
        };
      }
    }

    // 2. CHECK DATABASE FOR EXISTING USER VS FIRST TIME SIGNUP
    const checkRes = await this.checkElderUser(formattedPhone);
    const isNewUser = !checkRes.exists;

    if (!isNewUser && checkRes.elder) {
      // 2ND TIME ONWARDS: Load saved profile into dataStore and route to Elder Dashboard
      dataStore.loadLinkedPatient(checkRes.elder);
      const returningUser = {
        id: checkRes.elder.id || formattedPhone,
        phone: formattedPhone,
        name: checkRes.elder.name || 'Sahara Member',
        honorific: checkRes.elder.honorific || `${(checkRes.elder.name || 'Member').split(' ')[0]} ji`,
        age: checkRes.elder.age || 74,
        city: checkRes.elder.city || 'Guwahati',
        state: checkRes.elder.state || 'Assam',
        role: 'elder',
        caregiver: checkRes.elder.caregiverEmail || 'riya@sahara.care',
        authProvider: 'firebase-phone',
        avatar: checkRes.elder.avatar || '/avatar.png',
      };
      this.setCurrentUser(returningUser);
      return {
        success: true,
        user: returningUser,
        isNewUser: false,
        elderProfile: checkRes.elder,
        message: `Welcome back, ${checkRes.elder.name}! Entering your Sanctuary...`,
      };
    }

    // 1ST TIME SIGNUP: Returns isNewUser: true to prompt Step 3
    const pendingUser = {
      id: formattedPhone,
      phone: formattedPhone,
      role: 'elder',
      authProvider: 'firebase-phone',
      avatar: '/avatar.png',
    };
    this.setCurrentUser(pendingUser);

    return {
      success: true,
      user: pendingUser,
      isNewUser: true,
      phone: formattedPhone,
      message: 'Mobile verified! Please complete your profile details.',
    };
  },

  // Process any authenticated Google User (popup or in-app Google modal)
  async processGoogleUser({ email, displayName, photoURL, role = 'elder', mode = 'signin' }) {
    if (!email || !email.includes('@')) {
      return { success: false, message: 'Valid Google email is required.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const rawPrefix = cleanEmail.split('@')[0].replace(/[\._]/g, ' ');
    const fallbackName = rawPrefix
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    const cleanName = (displayName && displayName.trim()) ? displayName.trim() : (fallbackName || 'Sahara Member');

    const googleUser = {
      uid: 'google_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_'),
      email: cleanEmail,
      displayName: cleanName,
      photoURL: photoURL || '/avatar.png',
    };

    // Process Caregiver Google Login
    if (role === 'caregiver') {
      const caregiverRecord = {
        id: googleUser.uid,
        name: googleUser.displayName,
        email: googleUser.email,
        role: 'caregiver',
        authProvider: 'google',
        avatar: googleUser.photoURL,
      };
      this.setCurrentUser(caregiverRecord);
      return {
        success: true,
        user: caregiverRecord,
        role: 'caregiver',
        message: `Signed in with Google as ${googleUser.displayName} (Caregiver Portal)`,
      };
    }

    // If explicit SIGNUP mode was selected (e.g. tapping "Sign Up with Google"):
    if (mode === 'signup') {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('sahara_elder_setup_completed_' + cleanEmail);
        localStorage.removeItem('sahara_elder_setup_completed');
        localStorage.removeItem('sahara_google_elder_' + cleanEmail);
        localStorage.removeItem('sahara_patient_profile');
      }
      if (dataStore && dataStore.clearPatient) {
        dataStore.clearPatient();
      }
      const pendingGoogleUser = {
        id: googleUser.uid,
        email: googleUser.email,
        name: googleUser.displayName,
        role: 'elder',
        authProvider: 'google',
        avatar: googleUser.photoURL || '/avatar.png',
      };
      this.setCurrentUser(pendingGoogleUser);
      return {
        success: true,
        user: pendingGoogleUser,
        role: 'elder',
        isNewUser: true,
        email: googleUser.email,
        message: 'Google account connected! Please fill in your elder & caregiver profile details.',
      };
    }

    // Process Elder Google Login (SIGNIN mode): Check Database / Firebase Claims
    let checkRes = await this.checkElderUser(googleUser.email);
    let resolvedElder = checkRes?.elder;

    if (checkRes?.exists && resolvedElder && resolvedElder.name) {
      // RETURNING GOOGLE USER: Auto-remember details and load into dataStore!
      dataStore.loadLinkedPatient(resolvedElder);
      const returningGoogleElder = {
        id: resolvedElder.id || googleUser.email,
        email: googleUser.email,
        name: resolvedElder.name || googleUser.displayName,
        honorific: resolvedElder.honorific || `${(resolvedElder.name || googleUser.displayName).split(' ')[0]} ji`,
        age: resolvedElder.age || 74,
        city: resolvedElder.city || 'Guwahati',
        state: resolvedElder.state || 'Assam',
        role: 'elder',
        caregiver: resolvedElder.caregiverEmail || '',
        authProvider: 'google',
        avatar: resolvedElder.avatar || googleUser.photoURL || '/avatar.png',
      };
      this.setCurrentUser(returningGoogleElder);

      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('sahara_elder_setup_completed_' + cleanEmail, 'true');
        localStorage.setItem('sahara_google_elder_' + cleanEmail, JSON.stringify(resolvedElder));
        localStorage.setItem('sahara_patient_profile', JSON.stringify(resolvedElder));
      }

      return {
        success: true,
        user: returningGoogleElder,
        role: 'elder',
        isNewUser: false,
        elderProfile: resolvedElder,
        message: `Welcome back, ${resolvedElder.name}! Entering your Sanctuary...`,
      };
    }

    // If SIGNIN was clicked but no registered account exists in DB/Firebase:
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('sahara_elder_setup_completed_' + cleanEmail);
      localStorage.removeItem('sahara_elder_setup_completed');
      localStorage.removeItem('sahara_google_elder_' + cleanEmail);
      localStorage.removeItem('sahara_patient_profile');
    }
    if (dataStore && dataStore.clearPatient) {
      dataStore.clearPatient();
    }

    const pendingGoogleUser = {
      id: googleUser.uid,
      email: googleUser.email,
      name: googleUser.displayName,
      role: 'elder',
      authProvider: 'google',
      avatar: googleUser.photoURL || '/avatar.png',
    };
    this.setCurrentUser(pendingGoogleUser);

    return {
      success: true,
      user: pendingGoogleUser,
      role: 'elder',
      isNewUser: true,
      email: googleUser.email,
      message: 'No existing profile found. Please complete your elder & caregiver profile details.',
    };
  },

  // Google Sign In via Real Google OAuth (Popup + Redirect fallback)
  async signInWithGoogle(role = 'elder', mode = 'signin') {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem('sahara_google_auth_role', role);
      sessionStorage.setItem('sahara_google_auth_mode', mode);
      sessionStorage.removeItem('sahara_signed_out');
    }
    if (firebaseClientAuth) {
      try {
        const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } = await import('firebase/auth');
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });

        try {
          const result = await signInWithPopup(firebaseClientAuth, provider);
          if (result?.user && result.user.email) {
            return await this.processGoogleUser({
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL,
              role,
              mode,
            });
          }
        } catch (popupErr) {
          console.warn('[signInWithPopup notice]:', popupErr.code, popupErr.message);
          if (
            popupErr.code === 'auth/popup-blocked' ||
            popupErr.code === 'auth/cancelled-popup-request' ||
            popupErr.code === 'auth/operation-not-supported-in-this-environment'
          ) {
            // Popup blocked: fallback to full page redirection
            await signInWithRedirect(firebaseClientAuth, provider);
            return { redirecting: true };
          }
          if (popupErr.code === 'auth/popup-closed-by-user' || popupErr.code === 'auth/user-cancelled') {
            return { success: false, cancelled: true, message: 'Google Sign-In was cancelled.' };
          }
          throw popupErr;
        }
      } catch (err) {
        console.warn('[signInWithGoogle notice]:', err);
        return {
          success: false,
          error: err,
          code: err.code,
          message: err.message,
        };
      }
    }
    return {
      success: false,
      message: 'Firebase client authentication is not initialized.',
    };
  },

  // Check for Google Auth Redirect Result when user returns from accounts.google.com
  async checkGoogleRedirectResult() {
    if (typeof window === 'undefined' || !firebaseClientAuth) return null;
    try {
      const { getRedirectResult } = await import('firebase/auth');
      const result = await getRedirectResult(firebaseClientAuth);
      if (result?.user && result.user.email) {
        let role = 'elder';
        let mode = 'signin';
        if (window.sessionStorage) {
          role = sessionStorage.getItem('sahara_google_auth_role') || 'elder';
          mode = sessionStorage.getItem('sahara_google_auth_mode') || 'signin';
          sessionStorage.removeItem('sahara_google_auth_role');
          sessionStorage.removeItem('sahara_google_auth_mode');
        }
        return await this.processGoogleUser({
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          role,
          mode,
        });
      }
    } catch (err) {
      console.warn('[checkGoogleRedirectResult notice]:', err.code, err.message);
      return {
        success: false,
        error: err,
        code: err.code,
        message: err.message,
      };
    }
    return null;
  },

  // Save Elder profile and link Caregiver credentials to database and client store
  async saveElderProfile(patientData, caregiverData, customIdentifier) {
    const cleanElderName = (patientData?.name || '').trim();
    if (!cleanElderName) {
      throw new Error('Elder full name is required to complete registration.');
    }
    const firstName = cleanElderName.split(' ')[0];
    const cleanHonorific = patientData?.honorific || (firstName ? `${firstName} ji` : cleanElderName);

    const mergedPatientData = {
      ...patientData,
      name: cleanElderName,
      honorific: cleanHonorific,
    };

    const elderIdentifier = customIdentifier || patientData?.phone || patientData?.email || 'elder_' + Date.now().toString(36);

    // 1. Authoritative write to Server Database & Firebase Auth Cloud Claims FIRST
    let resData = null;
    try {
      const res = await fetch('/api/auth/elder-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: elderIdentifier,
          rawIdentifier: elderIdentifier,
          patientData: mergedPatientData,
          caregiverData,
        }),
      });

      resData = await res.json().catch(() => ({}));
      if (!res.ok || !resData || !resData.success) {
        const errorDetail = resData?.error || resData?.message || (`Database returned HTTP status ${res.status}`);
        throw new Error(errorDetail);
      }
    } catch (err) {
      console.error('[authService] Cloud database save failure:', err);
      throw new Error(`Failed to save setup to cloud database: ${err.message || 'Network error'}. Please verify connection and try again.`);
    }

    const savedElder = resData?.elder || mergedPatientData;
    const savedCaregiver = resData?.caregiver || caregiverData;

    // 2. Direct Firestore writes for reciprocal account linking
    if (db) {
      try {
        const cleanElderId = normalizeElderId(savedElder.id || elderIdentifier);
        const cleanCgEmail = (savedCaregiver?.email || caregiverData?.email || '').trim().toLowerCase();

        // Save elder under elders/{elderUid} with explicit empty medications and routines for new signups
        const todayStr = new Date().toISOString().split('T')[0];
        setDoc(doc(db, 'elders', cleanElderId), {
          uid: cleanElderId,
          elderName: cleanElderName,
          name: cleanElderName,
          age: savedElder.age || patientData?.age || 74,
          caregiverUid: cleanCgEmail,
          caregiverEmail: cleanCgEmail,
          caregiverName: savedCaregiver?.name || caregiverData?.name || 'Caregiver Companion',
          location: savedElder.location || `${savedElder.city || 'Guwahati'}, ${savedElder.state || 'Assam'}`,
          city: savedElder.city || 'Guwahati',
          state: savedElder.state || 'Assam',
          status: savedElder.status || 'Mild Cognitive Support Mode',
          problemStatement: savedElder.problemStatement || 'Mild Cognitive Support Mode',
          startingLevel: savedElder.startingLevel || 1,
          unlockedLevel: savedElder.unlockedLevel || 1,
          currentSublevel: 1,
          todayGameScore: 0,
          todayGameSessions: 0,
          medications: [],
          routines: [],
          aiAnalysis: savedElder.aiAnalysis || null,
          updatedAt: serverTimestamp(),
        }, { merge: true }).catch(() => {});

        // Explicitly create an empty dailyLog for today
        setDoc(doc(db, 'elders', cleanElderId, 'dailyLogs', todayStr), {
          date: todayStr,
          todayScore: 0,
          todaySessions: 0,
          lastPlayedLevel: 1,
          lastPlayedSublevel: 1,
          medications: [],
          routines: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true }).catch(() => {});

        // Save caregiver under caregivers/{caregiverUid}
        if (cleanCgEmail) {
          setDoc(doc(db, 'caregivers', cleanCgEmail), {
            uid: cleanCgEmail,
            email: cleanCgEmail,
            name: savedCaregiver?.name || caregiverData?.name || 'Caregiver Companion',
            linkedElderId: cleanElderId,
            role: 'caregiver',
            updatedAt: serverTimestamp(),
          }, { merge: true }).catch(() => {});
        }
      } catch (e) {}
    }

    // 3. Clear existing local cache and update client store & active session
    if (dataStore) {
      dataStore.state.medicines = [];
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('sahara_medicines') || k.startsWith('sahara_app_state') || k.startsWith('sahara_game_scores'))) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
      } catch (e) {}
    }
    dataStore.updatePatientProfile(savedElder);
    if (savedCaregiver) {
      dataStore.updateCaregiverProfile(savedCaregiver);
      this.registerCaregiverAccount({
        name: savedCaregiver.name,
        email: savedCaregiver.email,
        password: caregiverData?.password || 'care123',
        patientData: savedElder,
      });
    }

    const user = {
      id: savedElder.id || elderIdentifier,
      name: cleanElderName,
      honorific: cleanHonorific,
      age: savedElder.age || patientData?.age || 74,
      city: savedElder.city || 'Guwahati',
      state: savedElder.state || 'Assam',
      status: savedElder.status || savedElder.problemStatement || 'Mild Cognitive Support Mode',
      problemStatement: savedElder.problemStatement || savedElder.status || 'Mild Cognitive Support Mode',
      role: 'elder',
      avatar: savedElder.avatar || '/avatar.png',
      authProvider: 'sahara-flow',
      caregiver: savedCaregiver?.email || caregiverData?.email || '',
    };
    this.setCurrentUser(user);

    if (typeof window !== 'undefined' && window.localStorage) {
      const cleanEmail = (savedElder.email || customIdentifier || '').trim().toLowerCase();
      if (cleanEmail && cleanEmail.includes('@')) {
        localStorage.setItem('sahara_elder_setup_completed_' + cleanEmail, 'true');
        localStorage.setItem('sahara_google_elder_' + cleanEmail, JSON.stringify(savedElder));
      }
      localStorage.setItem('sahara_patient_profile', JSON.stringify(savedElder));
      localStorage.setItem('sahara_elder_setup_completed', 'true');
    }

    return {
      success: true,
      elder: savedElder,
      caregiver: savedCaregiver,
      user,
    };
  },

  // Register caregiver account created during Elder Step 3
  registerCaregiverAccount({ name, email, password, patientData }) {
    if (!email || !password) return null;
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanName = (name || 'Caregiver').trim();

    const accounts = this.getRegisteredCaregivers();
    const existingIndex = accounts.findIndex(a => a.email.toLowerCase() === cleanEmail);

    const accountRecord = {
      id: 'caregiver_reg_' + Date.now().toString(36),
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      role: 'caregiver',
      registeredAt: new Date().toISOString(),
      patientData: patientData || JSON.parse(JSON.stringify(dataStore.getPatient())),
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3C9pKlylR36n8hHQndvUKkTljs_tOg3Gdg5-srU8WvV-YTOGYJeIOBOvqYISbX2RJdQgvmyliRh8-jt8-UlqHi4x_L4FNBDvdeUaqZfr7Vp9FMtzRQH-g0ov39z8XoigzQ2-C1QPqxbbL8QBjqY-WQ5c8XYX4jMP5ji1MumxGOHHdxB90LidJtUJl3RhpDWlM7FZ76v8qtgurN4tWzXc_4Hfwe_mzuvAQ5TyGqbEvHwY70aZyKa_ROg',
    };

    if (existingIndex >= 0) {
      accounts[existingIndex] = { ...accounts[existingIndex], ...accountRecord };
    } else {
      accounts.push(accountRecord);
    }

    try {
      localStorage.setItem(STORAGE_KEY_REGISTERED_CAREGIVERS, JSON.stringify(accounts));
    } catch (e) {
      console.warn('Could not save registered caregiver', e);
    }

    return accountRecord;
  },

  getRegisteredCaregivers() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY_REGISTERED_CAREGIVERS);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading caregivers', e);
    }
    // Default demo caregiver
    return [{
      id: 'default_caregiver_riya',
      name: 'Riya Borah',
      email: 'riya@sahara.care',
      password: 'care123',
      role: 'caregiver',
      patientData: JSON.parse(JSON.stringify(dataStore.getPatient())),
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3C9pKlylR36n8hHQndvUKkTljs_tOg3Gdg5-srU8WvV-YTOGYJeIOBOvqYISbX2RJdQgvmyliRh8-jt8-UlqHi4x_L4FNBDvdeUaqZfr7Vp9FMtzRQH-g0ov39z8XoigzQ2-C1QPqxbbL8QBjqY-WQ5c8XYX4jMP5ji1MumxGOHHdxB90LidJtUJl3RhpDWlM7FZ76v8qtgurN4tWzXc_4Hfwe_mzuvAQ5TyGqbEvHwY70aZyKa_ROg',
    }];
  },

  getLatestRegisteredCaregiver() {
    const list = this.getRegisteredCaregivers();
    if (list && list.length > 0) {
      const customOnes = list.filter(c => c.id !== 'default_caregiver_riya');
      if (customOnes.length > 0) {
        return customOnes[customOnes.length - 1];
      }
    }
    const storeCg = dataStore.getCaregiver ? dataStore.getCaregiver() : null;
    if (storeCg && storeCg.email) {
      return storeCg;
    }
    return list[0] || null;
  },

  // Caregiver Portal Login with email & password - queries database for linked elder profile and fails explicitly
  async loginCaregiver({ email, password }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail) {
      return { success: false, message: 'Please enter your caregiver email address.' };
    }
    if (!cleanPassword) {
      return { success: false, message: 'Please enter your caregiver portal password.' };
    }

    // 1. Authenticate with server database API first!
    let apiAuthFailed = false;
    let apiErrorMessage = '';
    try {
      const res = await fetch('/api/auth/caregiver-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });
      const result = await res.json().catch(() => ({}));
      if (res.ok && result && result.success && result.user) {
        if (!result.elderProfile || !result.elderProfile.name) {
          return {
            success: false,
            message: `No elder profile is associated with caregiver "${cleanEmail}" in the database.`
          };
        }
        // Load real linked elder profile into dataStore
        dataStore.loadLinkedPatient(result.elderProfile, result.user);
        if (dataStore.updateCaregiverProfile) {
          dataStore.updateCaregiverProfile(result.user);
        }
        this.setCurrentUser(result.user);
        this.registerCaregiverAccount({
          name: result.user.name,
          email: result.user.email,
          password: cleanPassword,
          patientData: result.elderProfile,
        });
        return {
          success: true,
          user: result.user,
          elderProfile: result.elderProfile,
          message: result.message || `Welcome back, ${result.user.name}! Connected to ${result.elderProfile.name}'s care overview.`
        };
      } else if (result && !result.success) {
        apiAuthFailed = true;
        apiErrorMessage = result.message || '';
      }
    } catch (apiErr) {
      console.warn('[authService] Caregiver API login network error:', apiErr);
      apiAuthFailed = true;
    }

    // 2. Direct Firebase Client Authentication (if API endpoint network failed)
    if (firebaseClientAuth) {
      try {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        const userCred = await signInWithEmailAndPassword(firebaseClientAuth, cleanEmail, cleanPassword);
        const fbUser = userCred.user;
        const tokenResult = await fbUser.getIdTokenResult(true);
        const claims = tokenResult?.claims || {};

        let linkedElder = claims.linkedElder || null;
        if (!linkedElder || !linkedElder.name) {
          const syncRes = await this.syncCaregiverElderData(cleanEmail);
          if (syncRes && syncRes.elderProfile) {
            linkedElder = syncRes.elderProfile;
          }
        }

        // Additional browser-side resolution:
        if (!linkedElder || !linkedElder.name) {
          const localPatient = dataStore.getProfile ? dataStore.getProfile() : null;
          if (localPatient && localPatient.name && localPatient.name !== 'Asha Devi Borah') {
            linkedElder = localPatient;
          }
        }

        if (!linkedElder || !linkedElder.name) {
          if (typeof window !== 'undefined' && window.localStorage) {
            try {
              const raw = localStorage.getItem('sahara_patient_profile');
              if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.name) {
                  linkedElder = parsed;
                }
              }
            } catch (e) {}
          }
        }

        if (!linkedElder || !linkedElder.name) {
          return {
            success: false,
            message: `Caregiver account found, but no elder profile is linked in the database. Please check registration.`
          };
        }

        const caregiverUser = {
          id: fbUser.uid,
          name: fbUser.displayName || cleanEmail.split('@')[0] || 'Caregiver',
          email: cleanEmail,
          role: 'caregiver',
          relation: claims.relation || 'Primary Caregiver',
          elderPatient: linkedElder.name,
          elderPatientId: linkedElder.id || '',
          linkedElder: linkedElder,
          authProvider: 'firebase-cloud-auth',
          avatar: fbUser.photoURL || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3C9pKlylR36n8hHQndvUKkTljs_tOg3Gdg5-srU8WvV-YTOGYJeIOBOvqYISbX2RJdQgvmyliRh8-jt8-UlqHi4x_L4FNBDvdeUaqZfr7Vp9FMtzRQH-g0ov39z8XoigzQ2-C1QPqxbbL8QBjqY-WQ5c8XYX4jMP5ji1MumxGOHHdxB90LidJtUJl3RhpDWlM7FZ76v8qtgurN4tWzXc_4Hfwe_mzuvAQ5TyGqbEvHwY70aZyKa_ROg',
        };

        dataStore.loadLinkedPatient(linkedElder, caregiverUser);
        if (dataStore.updateCaregiverProfile) {
          dataStore.updateCaregiverProfile(caregiverUser);
        }
        this.setCurrentUser(caregiverUser);

        return {
          success: true,
          user: caregiverUser,
          elderProfile: linkedElder,
          message: `Welcome back, ${caregiverUser.name}! Connected to ${linkedElder.name}'s care overview via Firebase Cloud.`
        };
      } catch (fbAuthErr) {
        console.warn('[authService] Direct Firebase client auth error:', fbAuthErr.code, fbAuthErr.message);
        if (fbAuthErr.code === 'auth/wrong-password' || fbAuthErr.code === 'auth/invalid-credential') {
          return {
            success: false,
            message: 'Incorrect password for this caregiver account. Please check your credentials.'
          };
        }
        if (fbAuthErr.code === 'auth/user-not-found') {
          return {
            success: false,
            message: `No caregiver account found for "${cleanEmail}". Please check your email or register during Elder View Step 3.`
          };
        }
      }
    }

    // Explicit failure rather than silently masking missing database reads
    return {
      success: false,
      message: apiErrorMessage || `Authentication failed for "${cleanEmail}". Please ensure you have completed the Elder & Caregiver setup on Device A and check your internet connection.`
    };
  },

  // Synchronize Caregiver and Elder profiles across devices from Cloud
  async syncCaregiverElderData(caregiverEmail) {
    if (!caregiverEmail) return null;
    try {
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: caregiverEmail, role: 'caregiver' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data.elderProfile) {
          dataStore.loadLinkedPatient(data.elderProfile, data.user || data.caregiver);
          if (data.user) {
            this.setCurrentUser(data.user);
          }
          return data;
        }
      }
    } catch (e) {
      console.warn('[authService] syncCaregiverElderData notice:', e);
    }
    return null;
  },

  async syncElderData(elderIdentifier) {
    if (!elderIdentifier) return null;
    try {
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: elderIdentifier, role: 'elder' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data.elder) {
          dataStore.loadLinkedPatient(data.elder, data.caregiver);
          return data;
        }
      }
    } catch (e) {
      console.warn('[authService] syncElderData notice:', e);
    }
    return null;
  },

  // Alias for backward compatibility
  async signInCaregiver(email, password) {
    return this.loginCaregiver({ email, password });
  },

  // Sign out
  async signOut() {
    if (firebaseClientAuth) {
      try {
        const { signOut: fbSignOut } = await import('firebase/auth');
        await fbSignOut(firebaseClientAuth);
      } catch (e) {
        console.warn('[authService] Firebase signOut notice:', e);
      }
    }
    const supabase = getSupabase();
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    this.setCurrentUser(null);
    if (dataStore && dataStore.resetStore) {
      dataStore.resetStore();
    }
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        sessionStorage.clear();
        sessionStorage.setItem('sahara_signed_out', 'true');
      } catch (e) {}
    }
  },
};
