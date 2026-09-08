'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/authService.js';
import { dataStore } from '../services/dataStore.js';
import { getTranslation } from '../utils/i18n.js';
import { speakText, toggleAccessibilityTextSize } from '../utils/speech.js';
import { INDIAN_STATES, getCitiesForState } from '../utils/geoData.js';
import { showToast } from '../components/Toast.jsx';
import { auth as firebaseClientAuth } from '../lib/firebaseClient.js';

export default function HomePage() {
  const router = useRouter();

  // Multi-step onboarding state: 1 = Phone, 2 = OTP, 3 = Profile Details
  const [step, setStep] = useState(1);
  const [authMethod, setAuthMethod] = useState('phone'); // 'phone' | 'google'
  const [googleEmail, setGoogleEmail] = useState('');
  const [activeLanguage, setActiveLanguage] = useState('English');
  const [phone, setPhone] = useState('98540 12345');
  const [otpDigits, setOtpDigits] = useState(['5', '4', '3', '2']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  // In-App Google Account Modal
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [modalGoogleEmail, setModalGoogleEmail] = useState('');
  const [modalGoogleName, setModalGoogleName] = useState('');
  const [isSubmittingGoogleModal, setIsSubmittingGoogleModal] = useState(false);

  // Step 3 Profile State
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [selectedState, setSelectedState] = useState('Assam');
  const [selectedCity, setSelectedCity] = useState('Guwahati');
  const [availableCities, setAvailableCities] = useState([]);

  // Step 3 Caregiver Account Linking State
  const [cgName, setCgName] = useState('');
  const [cgEmail, setCgEmail] = useState('');
  const [cgPassword, setCgPassword] = useState('');

  useEffect(() => {
    const lang = dataStore.getLanguage ? dataStore.getLanguage() : 'English';
    setActiveLanguage(lang);

    const activeUser = authService.getCurrentUser ? authService.getCurrentUser() : null;
    const initialPatient = dataStore.getPatient ? dataStore.getPatient() : null;
    if (activeUser && initialPatient && initialPatient.name) {
      setFullName(initialPatient.name);
      if (initialPatient.age) {
        setAge(String(initialPatient.age));
      }
      const st = initialPatient.state || 'Assam';
      setSelectedState(st);
      const cities = getCitiesForState(st);
      setAvailableCities(cities);
      if (initialPatient.city) {
        setSelectedCity(initialPatient.city);
      } else {
        setSelectedCity(cities[0] || 'Guwahati');
      }
    } else {
      setAvailableCities(getCitiesForState('Assam'));
    }

    // Listen to Firebase Auth state on mount (catches redirects and saved sessions)
    let unsubscribe = null;
    if (firebaseClientAuth) {
      import('firebase/auth').then(({ onAuthStateChanged, getRedirectResult }) => {
        // 1. Check redirect result
        getRedirectResult(firebaseClientAuth).then(async (result) => {
          if (result?.user && result.user.email) {
            const role = typeof window !== 'undefined' ? (sessionStorage.getItem('sahara_google_auth_role') || 'elder') : 'elder';
            const res = await authService.processGoogleUser({
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL,
              role,
            });
            if (res?.success) {
              if (res.isNewUser) {
                setAuthMethod('google');
                const cleanEmail = res.email || result.user.email;
                setGoogleEmail(cleanEmail);
                const cleanName = (res.user?.name || cleanEmail.split('@')[0] || '').replace(/\s*\(.*?\)\s*/g, '');
                setFullName(cleanName);
                setAge('');
                setCgName('');
                setCgEmail('');
                setCgPassword('');
                showToast(`Google account verified as ${cleanEmail}! Please complete your companion & caregiver details.`, 'info', 5000);
                setStep(3);
              } else {
                showToast(res.message || `Welcome back, ${res.user?.name || 'Member'}! Loading your Sanctuary...`, 'success', 4000);
                router.push('/elder-dashboard');
              }
            }
          }
        }).catch((err) => console.warn('[getRedirectResult error]:', err));

        // 2. Listen to active auth state
        unsubscribe = onAuthStateChanged(firebaseClientAuth, async (fbUser) => {
          if (typeof window !== 'undefined' && sessionStorage.getItem('sahara_signed_out') === 'true') {
            return;
          }
          if (fbUser && fbUser.email && !authService.getCurrentUser()) {
            const role = typeof window !== 'undefined' ? (sessionStorage.getItem('sahara_google_auth_role') || 'elder') : 'elder';
            const res = await authService.processGoogleUser({
              email: fbUser.email,
              displayName: fbUser.displayName,
              photoURL: fbUser.photoURL,
              role,
            });
            if (res?.success) {
              if (res.isNewUser) {
                setAuthMethod('google');
                const cleanEmail = res.email || fbUser.email;
                setGoogleEmail(cleanEmail);
                const cleanName = (res.user?.name || cleanEmail.split('@')[0] || '').replace(/\s*\(.*?\)\s*/g, '');
                setFullName(cleanName);
                setAge('');
                setCgName('');
                setCgEmail('');
                setCgPassword('');
                showToast(`Google account verified as ${cleanEmail}! Please complete your companion & caregiver details.`, 'info', 5000);
                setStep(3);
              } else {
                showToast(res.message || `Welcome back, ${res.user?.name || 'Member'}! Loading your Sanctuary...`, 'success', 4000);
                router.push('/elder-dashboard');
              }
            }
          }
        });
      }).catch(() => {});
    }

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const t = getTranslation(activeLanguage);

  const handleLanguageSelect = (lang) => {
    setActiveLanguage(lang);
    dataStore.setLanguage(lang);
    showToast(`Language set to ${lang}`, 'info');
  };

  const handleStateChange = (st) => {
    setSelectedState(st);
    const cities = getCitiesForState(st);
    setAvailableCities(cities);
    setSelectedCity(cities[0] || '');
  };

  const handleVoiceGuide = (text) => {
    speakText(text);
    showToast(`🔊 ${text}`, 'info');
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    showToast(`SMS OTP sent to +91 ${phone}!`, 'success');
    setStep(2);
  };

  const [isSavingSetup, setIsSavingSetup] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoadingGoogle(true);
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem('sahara_signed_out');
    }
    try {
      const res = await authService.signInWithGoogle('elder');
      if (res?.redirecting) {
        showToast('Redirecting to Google to choose your account...', 'info', 3000);
        return;
      }
      if (res?.cancelled) {
        showToast('Google sign-in was cancelled.', 'info');
        return;
      }
      if (res?.success) {
        if (res.isNewUser) {
          // FIRST TIME SIGNUP: Prompt to fill up Step 3 details!
          setAuthMethod('google');
          const cleanEmail = res.email || '';
          setGoogleEmail(cleanEmail);
          const cleanName = (res.user?.name || cleanEmail.split('@')[0] || '').replace(/\s*\(.*?\)\s*/g, '');
          setFullName(cleanName);
          setAge('');
          setCgName('');
          setCgEmail('');
          setCgPassword('');
          showToast(`Google account verified as ${cleanEmail}! Please complete your companion & caregiver details.`, 'info', 5000);
          setStep(3);
        } else {
          // 2ND TIME ONWARDS: Remembered all details from database, jump straight to Sanctuary!
          showToast(res.message || `Welcome back, ${res.user?.name || 'Member'}! Loading your Sanctuary...`, 'success', 4000);
          router.push('/elder-dashboard');
        }
      } else {
        showToast(res?.message || 'Unable to sign in with Google.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Notice: ' + err.message, 'error');
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleCustomGoogleSubmit = async (e) => {
    e.preventDefault();
    const targetEmail = (modalGoogleEmail || '').trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes('@')) {
      showToast('Please enter a valid Google email address.', 'error');
      return;
    }
    setIsSubmittingGoogleModal(true);
    try {
      const res = await authService.processGoogleUser({
        email: targetEmail,
        displayName: modalGoogleName.trim(),
        role: 'elder',
      });
      setIsSubmittingGoogleModal(false);
      setIsGoogleModalOpen(false);

      if (res?.success) {
        if (res.isNewUser) {
          setAuthMethod('google');
          setGoogleEmail(res.email);
          const cleanName = (res.user?.name || res.email.split('@')[0]).replace(/\s*\(.*?\)\s*/g, '');
          setFullName(cleanName);
          setAge('');
          setCgName('');
          setCgEmail('');
          setCgPassword('');
          showToast(`Welcome ${cleanName}! Please complete your companion & caregiver details.`, 'info', 5000);
          setStep(3);
        } else {
          showToast(res.message || `Welcome back, ${res.user?.name}! Loading Sanctuary...`, 'success', 4000);
          router.push('/elder-dashboard');
        }
      } else {
        showToast(res?.message || 'Unable to verify Google account.', 'error');
      }
    } catch (err) {
      setIsSubmittingGoogleModal(false);
      console.error(err);
      showToast('Notice: ' + err.message, 'error');
    }
  };

  const handleInstantDemoLogin = async () => {
    const patientData = {
      name: 'Asha Devi Borah',
      age: 74,
      state: 'Assam',
      city: 'Guwahati',
      avatar: '/avatar.png',
      honorific: 'Asha ji',
      status: 'Mild Cognitive Support Mode',
      wing: 'Garden Terrace Wing',
      location: 'Guwahati, Assam',
      tabletBattery: 94,
      lastActive: 'Just now',
    };

    const caregiverData = {
      name: 'Riya Borah',
      email: 'riya@sahara.care',
      password: 'care123',
      relation: 'Daughter & Primary Caregiver',
      phone: '+91 98540 12345',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    };

    await authService.saveElderProfile(patientData, caregiverData, '+919854012345');
    showToast('Welcome Asha ji! Entering your Sanctuary...', 'success', 4000);
    router.push('/elder-dashboard');
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const entered = otpDigits.join('');
    if (entered.length < 4) {
      showToast('Please enter the 4-digit verification code', 'error');
      return;
    }
    setIsVerifying(true);

    try {
      const res = await authService.verifyOtp(phone, entered);
      setIsVerifying(false);

      if (res?.success) {
        if (res.isNewUser) {
          // 1ST TIME SIGNUP: Ask to complete Step 3 details!
          setAuthMethod('phone');
          setFullName('');
          setAge('');
          setCgName('');
          setCgEmail('');
          setCgPassword('');
          showToast('Phone verified! Please complete your profile and caregiver login details.', 'info', 4500);
          setStep(3);
        } else {
          // 2ND TIME RETURNING USER: Skips Step 3 and opens Sanctuary directly!
          showToast(res.message || `Welcome back, ${res.user?.name || 'Member'}! Loading your Sanctuary...`, 'success', 4000);
          router.push('/elder-dashboard');
        }
      } else {
        showToast(res?.message || 'Invalid verification code. Please enter 5432 or check your phone.', 'error');
      }
    } catch (err) {
      setIsVerifying(false);
      console.error(err);
      showToast('Verification error: ' + err.message, 'error');
    }
  };

  const handleCompleteSetup = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Please enter your full name', 'error');
      return;
    }

    setIsSavingSetup(true);

    const cleanDigits = phone.replace(/\D/g, '');
    const formattedPhone = cleanDigits.length >= 10
      ? (cleanDigits.startsWith('91') ? `+${cleanDigits}` : `+91${cleanDigits}`)
      : '';
    const targetIdentifier = authMethod === 'google' && googleEmail ? googleEmail : (formattedPhone || `user_${Date.now().toString(36)}`);

    const patientData = {
      name: fullName.trim(),
      age: parseInt(age, 10) || 72,
      state: selectedState,
      city: selectedCity,
      avatar: '/avatar.png',
      honorific: `${fullName.trim().split(' ')[0]} ji`,
      status: 'Mild Cognitive Support Mode',
      wing: 'Garden Terrace Wing',
      location: `${selectedCity}, ${selectedState}`,
      tabletBattery: 94,
      lastActive: 'Just now',
      phone: authMethod === 'phone' ? formattedPhone : '',
      email: authMethod === 'google' && googleEmail ? googleEmail : '',
    };

    const caregiverData = {
      name: cgName.trim() || 'Caregiver Companion',
      email: cgEmail.trim().toLowerCase() || 'caregiver@sahara.care',
      password: cgPassword || 'care123',
      relation: 'Primary Caregiver',
      phone: '+91 98540 12345',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    };

    try {
      await authService.saveElderProfile(patientData, caregiverData, targetIdentifier);
      setIsSavingSetup(false);
      showToast(`Welcome ${fullName}! Your details and caregiver login are saved to the database.`, 'success', 5000);
      router.push('/elder-dashboard');
    } catch (err) {
      setIsSavingSetup(false);
      console.error(err);
      showToast('Saved profile. Entering Sanctuary...', 'info');
      router.push('/elder-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#ebffe7] flex items-center justify-center p-3 sm:p-4 lg:p-6 overflow-y-auto">
      <main className="w-full max-w-lg lg:max-w-5xl xl:max-w-6xl mx-auto my-auto py-2 sm:py-4">
        {/* Top Switcher Bar */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="inline-flex p-1 bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-[#cdf2cb] gap-1">
            <button
              type="button"
              className="py-1.5 px-3.5 rounded-xl bg-[#0d631b] text-white font-extrabold text-xs sm:text-sm shadow-xs flex items-center gap-1.5 cursor-default"
            >
              <span className="material-symbols-outlined text-base">elderly</span>
              <span>Elder View Portal</span>
            </button>
            <button
              onClick={() => router.push('/caregiver-login')}
              type="button"
              className="py-1.5 px-3.5 rounded-xl text-[#40493d] hover:text-[#0d631b] hover:bg-[#ebffe7] font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">health_and_safety</span>
              <span>Caregiver Portal Login →</span>
            </button>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#0d631b] bg-white/80 px-3 py-1.5 rounded-full border border-[#cdf2cb] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#006e1c] animate-pulse"></span>
            Elder View Active
          </span>
        </div>

        {/* STEP 1: PHONE LOGIN & LANGUAGE SELECTION */}
        {step === 1 && (
          <div className="card-tactile overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-xl transition-all duration-300 border border-[#cdf2cb]">
            {/* Left Side: Cultural Illustration */}
            <div className="relative lg:col-span-5 bg-[#d9fdd6] p-5 sm:p-6 lg:p-7 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-[#cdf2cb]">
              <div className="relative z-10 flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-sm border border-[#cdf2cb]">
                  <img
                    alt="Sahara Logo"
                    className="w-8 h-8 object-contain rounded-full bg-white p-0.5"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuADfY8uUCdflx3PxgJV8n5Rdy5e1UqyJi1RpuX07Bmc9r6hn23Klt8mhC0O57Dlsy0AoO2Zfur4kxn9yueS6kMU1-B3o_rUnCtsYE80rKVOILi3Gl6wxP62ffyGjvNMaoafsux-4Nu3YfcznSLtBj71fvQApLWucdiSJyE4VD5KSm1AryUPF0ooW09SbgA3OdWj_0EfL0E3tOmeMY4frF7WwHEp3O9blDcLXakfekbdhrlgiYNNcO0c2Q"
                  />
                  <span className="text-lg font-extrabold text-[#0d631b]">Sahara</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0d631b] bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-[#cdf2cb]">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  <span>{t.gentleCare}</span>
                </span>
              </div>

              <div className="relative z-10 flex flex-col gap-3 my-auto">
                <div className="w-full rounded-2xl overflow-hidden shadow-md bg-white border border-[#cdf2cb]">
                  <img
                    className="w-full h-40 sm:h-48 object-cover object-center"
                    alt="Asha ji and Riya"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJSlVR-5VNbFEhXPfbHMokwKEVr4p84T1vioRIMtQbkjjZc_QouzIsH096JkiTRDihsg6TCuY9_5nzWs5gSPS21IyMjyNyEdLN0qMsDLQrgYsA9FNu2_N5GDRxhuuX3lTWOY1gqck6g0X49fzKVVjDsnW8EnjFBrqmMjH4v4C4u37k7sVe2eyvou_9I1gFBAfDUBLLhYXsfRWeGcXvm-WDEuz5BDstMLhUb4FNoAHXed73cvrYlATz3g"
                  />
                  <div className="p-3 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0d631b] animate-pulse"></span>
                      <p className="text-xs sm:text-sm font-bold text-[#0d631b]">{t.namasteWelcome}</p>
                    </div>
                    <button
                      onClick={() => handleVoiceGuide(t.voiceWelcome || t.audioInstruction || 'Welcome to Sahara')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#d3f8d0] text-[#0d631b] text-xs font-bold hover:bg-[#0d631b] hover:text-white transition-all cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-base">volume_up</span>
                      <span>{t.listen}</span>
                    </button>
                  </div>
                </div>

                <div className="text-left mt-1">
                  <h1 className="text-lg sm:text-xl font-extrabold text-[#032109] leading-snug">
                    {t.tagline}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#40493d] mt-1 leading-relaxed">
                    {t.subtitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side: Step 1 Phone Form */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-extrabold text-[#0d631b] uppercase tracking-wider bg-[#d9fdd6] px-3 py-1 rounded-full border border-[#cdf2cb]">
                    Step 1 of 3 · Phone & Language
                  </span>
                </div>

                {/* Language Selector Chips */}
                <div className="mb-5">
                  <label className="block text-xs font-extrabold text-[#032109] mb-2">
                    {t.chooseLanguage}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { code: 'English', label: 'English' },
                      { code: 'हिंदी', label: 'हिंदी' },
                      { code: 'অসমীয়া', label: 'অসমীয়া' },
                      { code: 'বাংলা', label: 'বাংলা' },
                      { code: 'মৈতৈলোন্', label: 'ꯃꯤꯇꯩꯂꯣꯟ' },
                    ].map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => handleLanguageSelect(item.code)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          activeLanguage === item.code
                            ? 'bg-[#006e1c] text-white shadow-md'
                            : 'bg-[#ebffe7] text-[#032109] border border-[#cdf2cb] hover:bg-[#d9fdd6]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Phone Form */}
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-extrabold text-[#032109] mb-1.5">
                      {t.phoneLabel || 'Mobile Phone Number'}
                    </label>
                    <div className="flex items-center rounded-2xl border-2 border-[#cdf2cb] focus-within:border-[#006e1c] bg-[#ebffe7]/30 px-3 py-2">
                      <span className="font-extrabold text-sm text-[#0d631b] mr-2">🇮🇳 +91</span>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="98540 12345"
                        className="w-full bg-transparent text-base font-bold text-[#032109] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Primary Send OTP Button */}
                  <button
                    type="submit"
                    className="btn-tactile btn-primary w-full py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg font-extrabold shadow-md flex items-center justify-center gap-2.5 cursor-pointer hover:shadow-lg transition-all"
                  >
                    <span>{t.sendOtp || 'Send OTP'}</span>
                    <span className="material-symbols-outlined text-2xl">arrow_forward</span>
                  </button>

                  {/* Divider */}
                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      {t.orSignInWith || 'or sign in with'}
                    </span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>

                  {/* Google Sign In Button */}
                  <button
                    id="login-google-btn"
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoadingGoogle}
                    className="w-full h-12 sm:h-13 rounded-2xl bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 px-4 shadow-sm active:scale-[0.99] cursor-pointer"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span className="font-extrabold">{isLoadingGoogle ? 'Connecting to Google...' : t.signInWithGoogle || 'Sign in with Google'}</span>
                  </button>
                </form>
              </div>

              {/* Gentle Reassurance Security Badge */}
              <div className="bg-[#ebffe7] rounded-2xl p-3 flex items-center gap-3 border border-[#cdf2cb]">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-[#0d631b]">
                  <span className="material-symbols-outlined text-xl">verified_user</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#032109]">{t.safeAndProtected || 'Safe & Protected'}</span>
                  <span className="text-[11px] text-[#40493d] leading-tight">
                    {t.safeDesc || 'Your information stays completely private and secure with family caregivers.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 2 && (
          <div className="card-tactile max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-[#cdf2cb] space-y-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#0d631b] hover:underline cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                <span>Change Number</span>
              </button>
              <span className="text-xs font-extrabold text-[#0d631b] uppercase bg-[#d9fdd6] px-3 py-1 rounded-full border border-[#cdf2cb]">
                Step 2 of 3 · Verification
              </span>
            </div>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#d9fdd6] text-[#006e1c] flex items-center justify-center mx-auto shadow-sm">
                <span className="material-symbols-outlined text-3xl">sms</span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#032109]">Enter 4-Digit Code</h2>
              <p className="text-xs sm:text-sm text-[#40493d]">
                We sent a gentle verification code to <strong>+91 {phone}</strong>
              </p>
            </div>

            {/* 4-digit tactile inputs */}
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex justify-center gap-3 sm:gap-4">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-box-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const val = e.target.value;
                      const next = [...otpDigits];
                      next[index] = val;
                      setOtpDigits(next);
                      if (val && index < 3) {
                        document.getElementById(`otp-box-${index + 1}`)?.focus();
                      }
                    }}
                    className="w-12 h-14 sm:w-14 sm:h-16 rounded-2xl text-center text-2xl font-extrabold bg-[#ebffe7]/50 border-2 border-[#cdf2cb] focus:border-[#006e1c] text-[#032109] focus:outline-none"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="btn-tactile btn-primary w-full py-4 rounded-2xl text-base font-extrabold shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isVerifying ? 'Verifying...' : 'Confirm Code & Continue'}</span>
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setOtpDigits(['5', '4', '3', '2']);
                  showToast('Filled sandbox verification code: 5432', 'info');
                }}
                className="text-xs font-bold text-[#0d631b] hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">auto_fix_high</span>
                <span>Auto-fill Demo Code (5432)</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: USER DETAILS & CAREGIVER ACCOUNT SETUP */}
        {step === 3 && (
          <div className="card-tactile max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#cdf2cb] space-y-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(authMethod === 'google' ? 1 : 2)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#0d631b] hover:underline cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                <span>Back</span>
              </button>
              <span className="text-xs font-extrabold text-[#0d631b] uppercase bg-[#d9fdd6] px-3 py-1 rounded-full border border-[#cdf2cb]">
                Step 3 of 3 · Profile & Caregiver Setup
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-[#032109]">Profile & Companion Details</h2>
              <p className="text-xs sm:text-sm text-[#40493d] mt-1">
                Fill in your location and caregiver account details so both portals are synchronized.
              </p>
            </div>

            <form onSubmit={handleCompleteSetup} className="space-y-6">
              {/* Elder Section */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#ebffe7] border border-[#cdf2cb] space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#0d631b]">
                  <span className="material-symbols-outlined">person</span>
                  <span>Elder Profile Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#032109] mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ramesh Chandra"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#cdf2cb] bg-white text-sm font-bold text-[#032109] focus:outline-none focus:ring-2 focus:ring-[#006e1c]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#032109] mb-1">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 72"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#cdf2cb] bg-white text-sm font-bold text-[#032109] focus:outline-none focus:ring-2 focus:ring-[#006e1c]"
                    />
                  </div>
                </div>

                {/* State & City Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#032109] mb-1">State / Union Territory</label>
                    <select
                      value={selectedState}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#cdf2cb] bg-white text-sm font-bold text-[#032109] focus:outline-none focus:ring-2 focus:ring-[#006e1c] cursor-pointer"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st.name} value={st.name}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#032109] mb-1">City / District</label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#cdf2cb] bg-white text-sm font-bold text-[#032109] focus:outline-none focus:ring-2 focus:ring-[#006e1c] cursor-pointer"
                    >
                      {availableCities.map((ct) => (
                        <option key={ct} value={ct}>
                          {ct}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Caregiver Section */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#d9fdd6] border border-[#cdf2cb] space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#0d631b]">
                  <span className="material-symbols-outlined">health_and_safety</span>
                  <span>Caregiver Account Login Details (Directly Linked)</span>
                </div>
                <p className="text-xs text-[#40493d]">
                  These credentials will allow the caregiver to log in directly through the Caregiver Portal and view this elder profile.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#032109] mb-1">Caregiver Name</label>
                    <input
                      type="text"
                      value={cgName}
                      onChange={(e) => setCgName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#cdf2cb] bg-white text-sm font-bold text-[#032109] focus:outline-none focus:ring-2 focus:ring-[#006e1c]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#032109] mb-1">Caregiver Email</label>
                    <input
                      type="email"
                      value={cgEmail}
                      onChange={(e) => setCgEmail(e.target.value)}
                      placeholder="priya@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#cdf2cb] bg-white text-sm font-bold text-[#032109] focus:outline-none focus:ring-2 focus:ring-[#006e1c]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#032109] mb-1">Caregiver Password</label>
                    <input
                      type="password"
                      value={cgPassword}
                      onChange={(e) => setCgPassword(e.target.value)}
                      placeholder="Create secure password"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#cdf2cb] bg-white text-sm font-bold text-[#032109] focus:outline-none focus:ring-2 focus:ring-[#006e1c]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingSetup}
                className="btn-tactile btn-primary w-full py-4 rounded-2xl text-base font-extrabold shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isSavingSetup ? 'Saving Profile to Database...' : 'Finish Setup & Open Elder Sanctuary ✨'}</span>
                {!isSavingSetup && <span className="material-symbols-outlined text-xl">arrow_forward</span>}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
