import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1C1917',
    textSecondary: '#57534E',
    background: '#F6F4EF',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E8E4DB',
    primary: '#1F6B4A',
    primaryText: '#FFFFFF',
    danger: '#B42318',
    border: '#D6D3CD',
    delayed: '#7C5E10',
  },
  dark: {
    text: '#F5F2EC',
    textSecondary: '#A8A29E',
    background: '#121110',
    backgroundElement: '#1C1B19',
    backgroundSelected: '#2A2824',
    primary: '#5DCAA0',
    primaryText: '#10231A',
    danger: '#F97066',
    border: '#3F3C38',
    delayed: '#E4C56B',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MinTapTarget = 48;
export const MaxContentWidth = 800;
