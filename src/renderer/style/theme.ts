import { css } from 'styled-components';

export const fontSizes = {
  huge: '20px',
};

export const colors = {
  positive: '#22c55e',
  red: '#ef4444',
  redDark: '#dc2626',
  redDarker: '#b91c1c',
  redDarkest: '#991b1b',

  title: '#f8fafc',
  titleContrast: '#ffffff',

  mutedText: '#9ca3af',
  mutedTextDark: '#6b7280',

  listItem: '#1e293b',
  listItemSelected: '#334155',

  cardBackground: '#0f172a',
  cardBackgroundHover: '#1e293b',
  cardForeground: '#f8fafc',
  cardSelected: '#0ea5e9',
  cardInstalled: '#22c55e',

  gray50: '#f8fafc',
  navy: '#0f172a',
  navyLightest: '#334155',
  navyLighter: '#1e293b',
  navy400: '#475569',
  teal50: '#f0fdfa',
  tealLight: '#0ea5e9',
  tealLightContrast: '#0284c7',
};

export const dropShadow = css`
  filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.25));
`;

export const smallCard = css`
  padding: 0.5em 1.15em;
  border-radius: 5px;

  background-color: ${colors.cardBackground};
  &:hover {
    background-color: ${colors.cardBackgroundHover};
  }
  color: ${colors.cardForeground};

  transition: background-color linear 200ms;

  ${dropShadow};
`;
