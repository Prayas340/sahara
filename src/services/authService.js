import { getSupabase } from './supabase.js';
import { dataStore } from './dataStore.js';
import { auth as firebaseClientAuth, googleProvider } from '../lib/firebaseClient.js';
import { signInWithPopup } from 'firebase/auth';

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
    if (user) {
      localStorage.setItem(SESSION_STORAGE_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_STORAGE_USER);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sahara:auth-change', { detail: { user } }));
    }
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
  async processGoogleUser({ email, displayName, photoURL, role = 'elder' }) {
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

    // Process Elder Google Login: CHECK DATABASE FOR FIRST-TIME VS 2ND TIME
    const checkRes = await this.checkElderUser(googleUser.email);
    const isNewUser = !checkRes.exists;

    if (!isNewUser && checkRes.elder) {
      // 2ND TIME RETURNING GOOGLE USER: Auto-remember details and load into dataStore!
      dataStore.loadLinkedPatient(checkRes.elder);
      const returningGoogleElder = {
        id: checkRes.elder.id || googleUser.email,
        email: googleUser.email,
        name: checkRes.elder.name || googleUser.displayName,
        honorific: checkRes.elder.honorific || `${(checkRes.elder.name || googleUser.displayName).split(' ')[0]} ji`,
        age: checkRes.elder.age || 74,
        city: checkRes.elder.city || 'Guwahati',
        state: checkRes.elder.state || 'Assam',
        role: 'elder',
        caregiver: checkRes.elder.caregiverEmail || '',
        authProvider: 'google',
        avatar: checkRes.elder.avatar || googleUser.photoURL || '/avatar.png',
      };
      this.setCurrentUser(returningGoogleElder);

      return {
        success: true,
        user: returningGoogleElder,
        role: 'elder',
        isNewUser: false,
        elderProfile: checkRes.elder,
        message: `Welcome back, ${checkRes.elder.name}! Entering your Sanctuary...`,
      };
    }

    // 1ST TIME GOOGLE SIGNUP: Clear old patient from dataStore so it doesn't bleed into new account
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
      message: 'Google account verified! Please complete your profile details.',
    };
  },

  // Google Sign In via Real Google OAuth (Popup + Redirect fallback)
  async signInWithGoogle(role = 'elder') {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem('sahara_google_auth_role', role);
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
        if (window.sessionStorage) {
          role = sessionStorage.getItem('sahara_google_auth_role') || 'elder';
          sessionStorage.removeItem('sahara_google_auth_role');
        }
        return await this.processGoogleUser({
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          role,
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
    const cleanElderName = (patientData?.name || 'Asha Devi Borah').trim();
    const firstName = cleanElderName.split(' ')[0];
    const cleanHonorific = patientData?.honorific || (firstName ? `${firstName} ji` : cleanElderName);

    const mergedPatientData = {
      ...patientData,
      name: cleanElderName,
      honorific: cleanHonorific,
    };

    if (patientData) {
      dataStore.updatePatientProfile(mergedPatientData);
    }
    if (caregiverData) {
      dataStore.updateCaregiverProfile(caregiverData);
      this.registerCaregiverAccount({
        name: caregiverData.name,
        email: caregiverData.email,
        password: caregiverData.password,
        patientData: mergedPatientData,
      });
    }

    const elderIdentifier = customIdentifier || patientData?.phone || patientData?.email || 'elder_' + Date.now().toString(36);

    // Persist to Server Database & Firestore
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
      if (res.ok) {
        const savedData = await res.json();
        console.log('[authService] Saved to database successfully:', savedData);
      }
    } catch (err) {
      console.warn('[authService] Server database save note:', err);
    }

    const user = {
      id: elderIdentifier,
      name: cleanElderName,
      honorific: cleanHonorific,
      age: patientData?.age || 74,
      city: patientData?.city || 'Guwahati',
      state: patientData?.state || 'Assam',
      status: mergedPatientData.status || mergedPatientData.problemStatement || 'Mild Cognitive Support Mode',
      problemStatement: mergedPatientData.problemStatement || mergedPatientData.status || 'Mild Cognitive Support Mode',
      role: 'elder',
      avatar: patientData?.avatar || '/avatar.png',
      authProvider: 'sahara-flow',
      caregiver: caregiverData?.email || '',
    };
    this.setCurrentUser(user);
    return user;
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

  // Caregiver Portal Login with email & password - directly fetches linked elder profile from Database!
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
    try {
      const res = await fetch('/api/auth/caregiver-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });
      const result = await res.json();
      if (result && result.success && result.user) {
        // DIRECTLY FETCH & LOAD LINKED ELDER PROFILE INTO DATASTORE!
        if (result.elderProfile) {
          dataStore.loadLinkedPatient(result.elderProfile);
        }
        if (dataStore.updateCaregiverProfile) {
          dataStore.updateCaregiverProfile(result.user);
        }
        this.setCurrentUser(result.user);
        this.registerCaregiverAccount({
          name: result.user.name,
          email: result.user.email,
          password: cleanPassword,
          patientData: result.elderProfile || dataStore.getPatient(),
        });
        return {
          success: true,
          user: result.user,
          elderProfile: result.elderProfile || dataStore.getPatient(),
          message: result.message || `Welcome back, ${result.user.name}! Connected to ${result.elderProfile?.name}'s care overview.`
        };
      } else if (result && !result.success) {
        return {
          success: false,
          message: result.message || 'Invalid caregiver credentials. Please check your email and password.'
        };
      }
    } catch (apiErr) {
      console.warn('[authService] Caregiver API login fallback to local cache:', apiErr);
    }

    // 2. Client-side local fallback
    const caregivers = this.getRegisteredCaregivers();
    let matched = caregivers.find(c => c.email.toLowerCase() === cleanEmail);

    if (!matched) {
      const storeCg = dataStore.getCaregiver ? dataStore.getCaregiver() : null;
      if (storeCg && storeCg.email && storeCg.email.toLowerCase() === cleanEmail) {
        matched = {
          ...storeCg,
          patientData: dataStore.getPatient(),
        };
      }
    }

    if (!matched && cleanEmail === 'riya@sahara.care') {
      matched = {
        name: 'Riya Borah',
        email: 'riya@sahara.care',
        password: 'care123',
        patientData: dataStore.getPatient(),
      };
    }

    if (!matched) {
      return {
        success: false,
        message: `No caregiver registered with "${cleanEmail}". Please register during Elder View Step 3.`
      };
    }

    const isDemoPassword = cleanEmail === 'riya@sahara.care' && (cleanPassword === 'care123' || cleanPassword === 'care1234');
    if (matched.password && matched.password !== cleanPassword && !isDemoPassword) {
      return {
        success: false,
        message: 'Incorrect password for this caregiver account. Please check your credentials.'
      };
    }

    if (matched.patientData) {
      dataStore.loadLinkedPatient(matched.patientData);
    }
    const elderProfile = matched.patientData || dataStore.getPatient();

    const caregiverUser = {
      id: matched.id || 'caregiver_' + Date.now().toString(36),
      name: matched.name || 'Caregiver',
      email: matched.email,
      role: 'caregiver',
      elderPatient: elderProfile.name,
      elderPatientId: elderProfile.id,
      linkedElder: elderProfile,
      authProvider: 'caregiver-credentials',
      avatar: matched.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3C9pKlylR36n8hHQndvUKkTljs_tOg3Gdg5-srU8WvV-YTOGYJeIOBOvqYISbX2RJdQgvmyliRh8-jt8-UlqHi4x_L4FNBDvdeUaqZfr7Vp9FMtzRQH-g0ov39z8XoigzQ2-C1QPqxbbL8QBjqY-WQ5c8XYX4jMP5ji1MumxGOHHdxB90LidJtUJl3RhpDWlM7FZ76v8qtgurN4tWzXc_4Hfwe_mzuvAQ5TyGqbEvHwY70aZyKa_ROg',
    };

    this.setCurrentUser(caregiverUser);
    return {
      success: true,
      user: caregiverUser,
      elderProfile,
      message: `Welcome back, ${caregiverUser.name}! Connected to ${elderProfile.name}'s care overview.`
    };
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
