// Sahara Shared Data Store
const STORAGE_KEY_DATA = 'sahara_app_state_v1';

const defaultState = {
  language: 'English',
  patient: null,
  caregiver: null,
  contacts: [],
  medicines: [],
  gamesPlayedCount: 0,
  gameScores: [],
  moodRating: 'Peaceful & Alert',
  wellnessBroadcasts: [],
  reminders: []
};

class DataStore {
  constructor() {
    this.state = this.loadState();
  }

  loadState() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY_DATA);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.patient && (!parsed.patient.avatar || parsed.patient.avatar.includes('AB6AXuAFC'))) {
            parsed.patient.avatar = '/avatar.png';
          }
          // Do not restore legacy hardcoded mock patient
          if (parsed.patient?.name === 'Asha Devi Borah' && !localStorage.getItem('sahara_keep_asha')) {
            parsed.patient = null;
          }
          if (parsed.caregiver?.email === 'riya@sahara.care' && !localStorage.getItem('sahara_keep_riya')) {
            parsed.caregiver = null;
          }
          return { ...defaultState, ...parsed };
        }
      }
    } catch (e) {
      console.warn('Could not read state from storage', e);
    }
    return JSON.parse(JSON.stringify(defaultState));
  }

  saveState() {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(this.state));
        window.dispatchEvent(new CustomEvent('sahara:state-change', { detail: this.state }));
        window.dispatchEvent(new CustomEvent('sahara:datastore-change', { detail: this.state }));
      }
    } catch (e) {
      console.warn('Could not write state to storage', e);
    }
  }

  notifyChange() {
    this.saveState();
  }

  markMedicineTaken(id) {
    const todayStr = new Date().toISOString().split('T')[0];
    const takenAtTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentMeds = this.getMedicines();
    let found = false;
    const updated = currentMeds.map((m, idx) => {
      const isTarget = (
        (id !== undefined && id !== null && (m.id === id || String(m.id) === String(id))) ||
        (m.title && m.title === id) ||
        (m.name && m.name === id) ||
        (currentMeds.length === 1) ||
        (idx === 0 && !m.taken)
      );
      if (isTarget && !found) {
        found = true;
        return { ...m, taken: true, isDue: false, takenAt: takenAtTime, takenDate: todayStr };
      }
      return m;
    });
    this.saveMedicines(updated);
    return updated;
  }

  addReminder(reminder) {
    this.state.reminders.unshift({
      id: 'rem_' + Date.now(),
      ...reminder,
    });
    this.saveState();
  }

  incrementGamesCount() {
    this.state.gamesPlayedCount = (this.state.gamesPlayedCount || 0) + 1;
    this.saveState();
  }

  sendWellnessBroadcast(message = 'Elder sanctuary is peaceful and calm.') {
    this.state.wellnessBroadcasts.unshift({
      id: 'broad_' + Date.now(),
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    this.saveState();
  }

  updatePatientProfile(data = {}) {
    if (!this.state.patient || typeof this.state.patient !== 'object') {
      this.state.patient = {};
    }
    const { name, age, location, city, state, avatar, honorific, phone, email, status, wing } = data;
    if (name && name.trim()) {
      const cleanName = name.trim();
      this.state.patient.name = cleanName;
      const firstName = cleanName.split(' ')[0];
      this.state.patient.honorific = honorific || (firstName ? `${firstName} ji` : cleanName);
    }
    if (age !== undefined && age !== '') {
      const numAge = parseInt(age, 10);
      if (!isNaN(numAge) && numAge > 0) {
        this.state.patient.age = numAge;
      }
    }
    if (location && location.trim()) {
      this.state.patient.location = location.trim();
      this.state.patient.wing = location.trim();
    }
    if (wing && wing.trim()) {
      this.state.patient.wing = wing.trim();
    }
    if (city && city.trim()) {
      this.state.patient.city = city.trim();
    }
    if (state && state.trim()) {
      this.state.patient.state = state.trim();
    }
    if (status && status.trim()) {
      this.state.patient.status = status.trim();
    }
    if (avatar) {
      this.state.patient.avatar = avatar;
    }
    if (phone) {
      this.state.patient.phone = phone;
    }
    if (email) {
      this.state.patient.email = email;
    }
    this.saveState();
  }

  getPatient() {
    // 1. If an active session exists in localStorage, inspect role & linkedElder first!
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const storedActive = localStorage.getItem('sahara_active_user');
        if (storedActive) {
          const u = JSON.parse(storedActive);
          // If logged-in user is a caregiver with a linkedElder, ALWAYS prioritize linkedElder!
          if (u?.role === 'caregiver' && u.linkedElder?.name) {
            const raw = u.linkedElder;
            const cleanHonorific = raw.honorific || `${raw.name.split(' ')[0]} ji`;
            const status = raw.status || raw.problemStatement || 'Mild Cognitive Support Mode';
            const linked = {
              id: raw.id || raw.identifier || raw.phone || raw.email || 'linked_elder',
              name: raw.name,
              honorific: cleanHonorific,
              age: parseInt(raw.age, 10) || 74,
              city: raw.city || 'Kolkata',
              state: raw.state || 'West Bengal',
              wing: raw.wing || raw.location || 'Garden Terrace Wing',
              location: raw.location || `${raw.city || 'Kolkata'}, ${raw.state || 'West Bengal'}`,
              status: status,
              problemStatement: status,
              tabletBattery: raw.tabletBattery || 94,
              deviceConnected: true,
              lastActive: raw.lastActive || 'Just now',
              avatar: raw.avatar || '/avatar.png',
              phone: raw.phone || '',
              email: raw.email || '',
              caregiverEmail: raw.caregiverEmail || u.email || '',
            };
            this.state.patient = linked;
            return linked;
          }
          // If logged-in user is an elder, return elder profile
          if (u?.role === 'elder' && u.name) {
            const elderObj = {
              ...this.state.patient,
              ...u,
              honorific: u.honorific || `${u.name.split(' ')[0]} ji`,
            };
            this.state.patient = elderObj;
            return elderObj;
          }
        }
      } catch (e) {}
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      const fresh = this.loadState();
      if (fresh && fresh.patient && fresh.patient.name) {
        this.state.patient = fresh.patient;
        return this.state.patient;
      }
    }

    if (this.state.patient && this.state.patient.name) {
      return this.state.patient;
    }

    // Do not fall back to mock data: return null so components know real patient is pending
    return null;
  }

  clearPatient() {
    this.state.patient = null;
    this.state.contacts = [];
    this.saveState();
  }

  resetStore() {
    this.state = {
      language: this.state.language || 'English',
      patient: null,
      caregiver: null,
      contacts: [...(defaultState.contacts || [])],
      medicines: [...(defaultState.medicines || [])],
      reminders: [...(defaultState.reminders || [])],
      gamesPlayedCount: 0,
      moodRating: 'Peaceful & Alert',
      wellnessBroadcasts: [],
    };
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_KEY_DATA);
    }
    this.notifyChange();
  }

  getCaregiver() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const storedActive = localStorage.getItem('sahara_active_user');
        if (storedActive) {
          const u = JSON.parse(storedActive);
          if (u?.role === 'caregiver' && u.name) {
            return {
              name: u.name,
              email: u.email,
              phone: u.phone || '+91 98540 12345',
              relation: u.relation || 'Primary Caregiver',
              avatar: u.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3C9pKlylR36n8hHQndvUKkTljs_tOg3Gdg5-srU8WvV-YTOGYJeIOBOvqYISbX2RJdQgvmyliRh8-jt8-UlqHi4x_L4FNBDvdeUaqZfr7Vp9FMtzRQH-g0ov39z8XoigzQ2-C1QPqxbbL8QBjqY-WQ5c8XYX4jMP5ji1MumxGOHHdxB90LidJtUJl3RhpDWlM7FZ76v8qtgurN4tWzXc_4Hfwe_mzuvAQ5TyGqbEvHwY70aZyKa_ROg',
              ...u,
            };
          }
        }
      } catch (e) {}

      const fresh = this.loadState();
      if (fresh && fresh.caregiver && fresh.caregiver.email) {
        this.state.caregiver = fresh.caregiver;
        return this.state.caregiver;
      }
    }
    return (this.state.caregiver && this.state.caregiver.email) ? this.state.caregiver : null;
  }

  updateCaregiverProfile({ name, email, password, phone, relation }) {
    if (!this.state.caregiver) {
      this.state.caregiver = {};
    }
    if (name && name.trim()) {
      this.state.caregiver.name = name.trim();
      // Also sync primary contact if exists
      if (this.state.contacts && this.state.contacts[0]) {
        this.state.contacts[0].name = name.trim();
      }
    }
    if (email && email.trim()) {
      this.state.caregiver.email = email.trim().toLowerCase();
    }
    if (password && password.trim()) {
      this.state.caregiver.password = password.trim();
    }
    if (phone && phone.trim()) {
      this.state.caregiver.phone = phone.trim();
    }
    if (relation && relation.trim()) {
      this.state.caregiver.relation = relation.trim();
    }
    this.saveState();
  }

  updatePatientAndCaregiver({ patientData, caregiverData }) {
    if (patientData) {
      this.updatePatientProfile(patientData);
    }
    if (caregiverData) {
      this.updateCaregiverProfile(caregiverData);
    }
  }

  loadLinkedPatient(patientData, caregiverData = null) {
    if (patientData && typeof patientData === 'object') {
      const rawName = patientData.name || 'Sahara Member';
      const cleanHonorific = patientData.honorific || `${rawName.split(' ')[0]} ji`;
      const status = patientData.status || patientData.problemStatement || 'Mild Cognitive Support Mode';
      const city = patientData.city || 'Kolkata';
      const state = patientData.state || 'West Bengal';
      const location = patientData.location || `${city}, ${state}`;

      this.state.patient = {
        id: patientData.id || patientData.identifier || patientData.email || patientData.phone || 'linked_elder',
        name: rawName,
        honorific: cleanHonorific,
        age: parseInt(patientData.age, 10) || 74,
        city: city,
        state: state,
        wing: patientData.wing || location,
        location: location,
        status: status,
        problemStatement: status,
        tabletBattery: patientData.tabletBattery || 94,
        deviceConnected: true,
        lastActive: patientData.lastActive || 'Just now',
        avatar: patientData.avatar || '/avatar.png',
        phone: patientData.phone || '',
        email: patientData.email || '',
        caregiverEmail: patientData.caregiverEmail || caregiverData?.email || '',
        updatedAt: patientData.updatedAt || new Date().toISOString(),
      };

      if (caregiverData && typeof caregiverData === 'object') {
        const cgName = caregiverData.name || 'Caregiver Companion';
        const cgEmail = caregiverData.email || patientData.caregiverEmail || '';
        const cgPhone = caregiverData.phone || patientData.phone || '+91 98540 12345';
        const cgRelation = caregiverData.relation || 'Primary Caregiver';

        this.state.caregiver = {
          name: cgName,
          email: cgEmail,
          phone: cgPhone,
          relation: cgRelation,
          avatar: caregiverData.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3C9pKlylR36n8hHQndvUKkTljs_tOg3Gdg5-srU8WvV-YTOGYJeIOBOvqYISbX2RJdQgvmyliRh8-jt8-UlqHi4x_L4FNBDvdeUaqZfr7Vp9FMtzRQH-g0ov39z8XoigzQ2-C1QPqxbbL8QBjqY-WQ5c8XYX4jMP5ji1MumxGOHHdxB90LidJtUJl3RhpDWlM7FZ76v8qtgurN4tWzXc_4Hfwe_mzuvAQ5TyGqbEvHwY70aZyKa_ROg',
          status: 'Active · Connected',
          location: city,
        };

        // Check if elder has saved customized contacts, else start with empty list for user customization
        const customContacts = (patientData.contacts && Array.isArray(patientData.contacts))
          ? patientData.contacts
          : (this.loadCustomContacts(this.state.patient.id) || []);

        this.state.contacts = customContacts;
      }

      // Load actual medicines for this elder if present, otherwise preserve existing state
      if (Array.isArray(patientData?.medicines)) {
        this.state.medicines = patientData.medicines;
      }

      this.saveState();
      this.notifyChange();
    }
  }

  getContacts() {
    if (!this.state.contacts) {
      const saved = this.loadCustomContacts();
      this.state.contacts = saved || [];
    }
    return this.state.contacts || [];
  }

  loadCustomContacts(elderId = null) {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    try {
      const targetId = elderId || this.state.patient?.id || this.state.patient?.phone || 'global';
      const raw = localStorage.getItem(`sahara_contacts_${targetId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const general = localStorage.getItem('sahara_contacts');
      if (general) {
        const parsedGen = JSON.parse(general);
        if (Array.isArray(parsedGen) && parsedGen.length > 0) return parsedGen;
      }
    } catch (e) {}
    return null;
  }

  saveContacts(contacts) {
    if (!Array.isArray(contacts)) return;
    this.state.contacts = contacts;
    this.saveState();
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const targetId = this.state.patient?.id || this.state.patient?.phone || 'global';
        localStorage.setItem(`sahara_contacts_${targetId}`, JSON.stringify(contacts));
        localStorage.setItem('sahara_contacts', JSON.stringify(contacts));
      } catch (e) {}
    }
    // Async persist to server database
    try {
      const elderId = this.state.patient?.id || this.state.patient?.phone;
      const caregiverEmail = this.state.caregiver?.email || this.state.patient?.caregiverEmail;
      fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elderId, caregiverEmail, contacts }),
      }).catch(err => console.warn('[dataStore] Failed to sync contacts to server:', err));
    } catch (e) {}

    this.notifyChange();
  }

  addContact(contact) {
    const newContact = {
      id: contact.id || `contact_${Date.now().toString(36)}`,
      name: contact.name || 'Family Member',
      relation: contact.relation || 'Loved One',
      phone: contact.phone || '',
      email: contact.email || '',
      location: contact.location || `${this.state.patient?.city || 'Home'}`,
      status: contact.status || 'Available',
      avatar: contact.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    };
    const updated = [...(this.state.contacts || []), newContact];
    this.saveContacts(updated);
    return newContact;
  }

  updateContact(contactId, updatedData) {
    const updated = (this.state.contacts || []).map(c => {
      if (c.id === contactId) {
        return { ...c, ...updatedData };
      }
      return c;
    });
    this.saveContacts(updated);
  }

  deleteContact(contactId) {
    const updated = (this.state.contacts || []).filter(c => c.id !== contactId);
    this.saveContacts(updated);
  }

  getMedicines() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const targetId = this.state.patient?.id || this.state.patient?.phone || 'global';
        const stored = localStorage.getItem(`sahara_medicines_${targetId}`) || localStorage.getItem('sahara_medicines');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.state.medicines = parsed;
            return parsed;
          }
        }
      } catch (e) {}
    }
    return Array.isArray(this.state.medicines) ? this.state.medicines : [];
  }

  saveMedicines(medicines) {
    if (!Array.isArray(medicines)) return;
    this.state.medicines = medicines;
    this.saveState();
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const targetId = this.state.patient?.id || this.state.patient?.phone || 'global';
        localStorage.setItem(`sahara_medicines_${targetId}`, JSON.stringify(medicines));
        localStorage.setItem('sahara_medicines', JSON.stringify(medicines));
      } catch (e) {}
    }

    // Resolve identity: prefer active session, fall back to state
    let elderId = null;
    let caregiverEmail = null;
    try {
      if (typeof window !== 'undefined') {
        const activeUser = JSON.parse(localStorage.getItem('sahara_active_user') || 'null');
        if (activeUser?.role === 'elder') {
          elderId = activeUser.phone || activeUser.email || activeUser.id;
          caregiverEmail = activeUser.caregiverEmail || null;
        } else if (activeUser?.role === 'caregiver') {
          caregiverEmail = activeUser.email || null;
          elderId = activeUser.linkedElder?.phone || activeUser.linkedElder?.id || activeUser.linkedElder?.email || null;
        }
      }
    } catch (e) {}
    if (!elderId) elderId = this.state.patient?.id || this.state.patient?.phone || this.state.patient?.email;
    if (!caregiverEmail) caregiverEmail = this.state.caregiver?.email || this.state.patient?.caregiverEmail;

    // Async persist to server database
    if (elderId || caregiverEmail) {
      fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elderId, caregiverEmail, medicines }),
      }).catch(err => console.warn('[dataStore] Failed to sync reminders to server:', err));
    }

    this.notifyChange();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sahara:medicines-change', { detail: { medicines } }));
    }
  }

  addReminder(reminder) {
    const newMed = {
      id: reminder.id || `rem_${Date.now().toString(36)}`,
      title: reminder.title || 'Daily Routine Dose',
      detail: reminder.detail || 'Scheduled reminder',
      scheduledTime: reminder.scheduledTime || reminder.time || '08:00 AM',
      category: reminder.category || 'medication',
      taken: Boolean(reminder.taken),
      takenAt: reminder.takenAt || null,
    };
    const list = [...this.getMedicines(), newMed];
    this.saveMedicines(list);
    return newMed;
  }

  deleteReminder(reminderId) {
    const list = this.getMedicines().filter(m => m.id !== reminderId);
    this.saveMedicines(list);
  }

  toggleMedicineStatus(identifier) {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMeds = this.getMedicines();
    let toggled = false;
    const list = currentMeds.map((m, idx) => {
      const isTarget = (
        m.id === identifier ||
        idx === identifier ||
        String(m.id) === String(identifier) ||
        m.title === identifier ||
        m.name === identifier ||
        (currentMeds.length === 1)
      );
      if (isTarget && !toggled) {
        toggled = true;
        const nowTaken = !m.taken;
        return {
          ...m,
          taken: nowTaken,
          isDue: !nowTaken,
          takenAt: nowTaken ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
          takenDate: nowTaken ? todayStr : null,
        };
      }
      return m;
    });
    this.saveMedicines(list);
    return list;
  }

  recordGameScore(scoreData) {
    const todayStr = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toISOString();
    const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const accuracy = Number(scoreData.accuracy) || 0;
    const newScore = {
      id: `score_${Date.now()}`,
      score: Number(scoreData.score) || 0,
      moves: Number(scoreData.moves) || 0,
      matchedPairs: Number(scoreData.matchedPairs) || 3,
      accuracy,
      durationSeconds: Number(scoreData.durationSeconds) || 0,
      date: scoreData.date || todayStr,
      timestamp,
      time: timeFormatted,
      status: scoreData.status || (accuracy >= 90 ? 'High Focus' : 'Steady Recall'),
    };

    if (!Array.isArray(this.state.gameScores)) {
      this.state.gameScores = [];
    }

    this.state.gameScores.unshift(newScore);
    this.state.gamesPlayedCount = (this.state.gamesPlayedCount || 0) + 1;
    this.saveState();

    // Resolve elder identity: prefer active logged-in user, fall back to state.patient
    let elderId = null;
    let caregiverEmail = null;
    try {
      if (typeof window !== 'undefined') {
        const activeUser = JSON.parse(localStorage.getItem('sahara_active_user') || 'null');
        if (activeUser?.role === 'elder') {
          elderId = activeUser.phone || activeUser.email || activeUser.id;
          caregiverEmail = activeUser.caregiverEmail || null;
        } else if (activeUser?.role === 'caregiver') {
          elderId = activeUser.linkedElder?.phone || activeUser.linkedElder?.id || activeUser.linkedElder?.email;
          caregiverEmail = activeUser.email || null;
        }
      }
    } catch (e) {}
    // Fallback to state
    if (!elderId) {
      elderId = this.state.patient?.id || this.state.patient?.phone || this.state.patient?.email;
    }
    if (!caregiverEmail) {
      caregiverEmail = this.state.caregiver?.email || this.state.patient?.caregiverEmail;
    }

    // Async persist to server database
    if (elderId) {
      fetch('/api/game-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elderId, caregiverEmail, ...newScore }),
      }).catch(err => console.warn('[dataStore] Failed to post game score to server:', err));
    }

    // Notify caregiver portal in real time
    this.notifyChange();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sahara:game-score-change', { detail: { score: newScore } }));
    }
    return newScore;
  }

  saveGameScores(scores) {
    if (Array.isArray(scores)) {
      this.state.gameScores = scores;
      this.state.gamesPlayedCount = scores.length;
      this.saveState();
      this.notifyChange();
    }
  }

  getGameScores() {
    return Array.isArray(this.state.gameScores) ? this.state.gameScores : [];
  }

  getGameAnalytics() {
    const scores = this.getGameScores();
    const todayStr = new Date().toISOString().split('T')[0];
    const todayScores = scores.filter(s => s.date === todayStr);
    const todayTotalScore = todayScores.reduce((sum, s) => sum + s.score, 0);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days = [];
    let weeklyTotalScore = 0;
    let weeklySessions = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayLabel = dayNames[d.getDay()];
      const dayRecords = scores.filter(s => s.date === dStr);
      const dayScore = dayRecords.reduce((sum, s) => sum + s.score, 0);
      const sessions = dayRecords.length;
      weeklyTotalScore += dayScore;
      weeklySessions += sessions;

      const dateStr = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;

      last7Days.push({
        date: dStr,
        dateStr,
        day: i === 0 ? 'Today' : dayLabel,
        score: dayScore,
        sessions,
        isToday: dStr === todayStr,
      });
    }

    const hasScores = scores.length > 0;
    const avgAccuracy = hasScores
      ? Math.round(scores.reduce((sum, s) => sum + (s.accuracy || 100), 0) / scores.length)
      : 0;

    return {
      todayScore: todayTotalScore,
      todaySessions: todayScores.length,
      weeklyScore: weeklyTotalScore,
      weeklySessions,
      avgAccuracy,
      cognitiveStability: hasScores ? (avgAccuracy >= 85 ? 'High Recall (96%)' : 'Steady Recall') : 'Awaiting First Game',
      last7Days,
      weeklyTrend: last7Days,
      recentScores: scores.slice(0, 10),
    };
  }

  getLanguage() {
    return this.state.language || 'English';
  }

  setLanguage(lang) {
    if (lang) {
      this.state.language = lang;
      this.saveState();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sahara:lang-change', { detail: { language: lang } }));
      }
    }
  }
}

export const dataStore = new DataStore();
