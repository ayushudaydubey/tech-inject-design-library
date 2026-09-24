export const parseCookies = (cookieHeader?: string): Record<string, string> => {
  if (!cookieHeader) return {};

  return cookieHeader.split(";").reduce((acc, pair) => {
    const idx = pair.indexOf("=");
    if (idx < 0) return acc;
    const key = pair.substring(0, idx).trim();
    const val = pair.substring(idx + 1).trim();
    if (key) {
      try {
        acc[key] = decodeURIComponent(val);
      } catch {
        acc[key] = val;
      }
    }
    return acc;
  }, {} as Record<string, string>);
};
