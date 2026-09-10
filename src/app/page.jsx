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
  const [phone, setPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
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
  const [showCgPassword, setShowCgPassword] = useState(false);
  const [cgErrors, setCgErrors] = useState({ name: '', email: '', password: '' });
  const [cgTouched, setCgTouched] = useState({ name: false, email: false, password: false });

  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validateCgEmail = (val) => {
    const clean = (val || '').trim();
    if (!clean) return 'Caregiver email is required.';
    if (!EMAIL_REGEX.test(clean)) {
      return 'Please enter a valid email address (e.g. name@domain.com).';
    }
    return '';
  };

  const validateCgPassword = (val) => {
    const clean = (val || '').trim();
    if (!clean) return 'Caregiver password is required.';
    if (clean.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    return '';
  };

  const validateCgName = (val) => {
    const clean = (val || '').trim();
    if (!clean) return 'Caregiver name is required.';
    if (clean.length < 2) {
      return 'Name must be at least 2 characters.';
    }
    return '';
  };

  // Step 3 Problem Statement / Support Mode
  const [problemStatement, setProblemStatement] = useState('Mild Cognitive Support Mode');
  const [customProblem, setCustomProblem] = useState('');

  // Step 3 Clinical Medical Report & Saha AI Assessment State
  const [reportFile, setReportFile] = useState(null);
  const [reportFileName, setReportFileName] = useState('');
  const [isAnalyzingReport, setIsAnalyzingReport] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [reportUploadError, setReportUploadError] = useState('');

  const handleReportFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReportFile(file);
    setReportFileName(file.name);
    setIsAnalyzingReport(true);
    setReportUploadError('');

    try {
      const formData = new FormData();
      formData.append('report', file);
      formData.append('file', file);
      formData.append('elderName', fullName || 'Elder');
      formData.append('elderAge', age || '72');
      formData.append('problemStatement', problemStatement || 'Mild Cognitive Support Mode');

      const res = await fetch('/api/analyze-report', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAiAnalysis(data);
        showToast(`✨ Saha AI Clinical Assessment Complete: Recommended Starting Level ${data.recommendedStartingLevel}/10`, 'success', 6000);
        speakText(`Medical report analyzed. Saha AI recommended starting at Level ${data.recommendedStartingLevel}.`);
      } else {
        throw new Error(data.error || 'Failed to analyze report.');
      }
    } catch (err) {
      console.warn('[AI Report Analysis Error]:', err);
      setReportUploadError(err.message || 'Error processing document. Defaulting to Level 1.');
      showToast('Notice: Could not parse report with Saha AI. Defaulting to Level 1.', 'info', 5000);
    } finally {
      setIsAnalyzingReport(false);
    }
  };

  const handleClearReport = () => {
    setReportFile(null);
    setReportFileName('');
    setAiAnalysis(null);
    setReportUploadError('');
  };


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

    // Listen to Firebase Auth state on mount (catches explicit OAuth redirects only)
    if (firebaseClientAuth) {
      import('firebase/auth').then(({ getRedirectResult }) => {
        getRedirectResult(firebaseClientAuth).then(async (result) => {
          if (result?.user && result.user.email) {
            const role = typeof window !== 'undefined' ? (sessionStorage.getItem('sahara_google_auth_role') || 'elder') : 'elder';
            const mode = typeof window !== 'undefined' ? (sessionStorage.getItem('sahara_google_auth_mode') || 'signin') : 'signin';
            const res = await authService.processGoogleUser({
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL,
              role,
              mode,
            });
            if (res?.success) {
              if (res.isNewUser || mode === 'signup') {
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
      }).catch(() => {});
    }
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

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      showToast('Please enter a valid 10-digit mobile phone number', 'error');
      return;
    }
    setIsSendingOtp(true);
    showToast('Sending SMS verification code to your phone...', 'info', 3000);

    try {
      const res = await authService.sendPhoneOtp(phone);
      setIsSendingOtp(false);
      if (res?.success) {
        showToast(`SMS code sent to +91 ${cleanPhone.slice(-10)}! Please check your messages.`, 'success', 5000);
        setOtpDigits(['', '', '', '', '', '']);
        setStep(2);
        setResendCooldown(30);
      } else {
        showToast(res?.message || 'Unable to send SMS code. Please try again.', 'error', 6000);
      }
    } catch (err) {
      setIsSendingOtp(false);
      console.error(err);
      showToast('Notice: ' + err.message, 'error');
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isSendingOtp) return;
    setIsSendingOtp(true);
    showToast('Resending SMS code to your phone...', 'info');
    try {
      const res = await authService.sendPhoneOtp(phone);
      setIsSendingOtp(false);
      if (res?.success) {
        showToast('New SMS verification code sent! Check your messages.', 'success', 4000);
        setResendCooldown(30);
      } else {
        showToast(res?.message || 'Unable to resend SMS.', 'error');
      }
    } catch (err) {
      setIsSendingOtp(false);
      showToast('Error: ' + err.message, 'error');
    }
  };

  const [isSavingSetup, setIsSavingSetup] = useState(false);

  const handleGoogleSignIn = async (mode = 'signin') => {
    setIsLoadingGoogle(true);
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem('sahara_signed_out');
      sessionStorage.setItem('sahara_google_auth_mode', mode);
    }
    try {
      const res = await authService.signInWithGoogle('elder', mode);
      if (res?.redirecting) {
        showToast('Redirecting to Google to choose your account...', 'info', 3000);
        return;
      }
      if (res?.cancelled) {
        showToast('Google sign-in was cancelled.', 'info');
        return;
      }
      if (res?.success) {
        if (res.isNewUser || mode === 'signup') {
          // SIGNUP / NEW USER: Prompt to fill up Step 3 details!
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
          // SIGNIN (RETURNING USER): Jump straight to Sanctuary!
          showToast(res.message || `Welcome back, ${res.user?.name || 'Member'}! Loading your Sanctuary...`, 'success', 4000);
          router.push('/elder-dashboard');
        }
      } else {
        showToast(res?.message || 'Unable to complete Google authentication.', 'error');
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
    const entered = otpDigits.join('').trim();
    if (entered.length < 6) {
      showToast('Please enter the full 6-digit SMS verification code', 'error');
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
          showToast('Phone verified! Please complete your companion & caregiver details.', 'info', 4500);
          setStep(3);
        } else {
          // 2ND TIME RETURNING USER: Skips Step 3 and opens Sanctuary directly!
          showToast(res.message || `Welcome back, ${res.user?.name || 'Member'}! Loading your Sanctuary...`, 'success', 4000);
          window.location.href = '/elder-dashboard';
        }
      } else {
        showToast(res?.message || 'Invalid verification code. Please check your SMS messages.', 'error', 6000);
      }
    } catch (err) {
      setIsVerifying(false);
      console.error(err);
      showToast('Verification error: ' + err.message, 'error');
    }
  };

  const handleCompleteSetup = async (e) => {
    e.preventDefault();
    const cleanElderName = (fullName || '').trim();
    if (!cleanElderName) {
      showToast("Please enter the elder's full name", 'error');
      return;
    }

    const cleanElderAge = parseInt(age, 10);
    if (!age || isNaN(cleanElderAge) || cleanElderAge < 40 || cleanElderAge > 120) {
      showToast("Please enter a valid age for the elder (40–120 years)", 'error');
      return;
    }

    // STRICT Caregiver Email and Password validation
    const nameErr = validateCgName(cgName);
    const emailErr = validateCgEmail(cgEmail);
    const passwordErr = validateCgPassword(cgPassword);

    setCgTouched({ name: true, email: true, password: true });
    setCgErrors({ name: nameErr, email: emailErr, password: passwordErr });

    if (nameErr || emailErr || passwordErr) {
      if (emailErr) {
        showToast(emailErr, 'error');
      } else if (passwordErr) {
        showToast(passwordErr, 'error');
      } else if (nameErr) {
        showToast(nameErr, 'error');
      }
      return;
    }

    setIsSavingSetup(true);

    const cleanDigits = phone.replace(/\D/g, '');
    const formattedPhone = cleanDigits.length >= 10
      ? (cleanDigits.startsWith('91') ? `+${cleanDigits}` : `+91${cleanDigits}`)
      : '';
    const targetIdentifier = (authMethod === 'google' && googleEmail)
      ? googleEmail
      : (formattedPhone || `user_${Date.now().toString(36)}`);

    const firstName = cleanElderName.split(' ')[0];
    const elderHonorific = `${firstName} ji`;

    const finalProblem = problemStatement === 'custom'
      ? (customProblem.trim() || 'Mild Cognitive Support Mode')
      : (problemStatement || 'Mild Cognitive Support Mode');

    const startingLevel = aiAnalysis?.recommendedStartingLevel ? Number(aiAnalysis.recommendedStartingLevel) : 1;
    const unlockedLevel = startingLevel;

    const patientData = {
      name: cleanElderName,
      honorific: elderHonorific,
      age: cleanElderAge || 72,
      state: selectedState,
      city: selectedCity,
      avatar: '/avatar.png',
      status: finalProblem,
      problemStatement: finalProblem,
      wing: 'Garden Terrace Wing',
      location: `${selectedCity}, ${selectedState}`,
      tabletBattery: 94,
      lastActive: 'Just now',
      phone: authMethod === 'phone' ? formattedPhone : '',
      email: authMethod === 'google' && googleEmail ? googleEmail : '',
      startingLevel,
      unlockedLevel,
      aiAnalysis: aiAnalysis ? {
        recommendedLevel: startingLevel,
        cognitiveSummary: aiAnalysis.cognitiveSummary || '',
        identifiedCondition: aiAnalysis.identifiedCondition || '',
        uploadedAt: new Date().toISOString(),
      } : null,
    };

    const cleanCgName = cgName.trim();
    const cleanCgEmail = cgEmail.trim().toLowerCase();
    const cleanCgPassword = cgPassword.trim();

    const caregiverData = {
      name: cleanCgName,
      email: cleanCgEmail,
      password: cleanCgPassword,
      relation: 'Primary Caregiver',
      phone: '+91 98540 12345',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3C9pKlylR36n8hHQndvUKkTljs_tOg3Gdg5-srU8WvV-YTOGYJeIOBOvqYISbX2RJdQgvmyliRh8-jt8-UlqHi4x_L4FNBDvdeUaqZfr7Vp9FMtzRQH-g0ov39z8XoigzQ2-C1QPqxbbL8QBjqY-WQ5c8XYX4jMP5ji1MumxGOHHdxB90LidJtUJl3RhpDWlM7FZ76v8qtgurN4tWzXc_4Hfwe_mzuvAQ5TyGqbEvHwY70aZyKa_ROg',
    };

    try {
      await authService.saveElderProfile(patientData, caregiverData, targetIdentifier);
      setIsSavingSetup(false);
      showToast(`Welcome ${cleanElderName}! Your profile and caregiver login are saved to the database.`, 'success', 5000);
      window.location.href = '/elder-dashboard';
    } catch (err) {
      setIsSavingSetup(false);
      console.error('[Setup Error]:', err);
      showToast('Database Error: ' + (err.message || 'Failed to save setup to database. Please try again.'), 'error', 6000);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#ebffe7] flex items-center justify-center p-2.5 sm:p-4 lg:p-6 w-full">
      {/* Firebase Phone Authentication Invisible reCAPTCHA Anchor */}
      <div id="recaptcha-container"></div>

      <main className="w-full max-w-lg lg:max-w-5xl xl:max-w-6xl mx-auto my-auto py-2 sm:py-4">
        {/* Top Switcher Bar */}
        <div className="flex items-center justify-between mb-3 px-0.5">
          <div className="inline-flex p-1 bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-[#cdf2cb] gap-1 max-w-full overflow-x-auto">
            <button
              type="button"
              className="py-1 px-2.5 sm:py-1.5 sm:px-3.5 rounded-xl bg-[#0d631b] text-white font-extrabold text-[11px] sm:text-sm shadow-xs flex items-center gap-1 cursor-default shrink-0"
            >
              <span className="material-symbols-outlined text-sm sm:text-base">elderly</span>
              <span>Elder View</span>
            </button>
            <button
              onClick={() => router.push('/caregiver-login')}
              type="button"
              className="py-1 px-2.5 sm:py-1.5 sm:px-3.5 rounded-xl text-[#40493d] hover:text-[#0d631b] hover:bg-[#ebffe7] font-bold text-[11px] sm:text-sm flex items-center gap-1 transition-all cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-sm sm:text-base">health_and_safety</span>
              <span>Caregiver Portal →</span>
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
                        placeholder="Enter 10-digit mobile number"
                        className="w-full bg-transparent text-base font-bold text-[#032109] placeholder:text-gray-400 placeholder:font-normal focus:outline-none"
                      />
                      {phone && (
                        <button
                          type="button"
                          onClick={() => setPhone('')}
                          className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                          title="Clear phone number"
                        >
                          <span className="material-symbols-outlined text-lg">cancel</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Primary Send OTP Button */}
                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="btn-tactile btn-primary w-full py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg font-extrabold shadow-md flex items-center justify-center gap-2.5 cursor-pointer hover:shadow-lg transition-all"
                  >
                    <span>{isSendingOtp ? 'Sending SMS Code via Firebase...' : (t.sendOtp || 'Send SMS Code')}</span>
                    {!isSendingOtp && <span className="material-symbols-outlined text-2xl">arrow_forward</span>}
                  </button>

                  {/* Divider */}
                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      {t.orSignInWith || 'or sign in with'}
                    </span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>

                  {/* Two Distinct Google Buttons: Sign In (Returning) and Sign Up (New Registration) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      id="login-google-btn"
                      type="button"
                      onClick={() => handleGoogleSignIn('signin')}
                      disabled={isLoadingGoogle}
                      className="w-full h-12 sm:h-13 rounded-2xl bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 px-3 shadow-sm active:scale-[0.99] cursor-pointer"
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
                      <span className="font-extrabold">{isLoadingGoogle ? 'Connecting...' : 'Sign in with Google'}</span>
                    </button>

                    <button
                      id="signup-google-btn"
                      type="button"
                      onClick={() => handleGoogleSignIn('signup')}
                      disabled={isLoadingGoogle}
                      className="w-full h-12 sm:h-13 rounded-2xl bg-[#006e1c] hover:bg-[#0d631b] text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 px-3 shadow-md active:scale-[0.99] cursor-pointer"
                    >
                      <svg className="w-5 h-5 shrink-0 bg-white p-0.5 rounded-full" viewBox="0 0 24 24">
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
                      <span className="font-extrabold">{isLoadingGoogle ? 'Connecting...' : 'Sign up with Google'}</span>
                    </button>
                  </div>
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

        {/* STEP 2: REAL FIREBASE SMS OTP VERIFICATION */}
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
              <h2 className="text-2xl font-extrabold text-[#032109]">Enter 6-Digit SMS Code</h2>
              <p className="text-xs sm:text-sm text-[#40493d]">
                We sent a real verification code to your messages at <strong>+91 {phone}</strong>
              </p>
            </div>

            {/* 6-digit tactile inputs with paste & backspace navigation */}
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex justify-center gap-2 sm:gap-3">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-box-${index}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !digit && index > 0) {
                        document.getElementById(`otp-box-${index - 1}`)?.focus();
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                      if (pasted) {
                        const next = [...otpDigits];
                        for (let i = 0; i < 6; i++) {
                          next[i] = pasted[i] || '';
                        }
                        setOtpDigits(next);
                        const focusIdx = Math.min(pasted.length, 5);
                        document.getElementById(`otp-box-${focusIdx}`)?.focus();
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      const next = [...otpDigits];
                      next[index] = val ? val[val.length - 1] : '';
                      setOtpDigits(next);
                      if (val && index < 5) {
                        document.getElementById(`otp-box-${index + 1}`)?.focus();
                      }
                    }}
                    className="w-10 h-13 sm:w-12 sm:h-15 rounded-2xl text-center text-xl sm:text-2xl font-extrabold bg-[#ebffe7]/50 border-2 border-[#cdf2cb] focus:border-[#006e1c] text-[#032109] focus:outline-none transition-all"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="btn-tactile btn-primary w-full py-4 rounded-2xl text-base font-extrabold shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isVerifying ? 'Verifying SMS Code...' : 'Confirm Code & Continue'}</span>
                {!isVerifying && <span className="material-symbols-outlined text-xl">arrow_forward</span>}
              </button>
            </form>

            <div className="flex items-center justify-between pt-2 border-t border-[#cdf2cb]">
              <span className="text-xs text-[#40493d]">Didn&apos;t receive the SMS code?</span>
              <button
                type="button"
                disabled={resendCooldown > 0 || isSendingOtp}
                onClick={handleResendOtp}
                className={`text-xs font-bold ${resendCooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#0d631b] hover:underline cursor-pointer'} inline-flex items-center gap-1`}
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                <span>{resendCooldown > 0 ? `Resend SMS in ${resendCooldown}s` : 'Resend SMS Code'}</span>
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
                    <label className="block text-xs font-bold text-[#032109] mb-1">Elder&apos;s Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ramesh Chandra (or elder's name)"
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
                    <div className="relative flex items-center">
                      <select
                        value={selectedState}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className="w-full pl-3.5 pr-14 py-2.5 rounded-xl border border-[#cdf2cb] bg-white text-sm font-bold text-[#032109] focus:outline-none focus:ring-2 focus:ring-[#006e1c] cursor-pointer appearance-none shadow-xs"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st.name} value={st.name}>
                            {st.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1">
                        <img
                          src="/location.gif"
                          alt="State Location"
                          className="w-7 h-7 sm:w-8 sm:h-8 object-contain inline-block shrink-0"
                        />
                        <span className="material-symbols-outlined text-gray-500 text-lg">expand_more</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#032109] mb-1">City / District</label>
                    <div className="relative flex items-center">
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full pl-3.5 pr-14 py-2.5 rounded-xl border border-[#cdf2cb] bg-white text-sm font-bold text-[#032109] focus:outline-none focus:ring-2 focus:ring-[#006e1c] cursor-pointer appearance-none shadow-xs"
                      >
                        {availableCities.map((ct) => (
                          <option key={ct} value={ct}>
                            {ct}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1">
                        <img
                          src="/location.gif"
                          alt="City Location"
                          className="w-7 h-7 sm:w-8 sm:h-8 object-contain inline-block shrink-0"
                        />
                        <span className="material-symbols-outlined text-gray-500 text-lg">expand_more</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Problem Statement / Condition Mode */}
                <div>
                  <label className="block text-xs font-bold text-[#032109] mb-1">
                    Problem Statement / Cognitive Condition Mode
                  </label>
                  <select
                    value={problemStatement}
                    onChange={(e) => setProblemStatement(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#cdf2cb] bg-white text-sm font-bold text-[#032109] focus:outline-none focus:ring-2 focus:ring-[#006e1c] cursor-pointer"
                  >
                    <option value="Mild Cognitive Support Mode">Mild Cognitive Support Mode</option>
                    <option value="Memory Loss & Daily Recall Assistance">Memory Loss & Daily Recall Assistance</option>
                    <option value="Early-Stage Alzheimer's Care">Early-Stage Alzheimer&apos;s Care</option>
                    <option value="Dementia & Confusion Management">Dementia & Confusion Management</option>
                    <option value="Independent Senior Care & Medicine Tracking">Independent Senior Care & Medicine Tracking</option>
                    <option value="custom">Other / Custom Problem Statement...</option>
                  </select>

                  {problemStatement === 'custom' && (
                    <input
                      type="text"
                      value={customProblem}
                      onChange={(e) => setCustomProblem(e.target.value)}
                      placeholder="Type elder's condition or support requirement..."
                      className="mt-2 w-full px-3.5 py-2.5 rounded-xl border border-[#cdf2cb] bg-white text-sm font-bold text-[#032109] focus:outline-none focus:ring-2 focus:ring-[#006e1c]"
                    />
                  )}
                  <p className="text-[11px] text-[#40493d] mt-1">
                    This condition mode synchronizes directly with your caregiver portal overview.
                  </p>
                </div>
              </div>

              {/* Clinical Medical Report & Saha AI Cognitive Assessment (Optional) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white border-2 border-[#cdf2cb] shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#0d631b]">
                    <span className="material-symbols-outlined text-xl text-[#0d631b]">clinical_notes</span>
                    <span>Clinical Report & Saha AI Assessment (Optional)</span>
                  </div>
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#006e1c] border border-emerald-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span>Saha AI Clinical Engine</span>
                  </span>
                </div>

                <p className="text-xs text-[#40493d] leading-relaxed">
                  Upload patient medical reports (PDF or images: MMSE, MoCA, physician notes). The Saha AI engine will evaluate the cognitive baseline and automatically map and unlock progressive starting levels (1–10).
                </p>

                {/* Upload Box / Dropzone */}
                {!aiAnalysis && !isAnalyzingReport && (
                  <div>
                    <label
                      htmlFor="medical-report-input"
                      className="group flex flex-col items-center justify-center p-5 sm:p-6 border-2 border-dashed border-[#cdf2cb] hover:border-[#006e1c] hover:bg-[#ebffe7]/40 rounded-2xl cursor-pointer transition-all text-center bg-white/70"
                    >
                      <input
                        id="medical-report-input"
                        type="file"
                        accept=".pdf,image/png,image/jpeg,image/webp,image/jpg"
                        onChange={handleReportFileUpload}
                        className="hidden"
                      />
                      <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
                          <defs>
                            <style>{`
                              .cloud-bg {
                                fill: none;
                                stroke: #1B1834;
                                stroke-width: 16;
                                stroke-linecap: round;
                                stroke-linejoin: round;
                              }
                              
                              .cloud-layer {
                                transform-origin: 250px 260px;
                                animation: cloudFloat 3s ease-in-out infinite;
                              }
                              
                              .arrow-group {
                                animation: uploadBounce 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                                transform-origin: 275px 330px;
                              }

                              .arrow-stem {
                                stroke: #10A37F;
                                stroke-width: 16;
                                stroke-linecap: round;
                              }

                              .arrow-head {
                                fill: none;
                                stroke: #10A37F;
                                stroke-width: 16;
                                stroke-linecap: round;
                                stroke-linejoin: round;
                              }

                              @keyframes cloudFloat {
                                0%, 100% {
                                  transform: translateY(0) scale(1);
                                }
                                50% {
                                  transform: translateY(-4px) scale(1.01);
                                }
                              }

                              @keyframes uploadBounce {
                                0% {
                                  transform: translateY(0);
                                  opacity: 1;
                                }
                                40% {
                                  transform: translateY(-24px);
                                }
                                70% {
                                  transform: translateY(4px);
                                }
                                100% {
                                  transform: translateY(0);
                                  opacity: 1;
                                }
                              }
                            `}</style>
                          </defs>

                          {/* Cloud Body */}
                          <g className="cloud-layer">
                            {/* Right outer accent ridge */}
                            <path className="cloud-bg" d="M 405 205 C 455 240 455 315 410 350" />

                            {/* Main cloud contour */}
                            <path className="cloud-bg" d="
                              M 250 375 
                              H 135 
                              A 65 65 0 0 1 80 320 
                              A 75 75 0 0 1 125 210 
                              A 35 35 0 0 1 195 185 
                              C 200 110 300 70 380 135 
                              C 435 180 430 270 395 315 
                              C 375 345 355 375 305 375
                            " />
                          </g>

                          {/* Animated Upload Arrow */}
                          <g className="arrow-group">
                            <line className="arrow-stem" x1="278" y1="240" x2="278" y2="400" />
                            <path className="arrow-head" d="M 225 292 L 278 238 L 331 292" />
                          </g>
                        </svg>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-[#032109]">
                        Click or drag clinical report here
                      </p>
                      <p className="text-[11px] text-[#40493d] mt-0.5">
                        Supports PDF, PNG, JPG (MMSE, MoCA, clinical notes, prescriptions)
                      </p>
                    </label>

                    {reportUploadError && (
                      <p className="text-xs text-red-600 mt-2 font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">warning</span>
                        <span>{reportUploadError}</span>
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-2 px-1 text-[11px] text-[#40493d]">
                      <span className="material-symbols-outlined text-sm text-[#0d631b]">info</span>
                      <span>No report? Mind Games will default to starting Level 1 unlocked.</span>
                    </div>
                  </div>
                )}

                {/* Loading / Analyzing State */}
                {isAnalyzingReport && (
                  <div className="p-6 rounded-2xl bg-[#ebffe7] border border-[#cdf2cb] text-center space-y-3">
                    <div className="inline-flex p-3 rounded-full bg-white shadow-sm border border-[#cdf2cb] animate-bounce">
                      <span className="material-symbols-outlined text-2xl text-[#0d631b]">neurology</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-[#032109]">
                        Analyzing {reportFileName}...
                      </h4>
                      <p className="text-xs text-[#40493d] mt-0.5">
                        Saha AI is assessing clinical indicators, MMSE/MoCA scores, and calculating optimal baseline level.
                      </p>
                    </div>
                    <div className="w-full max-w-xs mx-auto bg-white rounded-full h-2 overflow-hidden border border-[#cdf2cb]">
                      <div className="h-full bg-[#006e1c] animate-pulse w-3/4 rounded-full"></div>
                    </div>
                  </div>
                )}


                {/* AI Assessment Results Card */}
                {aiAnalysis && !isAnalyzingReport && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#006e1c] shadow-md space-y-3 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-[#006e1c] text-white flex items-center justify-center font-black text-base shadow-sm">
                          L{aiAnalysis.recommendedStartingLevel}
                        </div>
                        <div>
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#006e1c] bg-[#d9fdd6] px-2 py-0.5 rounded-md border border-[#cdf2cb]">
                            AI Recommended Baseline
                          </span>
                          <h4 className="text-sm sm:text-base font-extrabold text-[#032109] mt-0.5">
                            Level {aiAnalysis.recommendedStartingLevel} of 10 Unlocked
                          </h4>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleClearReport}
                        className="text-xs font-bold text-red-600 hover:text-red-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-[#ebffe7] border border-[#cdf2cb] space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#0d631b]">
                        <span className="material-symbols-outlined text-base">psychology</span>
                        <span>Identified Condition: {aiAnalysis.identifiedCondition}</span>
                      </div>
                      <p className="text-xs text-[#40493d] leading-relaxed">
                        {aiAnalysis.cognitiveSummary}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-[#006e1c] bg-[#d9fdd6] p-2.5 rounded-xl border border-[#cdf2cb]">
                      <span className="material-symbols-outlined text-base">lock_open</span>
                      <span>
                        Rule applied: Levels 1 through {aiAnalysis.recommendedStartingLevel} will be unlocked immediately upon account creation!
                      </span>
                    </div>

                    {reportFileName && (
                      <p className="text-[10px] text-gray-500">
                        Evaluated from attached document: <strong>{reportFileName}</strong>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Caregiver Section */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#d9fdd6] border border-[#cdf2cb] space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#0d631b]">
                    <span className="material-symbols-outlined">health_and_safety</span>
                    <span>Caregiver Account Login Details (Directly Linked)</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#0d631b] bg-white px-2.5 py-0.5 rounded-full border border-[#cdf2cb]">
                    Required for Portal Access
                  </span>
                </div>
                <p className="text-xs text-[#40493d]">
                  These credentials will allow the caregiver to log in directly through the Caregiver Portal and view this elder profile.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Caregiver Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#032109] mb-1">
                      Caregiver Name <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cgName}
                        onChange={(e) => {
                          setCgName(e.target.value);
                          if (cgTouched.name) {
                            setCgErrors((prev) => ({ ...prev, name: validateCgName(e.target.value) }));
                          }
                        }}
                        onBlur={() => {
                          setCgTouched((prev) => ({ ...prev, name: true }));
                          setCgErrors((prev) => ({ ...prev, name: validateCgName(cgName) }));
                        }}
                        placeholder="e.g. Priya Sharma"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold text-[#032109] focus:outline-none transition-all ${
                          cgTouched.name && cgErrors.name
                            ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-200'
                            : cgTouched.name && !cgErrors.name && cgName.trim()
                            ? 'border-emerald-500 bg-white focus:ring-2 focus:ring-emerald-200'
                            : 'border-[#cdf2cb] bg-white focus:ring-2 focus:ring-[#006e1c]'
                        }`}
                      />
                      {cgTouched.name && !cgErrors.name && cgName.trim() && (
                        <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-emerald-600 text-lg pointer-events-none">
                          check_circle
                        </span>
                      )}
                    </div>
                    {cgTouched.name && cgErrors.name ? (
                      <p className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-sm">error</span>
                        <span>{cgErrors.name}</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-[#40493d] mt-1">Primary caregiver or family member</p>
                    )}
                  </div>

                  {/* Caregiver Email */}
                  <div>
                    <label className="block text-xs font-bold text-[#032109] mb-1">
                      Caregiver Email <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={cgEmail}
                        onChange={(e) => {
                          setCgEmail(e.target.value);
                          if (cgTouched.email) {
                            setCgErrors((prev) => ({ ...prev, email: validateCgEmail(e.target.value) }));
                          }
                        }}
                        onBlur={() => {
                          setCgTouched((prev) => ({ ...prev, email: true }));
                          setCgErrors((prev) => ({ ...prev, email: validateCgEmail(cgEmail) }));
                        }}
                        placeholder="priya@gmail.com"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold text-[#032109] focus:outline-none transition-all ${
                          cgTouched.email && cgErrors.email
                            ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-200'
                            : cgTouched.email && !cgErrors.email && cgEmail.trim()
                            ? 'border-emerald-500 bg-white focus:ring-2 focus:ring-emerald-200'
                            : 'border-[#cdf2cb] bg-white focus:ring-2 focus:ring-[#006e1c]'
                        }`}
                      />
                      {cgTouched.email && !cgErrors.email && cgEmail.trim() && (
                        <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-emerald-600 text-lg pointer-events-none">
                          check_circle
                        </span>
                      )}
                    </div>
                    {cgTouched.email && cgErrors.email ? (
                      <p className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-sm">error</span>
                        <span>{cgErrors.email}</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-[#40493d] mt-1">Valid email format (e.g. name@domain.com)</p>
                    )}
                  </div>

                  {/* Caregiver Password */}
                  <div>
                    <label className="block text-xs font-bold text-[#032109] mb-1">
                      Caregiver Password <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCgPassword ? 'text' : 'password'}
                        value={cgPassword}
                        onChange={(e) => {
                          setCgPassword(e.target.value);
                          if (cgTouched.password) {
                            setCgErrors((prev) => ({ ...prev, password: validateCgPassword(e.target.value) }));
                          }
                        }}
                        onBlur={() => {
                          setCgTouched((prev) => ({ ...prev, password: true }));
                          setCgErrors((prev) => ({ ...prev, password: validateCgPassword(cgPassword) }));
                        }}
                        placeholder="Create secure password"
                        className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-sm font-bold text-[#032109] focus:outline-none transition-all ${
                          cgTouched.password && cgErrors.password
                            ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-200'
                            : cgTouched.password && !cgErrors.password && cgPassword.trim()
                            ? 'border-emerald-500 bg-white focus:ring-2 focus:ring-emerald-200'
                            : 'border-[#cdf2cb] bg-white focus:ring-2 focus:ring-[#006e1c]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCgPassword(!showCgPassword)}
                        className="absolute right-2.5 top-2.5 text-[#40493d] hover:text-[#0d631b] transition-colors cursor-pointer"
                        title={showCgPassword ? 'Hide password' : 'Show password'}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {showCgPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                    {cgTouched.password && cgErrors.password ? (
                      <p className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-sm">error</span>
                        <span>{cgErrors.password}</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-[#40493d] mt-1">Minimum 6 characters required</p>
                    )}
                  </div>
                </div>

                {/* Password Requirement / Security Hints */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1.5">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-2 transition-all shadow-xs border ${
                    cgPassword.length >= 6 ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-white text-[#032109] border-[#cdf2cb]'
                  }`}>
                    {cgPassword.length >= 6 ? (
                      <span className="material-symbols-outlined text-lg font-bold text-emerald-700">check_circle</span>
                    ) : (
                      <img
                        src="/fingerprint-scan.gif"
                        alt="Fingerprint Security Scan"
                        className="w-7 h-7 object-contain inline-block shrink-0"
                      />
                    )}
                    <span>Min 6 characters</span>
                  </span>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-2 transition-all shadow-xs border ${
                    EMAIL_REGEX.test((cgEmail || '').trim()) ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-white text-[#032109] border-[#cdf2cb]'
                  }`}>
                    {EMAIL_REGEX.test((cgEmail || '').trim()) ? (
                      <span className="material-symbols-outlined text-lg font-bold text-emerald-700">check_circle</span>
                    ) : (
                      <img
                        src="/user.gif"
                        alt="User verification"
                        className="w-7 h-7 object-contain inline-block shrink-0"
                      />
                    )}
                    <span>Valid email format</span>
                  </span>
                  <span className="text-xs text-[#40493d] italic ml-auto">
                    🔒 Credentials securely link to this elder's profile
                  </span>
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
