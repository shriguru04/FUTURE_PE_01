// Everything is stored in this browser only (localStorage). Nothing is sent anywhere.
const DRAFTS_KEY = 'copycraft:drafts:v1';
const THEME_KEY = 'copycraft:theme:v1';
const MAX_DRAFTS = 10;

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false; // storage full, blocked, or private mode
  }
};

export const listDrafts = () => (Array.isArray(read(DRAFTS_KEY, [])) ? read(DRAFTS_KEY, []) : []);

export function saveDraft({ profile, sections, meta, mode }) {
  const draft = {
    id: `d_${Date.now().toString(36)}`,
    name: profile.name || 'Untitled draft',
    savedAt: new Date().toISOString(),
    profile, sections, meta, mode,
  };
  const ok = write(DRAFTS_KEY, [draft, ...listDrafts()].slice(0, MAX_DRAFTS));
  return ok ? draft : null;
}

export const deleteDraft = (id) => write(DRAFTS_KEY, listDrafts().filter((d) => d.id !== id));
export const clearDrafts = () => write(DRAFTS_KEY, []);
export const getTheme = () => read(THEME_KEY, null);
export const setTheme = (t) => write(THEME_KEY, t);

const WORKSPACE_KEY = 'copycraft:workspace:v1';
export const loadWorkspace = () => read(WORKSPACE_KEY, null);
export const saveWorkspace = (data) => write(WORKSPACE_KEY, data);
export const clearWorkspace = () => {
  try { localStorage.removeItem(WORKSPACE_KEY); return true; } catch { return false; }
};
export const clearAllLocalData = () => {
  try {
    [WORKSPACE_KEY, DRAFTS_KEY, THEME_KEY].forEach((k) => localStorage.removeItem(k));
    return true;
  } catch { return false; }
};
