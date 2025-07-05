// Simple i18n helper for Habitica MCP Server
const DEFAULT_LANG = 'en';
let currentLang = DEFAULT_LANG;

export function setLanguage(lang) {
  currentLang = (lang || '').toLowerCase();
}

export function getLanguage() {
  return currentLang;
}

export function t(en, zh) {
  return currentLang.startsWith('zh') ? zh : en;
} 