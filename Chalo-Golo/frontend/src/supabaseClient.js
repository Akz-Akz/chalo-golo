import { createClient } from '@supabase/supabase-js'

/**
 * Supabase client — requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * (set local secrets in `.env.local`).
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

if (!isSupabaseConfigured) {
  console.warn(
    '[Chalo Golo] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them in frontend/.env.local.'
  )
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      }
    })
  : null

const SUPABASE_DISABLED_ERROR = {
  message: 'Supabase is not configured. Use guest mode for demo, or add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.',
}

function getDisabledResult() {
  return { data: null, error: SUPABASE_DISABLED_ERROR }
}

/**
 * AUTH HELPERS
 *
 * These wrap the Supabase API to give a clean interface to the rest of the app
 * and to add a graceful fallback to localStorage "guest mode" when Supabase
 * isn't configured (so the demo always works).
 */

export const authService = {
  // Sign up with email + password
  async signUpWithPassword({ email, password, name }) {
    if (!supabase) return getDisabledResult()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: window.location.origin,
      }
    });
    return { data, error };
  },

  // Sign in with email + password
  async signInWithPassword({ email, password }) {
    if (!supabase) return getDisabledResult()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  },

  // Email OTP (magic link / 6-digit code)
  async sendEmailOTP(email) {
    if (!supabase) return getDisabledResult()
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: window.location.origin,
      }
    });
    return { data, error };
  },

  // Verify the 6-digit OTP code
  async verifyEmailOTP({ email, token }) {
    if (!supabase) return getDisabledResult()
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    return { data, error };
  },

  // Google OAuth (opens Google popup / redirect)
  async signInWithGoogle() {
    if (!supabase) return getDisabledResult()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    return { data, error };
  },

  // Get current session
  async getSession() {
    if (!supabase) return { data: { session: null }, error: null }
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  },

  // Sign out
  async signOut() {
    if (!supabase) return { error: null }
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Listen for auth state changes
  onAuthStateChange(callback) {
    if (!supabase) {
      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      }
    }
    return supabase.auth.onAuthStateChange(callback);
  }
};

/**
 * DATA HELPERS — thoughts (goals/tabs) persistence
 *
 * Uses localStorage as primary storage so the demo always works without
 * requiring additional Supabase DB setup. Wire up the Supabase `thoughts`
 * table later for multi-device sync.
 */

const THOUGHTS_KEY = 'chalo_golo_thoughts';
const PROFILE_KEY = 'chalo_golo_profile';
const USE_REMOTE_KEY = 'chalo_golo_use_remote';
const OLD_THOUGHTS_KEY = 'pathfinder_thoughts';
const OLD_PROFILE_KEY = 'pathfinder_profile';
const OLD_USE_REMOTE_KEY = 'pathfinder_use_remote';

function getStoredJson(primaryKey, legacyKey, fallback) {
  try {
    const raw = localStorage.getItem(primaryKey) || localStorage.getItem(legacyKey);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!localStorage.getItem(primaryKey)) {
      localStorage.setItem(primaryKey, raw);
    }
    return parsed;
  } catch {
    return fallback;
  }
}

function dedupeThoughts(thoughts = []) {
  const seen = new Set();
  return thoughts.filter((thought) => {
    if (!thought?.id || seen.has(thought.id)) return false;
    seen.add(thought.id);
    return true;
  });
}

function upsertThoughtInList(thoughts = [], thought) {
  return dedupeThoughts([
    thought,
    ...thoughts.filter((item) => item.id !== thought.id),
  ]);
}

function getCurrentUserIdSafe() {
  try {
    // Try every sb-*-auth-token key in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('sb-') || !key.endsWith('-auth-token')) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const uid = parsed?.user?.id;
      if (uid) return uid;
    }
    return null;
  } catch {
    return null;
  }
}

async function canUseRemoteThoughts() {
  if (!supabase) return false
  const session = await supabase.auth.getSession();
  const uid = session?.data?.session?.user?.id || getCurrentUserIdSafe();
  if (!uid) return false;

  try {
    const { error } = await supabase.from('thoughts').select('id', { count: 'exact', head: true });
    if (error) {
      localStorage.removeItem(USE_REMOTE_KEY);
      localStorage.removeItem(OLD_USE_REMOTE_KEY);
      return false;
    }
    localStorage.setItem(USE_REMOTE_KEY, '1');
    return true;
  } catch {
    localStorage.removeItem(USE_REMOTE_KEY);
    return false;
  }
}

export const dataService = {
  // PROFILE
  saveProfile(profile) {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore storage write errors in restricted browser contexts.
    }
  },
  loadProfile() {
    return getStoredJson(PROFILE_KEY, OLD_PROFILE_KEY, null);
  },
  clearProfile() {
    try {
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem(OLD_PROFILE_KEY);
    } catch {
      // Ignore storage write errors in restricted browser contexts.
    }
  },

  // THOUGHTS (goals)
  saveThoughts(thoughts) {
    try {
      localStorage.setItem(THOUGHTS_KEY, JSON.stringify(dedupeThoughts(thoughts)));
    } catch {
      // Ignore storage write errors in restricted browser contexts.
    }
  },
  loadThoughts() {
    const parsed = getStoredJson(THOUGHTS_KEY, OLD_THOUGHTS_KEY, []);
    return Array.isArray(parsed) ? dedupeThoughts(parsed) : [];
  },
  addThought(thought) {
    const next = upsertThoughtInList(this.loadThoughts(), thought);
    this.saveThoughts(next);
    return next;
  },
  updateThought(id, updates) {
    const all = this.loadThoughts();
    const next = all.map(t => t.id === id ? { ...t, ...updates } : t);
    this.saveThoughts(next);
    return next;
  },
  deleteThought(id) {
    const all = this.loadThoughts().filter(t => t.id !== id);
    this.saveThoughts(all);
    return all;
  },
  async deleteThoughtForUser(userId, thoughtId) {
    const uid = userId || getCurrentUserIdSafe();
    const updated = this.loadThoughts().filter(t => t.id !== thoughtId);
    this.saveThoughts(updated);
    if (!uid || !(await canUseRemoteThoughts())) return updated;
    await supabase.from('thoughts').delete().eq('id', thoughtId).eq('user_id', uid);
    return updated;
  },

  async loadThoughtsForUser(userId) {
    const localThoughts = this.loadThoughts();
    const uid = userId || getCurrentUserIdSafe();
    if (!uid) return localThoughts;

    if (!(await canUseRemoteThoughts())) return localThoughts;
    const { data, error } = await supabase
      .from('thoughts')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });

    if (error || !Array.isArray(data)) return localThoughts;

    const mapped = data.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category || 'Goal',
      goal: row.goal || row.title,
      createdAt: row.created_at,
      status: row.status || 'active',
      realityScore: row.reality_score ?? null,
      roadmap: row.roadmap || null,
      thoughtData: row.thought_data || {},
      progress: row.progress || 0,
      color: row.color || '#5b47e0',
      tags: row.tags || [],
      nextTask: row.next_task || 'Start your first module',
      phase: row.phase || 'Planning',
      eta: row.eta || 'Roadmap ready',
      weeklyHours: row.weekly_hours || null,
    }));

    this.saveThoughts(mapped);
    return mapped;
  },

  async upsertThoughtForUser(userId, thought) {
    const uid = userId || getCurrentUserIdSafe();
    const updated = upsertThoughtInList(this.loadThoughts(), thought);
    this.saveThoughts(updated);
    if (!uid || !(await canUseRemoteThoughts())) return updated;

    const { error } = await supabase.from('thoughts').upsert({
      id: thought.id,
      user_id: uid,
      title: thought.title,
      goal: thought.goal,
      category: thought.category,
      status: thought.status,
      progress: thought.progress,
      phase: thought.phase,
      next_task: thought.nextTask,
      eta: thought.eta,
      color: thought.color,
      tags: thought.tags,
      reality_score: thought.realityScore,
      thought_data: thought.thoughtData || {},
      roadmap: thought.roadmap || {},
      weekly_hours: thought.weeklyHours || null,
      created_at: thought.createdAt || new Date().toISOString(),
    });
    if (error) {
      console.warn('[Chalo Golo] Failed to sync thought to Supabase:', error.message);
    }
    return updated;
  },

  clearAll() {
    try {
      localStorage.removeItem(THOUGHTS_KEY);
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem(OLD_THOUGHTS_KEY);
      localStorage.removeItem(OLD_PROFILE_KEY);
    } catch {
      // Ignore storage write errors in restricted browser contexts.
    }
  }
};
