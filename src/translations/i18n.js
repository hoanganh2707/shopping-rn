import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { store } from '~/redux';
import * as en from './en';
import * as vi from './vi';

export const defaultNS = 'common';
export const resources = {
  en,
  vi,
};
const ns = Object.keys(en);

i18n.use(initReactI18next).init({
  lng: store.getState().app.lang, // default language
  fallbackLng: false, // fallback language
  ns: ns,
  debug: false,
  resources: resources,
  interpolation: {
    escapeValue: false,
  },
  keySeparator: '.',
  compatibilityJSON: 'v3',
});

export default i18n;
