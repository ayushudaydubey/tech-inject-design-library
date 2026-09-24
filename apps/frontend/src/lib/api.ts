import { ApiFieldError, ComponentListParams } from "../types/api";
import { User, LoginCredentials, AuthResponseData } from "../types/auth";
import {
  ComponentSummary,
  ComponentDetail,
  ComponentPreview,
  ComponentSource,
  ComponentInstallPayload,
  ComponentAgentPrompt,
} from "../types/component";

export class ApiError extends Error {
  status: number;
  errors?: ApiFieldError[];

  constructor(status: number, message: string, errors?: ApiFieldError[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get userFriendlyMessage(): string {
    switch (this.status) {
      case 401:
        return "Please sign in to access this resource.";
      case 403:
        return "You need an active premium membership to view this resource.";
      case 404:
        return "The requested component or resource could not be found.";
      case 500:
        return "A server error occurred. Please try again shortly.";
      default:
        return this.message || "An unexpected error occurred.";
    }
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const TOKEN_KEY = "tech_inject_access_token";

export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearStoredToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
};

interface RequestOptions extends RequestInit {
  params?: Record<string, string | undefined>;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers, ...restOptions } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== "") {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const token = getStoredToken();
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...restOptions,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    credentials: "include", // Transmits secure HttpOnly refresh token cookie
  });

  let data: unknown;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = { success: res.ok, message: await res.text() };
  }

  if (!res.ok) {
    const errorPayload = data as {
      message?: string;
      errors?: ApiFieldError[];
    } | null;
    const message =
      errorPayload?.message || `Request failed with HTTP status ${res.status}`;
    throw new ApiError(res.status, message, errorPayload?.errors);
  }

  const successPayload = data as { data?: T } | null;
  return (successPayload?.data !== undefined ? successPayload.data : (data as T));
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};

// ========================
// COMPONENT ENDPOINTS
// ========================
export const fetchComponents = async (
  params?: ComponentListParams
): Promise<ComponentSummary[]> => {
  return api.get<ComponentSummary[]>("/components", {
    params: {
      search: params?.search,
      category: params?.category,
    },
  });
};

export const fetchComponentBySlug = async (
  slug: string
): Promise<ComponentDetail> => {
  return api.get<ComponentDetail>(`/components/${encodeURIComponent(slug)}`);
};

export const fetchComponentPreview = async (
  slug: string
): Promise<ComponentPreview> => {
  return api.get<ComponentPreview>(
    `/components/${encodeURIComponent(slug)}/preview`
  );
};

export const fetchComponentSource = async (
  slug: string
): Promise<ComponentSource> => {
  return api.get<ComponentSource>(
    `/components/${encodeURIComponent(slug)}/source`
  );
};

export const fetchComponentInstall = async (
  slug: string
): Promise<ComponentInstallPayload> => {
  return api.get<ComponentInstallPayload>(
    `/components/${encodeURIComponent(slug)}/install`
  );
};

export const fetchComponentAgentPrompt = async (
  slug: string
): Promise<ComponentAgentPrompt> => {
  return api.get<ComponentAgentPrompt>(
    `/components/${encodeURIComponent(slug)}/agent-prompt`
  );
};

// ========================
// AUTH ENDPOINTS
// ========================
export const fetchCurrentUser = async (): Promise<User> => {
  const res = await api.get<{ user: User }>("/auth/me");
  return res.user;
};

export const loginUser = async (
  credentials: LoginCredentials
): Promise<AuthResponseData> => {
  const data = await api.post<AuthResponseData>("/auth/login", credentials);
  if (data?.accessToken) {
    setStoredToken(data.accessToken);
  }
  return data;
};

export const logoutUser = async (): Promise<void> => {
  try {
    await api.post("/auth/logout");
  } finally {
    clearStoredToken();
  }
};

export const refreshSession = async (): Promise<string | null> => {
  try {
    const data = await api.post<{ accessToken: string }>("/auth/refresh");
    if (data?.accessToken) {
      setStoredToken(data.accessToken);
      return data.accessToken;
    }
    return null;
  } catch {
    clearStoredToken();
    return null;
  }
};
