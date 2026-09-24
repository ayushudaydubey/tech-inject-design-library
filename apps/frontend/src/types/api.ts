export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ApiFieldError[];
}

export interface ComponentListParams {
  search?: string;
  category?: string;
}
