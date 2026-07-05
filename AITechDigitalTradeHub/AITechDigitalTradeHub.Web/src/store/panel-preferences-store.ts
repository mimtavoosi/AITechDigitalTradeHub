"use client";

import { create } from "zustand";
import { panelPreferencesApi } from "@/features/preferences/api/panel-preferences-api";

export type PanelKey = "dashboard" | "admin" | "company";
export type PanelThemeKey = "default" | "violet" | "teal" | "emerald" | "slate" | "cyan" | "blue" | "rose" | "amber" | "indigo";
export type PanelDensityKey = "comfortable" | "compact";
export type PanelFontScale = "small" | "normal" | "large";
export type PanelFontFamily = "vazirmatn" | "system" | "tahoma" | "iransans";
export type PanelSidebarMode = "dark" | "glass" | "light";
export type PanelSidebarSide = "right" | "left";

export type PanelPreference = {
  panelKey: PanelKey;
  themeKey: PanelThemeKey;
  densityKey: PanelDensityKey;
  fontScale: PanelFontScale;
  fontFamily: PanelFontFamily;
  sidebarMode: PanelSidebarMode;
  sidebarSide: PanelSidebarSide;
  cardOrder: string[];
  hiddenItems: string[];
};

type PanelPreferenceState = {
  preferences: Partial<Record<PanelKey, PanelPreference>>;
  loaded: Partial<Record<PanelKey, boolean>>;
  loadPreference: (panelKey: PanelKey) => Promise<void>;
  updatePreference: (panelKey: PanelKey, patch: Partial<PanelPreference>) => Promise<void>;
  resetCardOrder: (panelKey: PanelKey) => Promise<void>;
  showItem: (panelKey: PanelKey, itemId: string) => Promise<void>;
  hideItem: (panelKey: PanelKey, itemId: string) => Promise<void>;
};

export const defaultPanelPreferences: Record<PanelKey, PanelPreference> = {
  dashboard: {
    panelKey: "dashboard",
    themeKey: "default",
    densityKey: "comfortable",
    fontScale: "normal",
    fontFamily: "vazirmatn",
    sidebarMode: "dark",
    sidebarSide: "right",
    cardOrder: [],
    hiddenItems: []
  },
  admin: {
    panelKey: "admin",
    themeKey: "violet",
    densityKey: "comfortable",
    fontScale: "normal",
    fontFamily: "vazirmatn",
    sidebarMode: "dark",
    sidebarSide: "right",
    cardOrder: [],
    hiddenItems: []
  },
  company: {
    panelKey: "company",
    themeKey: "teal",
    densityKey: "comfortable",
    fontScale: "normal",
    fontFamily: "vazirmatn",
    sidebarMode: "dark",
    sidebarSide: "right",
    cardOrder: [],
    hiddenItems: []
  }
};

export function getPanelPreference(preference: PanelPreference | undefined, panelKey: PanelKey) {
  return preference ?? defaultPanelPreferences[panelKey];
}

export const usePanelPreferencesStore = create<PanelPreferenceState>()((set, get) => ({
  preferences: {},
  loaded: {},
  async loadPreference(panelKey) {
    if (get().loaded[panelKey]) return;

    const local = readLocalPreference(panelKey);
    if (local) {
      set((state) => ({
        preferences: { ...state.preferences, [panelKey]: local },
        loaded: { ...state.loaded, [panelKey]: true }
      }));
    }

    try {
      const remote = normalizePreference(panelKey, await panelPreferencesApi.get(panelKey));
      writeLocalPreference(panelKey, remote);
      set((state) => ({
        preferences: { ...state.preferences, [panelKey]: remote },
        loaded: { ...state.loaded, [panelKey]: true }
      }));
    } catch {
      set((state) => ({ loaded: { ...state.loaded, [panelKey]: true } }));
    }
  },
  async updatePreference(panelKey, patch) {
    const next = normalizePreference(panelKey, {
      ...defaultPanelPreferences[panelKey],
      ...get().preferences[panelKey],
      ...patch,
      panelKey
    });

    writeLocalPreference(panelKey, next);
    set((state) => ({
      preferences: { ...state.preferences, [panelKey]: next },
      loaded: { ...state.loaded, [panelKey]: true }
    }));

    try {
      const remote = normalizePreference(panelKey, await panelPreferencesApi.update(panelKey, next));
      writeLocalPreference(panelKey, remote);
      set((state) => ({ preferences: { ...state.preferences, [panelKey]: remote } }));
    } catch {
      // Local preference remains active if the API is unavailable or migration has not run yet.
    }
  },
  async resetCardOrder(panelKey) {
    await get().updatePreference(panelKey, { cardOrder: [] });
  },
  async showItem(panelKey, itemId) {
    const current = getPanelPreference(get().preferences[panelKey], panelKey);
    await get().updatePreference(panelKey, { hiddenItems: current.hiddenItems.filter((id) => id !== itemId) });
  },
  async hideItem(panelKey, itemId) {
    const current = getPanelPreference(get().preferences[panelKey], panelKey);
    await get().updatePreference(panelKey, { hiddenItems: Array.from(new Set([...current.hiddenItems, itemId])) });
  }
}));

function storageKey(panelKey: PanelKey) {
  return `ainet-panel-preference:${panelKey}`;
}

function readLocalPreference(panelKey: PanelKey) {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(storageKey(panelKey));
    return value ? normalizePreference(panelKey, JSON.parse(value)) : null;
  } catch {
    return null;
  }
}

function writeLocalPreference(panelKey: PanelKey, preference: PanelPreference) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(panelKey), JSON.stringify(preference));
}

function normalizePreference(panelKey: PanelKey, value: Partial<PanelPreference>) {
  const fallback = defaultPanelPreferences[panelKey];
  return {
    panelKey,
    themeKey: normalizeOption(value.themeKey, ["default", "violet", "teal", "emerald", "slate", "cyan", "blue", "rose", "amber", "indigo"], fallback.themeKey),
    densityKey: normalizeOption(value.densityKey, ["comfortable", "compact"], fallback.densityKey),
    fontScale: normalizeOption(value.fontScale, ["small", "normal", "large"], fallback.fontScale),
    fontFamily: normalizeOption(value.fontFamily, ["vazirmatn", "system", "tahoma", "iransans"], fallback.fontFamily),
    sidebarMode: normalizeOption(value.sidebarMode, ["dark", "glass", "light"], fallback.sidebarMode),
    sidebarSide: normalizeOption(value.sidebarSide, ["right", "left"], fallback.sidebarSide),
    cardOrder: Array.isArray(value.cardOrder) ? sanitizeIds(value.cardOrder, 80) : [],
    hiddenItems: Array.isArray(value.hiddenItems) ? sanitizeIds(value.hiddenItems, 80) : []
  } satisfies PanelPreference;
}

function normalizeOption<T extends string>(value: unknown, options: T[], fallback: T) {
  return typeof value === "string" && options.includes(value as T) ? (value as T) : fallback;
}

function sanitizeIds(values: unknown[], take: number) {
  return Array.from(new Set(values.filter((value): value is string => typeof value === "string" && value.trim().length > 0).map((value) => value.trim()))).slice(0, take);
}
