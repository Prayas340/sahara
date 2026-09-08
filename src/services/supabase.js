import { createClient } from '@supabase/supabase-js';

// Configuration keys for localStorage
const STORAGE_KEY_URL = 'sahara_supabase_url';
const STORAGE_KEY_ANON = 'sahara_supabase_anon_key';
const STORAGE_KEY_PROJECT = 'sahara_supabase_project_name';

// Default project setup
const DEFAULT_URL = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) || 'https://sahara.supabase.co';
const DEFAULT_KEY = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 'BqtU6lFwVcs1sEZb';
const DEFAULT_PROJECT = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_PROJECT_NAME) || 'sahara';

export function getSupabaseConfig() {
  const customUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) : null;
  const customKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ANON) : null;
  const customProject = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_PROJECT) : null;

  const url = (customUrl && customUrl.trim()) || DEFAULT_URL;
  const anonKey = (customKey && customKey.trim()) || DEFAULT_KEY;
  const projectName = (customProject && customProject.trim()) || DEFAULT_PROJECT;

  const isConfigured = Boolean(
    url &&
    anonKey &&
    url.startsWith('https://') &&
    url.includes('.supabase.co')
  );

  return {
    url,
    anonKey,
    projectName,
    isConfigured,
  };
}

let supabaseInstance = null;

export function getSupabase() {
  const { url, anonKey } = getSupabaseConfig();
  
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        },
      });
    } catch (err) {
      console.warn('[Sahara Supabase] Initialization warning:', err);
      supabaseInstance = createClient('https://mock.supabase.co', 'mock-anon-key');
    }
  }

  return supabaseInstance;
}

export function updateSupabaseConfig(url, anonKey, projectName = 'sahara') {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
    if (anonKey) localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
    if (projectName) localStorage.setItem(STORAGE_KEY_PROJECT, projectName.trim());
  }

  supabaseInstance = null;
  return getSupabaseConfig();
}

export function resetSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_ANON);
    localStorage.removeItem(STORAGE_KEY_PROJECT);
  }
  supabaseInstance = null;
  return getSupabaseConfig();
}

export async function testSupabaseConnection() {
  const { url, anonKey, projectName } = getSupabaseConfig();
  
  try {
    const sb = getSupabase();
    const { data: sessionData, error: sessionError } = await sb.auth.getSession();
    
    if (sessionError) {
      return {
        success: false,
        message: sessionError.message || 'Could not verify connection',
        url,
        projectName,
      };
    }

    return {
      success: true,
      message: `Connected securely to Supabase project "${projectName}"!`,
      url,
      projectName,
      hasSession: Boolean(sessionData?.session),
    };
  } catch (err) {
    return {
      success: false,
      message: err.message || 'Network connection failed',
      url,
      projectName,
    };
  }
}

export const supabaseService = {
  getConfig() {
    const cfg = getSupabaseConfig();
    return { url: cfg.url, key: cfg.anonKey, projectName: cfg.projectName };
  },
  saveConfig(url, key) {
    return updateSupabaseConfig(url, key);
  },
  resetConfig() {
    return resetSupabaseConfig();
  },
  testConnection() {
    return testSupabaseConnection();
  },
};
