import {
  getStoredAdminToken,
  setStoredAdminToken,
  clearStoredAdminToken,
} from "./api";

export const isAdminAuthenticated = (): boolean => {
  return Boolean(getStoredAdminToken());
};

export const getAdminToken = (): string | null => {
  return getStoredAdminToken();
};

export const setAdminToken = (token: string): void => {
  setStoredAdminToken(token);
};

export const removeAdminToken = (): void => {
  clearStoredAdminToken();
};
