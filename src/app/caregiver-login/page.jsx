'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/authService.js';
import { showToast } from '../../components/Toast.jsx';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function CaregiverLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });

  const validateEmail = (val) => {
    const clean = (val || '').trim();
    if (!clean) return 'Caregiver email address is required.';
    if (!EMAIL_REGEX.test(clean)) {
      return 'Please enter a valid email address (e.g. name@domain.com).';
    }
    return '';
  };

  const validatePassword = (val) => {
    const clean = (val || '').trim();
    if (!clean) return 'Caregiver password is required.';
    if (clean.length < 4) {
      return 'Password must be at least 4 characters.';
    }
    return '';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    const emailErr = validateEmail(cleanEmail);
    const passwordErr = validatePassword(cleanPassword);

    setTouched({ email: true, password: true });
    setFieldErrors({ email: emailErr, password: passwordErr });

    if (emailErr || passwordErr) {
      if (emailErr) {
        showToast(emailErr, 'error');
      } else if (passwordErr) {
        showToast(passwordErr, 'error');
      }
      return;
    }

    setIsLoading(true);

    try {
      const res = await authService.loginCaregiver({ email: cleanEmail, password: cleanPassword });
      setIsLoading(false);

      if (res?.success) {
        showToast(res.message || `Welcome back, ${res.user?.name || 'Caregiver'}! Caregiver portal synchronized.`, 'success', 4000);
        window.location.href = '/caregiver-dashboard';
      } else {
        const errorMsg = res?.message || 'Access denied. The email or password entered does not match this elder’s registered caregiver.';
        setLoginError(errorMsg);
        showToast(errorMsg, 'error', 5000);
      }
    } catch (err) {
      setIsLoading(false);
      console.error(err);
      const serverErr = 'Authentication service error: ' + (err.message || 'Please check your connection and try again.');
      setLoginError(serverErr);
      showToast(serverErr, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#ebffe7] flex items-center justify-center p-2.5 sm:p-4 lg:p-6 overflow-y-auto max-w-full">
      <main className="w-full max-w-lg lg:max-w-5xl xl:max-w-6xl mx-auto my-auto py-2 sm:py-4">
        {/* Top Switcher Bar */}
        <div className="flex items-center justify-between mb-3 px-0.5">
          <div className="inline-flex p-1 bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-[#cdf2cb] gap-1 max-w-full overflow-x-auto">
            <button
              onClick={() => router.push('/')}
              type="button"
              className="py-1 px-2.5 sm:py-1.5 sm:px-3.5 rounded-xl text-[#40493d] hover:text-[#0d631b] hover:bg-[#ebffe7] font-bold text-[11px] sm:text-sm flex items-center gap-1 transition-all cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-sm sm:text-base">elderly</span>
              <span>← Elder View</span>
            </button>
            <button
              type="button"
              className="py-1 px-2.5 sm:py-1.5 sm:px-3.5 rounded-xl bg-[#0d631b] text-white font-extrabold text-[11px] sm:text-sm shadow-xs flex items-center gap-1 cursor-default shrink-0"
            >
              <span className="material-symbols-outlined text-sm sm:text-base">health_and_safety</span>
              <span>Caregiver Portal</span>
            </button>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#0d631b] bg-white/80 px-3 py-1.5 rounded-full border border-[#cdf2cb] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#006e1c] animate-pulse"></span>
            Family & Clinical Mode
          </span>
        </div>

        {/* Tactile Elevated Card */}
        <div className="card-tactile overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-xl transition-all duration-300 border border-[#cdf2cb]">
          {/* Left Side: Caregiver Hero Banner */}
          <div className="relative lg:col-span-5 bg-[#d9fdd6] p-5 sm:p-6 lg:p-7 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-[#cdf2cb]">
            <div className="relative z-10 flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-sm border border-[#cdf2cb]">
                <img
                  alt="Sahara Brand Logo"
                  className="w-8 h-8 object-contain rounded-full bg-white p-0.5"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuADfY8uUCdflx3PxgJV8n5Rdy5e1UqyJi1RpuX07Bmc9r6hn23Klt8mhC0O57Dlsy0AoO2Zfur4kxn9yueS6kMU1-B3o_rUnCtsYE80rKVOILi3Gl6wxP62ffyGjvNMaoafsux-4Nu3YfcznSLtBj71fvQApLWucdiSJyE4VD5KSm1AryUPF0ooW09SbgA3OdWj_0EfL0E3tOmeMY4frF7WwHEp3O9blDcLXakfekbdhrlgiYNNcO0c2Q"
                />
                <span className="text-base font-extrabold text-[#0d631b]">Sahara Caregiver</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0d631b] bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-[#cdf2cb]">
                <span className="material-symbols-outlined text-sm">verified</span>
                <span>Clinical Mode</span>
              </span>
            </div>

            <div className="relative z-10 flex flex-col gap-3 my-auto">
              <div className="w-full rounded-2xl overflow-hidden shadow-md bg-white border border-[#cdf2cb]">
                <img
                  className="w-full h-40 sm:h-48 object-cover object-center"
                  alt="Caregiver Companion"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJSlVR-5VNbFEhXPfbHMokwKEVr4p84T1vioRIMtQbkjjZc_QouzIsH096JkiTRDihsg6TCuY9_5nzWs5gSPS21IyMjyNyEdLN0qMsDLQrgYsA9FNu2_N5GDRxhuuX3lTWOY1gqck6g0X49fzKVVjDsnW8EnjFBrqmMjH4v4C4u37k7sVe2eyvou_9I1gFBAfDUBLLhYXsfRWeGcXvm-WDEuz5BDstMLhUb4FNoAHXed73cvrYlATz3g"
                />
                <div className="p-3 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0d631b] animate-pulse"></span>
                    <p className="text-xs sm:text-sm font-bold text-[#0d631b]">Caregiver Companion Portal</p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#ebffe7] text-[#0d631b] border border-[#cdf2cb]">
                    Protected Access
                  </span>
                </div>
              </div>

              <div className="text-left mt-1">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#032109] leading-snug">
                  Caring with Calm & Clarity
                </h1>
                <p className="text-xs sm:text-sm text-[#40493d] mt-1 leading-relaxed">
                  Keep loved ones independent while staying connected around the clock.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Login Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <span className="text-xs font-extrabold text-[#0d631b] uppercase tracking-wider bg-[#d9fdd6] px-3 py-1 rounded-full border border-[#cdf2cb]">
                  Caregiver Portal Authentication
                </span>
              </div>

              <h2 className="text-2xl font-extrabold text-[#032109] mb-1">Welcome, Caregiver</h2>
              <p className="text-xs sm:text-sm text-[#40493d] mb-5">
                Sign in with your authorized email and password to access the care dashboard and patient insights.
              </p>

              {/* Error Alert Box */}
              {loginError && (
                <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5 animate-shake">
                  <span className="material-symbols-outlined text-lg text-red-600 shrink-0 mt-0.5">error</span>
                  <div className="flex-1">
                    <p className="font-bold text-red-900">Access Denied</p>
                    <p className="text-red-700 mt-0.5">{loginError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4" noValidate>
                {/* Email Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#032109]" htmlFor="cg-login-email">
                      Caregiver Email <span className="text-red-600">*</span>
                    </label>
                    <span className="text-[11px] text-[#40493d]">e.g. riya@sahara.care</span>
                  </div>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-gray-400 text-lg pointer-events-none">
                      mail
                    </span>
                    <input
                      id="cg-login-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setLoginError('');
                        if (touched.email) {
                          setFieldErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }));
                        }
                      }}
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, email: true }));
                        setFieldErrors((prev) => ({ ...prev, email: validateEmail(email) }));
                      }}
                      placeholder="riya@sahara.care"
                      className={`w-full pl-10 pr-4 py-3 rounded-2xl border-2 text-sm font-bold text-[#032109] focus:outline-none transition-all ${
                        fieldErrors.email
                          ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-200'
                          : touched.email && !fieldErrors.email && email.trim()
                          ? 'border-emerald-500 bg-white focus:ring-2 focus:ring-emerald-200'
                          : 'border-[#cdf2cb] bg-[#ebffe7]/30 focus:border-[#006e1c]'
                      }`}
                    />
                    {touched.email && !fieldErrors.email && email.trim() && (
                      <span className="material-symbols-outlined absolute right-3 text-emerald-600 text-lg pointer-events-none">
                        check_circle
                      </span>
                    )}
                  </div>
                  {fieldErrors.email && (
                    <p className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-sm">error</span>
                      <span>{fieldErrors.email}</span>
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#032109]" htmlFor="cg-login-password">
                      Password <span className="text-red-600">*</span>
                    </label>
                    <span className="text-[11px] text-[#40493d]">Authorized access password</span>
                  </div>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-gray-400 text-lg pointer-events-none">
                      lock
                    </span>
                    <input
                      id="cg-login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setLoginError('');
                        if (touched.password) {
                          setFieldErrors((prev) => ({ ...prev, password: validatePassword(e.target.value) }));
                        }
                      }}
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, password: true }));
                        setFieldErrors((prev) => ({ ...prev, password: validatePassword(password) }));
                      }}
                      placeholder="Enter password"
                      className={`w-full pl-10 pr-11 py-3 rounded-2xl border-2 text-sm font-bold text-[#032109] focus:outline-none transition-all ${
                        fieldErrors.password
                          ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-200'
                          : touched.password && !fieldErrors.password && password.trim()
                          ? 'border-emerald-500 bg-white focus:ring-2 focus:ring-emerald-200'
                          : 'border-[#cdf2cb] bg-[#ebffe7]/30 focus:border-[#006e1c]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 p-1 text-gray-400 hover:text-[#0d631b] transition-colors cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-sm">error</span>
                      <span>{fieldErrors.password}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-tactile btn-primary w-full py-4 rounded-2xl text-base font-extrabold shadow-md cursor-pointer flex items-center justify-center gap-2 mt-2 transition-all disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Verifying Caregiver Access...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Caregiver Portal</span>
                      <span className="material-symbols-outlined text-xl">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Gentle Reassurance Security Badge */}
            <div className="bg-[#ebffe7] rounded-2xl p-3.5 flex items-center gap-3 border border-[#cdf2cb]">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-[#0d631b]">
                <span className="material-symbols-outlined text-xl">verified_user</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#032109]">Secure Caregiver Portal</span>
                <span className="text-[11px] text-[#40493d] leading-tight">
                  Protected by end-to-end authentication. Only authorized caregivers can monitor this elder.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

