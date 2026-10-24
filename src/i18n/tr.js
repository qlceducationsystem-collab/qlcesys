import { PAGES_EN } from './locales/pages.en.js';

let current = 'es';

export const setTrLang = (lang) => {
  current = lang === 'en' ? 'en' : 'es';
};

export function tr(text, vars) {
  if (typeof text !== 'string') return text;
  const value = current === 'en' ? PAGES_EN[text] ?? PAGES_EN[text.trim()] ?? text : text;
  return vars ? value.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`)) : value;
}
