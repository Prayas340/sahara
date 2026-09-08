'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/authService.js';
import { dataStore } from '../../services/dataStore.js';
import { showToast } from '../../components/Toast.jsx';

export default function CaregiverLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [patient, setPatient] = useState({});
  const [caregiver, setCaregiver] = useState({});

  useEffect(() => {
    const currentPatient = dataStore.getPatient ? dataStore.getPatient() : (dataStore.state?.patient || {});
    setPatient(currentPatient);

    const latestCg = authService.getLatestRegisteredCaregiver ? authService.getLatestRegisteredCaregiver() : null;
    const storeCg = dataStore.getCaregiver ? dataStore.getCaregiver() : null;
    const activeCg = latestCg || storeCg || { email: 'riya@sahara.care', password: 'care123', name: 'Riya Borah' };

    setCaregiver(activeCg);
    if (activeCg.email) setEmail(activeCg.email);
    if (activeCg.password) setPassword(activeCg.password);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await authService.loginCaregiver({ email: email.trim(), password });
      setIsLoading(false);

      if (res?.success) {
        showToast(res.message || `Welcome back, ${res.user?.name || 'Caregiver'}! Caregiver portal synchronized.`, 'success', 4000);
        router.push('/caregiver-dashboard');
      } else {
        showToast(res?.message || 'Invalid credentials. Please check your email and password.', 'error');
      }
    } catch (err) {
      setIsLoading(false);
      console.error(err);
      showToast('Login error: ' + (err.message || 'Please try again'), 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#ebffe7] flex items-center justify-center p-3 sm:p-4 lg:p-6 overflow-y-auto">
      <main className="w-full max-w-lg lg:max-w-5xl xl:max-w-6xl mx-auto my-auto py-2 sm:py-4">
        {/* Top Switcher Bar */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="inline-flex p-1 bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-[#cdf2cb] gap-1">
            <button
              onClick={() => router.push('/')}
              type="button"
              className="py-1.5 px-3.5 rounded-xl text-[#40493d] hover:text-[#0d631b] hover:bg-[#ebffe7] font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">elderly</span>
              <span>← Switch to Elder View</span>
            </button>
            <button
              type="button"
              className="py-1.5 px-3.5 rounded-xl bg-[#0d631b] text-white font-extrabold text-xs sm:text-sm shadow-xs flex items-center gap-1.5 cursor-default"
            >
              <span className="material-symbols-outlined text-base">health_and_safety</span>
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
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold text-[#0d631b] uppercase tracking-wider bg-[#d9fdd6] px-3 py-1 rounded-full border border-[#cdf2cb]">
                  Caregiver Portal Authentication
                </span>
              </div>

              <h2 className="text-2xl font-extrabold text-[#032109] mb-1">Welcome, Caregiver</h2>
              <p className="text-xs sm:text-sm text-[#40493d] mb-6">
                Sign in with the email & password configured during the Elder View setup to load synchronized care overview.
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#032109] mb-1.5">Caregiver Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="riya@sahara.care"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-[#cdf2cb] focus:border-[#006e1c] bg-[#ebffe7]/30 text-sm font-bold text-[#032109] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#032109] mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="care123"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-[#cdf2cb] focus:border-[#006e1c] bg-[#ebffe7]/30 text-sm font-bold text-[#032109] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-tactile btn-primary w-full py-4 rounded-2xl text-base font-extrabold shadow-md cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  <span>{isLoading ? 'Signing In...' : 'Sign In to Caregiver Portal'}</span>
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
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
                  End-to-end synchronized health reminders, routines, and family emergency response.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
