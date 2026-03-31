export const ACCESSIBILITY_PREFERENCES = [
  {
    id: 'wheelchair',
    subtitle: 'Routen mit Rampen und Aufzügen',
    title: 'Rollstuhlzugang',
  },
  {
    id: 'vision',
    subtitle: 'Taktile Leitsysteme & Ansagen',
    title: 'Sehbehinderung',
  },
  {
    id: 'hearing',
    subtitle: 'Visuelle Signale & Anzeigen',
    title: 'Hörbehinderung',
  },
  {
    id: 'mobility',
    subtitle: 'Minimale Stufen und kurze Wege',
    title: 'Eingeschränkte Mobilität',
  },
  {
    id: 'stroller',
    subtitle: 'Mehr Platz und stufenarme Wege',
    title: 'Kinderwagen',
  },
] as const;

export type AccessibilityPreference = (typeof ACCESSIBILITY_PREFERENCES)[number];
export type AccessibilityPreferenceId = AccessibilityPreference['id'];
