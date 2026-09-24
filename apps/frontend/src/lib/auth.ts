import { getStoredToken, setStoredToken, clearStoredToken } from "./api";

export const isAuthenticated = (): boolean => {
  return Boolean(getStoredToken());
};

export const getAccessToken = (): string | null => {
  return getStoredToken();
};

export const setAccessToken = (token: string): void => {
  setStoredToken(token);
};

export const removeAccessToken = (): void => {
  clearStoredToken();
};
