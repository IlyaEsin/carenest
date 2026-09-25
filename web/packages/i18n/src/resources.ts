import enAuth from './locales/en/auth.json';
import enCommon from './locales/en/common.json';
import enErrors from './locales/en/errors.json';
import enHome from './locales/en/home.json';
import enInvite from './locales/en/invite.json';
import enProfile from './locales/en/profile.json';
import enStudio from './locales/en/studio.json';
import ruAuth from './locales/ru/auth.json';
import ruCommon from './locales/ru/common.json';
import ruErrors from './locales/ru/errors.json';
import ruHome from './locales/ru/home.json';
import ruInvite from './locales/ru/invite.json';
import ruProfile from './locales/ru/profile.json';
import ruStudio from './locales/ru/studio.json';

export const resources = {
  ru: { common: ruCommon, auth: ruAuth, profile: ruProfile, home: ruHome, invite: ruInvite, studio: ruStudio, errors: ruErrors },
  en: { common: enCommon, auth: enAuth, profile: enProfile, home: enHome, invite: enInvite, studio: enStudio, errors: enErrors },
} as const;

export type Namespace = keyof (typeof resources)['en'];

export const namespaces = Object.keys(resources.en) as Namespace[];
