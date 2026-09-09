// Sahara Shared Data Store
const STORAGE_KEY_DATA = 'sahara_app_state_v1';

const defaultState = {
  language: 'English',
  patient: null,
  caregiver: null,
  contacts: [],
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

      // Update medicines tailored to this elder
      this.state.medicines = [
        {
          id: 'med_morning',
          title: status.includes('Alzheimer') || status.includes('Cognitive') ? 'Donepezil & Morning Rhythm' : 'Morning Vitality Dose',
          detail: `Blood pressure tablet & warm hydration after breakfast for ${cleanHonorific}`,
          instruction: 'Take with warm water or light tea.',
          scheduledTime: '08:00 AM',
          isDue: false,
          taken: true,
          takenAt: '08:15 AM',
        },
        {
          id: 'med_afternoon',
          title: 'Afternoon Digestive Tonic',
          detail: '10ml digestive syrup with lukewarm water after lunch',
          instruction: 'Take after midday rest.',
          scheduledTime: '01:30 PM',
          isDue: true,
          taken: false,
          takenAt: null,
        },
        {
          id: 'med_night',
          title: 'Night Calm Routine',
          detail: 'Joint mobility tablet with warm turmeric milk',
          instruction: 'Take before sleep.',
          scheduledTime: '08:30 PM',
          isDue: false,
          taken: false,
          takenAt: null,
        }
      ];

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
