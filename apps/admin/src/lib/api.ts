import { ApiFieldError } from "../types/api";
import { User, LoginCredentials, AuthResponseData } from "../types/auth";
import {
  AdminComponent,
  CreateComponentInput,
  UpdateComponentInput,
  ValidationResult,
  AdminPreviewData,
} from "../types/component";
import { Customer } from "../types/customer";

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
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const ADMIN_TOKEN_KEY = "tech_inject_admin_token";

export const getStoredAdminToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

export const setStoredAdminToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

export const clearStoredAdminToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
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

  const token = getStoredAdminToken();
  const defaultHeaders: Record<string, string> = {};

  // Only set Content-Type if body is not FormData
  if (!(restOptions.body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...restOptions,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    credentials: "include",
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
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
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
// AUTH ENDPOINTS
// ========================
export const adminLogin = async (
  credentials: LoginCredentials
): Promise<AuthResponseData> => {
  const data = await api.post<AuthResponseData>("/auth/login", credentials);
  if (data?.accessToken) {
    setStoredAdminToken(data.accessToken);
  }
  return data;
};

export const adminLogout = async (): Promise<void> => {
  try {
    await api.post("/auth/logout");
  } finally {
    clearStoredAdminToken();
  }
};

export const fetchAdminSession = async (): Promise<User> => {
  const res = await api.get<{ user: User }>("/auth/me");
  return res.user;
};

// ========================
// COMPONENT ENDPOINTS
// ========================
export const fetchAdminComponents = async (): Promise<AdminComponent[]> => {
  return api.get<AdminComponent[]>("/admin/components");
};

export const fetchAdminComponentById = async (
  id: string
): Promise<AdminComponent> => {
  return api.get<AdminComponent>(`/admin/components/${encodeURIComponent(id)}`);
};

export const createComponentDraft = async (
  input: CreateComponentInput
): Promise<AdminComponent> => {
  return api.post<AdminComponent>("/admin/components", input);
};

export const updateComponentDraft = async (
  id: string,
  input: UpdateComponentInput
): Promise<AdminComponent> => {
  return api.patch<AdminComponent>(
    `/admin/components/${encodeURIComponent(id)}`,
    input
  );
};

export const uploadComponentFiles = async (
  id: string,
  formData: FormData
): Promise<AdminComponent> => {
  return api.post<AdminComponent>(
    `/admin/components/${encodeURIComponent(id)}/upload`,
    formData
  );
};

export const validateComponentDraft = async (
  id: string,
  payload?: Partial<CreateComponentInput>
): Promise<ValidationResult> => {
  return api.post<ValidationResult>(
    `/admin/components/${encodeURIComponent(id)}/validate`,
    payload
  );
};

export const validateComponentPayload = async (
  payload: Partial<CreateComponentInput>
): Promise<ValidationResult> => {
  return api.post<ValidationResult>("/admin/components/validate", payload);
};

export const previewComponentDraft = async (
  id: string
): Promise<AdminPreviewData> => {
  return api.post<AdminPreviewData>(
    `/admin/components/${encodeURIComponent(id)}/preview`
  );
};

export const publishComponent = async (
  id: string
): Promise<AdminComponent> => {
  return api.post<AdminComponent>(
    `/admin/components/${encodeURIComponent(id)}/publish`
  );
};

export const unpublishComponent = async (
  id: string
): Promise<AdminComponent> => {
  return api.post<AdminComponent>(
    `/admin/components/${encodeURIComponent(id)}/unpublish`
  );
};

export const deleteComponent = async (
  id: string
): Promise<void> => {
  return api.delete<void>(`/admin/components/${encodeURIComponent(id)}`);
};

// ========================
// CUSTOMER ENDPOINTS
// ========================
export const fetchAdminCustomers = async (): Promise<Customer[]> => {
  return api.get<Customer[]>("/admin/customers");
};

export const grantCustomerPremium = async (
  id: string
): Promise<Customer> => {
  return api.post<Customer>(
    `/admin/customers/${encodeURIComponent(id)}/grant-premium`
  );
};

export const revokeCustomerPremium = async (
  id: string
): Promise<Customer> => {
  return api.post<Customer>(
    `/admin/customers/${encodeURIComponent(id)}/revoke-premium`
  );
};
