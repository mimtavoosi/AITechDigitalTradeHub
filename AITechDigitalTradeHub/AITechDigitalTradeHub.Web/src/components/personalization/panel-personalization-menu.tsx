"use client";

import { useEffect } from "react";
import { Eye, RotateCcw, SlidersHorizontal } from "lucide-react";
import { panelWidgets } from "@/config/panel-widgets";
import {
  getPanelPreference,
  usePanelPreferencesStore,
  type PanelDensityKey,
  type PanelFontFamily,
  type PanelFontScale,
  type PanelKey,
  type PanelSidebarMode,
  type PanelSidebarSide,
  type PanelThemeKey
} from "@/store/panel-preferences-store";

const themeOptions: Array<{ value: PanelThemeKey; label: string }> = [
  { value: "default", label: "پیش‌فرض" },
  { value: "violet", label: "بنفش" },
  { value: "teal", label: "فیروزه‌ای" },
  { value: "emerald", label: "سبز" },
  { value: "slate", label: "اسلیت" },
  { value: "cyan", label: "سایان" },
  { value: "blue", label: "آبی" },
  { value: "rose", label: "رز" },
  { value: "amber", label: "کهربایی" },
  { value: "indigo", label: "نیلی" }
];

const densityOptions: Array<{ value: PanelDensityKey; label: string }> = [
  { value: "comfortable", label: "معمولی" },
  { value: "compact", label: "فشرده" }
];

const fontOptions: Array<{ value: PanelFontScale; label: string }> = [
  { value: "small", label: "کوچک" },
  { value: "normal", label: "معمولی" },
  { value: "large", label: "بزرگ" }
];

const fontFamilyOptions: Array<{ value: PanelFontFamily; label: string }> = [
  { value: "vazirmatn", label: "وزیرمتن" },
  { value: "iransans", label: "ایران‌سنس" },
  { value: "tahoma", label: "Tahoma" },
  { value: "system", label: "سیستمی" }
];

const sidebarOptions: Array<{ value: PanelSidebarMode; label: string }> = [
  { value: "dark", label: "تیره" },
  { value: "glass", label: "شیشه‌ای" },
  { value: "light", label: "روشن" }
];

const sidebarSideOptions: Array<{ value: PanelSidebarSide; label: string }> = [
  { value: "right", label: "راست" },
  { value: "left", label: "چپ" }
];

export function PanelPersonalizationMenu({ panelKey }: { panelKey: PanelKey }) {
  const preference = usePanelPreferencesStore((state) => getPanelPreference(state.preferences[panelKey], panelKey));
  const loadPreference = usePanelPreferencesStore((state) => state.loadPreference);
  const updatePreference = usePanelPreferencesStore((state) => state.updatePreference);
  const resetCardOrder = usePanelPreferencesStore((state) => state.resetCardOrder);
  const showItem = usePanelPreferencesStore((state) => state.showItem);
  const hiddenWidgets = panelWidgets[panelKey].filter((item) => preference.hiddenItems.includes(item.id));

  useEffect(() => {
    void loadPreference(panelKey);
  }, [loadPreference, panelKey]);

  return (
    <details className="group relative">
      <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-md border border-border bg-white/86 text-muted shadow-panel transition hover:text-foreground [&::-webkit-details-marker]:hidden" title="شخصی‌سازی پنل">
        <SlidersHorizontal className="size-4" />
      </summary>
      <div className="absolute left-0 top-12 z-50 max-h-[min(720px,calc(100vh-96px))] w-80 overflow-y-auto rounded-lg border border-border bg-white p-3 text-right shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
        <div className="mb-3">
          <div className="text-sm font-black text-foreground">شخصی‌سازی پنل</div>
          <div className="mt-1 text-xs leading-6 text-muted">رنگ، تراکم، اندازه متن و چینش کارت‌ها برای حساب شما ذخیره می‌شود.</div>
        </div>

        <PreferenceSelect label="رنگ پنل" value={preference.themeKey} options={themeOptions} onChange={(themeKey) => updatePreference(panelKey, { themeKey })} />
        <PreferenceSelect label="تراکم" value={preference.densityKey} options={densityOptions} onChange={(densityKey) => updatePreference(panelKey, { densityKey })} />
        <PreferenceSelect label="اندازه متن" value={preference.fontScale} options={fontOptions} onChange={(fontScale) => updatePreference(panelKey, { fontScale })} />
        <PreferenceSelect label="فونت" value={preference.fontFamily} options={fontFamilyOptions} onChange={(fontFamily) => updatePreference(panelKey, { fontFamily })} />
        <PreferenceSelect label="ظاهر سایدبار" value={preference.sidebarMode} options={sidebarOptions} onChange={(sidebarMode) => updatePreference(panelKey, { sidebarMode })} />
        <PreferenceSelect label="جای سایدبار" value={preference.sidebarSide} options={sidebarSideOptions} onChange={(sidebarSide) => updatePreference(panelKey, { sidebarSide })} />

        <div className="mt-4 rounded-lg border border-border bg-background/70 p-2">
          <div className="mb-2 text-xs font-black text-foreground">ویجت‌های مخفی‌شده</div>
          {hiddenWidgets.length > 0 ? (
            <div className="grid gap-2">
              {hiddenWidgets.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => showItem(panelKey, item.id)}
                  className="flex min-h-9 items-center justify-between gap-2 rounded-md border border-border bg-white px-2 text-right text-xs font-bold text-muted transition hover:text-foreground"
                >
                  <span>
                    {item.label}
                    <span className="mr-1 text-[10px] text-muted/70">({item.group})</span>
                  </span>
                  <Eye className="size-4 text-primary" />
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-md bg-white px-2 py-3 text-xs leading-6 text-muted">همه ویجت‌ها روی صفحه فعال هستند.</div>
          )}
        </div>

        <button
          type="button"
          onClick={() => resetCardOrder(panelKey)}
          className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-border bg-background text-xs font-black text-muted transition hover:text-foreground"
        >
          <RotateCcw className="size-4" />
          بازنشانی چیدمان کارت‌ها
        </button>
      </div>
    </details>
  );
}

function PreferenceSelect<T extends string>({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <label className="mt-2 grid gap-1 text-xs font-bold text-muted">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="h-9 rounded-md border border-border bg-white px-2 text-sm font-bold text-foreground outline-none focus:border-primary"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
