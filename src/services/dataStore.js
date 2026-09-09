// Sahara Shared Data Store
const STORAGE_KEY_DATA = 'sahara_app_state_v1';

const defaultState = {
  language: 'English',
  patient: {
    id: 'asha_devi',
    name: 'Asha Devi Borah',
    honorific: 'Asha ji',
    age: 72,
    location: 'Room 2, Garden Terrace Wing',
    city: 'Guwahati',
    state: 'Assam',
    wing: 'Room 2, Garden Terrace Wing',
    status: 'Mild Cognitive Support Mode',
    tabletBattery: 92,
    deviceConnected: true,
    lastActive: '12 min ago',
    avatar: '/avatar.png',
  },
  caregiver: {
    name: 'Riya Borah',
    relation: 'Primary Daughter',
    email: 'riya@sahara.care',
    password: 'care123',
    phone: '+91 98540 12345',
    status: 'Available now · At home',
    location: 'In the tea room or backyard garden',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3C9pKlylR36n8hHQndvUKkTljs_tOg3Gdg5-srU8WvV-YTOGYJeIOBOvqYISbX2RJdQgvmyliRh8-jt8-UlqHi4x_L4FNBDvdeUaqZfr7Vp9FMtzRQH-g0ov39z8XoigzQ2-C1QPqxbbL8QBjqY-WQ5c8XYX4jMP5ji1MumxGOHHdxB90LidJtUJl3RhpDWlM7FZ76v8qtgurN4tWzXc_4Hfwe_mzuvAQ5TyGqbEvHwY70aZyKa_ROg',
  },
  contacts: [
    {
      id: 'riya',
      name: 'Riya',
      relation: 'Daughter · Primary Caregiver',
      location: 'Lives with you · Guwahati',
      status: 'With You · At home',
      phone: '+91 98540 12345',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3C9pKlylR36n8hHQndvUKkTljs_tOg3Gdg5-srU8WvV-YTOGYJeIOBOvqYISbX2RJdQgvmyliRh8-jt8-UlqHi4x_L4FNBDvdeUaqZfr7Vp9FMtzRQH-g0ov39z8XoigzQ2-C1QPqxbbL8QBjqY-WQ5c8XYX4jMP5ji1MumxGOHHdxB90LidJtUJl3RhpDWlM7FZ76v8qtgurN4tWzXc_4Hfwe_mzuvAQ5TyGqbEvHwY70aZyKa_ROg',
    },
    {
      id: 'anil',
      name: 'Anil',
      relation: 'Son · Engineer',
      location: 'Bangalore · Calls daily at 7 PM',
      status: 'Online · Free to talk',
      phone: '+91 98640 54321',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'dr_das',
      name: 'Dr. B. Das',
      relation: 'Family Physician · Guwahati Clinic',
      location: 'Dispur Medical Center',
      status: 'Clinic hours 9 AM - 6 PM',
      phone: '+91 98640 99887',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
    },
  ],
  medicines: [
    {
      id: 'med_morning',
      title: 'Morning Medicine',
      detail: 'Blood pressure tablet & Vitamin D',
      instruction: 'Take 1 round white tablet and 1 yellow gel capsule with lukewarm water after breakfast.',
      scheduledTime: '8:00 AM',
      isDue: true,
      taken: false,
      takenAt: null,
    },
    {
      id: 'med_afternoon',
      title: 'Afternoon Digestive',
      detail: 'Herbal digestive tonic (10ml)',
      instruction: 'Mix with warm water after lunch.',
      scheduledTime: '1:30 PM',
      isDue: false,
      taken: true,
      takenAt: '1:35 PM',
    },
    {
      id: 'med_night',
      title: 'Night Calm Routine',
      detail: 'Joint mobility tablet & warm turmeric milk',
      instruction: 'Take before reading or sleep.',
      scheduledTime: '8:30 PM',
      isDue: false,
      taken: false,
      takenAt: null,
    }
  ],
  gamesPlayedCount: 3,
  moodRating: 'Peaceful & Alert',
  wellnessBroadcasts: [],
  reminders: [
    {
      id: 'rem_1',
      title: 'Take blood pressure tablet with warm water',
      category: 'Medicine',
      time: '08:00 AM',
      frequency: 'Daily',
      whatsAppSync: true,
      recipients: 'Both (Active)',
    },
    {
      id: 'rem_2',
      title: 'Veranda gentle morning stroll',
      category: 'Walk / Stretch',
      time: '09:30 AM',
      frequency: 'Daily',
      whatsAppSync: true,
      recipients: 'Patient (Asha ji)',
    },
    {
      id: 'rem_3',
      title: 'Familiar Treasures memory picture game',
      category: 'Memory Game',
      time: '04:00 PM',
      frequency: 'Daily',
      whatsAppSync: false,
      recipients: 'Patient (Asha ji)',
    }
  ]
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
    const med = this.state.medicines.find(m => m.id === id);
    if (med) {
      med.taken = true;
      med.isDue = false;
      med.takenAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.saveState();
    }
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

  sendWellnessBroadcast(message = 'Asha ji is smiling and doing well.') {
    this.state.wellnessBroadcasts.unshift({
      id: 'broad_' + Date.now(),
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    this.saveState();
  }

  updatePatientProfile(data = {}) {
    if (!this.state.patient || typeof this.state.patient !== 'object') {
      this.state.patient = { ...defaultState.patient };
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

    // Safe fallback to defaultState so UI components never crash on patient.name
    return (this.state.patient && typeof this.state.patient === 'object') ? this.state.patient : defaultState.patient;
  }

  clearPatient() {
    this.state.patient = { ...defaultState.patient, name: '', honorific: '' };
    this.saveState();
  }

  resetStore() {
    this.state = {
      language: this.state.language || 'English',
      patient: { ...defaultState.patient },
      caregiver: { ...defaultState.caregiver },
      contacts: [...defaultState.contacts],
      medicines: [...defaultState.medicines],
      reminders: [...defaultState.reminders],
      gamesPlayedCount: 3,
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
      if (fresh && fresh.caregiver) {
        this.state.caregiver = fresh.caregiver;
      }
    }
    return this.state.caregiver || defaultState.caregiver;
  }

  updateCaregiverProfile({ name, email, password, phone, relation }) {
    if (!this.state.caregiver) {
      this.state.caregiver = { ...defaultState.caregiver };
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

  loadLinkedPatient(patientData) {
    if (patientData && typeof patientData === 'object') {
      const rawName = patientData.name || 'Sahara Member';
      const cleanHonorific = patientData.honorific || `${rawName.split(' ')[0]} ji`;
      const status = patientData.status || patientData.problemStatement || 'Mild Cognitive Support Mode';
      this.state.patient = {
        id: patientData.id || patientData.identifier || patientData.email || patientData.phone,
        name: rawName,
        honorific: cleanHonorific,
        age: parseInt(patientData.age, 10) || 74,
        city: patientData.city || 'Guwahati',
        state: patientData.state || 'Assam',
        wing: patientData.wing || 'Garden Terrace Wing',
        location: patientData.location || `${patientData.city || 'Guwahati'}, ${patientData.state || 'Assam'}`,
        status: status,
        problemStatement: status,
        tabletBattery: patientData.tabletBattery || 94,
        deviceConnected: true,
        lastActive: 'Just now',
        avatar: patientData.avatar || '/avatar.png',
        phone: patientData.phone || '',
        email: patientData.email || '',
        caregiverEmail: patientData.caregiverEmail || '',
      };
      this.saveState();
      this.notifyChange();
    }
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
