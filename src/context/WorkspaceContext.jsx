import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { EMPTY_PROFILE, SECTION_IDS } from '../data/options.js';
import { generateWebsiteCopy, GenerationError, isAiConfigured } from '../services/contentGenerator.js';
import { validateProfile } from '../services/validation.js';
import { setIn } from '../utils/objectPath.js';
import { loadWorkspace, saveWorkspace, clearWorkspace, saveDraft as storeDraft, listDrafts, deleteDraft as removeDraft, clearDrafts } from '../utils/storage.js';
import { useToast } from './ToastContext.jsx';

const WorkspaceContext = createContext(null);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function initState() {
  const saved = loadWorkspace();
  const base = {
    profile: { ...EMPTY_PROFILE },
    sections: {},
    meta: {},
    loading: {},
    errors: {},
    fieldErrors: {},
    variants: {},
    mode: 'demo',
    provider: 'anthropic',
    activeTab: 'homepage',
    progress: null,
  };
  if (!saved || typeof saved !== 'object') return base;
  return {
    ...base,
    profile: { ...EMPTY_PROFILE, ...(saved.profile || {}) },
    sections: saved.sections || {},
    meta: saved.meta || {},
    mode: saved.mode === 'ai' && isAiConfigured() ? 'ai' : 'demo',
    provider: saved.provider || 'anthropic',
    activeTab: SECTION_IDS.includes(saved.activeTab) ? saved.activeTab : 'homepage',
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'field':
      return { ...state, profile: { ...state.profile, [action.name]: action.value }, fieldErrors: { ...state.fieldErrors, [action.name]: undefined } };
    case 'setProfile':
      return { ...state, profile: { ...EMPTY_PROFILE, ...action.profile }, fieldErrors: {} };
    case 'fieldErrors':
      return { ...state, fieldErrors: action.errors };
    case 'tab':
      return { ...state, activeTab: action.id };
    case 'mode':
      return { ...state, mode: action.mode, errors: {} };
    case 'provider':
      return { ...state, provider: action.provider };
    case 'start':
      return { ...state, loading: { ...state.loading, [action.id]: true }, errors: { ...state.errors, [action.id]: null } };
    case 'success':
      return {
        ...state,
        loading: { ...state.loading, [action.id]: false },
        sections: { ...state.sections, [action.id]: action.content },
        meta: { ...state.meta, [action.id]: { ...action.meta, edited: false } },
        variants: { ...state.variants, [action.id]: action.variant },
      };
    case 'failure':
      return { ...state, loading: { ...state.loading, [action.id]: false }, errors: { ...state.errors, [action.id]: action.error } };
    case 'edit':
      return {
        ...state,
        sections: { ...state.sections, [action.id]: setIn(state.sections[action.id], action.path, action.value) },
        meta: { ...state.meta, [action.id]: { ...state.meta[action.id], edited: true } },
      };
    case 'progress':
      return { ...state, progress: action.progress };
    case 'resetForm':
      return { ...state, profile: { ...EMPTY_PROFILE }, fieldErrors: {} };
    case 'resetWorkspace':
      return {
        ...state,
        profile: { ...EMPTY_PROFILE }, sections: {}, meta: {}, loading: {}, errors: {}, fieldErrors: {},
        variants: {}, activeTab: 'homepage', progress: null,
      };
    case 'restore':
      return {
        ...state,
        profile: { ...EMPTY_PROFILE, ...action.draft.profile },
        sections: action.draft.sections || {},
        meta: action.draft.meta || {},
        errors: {}, fieldErrors: {}, loading: {},
      };
    default:
      return state;
  }
}

export function WorkspaceProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState);
  const toast = useToast();
  const ref = useRef(state);
  ref.current = state;

  // Persist the working copy (this browser only), debounced.
  useEffect(() => {
    const id = setTimeout(() => {
      saveWorkspace({ profile: state.profile, sections: state.sections, meta: state.meta, mode: state.mode, provider: state.provider, activeTab: state.activeTab });
    }, 400);
    return () => clearTimeout(id);
  }, [state.profile, state.sections, state.meta, state.mode, state.provider, state.activeTab]);

  const setField = useCallback((name, value) => dispatch({ type: 'field', name, value }), []);
  const setProfile = useCallback((profile) => dispatch({ type: 'setProfile', profile }), []);
  const setTab = useCallback((id) => dispatch({ type: 'tab', id }), []);
  const setMode = useCallback((mode) => dispatch({ type: 'mode', mode }), []);
  const setProvider = useCallback((provider) => dispatch({ type: 'provider', provider }), []);

  const checkProfile = useCallback(() => {
    const { valid, errors } = validateProfile(ref.current.profile);
    dispatch({ type: 'fieldErrors', errors: valid ? {} : errors });
    return valid;
  }, []);

  // Generates ONE section and leaves every other section untouched.
  const runSection = useCallback(async (id, { regenerate = false } = {}) => {
    const s = ref.current;
    const variant = regenerate ? (s.variants[id] || 0) + 1 : s.variants[id] || 0;
    dispatch({ type: 'start', id });
    try {
      if (s.mode === 'demo') await sleep(380); // short beat so the progress UI is perceivable; no network involved
      const { content, meta } = await generateWebsiteCopy({
        businessProfile: s.profile, section: id, mode: s.mode, provider: s.provider, variant,
      });
      dispatch({ type: 'success', id, content, meta, variant });
      return true;
    } catch (err) {
      const error = err instanceof GenerationError ? err : new GenerationError('Something went wrong while generating.', { hint: 'Try again.' });
      if (error.fields) dispatch({ type: 'fieldErrors', errors: error.fields });
      dispatch({ type: 'failure', id, error: { message: error.message, hint: error.hint, code: error.code } });
      return false;
    }
  }, []);

  const generateSection = useCallback(async (id, opts = {}) => {
    if (!checkProfile()) {
      toast.error('Some fields need attention. Check the highlighted fields.');
      return false;
    }
    const ok = await runSection(id, opts);
    if (ok) toast.success(opts.regenerate ? `${labelFor(id)} regenerated.` : `${labelFor(id)} generated.`);
    else toast.error(`Could not generate ${labelFor(id).toLowerCase()}.`);
    return ok;
  }, [checkProfile, runSection, toast]);

  const generateAll = useCallback(async () => {
    if (!checkProfile()) {
      toast.error('Some fields need attention. Check the highlighted fields.');
      return false;
    }
    let okCount = 0;
    for (let i = 0; i < SECTION_IDS.length; i++) {
      dispatch({ type: 'progress', progress: { done: i, total: SECTION_IDS.length, current: SECTION_IDS[i] } });
      // eslint-disable-next-line no-await-in-loop
      if (await runSection(SECTION_IDS[i])) okCount++;
    }
    dispatch({ type: 'progress', progress: null });
    if (okCount === SECTION_IDS.length) toast.success('All sections generated.');
    else toast.error(`${SECTION_IDS.length - okCount} section(s) failed. Open the tab to retry.`);
    return okCount === SECTION_IDS.length;
  }, [checkProfile, runSection, toast]);

  const editContent = useCallback((id, path, value) => dispatch({ type: 'edit', id, path, value }), []);
  const resetForm = useCallback(() => { dispatch({ type: 'resetForm' }); toast.info('Form cleared. Generated content was kept.'); }, [toast]);
  const resetWorkspace = useCallback(() => { dispatch({ type: 'resetWorkspace' }); clearWorkspace(); toast.info('Workspace reset.'); }, [toast]);

  const saveDraft = useCallback(() => {
    const s = ref.current;
    if (!Object.keys(s.sections).length) { toast.error('Generate some content before saving a draft.'); return false; }
    const draft = storeDraft({ profile: s.profile, sections: s.sections, meta: s.meta, mode: s.mode });
    if (!draft) { toast.error('Could not save. Browser storage may be full or blocked.'); return false; }
    toast.success('Draft saved in this browser.');
    return true;
  }, [toast]);

  const restoreDraft = useCallback((draft) => {
    dispatch({ type: 'restore', draft });
    toast.success(`Restored "${draft.name}".`);
  }, [toast]);

  const deleteDraft = useCallback((id) => { removeDraft(id); }, []);
  const deleteAllDrafts = useCallback(() => { clearDrafts(); }, []);

  const value = useMemo(() => ({
    ...state, setField, setProfile, setTab, setMode, setProvider, generateSection, generateAll,
    editContent, resetForm, resetWorkspace, saveDraft, restoreDraft, deleteDraft, deleteAllDrafts, listDrafts,
    hasContent: Object.keys(state.sections).length > 0,
  }), [state, setField, setProfile, setTab, setMode, setProvider, generateSection, generateAll, editContent, resetForm, resetWorkspace, saveDraft, restoreDraft, deleteDraft, deleteAllDrafts]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

const LABELS = { homepage: 'Homepage', about: 'About Us', services: 'Services', cta: 'Calls to Action', contact: 'Contact section' };
const labelFor = (id) => LABELS[id] || id;

export const useWorkspace = () => useContext(WorkspaceContext);
