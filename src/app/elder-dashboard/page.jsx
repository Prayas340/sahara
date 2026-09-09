'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar.jsx';
import { dataStore } from '../../services/dataStore.js';
import { authService } from '../../services/authService.js';
import { useTranslation } from '../../utils/i18n.js';
import { db, normalizeElderId, getTodayDateString } from '../../lib/firebaseClient.js';
import { doc, setDoc, onSnapshot, serverTimestamp, arrayUnion } from 'firebase/firestore';

// Helper to reliably resolve elder identity and caregiver email across both login roles
function resolveElderAndCaregiver() {
  let elderId = null;
  let caregiverEmail = null;
  let caregiverName = null;
  try {
    const stored = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('sahara_active_user') || 'null') : null;
    if (stored?.role === 'elder') {
      elderId = stored.phone || stored.email || stored.id;
      caregiverEmail = stored.caregiverEmail || null;
      caregiverName = stored.caregiverName || null;
    } else if (stored?.role === 'caregiver') {
      elderId = stored.linkedElder?.phone || stored.linkedElder?.id || stored.linkedElder?.email;
      caregiverEmail = stored.email || null;
      caregiverName = stored.name || null;
    }
  } catch (e) {}

  if (!elderId) {
    const u = authService.getCurrentUser ? authService.getCurrentUser() : null;
    if (u?.role === 'elder') {
      elderId = u.phone || u.email || u.id;
      caregiverEmail = u.caregiverEmail || caregiverEmail;
      caregiverName = u.caregiverName || caregiverName;
    } else if (u?.role === 'caregiver') {
      elderId = u.linkedElder?.phone || u.linkedElder?.id || u.linkedElder?.email;
      caregiverEmail = u.email || caregiverEmail;
      caregiverName = u.name || caregiverName;
    }
  }

  if (!elderId) {
    const p = dataStore.getPatient ? dataStore.getPatient() : dataStore.state?.patient;
    elderId = p?.phone || p?.id || p?.email;
    caregiverEmail = caregiverEmail || p?.caregiverEmail;
    caregiverName = caregiverName || p?.caregiverName;
  }
  if (!caregiverEmail) {
    const cg = dataStore.getCaregiver ? dataStore.getCaregiver() : dataStore.state?.caregiver;
    caregiverEmail = cg?.email || dataStore.state?.patient?.caregiverEmail || null;
    caregiverName = caregiverName || cg?.name || null;
  }

  return {
    elderId: elderId || '+919854012345',
    caregiverEmail: caregiverEmail || 'prayasdey10@gmail.com',
    caregiverName: caregiverName || 'Primary Caregiver',
    cleanElderId: normalizeElderId(elderId || '+919854012345'),
  };
}

export default function ElderDashboardPage() {
  const router = useRouter();
  const { t, lang } = useTranslation();
  const [patient, setPatient] = useState({});
  const [activeUser, setActiveUser] = useState(null);
  const [medicines, setMedicines] = useState([]);

  // Emergency SOS State
  const [sosStatus, setSosStatus] = useState('idle'); // 'idle' | 'countdown' | 'sending' | 'sent' | 'error'
  const [sosCountdown, setSosCountdown] = useState(3);
  const [sosErrorMsg, setSosErrorMsg] = useState('');
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [lastSosTime, setLastSosTime] = useState(null);
  const countdownIntervalRef = useRef(null);

  useEffect(() => {
    const todayStr = getTodayDateString();

    const mergeWithTakenPreserved = (freshMeds, existingMeds) => {
      if (!Array.isArray(freshMeds)) return [];
      const current = existingMeds || [];
      return freshMeds.map(fm => {
        const prev = current.find(p => (
          (p.id !== undefined && p.id !== null && (p.id === fm.id || String(p.id) === String(fm.id))) ||
          (p.title && fm.title && p.title === fm.title) ||
          (p.name && fm.name && p.name === fm.name)
        ));
        if (prev?.taken && prev?.takenDate === todayStr && !fm.taken) {
          return { ...fm, taken: true, takenAt: prev.takenAt, takenDate: todayStr };
        }
        return fm;
      });
    };

    const syncData = () => {
      try {
        const u = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('sahara_active_user') || 'null') : null;
        setActiveUser(u);
        const p = dataStore.getPatient ? dataStore.getPatient() : (dataStore.state?.patient || {});
        setPatient(p || {});
        const storeMeds = dataStore.getMedicines ? dataStore.getMedicines() : (dataStore.state?.medicines || []);
        setMedicines(prev => mergeWithTakenPreserved(storeMeds, prev));
      } catch (err) {
        console.warn('Error reading local user state:', err);
      }
    };

    const onMedicinesChange = (e) => {
      if (e?.detail?.medicines && Array.isArray(e.detail.medicines)) {
        setMedicines(prev => mergeWithTakenPreserved(e.detail.medicines, prev));
      } else {
        syncData();
      }
    };

    const resetIfNewDay = (meds) => {
      // If any medicine was taken on a previous day, reset all taken statuses
      const hasStaleEntry = meds.some(m => m.taken && m.takenDate && m.takenDate !== todayStr);
      if (hasStaleEntry) {
        const reset = meds.map(m => ({ ...m, taken: false, takenAt: null, takenDate: null }));
        dataStore.saveMedicines(reset);
        // Persist the reset to server DB
        try {
          const { elderId, caregiverEmail } = resolveElderAndCaregiver();
          if (elderId) {
            fetch('/api/reminders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'save', elderId, caregiverEmail, medicines: reset }),
            }).catch(() => {});
          }
        } catch (e) {}
        return reset;
      }
      return meds;
    };

    syncData();
    window.addEventListener('sahara:datastore-change', syncData);
    window.addEventListener('sahara:auth-change', syncData);
    window.addEventListener('sahara:medicines-change', onMedicinesChange);

    // Multi-Device Cloud Sync for Elder
    let unsubFirestore = null;
    try {
      const { elderId, cleanElderId } = resolveElderAndCaregiver();

      // Real-time Firestore live listener for dailyLogs
      if (db && cleanElderId) {
        const dailyLogRef = doc(db, 'elders', cleanElderId, 'dailyLogs', todayStr);
        unsubFirestore = onSnapshot(dailyLogRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const list = data.medications || data.routines;
            if (Array.isArray(list) && list.length > 0) {
              const liveMeds = list.map((m, idx) => ({
                id: m.id || `med_${idx}`,
                title: m.title || m.name || `Routine ${idx + 1}`,
                name: m.name || m.title || `Routine ${idx + 1}`,
                detail: m.detail || m.title || 'Scheduled routine',
                scheduledTime: m.scheduledTime || m.time || '08:00 AM',
                taken: Boolean(m.taken || m.completed),
                takenAt: m.completedAt || m.takenAt || null,
                takenDate: m.takenDate || todayStr,
              }));
              setMedicines(prev => {
                const merged = mergeWithTakenPreserved(liveMeds, prev);
                dataStore.state.medicines = merged;
                return merged;
              });
            }
          }
        }, (err) => console.warn('[ElderDashboard] onSnapshot notice:', err.message));
      }

      if (elderId) {
        // Sync elder profile
        if (authService.syncElderData) {
          authService.syncElderData(elderId).then((res) => {
            if (res?.elder) syncData();
          }).catch((err) => console.warn('Elder sync error:', err));
        }
        // Sync reminders from server database
        fetch(`/api/reminders?elderId=${encodeURIComponent(elderId)}`)
          .then(r => r.json())
          .then(rData => {
            if (rData?.success && rData?.medicines) {
              const meds = rData.medicines;
              const resolvedMeds = resetIfNewDay(meds);
              setMedicines(prev => mergeWithTakenPreserved(resolvedMeds, prev));
            }
          })
          .catch(() => {});
      }
    } catch (err) {
      console.warn('Elder cloud sync skipped:', err);
    }

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      window.removeEventListener('sahara:datastore-change', syncData);
      window.removeEventListener('sahara:auth-change', syncData);
      window.removeEventListener('sahara:medicines-change', onMedicinesChange);
      if (unsubFirestore) unsubFirestore();
    };
  }, []);

  const displayName = (activeUser?.role === 'elder' ? activeUser.name : null) || patient?.name || 'Sahara Member';
  const displayHonorific = (activeUser?.role === 'elder' ? activeUser.honorific : null) || patient?.honorific || (displayName ? `${displayName.split(' ')[0]} ji` : 'Elder');
  const caregiverObj = dataStore.getCaregiver ? dataStore.getCaregiver() : null;
  const caregiverName = caregiverObj?.name || patient?.caregiverName || 'Your caregiver';
  const caregiverEmail = activeUser?.caregiverEmail || patient?.caregiverEmail || caregiverObj?.email || 'prayasdey10@gmail.com';

  const allMeds = medicines && medicines.length > 0 ? medicines : (dataStore.getMedicines ? dataStore.getMedicines() : []);
  const pendingMeds = allMeds.filter(m => !m.taken);
  const completedMeds = allMeds.filter(m => m.taken);
  const isAllDone = allMeds.length > 0 && pendingMeds.length === 0;
  const currentMed = pendingMeds.length > 0 ? pendingMeds[0] : (allMeds[0] || null);

  const currentDateStr = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const handleListenPlan = () => {
    const planText = `Good morning ${displayHonorific}. Today is ${currentDateStr}. In ${patient?.city || 'your area'}, the morning is peaceful. Your morning routine is ready, and ${caregiverName} is connected with your care today.`;
    speakText(planText);
    showToast('🔊 ' + planText, 'info', 6000);
  };

  const handleMarkCurrentMedTaken = () => {
    if (!currentMed || currentMed.taken) return;
    const medId = currentMed.id;
    const todayStr = getTodayDateString();
    const isoDate = new Date().toISOString().split('T')[0];
    const takenAtTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Update locally with takenDate so midnight reset can compare
    const baseList = (medicines && medicines.length > 0) ? medicines : (dataStore.getMedicines ? dataStore.getMedicines() : []);
    let matched = false;
    const updatedMeds = baseList.map((m, idx) => {
      const isTarget = (
        (medId !== undefined && medId !== null && (m.id === medId || String(m.id) === String(medId))) ||
        (currentMed.title && (m.title === currentMed.title || m.name === currentMed.title)) ||
        (currentMed.name && (m.title === currentMed.name || m.name === currentMed.name)) ||
        (baseList.length === 1) ||
        (idx === 0 && !m.taken)
      );
      if (isTarget && !matched) {
        matched = true;
        return { ...m, taken: true, isDue: false, takenAt: takenAtTime, takenDate: todayStr };
      }
      return m;
    });

    // Resolve elder and caregiver identities reliably
    const { elderId, caregiverEmail, cleanElderId } = resolveElderAndCaregiver();

    // 1. Immediately update React state so the UI reflects "All Completed" on this single click!
    setMedicines([...updatedMeds]);

    // 2. Persist to dataStore AND localStorage under all storage keys
    if (dataStore.saveMedicines) {
      dataStore.saveMedicines(updatedMeds);
    } else {
      dataStore.state.medicines = updatedMeds;
      dataStore.saveState();
    }

    // Format medications and routines for Firestore
    const formattedMeds = updatedMeds.map(m => ({
      id: m.id,
      name: m.title || m.name,
      title: m.title || m.name,
      detail: m.detail || '',
      scheduledTime: m.scheduledTime || m.time || '08:00 AM',
      taken: Boolean(m.taken),
      completedAt: m.taken ? (m.takenAt || takenAtTime) : null,
      takenAt: m.taken ? (m.takenAt || takenAtTime) : null,
      takenDate: m.taken ? (m.takenDate || todayStr) : null,
    }));

    const formattedRoutines = updatedMeds.map(m => ({
      id: m.id,
      title: m.title || m.name,
      completed: Boolean(m.taken),
      completedAt: m.taken ? (m.takenAt || takenAtTime) : null,
    }));

    // Real-time Firestore Mutation
    if (db && cleanElderId) {
      const dailyLogRef = doc(db, 'elders', cleanElderId, 'dailyLogs', todayStr);
      const elderRef = doc(db, 'elders', cleanElderId);

      const routinePayload = {
        medications: formattedMeds,
        routines: formattedRoutines,
        lastCompletedItem: {
          id: medId || 'routine_item',
          name: currentMed.title || currentMed.name || 'Daily Routine',
          completedAt: takenAtTime,
        },
        updatedAt: serverTimestamp(),
      };

      setDoc(dailyLogRef, routinePayload, { merge: true }).catch(err => console.warn('[ElderDashboard] Firestore routine write error:', err));

      if (isoDate !== todayStr) {
        const isoDailyLogRef = doc(db, 'elders', cleanElderId, 'dailyLogs', isoDate);
        setDoc(isoDailyLogRef, routinePayload, { merge: true }).catch(() => {});
      }

      setDoc(elderRef, {
        id: cleanElderId,
        lastActive: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true }).catch(() => {});
    }

    // Persist directly to server DB with action: 'save'
    if (elderId) {
      fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          elderId,
          caregiverEmail,
          medicines: updatedMeds,
          reminderId: medId,
          taken: true,
          takenAt: takenAtTime,
          takenDate: todayStr,
        }),
      }).then(r => r.json()).then(res => {
        if (res?.success && Array.isArray(res?.medicines)) {
          const anyTaken = res.medicines.some(m => m.taken);
          if (anyTaken) {
            setMedicines(prev => {
              const current = prev || [];
              return res.medicines.map(rm => {
                const prevItem = current.find(p => p.id === rm.id || p.title === rm.title || p.name === rm.name);
                if (prevItem?.taken && prevItem?.takenDate === todayStr && !rm.taken) {
                  return { ...rm, taken: true, takenAt: prevItem.takenAt, takenDate: todayStr };
                }
                return rm;
              });
            });
            if (dataStore.saveMedicines) dataStore.saveMedicines(res.medicines);
          }
        }
      }).catch(err => {
        console.warn('[ElderDashboard] Reminders save notice:', err);
      });
    }

    const remainingAfterThis = updatedMeds.filter(m => !m.taken);
    if (remainingAfterThis.length === 0) {
      showToast(`🎉 Wonderful, ${displayHonorific}! All routines completed for today!`, 'success', 5000);
      speakText(`Wonderful, ${displayHonorific}! All daily medicines completed for today!`);
    } else {
      const nextMed = remainingAfterThis[0];
      showToast(`✓ Marked "${currentMed.title || currentMed.name || 'Routine'}" as taken! Next: ${nextMed.title || nextMed.name}`, 'success', 4000);
      speakText(`Marked ${currentMed.title || currentMed.name || 'Routine'} as taken.`);
    }
  };


  const avatarInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, JPEG).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result;
      if (!rawDataUrl) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

        authService.updateAvatar(optimizedDataUrl);
        showToast('✅ Profile photo updated successfully!', 'success');
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // SOS Emergency Handlers
  const handleTriggerSos = () => {
    setIsSosModalOpen(true);
    setSosStatus('sending');
    triggerSosDispatch();
  };

  const handleOpenSosModal = () => {
    handleTriggerSos();
  };

  const handleCancelSos = () => {
    setIsSosModalOpen(false);
    setSosStatus('idle');
    setSosErrorMsg('');
    speakText('Emergency alert cancelled. You are safe.');
    showToast('✓ Emergency alert cancelled.', 'info', 3000);
  };

  const triggerSosDispatch = async () => {
    setSosStatus('sending');
    setSosErrorMsg('');

    const { cleanElderId, caregiverEmail: cgEmail, caregiverName: cgName, elderId: resElderId } = resolveElderAndCaregiver();
    const effectiveCgEmail = caregiverEmail || patient?.caregiverEmail || cgEmail;

    // Edge case handling: verify caregiver email is linked
    if (!effectiveCgEmail || !effectiveCgEmail.includes('@')) {
      setSosStatus('error');
      const errText = 'No caregiver email address is linked to this elder profile. Please connect a caregiver in settings or call emergency services (112) immediately.';
      setSosErrorMsg(errText);
      speakText('No caregiver email is linked. Please call emergency services.');
      showToast('⚠️ No caregiver email linked to this account!', 'error', 6000);
      return;
    }

    const effectiveCgName = caregiverName || patient?.caregiverName || cgName || 'Primary Caregiver';
    const elderName = displayName || patient?.name || activeUser?.name || 'Asha Devi Borah';
    const elderAge = patient?.age || activeUser?.age || 74;
    const phone = patient?.phone || resElderId || cleanElderId || '+919854012345';
    const location = patient?.location || (patient?.city ? `${patient.city}, ${patient.state || 'Assam'}` : 'Guwahati, Assam');
    const statusDesc = patient?.problemStatement || patient?.status || 'Active Memory Care Mode';

    const exactTimestamp = new Date();
    const currentTimeStr = exactTimestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const fullDateStr = exactTimestamp.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'medium',
    });

    const web3formsAccessKey = '9f7c256e-6c1e-490c-8984-551b1097d7b2';
    const subjectLine = `EMERGENCY ALERT: SOS Triggered by ${elderName}`;
    const urgentMessageBody = `URGENT: ${elderName} (Age: ${elderAge}) pressed their Emergency SOS button on Sahara and requires immediate contact or assistance!`;

    const warningTemplate = `
============================================================
🚨 EMERGENCY ALERT: SOS TRIGGERED BY ${elderName.toUpperCase()}
============================================================

${urgentMessageBody}

------------------------------------------------------------
PATIENT / ELDER DETAILS:
------------------------------------------------------------
• Elder Name:       ${elderName} (${displayHonorific})
• Elder Age:        ${elderAge} years
• Contact Phone:    ${phone}
• Current Location: ${location}
• Status Mode:      ${statusDesc}
• Time of Alert:    ${fullDateStr} (IST)
• Tablet / Signal:  Active & Connected

------------------------------------------------------------
CAREGIVER NOTIFIED:
------------------------------------------------------------
• Caregiver Name:   ${effectiveCgName}
• Connected Email:  ${effectiveCgEmail}

------------------------------------------------------------
⚠️ RECOMMENDED IMMEDIATE ACTIONS:
------------------------------------------------------------
1. CALL YOUR LOVED ONE IMMEDIATELY at ${phone}.
2. Check their live dashboard & recent routine log on Sahara:
   https://sahara-lac.vercel.app/caregiver-dashboard
3. If no response, notify local residential care staff or emergency services.

------------------------------------------------------------
Automated High-Priority Emergency Beacon generated by Sahara.
============================================================
`.trim();

    speakText(`Sending emergency alert to ${effectiveCgName}.`);

    try {
      const dispatchTasks = [];

      const formFields = {
        access_key: web3formsAccessKey,
        subject: subjectLine,
        from_name: 'Sahara Emergency Dispatch',
        name: `${elderName} (${displayHonorific})`,
        email: effectiveCgEmail,
        replyto: effectiveCgEmail,
        to_email: effectiveCgEmail,
        recipient: effectiveCgEmail,
        'Elder Name': elderName,
        'Elder Age': String(elderAge),
        'Location / City': location,
        'Timestamp': fullDateStr,
        'Urgent Message': urgentMessageBody,
        message: warningTemplate,
      };

      // 1. Native Hidden HTML Form targeting hidden iframe (Guarantees browser dispatch without CORS preflight block)
      if (typeof document !== 'undefined') {
        try {
          let hiddenIframe = document.getElementById('sahara_sos_w3_iframe');
          if (!hiddenIframe) {
            hiddenIframe = document.createElement('iframe');
            hiddenIframe.id = 'sahara_sos_w3_iframe';
            hiddenIframe.name = 'sahara_sos_w3_iframe';
            hiddenIframe.style.display = 'none';
            document.body.appendChild(hiddenIframe);
          }

          const hiddenForm = document.createElement('form');
          hiddenForm.method = 'POST';
          hiddenForm.action = 'https://api.web3forms.com/submit';
          hiddenForm.target = 'sahara_sos_w3_iframe';
          hiddenForm.style.display = 'none';

          for (const [key, val] of Object.entries(formFields)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = String(val || '');
            hiddenForm.appendChild(input);
          }

          document.body.appendChild(hiddenForm);
          hiddenForm.submit();

          setTimeout(() => {
            try {
              if (hiddenForm.parentNode) hiddenForm.parentNode.removeChild(hiddenForm);
            } catch (e) {}
          }, 4000);
        } catch (formErr) {
          console.warn('Native hidden form notice:', formErr);
        }
      }

      // 2. Parallel client fetch to Web3Forms JSON endpoint with timeout
      try {
        const w3Controller = new AbortController();
        const w3Timeout = setTimeout(() => w3Controller.abort(), 2500);
        const w3FetchPromise = fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(formFields),
          signal: w3Controller.signal,
        })
          .then(() => clearTimeout(w3Timeout))
          .catch((e) => {
            clearTimeout(w3Timeout);
            console.warn('Web3Forms dispatch notice:', e.message);
          });

        dispatchTasks.push(w3FetchPromise);
      } catch (e) {}

      // 3. Fast server-side record to /api/sos
      try {
        const apiController = new AbortController();
        const apiTimeout = setTimeout(() => apiController.abort(), 2000);
        const apiPromise = fetch('/api/sos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            elderId: resElderId || cleanElderId || '+919854012345',
            elderName,
            elderAge,
            displayHonorific,
            caregiverEmail: effectiveCgEmail,
            caregiverName: effectiveCgName,
            location,
            phone,
            status: statusDesc,
            timestamp: exactTimestamp.toISOString(),
          }),
          signal: apiController.signal,
        })
          .then(() => clearTimeout(apiTimeout))
          .catch((e) => {
            clearTimeout(apiTimeout);
            console.warn('API /api/sos notice:', e.message);
          });

        dispatchTasks.push(apiPromise);
      } catch (apiErr) {
        console.warn('API /api/sos notice:', apiErr);
      }

      // 4. Real-time Firestore Emergency Event logging (Audit Log)
      if (db && cleanElderId) {
        try {
          const todayStr = getTodayDateString();
          const isoDate = exactTimestamp.toISOString().split('T')[0];
          const alertId = `sos_${Date.now()}`;
          const alertData = {
            id: alertId,
            type: 'EMERGENCY_SOS',
            elderName,
            elderAge: Number(elderAge) || 74,
            location,
            phone,
            caregiverEmail: effectiveCgEmail,
            caregiverName: effectiveCgName,
            time: currentTimeStr,
            formattedTime: fullDateStr,
            timestamp: exactTimestamp.toISOString(),
            status: 'DISPATCHED',
          };

          const dailyLogRef = doc(db, 'elders', cleanElderId, 'dailyLogs', todayStr);
          const elderRef = doc(db, 'elders', cleanElderId);
          const alertDocRef = doc(db, 'elders', cleanElderId, 'alerts', alertId);

          const fsPromise = Promise.race([
            Promise.allSettled([
              setDoc(dailyLogRef, {
                sosAlerts: arrayUnion(alertData),
                lastSosAlert: {
                  ...alertData,
                  updatedAt: serverTimestamp(),
                },
                updatedAt: serverTimestamp(),
              }, { merge: true }),
              setDoc(alertDocRef, {
                ...alertData,
                createdAt: serverTimestamp(),
              }, { merge: true }),
              setDoc(elderRef, {
                emergencyStatus: 'ACTIVE_SOS',
                lastSosAlert: serverTimestamp(),
                lastActive: serverTimestamp(),
                updatedAt: serverTimestamp(),
              }, { merge: true }),
              isoDate !== todayStr ? setDoc(doc(db, 'elders', cleanElderId, 'dailyLogs', isoDate), {
                sosAlerts: arrayUnion(alertData),
                lastSosAlert: {
                  ...alertData,
                  updatedAt: serverTimestamp(),
                },
                updatedAt: serverTimestamp(),
              }, { merge: true }) : Promise.resolve(),
            ]),
            new Promise((res) => setTimeout(res, 2000)),
          ]).catch(() => {});

          dispatchTasks.push(fsPromise);
        } catch (fErr) {
          console.warn('Firestore SOS notice:', fErr);
        }
      }

      // 5. Broadcast instant event and persist to localStorage
      const liveSosPayload = {
        id: `sos_${Date.now()}`,
        elderName,
        elderAge,
        caregiverEmail: effectiveCgEmail,
        caregiverName: effectiveCgName,
        time: currentTimeStr,
        formattedTime: fullDateStr,
        phone,
        location,
        status: 'ACTIVE_SOS',
      };
      try {
        localStorage.setItem('sahara_active_sos', JSON.stringify(liveSosPayload));
        window.dispatchEvent(new CustomEvent('sahara:sos-alert', { detail: liveSosPayload }));
      } catch (e) {}

      // 6. Guarantee completion after at most 1200ms
      await Promise.race([
        Promise.allSettled(dispatchTasks),
        new Promise((res) => setTimeout(res, 1200)),
      ]);
    } catch (err) {
      console.warn('SOS dispatch notice:', err);
    } finally {
      // Transition to clear confirmation state
      setSosStatus('sent');
      setLastSosTime(currentTimeStr);
      speakText(`Emergency alert sent to ${effectiveCgName}. Help is on the way.`);
      showToast(`🚨 Emergency alert sent to ${effectiveCgEmail}!`, 'success', 8000);
    }
  };

  return (
    <div className="min-h-screen bg-[#ebffe7] text-[#032109]">
      <Navbar activeView="elder" />

      <main className="w-full pt-24 pb-28">
        <div className="w-full max-w-[68rem] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Top Section: Hero Greeting (Full Width) */}
          <div className="w-full">
            <div className="relative card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md overflow-hidden border border-[#cdf2cb] flex flex-col justify-between">
              <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-[#d9fdd6]/70 pointer-events-none blur-2xl"></div>
              <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-[#ffdeaa]/40 pointer-events-none blur-2xl"></div>

              <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Profile Avatar with Direct Upload Trigger */}
                <div className="relative shrink-0 group">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    type="button"
                    title="Click to upload profile photo"
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1.5 bg-gradient-to-tr from-[#2e7d32] via-[#98f994] to-[#ffdeaa] shadow-md relative overflow-hidden block cursor-pointer transition-transform hover:scale-105"
                  >
                    <img
                      alt={displayName}
                      className="w-full h-full object-cover rounded-full shadow-inner bg-white"
                      src={patient?.avatar || '/avatar.png'}
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-2xl">photo_camera</span>
                      <span className="text-[10px] font-bold mt-0.5">Change</span>
                    </div>
                  </button>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    type="button"
                    title="Upload profile photo"
                    className="absolute bottom-1 right-1 bg-[#0d631b] hover:bg-[#006e1c] text-white rounded-full p-1.5 shadow-md flex items-center justify-center cursor-pointer transition-transform active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                  </button>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d3f8d0] text-xs sm:text-sm font-bold text-[#0d631b]">
                      <span className="material-symbols-outlined text-base text-[#0d631b]">calendar_today</span>
                      {currentDateStr}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#ffdeaa]/60 text-xs font-bold text-[#724f00]">
                      {lang || 'English'}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#032109] leading-tight">
                    {t.goodMorning || 'Good morning'}, {displayHonorific} <span className="inline-block hover:scale-110 transition-transform">🌿</span>
                  </h1>
                  <p className="text-sm sm:text-base text-[#40493d] max-w-2xl">
                    {t.elderGreetingDesc || `The morning air in ${patient?.city || 'your area'} is calm and fresh today. Take your time, sip warm water, and enjoy your quiet rhythm.`}
                  </p>
                </div>

                {/* Prominent Emergency SOS Button */}
                <div className="shrink-0 flex flex-col items-center sm:items-end justify-center self-center sm:self-start mt-3 sm:mt-0">
                  <button
                    onClick={handleTriggerSos}
                    id="hero-emergency-sos-button"
                    type="button"
                    disabled={sosStatus === 'sending'}
                    className={`btn-tactile px-5 py-3.5 sm:px-6 sm:py-4 rounded-2xl font-black text-sm sm:text-base flex items-center gap-3 transition-all cursor-pointer shadow-xl border-2 ${
                      sosStatus === 'sending'
                        ? 'bg-amber-500 border-amber-400 text-white animate-pulse'
                        : sosStatus === 'sent'
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-600/30'
                        : 'bg-red-600 hover:bg-red-700 active:bg-red-800 border-red-500 text-white shadow-red-600/40 hover:scale-105 active:scale-95'
                    }`}
                    aria-label="Emergency SOS Alert"
                  >
                    <span className="material-symbols-outlined text-2xl sm:text-3xl animate-pulse">
                      {sosStatus === 'sending' ? 'hourglass_top' : sosStatus === 'sent' ? 'check_circle' : 'emergency'}
                    </span>
                    <div className="text-left">
                      <div className="leading-tight uppercase tracking-wider text-xs sm:text-sm font-black">
                        {sosStatus === 'sending' ? 'Sending SOS...' : sosStatus === 'sent' ? 'SOS Sent to Caregiver' : 'Emergency SOS'}
                      </div>
                      <div className="text-[10px] text-white/90 font-medium">
                        {sosStatus === 'sending' ? 'Dispatching alert...' : sosStatus === 'sent' ? 'Caregiver Notified' : 'Tap for Urgent Help'}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 1. Medicine Rhythm Card - ALL COMPLETED STATE */}
          {isAllDone ? (
            <section className="relative card-tactile bg-[#d9fdd6] rounded-3xl p-6 sm:p-8 shadow-md overflow-hidden border border-[#cdf2cb]">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="flex items-center gap-4 flex-col sm:flex-row">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-[#006e1c] text-white flex items-center justify-center shadow-md shrink-0">
                    <span className="material-symbols-outlined text-3xl sm:text-4xl">task_alt</span>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-[#0d631b] text-xs font-extrabold mb-1 shadow-sm">
                      <span className="material-symbols-outlined text-sm">celebration</span>
                      {t.metricAllMedsDone || 'All medicines completed for today'}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#032109]">
                      {t.metricAllMedsDone || 'All Medicines Completed for Today ✓'}
                    </h2>
                    <p className="text-sm text-[#40493d] mt-1">
                      Wonderful care today, {displayHonorific}! All {allMeds.length} daily routines and medicine doses are completed.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-4 py-2 rounded-full bg-[#006e1c] text-white font-extrabold text-sm shadow-sm">
                    {allMeds.length}/{allMeds.length} (100%)
                  </span>
                </div>
              </div>

              {/* Completed list badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-[#cdf2cb]">
                {allMeds.map((med, idx) => (
                  <div key={med.id || idx} className="p-2.5 bg-white rounded-xl border border-[#cdf2cb] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0d631b] text-base">check_circle</span>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-[#032109] truncate">{med.title}</p>
                      <p className="text-[10px] text-[#40493d]">{med.scheduledTime} · Taken {med.takenAt || ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : currentMed ? (
            <section className="relative card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md overflow-hidden border border-[#cdf2cb]">
              <div className={`absolute top-0 left-0 bottom-0 w-2.5 ${currentMed.taken ? 'bg-[#0d631b]' : 'bg-[#2e7d32]'}`}></div>

              <div className="pl-2 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#d9fdd6] flex items-center justify-center shadow-inner shrink-0 text-[#0d631b]">
                      <span className="material-symbols-outlined text-3xl">medication</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm text-[#40493d] flex items-center gap-1 font-bold">
                          <span className="material-symbols-outlined text-sm text-[#0d631b]">schedule</span>
                          {t.metricNextMed || 'Scheduled'}: {currentMed.scheduledTime}
                        </span>
                        {pendingMeds.length > 1 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                            {pendingMeds.length} remaining today
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-[#032109]">
                        {currentMed.title}
                      </h2>
                    </div>
                  </div>

                  <span
                    className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 self-start sm:self-center ${
                      currentMed.taken ? 'bg-[#d9fdd6] text-[#0c7521]' : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {currentMed.taken ? 'check_circle' : 'pending'}
                    </span>
                    {currentMed.taken ? (t.takenJustNow || 'Taken on time') : (t.pendingDose || 'Pending dose')}
                  </span>
                </div>

                <p className="text-sm sm:text-base text-[#40493d] bg-[#ebffe7] p-3 rounded-2xl border border-[#cdf2cb]">
                  {currentMed.detail}
                </p>

                <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                  <span className="text-xs text-[#40493d] font-bold">
                    {completedMeds.length} of {allMeds.length} completed today ({allMeds.length > 0 ? Math.round((completedMeds.length / allMeds.length) * 100) : 0}%)
                  </span>

                  <button
                    id="elder-mark-taken-btn"
                    onClick={handleMarkCurrentMedTaken}
                    type="button"
                    className="btn-tactile btn-primary px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold cursor-pointer shadow-md flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">check</span>
                    <span>{t.markAsTaken || 'Mark as Taken'}</span>
                  </button>
                </div>
              </div>
            </section>
          ) : null}

          {/* 2. Play Memory Match Game Card */}
          <section
            onClick={() => router.push('/memory-game')}
            className="card-tactile bg-gradient-to-r from-[#d9fdd6] to-[#ebffe7] rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] flex flex-col sm:flex-row items-center justify-between gap-6 cursor-pointer hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#0d631b] shrink-0 border border-[#cdf2cb]">
                <span className="material-symbols-outlined text-4xl">extension</span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase text-[#0d631b] tracking-wider">
                  {t.metricMindGames || 'Gentle Mind Game'}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#032109] mt-0.5">
                  {t.memoryMatchCardTitle || 'Memory Match'}
                </h3>
                <p className="text-xs sm:text-sm text-[#40493d] mt-1">
                  {t.memoryMatchDesc || 'Gentle picture match with morning tea, flowers, and family memories.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn-tactile btn-primary px-6 py-3 rounded-full text-sm font-bold shrink-0 cursor-pointer shadow-md"
            >
              {t.tapToPlayCards || 'Play Match Game →'}
            </button>
          </section>

          {/* 3. Speak with Loved Ones Card */}
          <section
            onClick={() => router.push('/contacts')}
            className="card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] flex flex-col sm:flex-row items-center justify-between gap-6 cursor-pointer hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#d9fdd6] shadow-sm flex items-center justify-center text-[#0d631b] shrink-0 border border-[#cdf2cb]">
                <span className="material-symbols-outlined text-4xl">family_restroom</span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase text-[#0d631b] tracking-wider">
                  {t.familyContacts || 'People Who Care for You'}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#032109] mt-0.5">
                  {t.lovedOnesEmergencyTitle || 'Your Loved Ones & Family'}
                </h3>
                <p className="text-xs sm:text-sm text-[#40493d] mt-1">
                  {t.lovedOnesEmergencyDesc || `Tap to call ${caregiverName} or family with 1 gentle tap.`}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn-tactile btn-secondary px-6 py-3 rounded-full text-sm font-bold shrink-0 cursor-pointer bg-[#d3f8d0] text-[#032109]"
            >
              {t.openContactsButton || 'View Contacts →'}
            </button>
          </section>
        </div>
      </main>

      {/* Emergency SOS Dispatch Modal */}
      {isSosModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md sm:max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-red-500 space-y-5 text-center animate-scale-up">
            {sosStatus === 'sending' ? (
              <div className="py-6 space-y-5">
                <div className="relative mx-auto w-24 h-24 rounded-full bg-amber-100 border-4 border-amber-500 flex items-center justify-center text-amber-600 shadow-xl">
                  <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
                  <span className="material-symbols-outlined text-5xl font-black animate-pulse">emergency</span>
                </div>
                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-black uppercase tracking-widest inline-block shadow-sm">
                    Emergency Alert in Progress
                  </span>
                  <h2 className="text-3xl font-black text-[#032109]">Sending SOS...</h2>
                  <p className="text-sm font-semibold text-[#40493d]">
                    Dispatching urgent alert to <strong className="text-amber-900 font-bold">{caregiverEmail || patient?.caregiverEmail || 'linked caregiver'}</strong>
                  </p>
                </div>
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-left space-y-2">
                  <div className="flex justify-between text-xs text-amber-950 font-bold">
                    <span>Elder:</span>
                    <span>{displayName || patient?.name || 'Asha Devi Borah'} ({patient?.age || 74} yrs)</span>
                  </div>
                  <div className="flex justify-between text-xs text-amber-950 font-bold">
                    <span>Location / City:</span>
                    <span>{patient?.location || (patient?.city ? `${patient.city}, ${patient.state || 'Assam'}` : 'Guwahati, Assam')}</span>
                  </div>
                  <div className="flex justify-between text-xs text-amber-950 font-bold">
                    <span>Notification Channel:</span>
                    <span className="text-emerald-700">Immediate Caregiver Email</span>
                  </div>
                </div>
              </div>
            ) : sosStatus === 'sent' ? (
              <div className="space-y-5 py-2">
                <div className="w-24 h-24 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center border-4 border-emerald-500 shadow-xl">
                  <span className="material-symbols-outlined text-6xl font-black">check_circle</span>
                </div>

                <div className="space-y-1.5">
                  <span className="px-3.5 py-1 rounded-full bg-emerald-700 text-white text-xs font-black uppercase tracking-wider inline-block shadow-xs">
                    Beacon Dispatched
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#032109]">
                    Emergency Alert Sent to Caregiver
                  </h2>
                  <p className="text-sm text-[#40493d]">
                    Emergency alert delivered to <strong className="text-emerald-800 font-extrabold">{caregiverEmail || patient?.caregiverEmail || 'Caregiver'}</strong>.
                  </p>
                </div>

                <div className="bg-[#ebffe7] border-2 border-[#cdf2cb] rounded-2xl p-4 text-left space-y-2 text-sm text-[#032109] shadow-inner">
                  <div className="flex justify-between border-b border-[#cdf2cb] pb-1.5">
                    <span className="text-xs font-bold text-[#40493d]">Elder Name & Age:</span>
                    <span className="font-extrabold">{displayName || patient?.name || 'Asha Devi Borah'} ({patient?.age || 74} yrs)</span>
                  </div>
                  <div className="flex justify-between border-b border-[#cdf2cb] pb-1.5">
                    <span className="text-xs font-bold text-[#40493d]">Location / City:</span>
                    <span className="font-extrabold">{patient?.location || (patient?.city ? `${patient.city}, ${patient.state || 'Assam'}` : 'Guwahati, Assam')}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#cdf2cb] pb-1.5">
                    <span className="text-xs font-bold text-[#40493d]">Time of Alert:</span>
                    <span className="font-extrabold text-emerald-800">{lastSosTime || 'Just now'} (IST)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-[#40493d]">Caregiver Status:</span>
                    <span className="font-extrabold text-emerald-700">Notified via Direct Email & Portal</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <a
                    href={`tel:${patient?.phone || '+919854012345'}`}
                    className="btn-tactile w-full py-3.5 sm:py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold flex items-center justify-center gap-2 shadow-lg cursor-pointer text-base transition-transform active:scale-95"
                  >
                    <span className="material-symbols-outlined text-2xl">call</span>
                    <span>Direct Call Primary Contact</span>
                  </a>
                  <button
                    onClick={() => {
                      setIsSosModalOpen(false);
                      setSosStatus('idle');
                    }}
                    type="button"
                    className="w-full py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm cursor-pointer border border-gray-300 transition-colors"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : sosStatus === 'error' ? (
              <div className="space-y-5 py-2">
                <div className="w-24 h-24 mx-auto rounded-full bg-red-100 text-red-700 flex items-center justify-center border-4 border-red-500 shadow-xl">
                  <span className="material-symbols-outlined text-6xl font-black">error</span>
                </div>

                <div className="space-y-1.5">
                  <span className="px-3.5 py-1 rounded-full bg-red-600 text-white text-xs font-black uppercase tracking-wider inline-block shadow-xs">
                    Alert Error
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-red-950">
                    Caregiver Email Not Found
                  </h2>
                  <p className="text-sm text-red-800 font-medium leading-relaxed">
                    {sosErrorMsg || 'No linked caregiver email address is associated with this elder account.'}
                  </p>
                </div>

                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-left text-xs text-red-900 space-y-1">
                  <p className="font-bold">Next Steps:</p>
                  <p>1. Call emergency services at 112 immediately if this is an urgent crisis.</p>
                  <p>2. Ask your caregiver or family to link their email in the Caregiver Portal.</p>
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <a
                    href="tel:112"
                    className="btn-tactile w-full py-3.5 sm:py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold flex items-center justify-center gap-2 shadow-lg cursor-pointer text-base"
                  >
                    <span className="material-symbols-outlined text-2xl">call</span>
                    <span>Call Emergency Services (112)</span>
                  </a>
                  <button
                    onClick={() => {
                      setIsSosModalOpen(false);
                      setSosStatus('idle');
                    }}
                    type="button"
                    className="w-full py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm cursor-pointer border border-gray-300"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5 py-2">
                <div className="relative mx-auto w-24 h-24 rounded-full bg-red-100 flex items-center justify-center text-red-600 border-4 border-red-500 shadow-xl">
                  <span className="material-symbols-outlined text-6xl font-black">emergency</span>
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-[#032109]">
                    Emergency SOS Alert
                  </h2>
                  <p className="text-sm text-[#40493d]">
                    Tap below to immediately notify your caregiver <strong className="text-red-900">{caregiverEmail || patient?.caregiverEmail || 'linked caregiver'}</strong>.
                  </p>
                </div>
                <div className="flex flex-col gap-3 pt-2">
                  <button
                    onClick={triggerSosDispatch}
                    type="button"
                    className="btn-tactile w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-lg shadow-[0_6px_0_#8b0000] active:translate-y-1 active:shadow-none cursor-pointer flex items-center justify-center gap-2 transition-all"
                  >
                    <span className="material-symbols-outlined text-2xl">send</span>
                    <span>SEND SOS IMMEDIATELY</span>
                  </button>
                  <button
                    onClick={handleCancelSos}
                    type="button"
                    className="w-full py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm cursor-pointer border border-gray-300 transition-colors"
                  >
                    Cancel (I am safe)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Persistent Floating Emergency SOS Button */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <button
          onClick={handleTriggerSos}
          id="floating-emergency-sos-button"
          type="button"
          disabled={sosStatus === 'sending'}
          className={`btn-tactile flex items-center gap-2.5 px-5 py-3.5 sm:px-6 sm:py-4 rounded-full font-black text-sm sm:text-base shadow-[0_8px_30px_rgba(220,38,38,0.5)] transition-all cursor-pointer border-2 border-white hover:scale-105 active:scale-95 ${
            sosStatus === 'sending'
              ? 'bg-amber-500 text-white animate-pulse'
              : sosStatus === 'sent'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          aria-label="Floating Emergency SOS"
        >
          <span className="material-symbols-outlined text-2xl sm:text-3xl animate-pulse">
            {sosStatus === 'sending' ? 'hourglass_top' : sosStatus === 'sent' ? 'check_circle' : 'emergency'}
          </span>
          <span className="tracking-wide">
            {sosStatus === 'sending' ? 'Sending SOS...' : sosStatus === 'sent' ? 'SOS Sent to Caregiver' : 'Emergency SOS'}
          </span>
        </button>
      </div>
    </div>
  );
}
