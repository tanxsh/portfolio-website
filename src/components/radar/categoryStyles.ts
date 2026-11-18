export type CategoryStyle = {
  light: string;
  base: string;
  glow: string;
  labelText: string;
  chipText: string;
  chipActive: string;
  badge: string;
  bar: string;
  border: string;
  tint: string;
  tintHover: string;
  tintHovered: string;
  tintActive: string;
  borderSoft: string;
  borderStrong: string;
};

export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  Languages: {
    light: "#7dd3fc",
    base: "#0284c7",
    glow: "#0ea5e9",
    labelText: "fill-sky-600 dark:fill-sky-400",
    chipText: "text-sky-600 dark:text-sky-400",
    chipActive: "bg-sky-500 border-sky-500",
    badge: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    bar: "bg-sky-500",
    border: "border-sky-500",
    tint: "bg-sky-500/12",
    tintHover: "hover:bg-sky-500/18",
    tintHovered: "bg-sky-500/18",
    tintActive: "bg-sky-500/28",
    borderSoft: "border-sky-500/40",
    borderStrong: "border-sky-500",
  },
  "Frameworks & Libraries": {
    light: "#fca5a5",
    base: "#dc2626",
    glow: "#ef4444",
    labelText: "fill-red-600 dark:fill-red-400",
    chipText: "text-red-600 dark:text-red-400",
    chipActive: "bg-red-500 border-red-500",
    badge: "bg-red-500/15 text-red-600 dark:text-red-400",
    bar: "bg-red-500",
    border: "border-red-500",
    tint: "bg-red-500/12",
    tintHover: "hover:bg-red-500/18",
    tintHovered: "bg-red-500/18",
    tintActive: "bg-red-500/28",
    borderSoft: "border-red-500/40",
    borderStrong: "border-red-500",
  },
  "Platforms & Tools": {
    light: "#6ee7b7",
    base: "#059669",
    glow: "#10b981",
    labelText: "fill-emerald-600 dark:fill-emerald-400",
    chipText: "text-emerald-600 dark:text-emerald-400",
    chipActive: "bg-emerald-500 border-emerald-500",
    badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500",
    border: "border-emerald-500",
    tint: "bg-emerald-500/12",
    tintHover: "hover:bg-emerald-500/18",
    tintHovered: "bg-emerald-500/18",
    tintActive: "bg-emerald-500/28",
    borderSoft: "border-emerald-500/40",
    borderStrong: "border-emerald-500",
  },
  Techniques: {
    light: "#fcd34d",
    base: "#d97706",
    glow: "#f59e0b",
    labelText: "fill-amber-600 dark:fill-amber-400",
    chipText: "text-amber-600 dark:text-amber-400",
    chipActive: "bg-amber-500 border-amber-500",
    badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    bar: "bg-amber-500",
    border: "border-amber-500",
    tint: "bg-amber-500/12",
    tintHover: "hover:bg-amber-500/18",
    tintHovered: "bg-amber-500/18",
    tintActive: "bg-amber-500/28",
    borderSoft: "border-amber-500/40",
    borderStrong: "border-amber-500",
  },
};
