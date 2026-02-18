const TOKEN_KEY = 'token';
const REMEMBERED_EMAIL_KEY = 'rememberedEmail';

export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
};

export const getRememberedEmail = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REMEMBERED_EMAIL_KEY);
};

export const setRememberedEmail = (email: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
};

export const clearRememberedEmail = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(REMEMBERED_EMAIL_KEY);
};
