"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminComponents,
  fetchAdminComponentById,
  createComponentDraft,
  updateComponentDraft,
  uploadComponentFiles,
  validateComponentDraft,
  previewComponentDraft,
  publishComponent,
  unpublishComponent,
  ApiError,
} from "../lib/api";
import {
  AdminComponent,
  CreateComponentInput,
  UpdateComponentInput,
  ValidationResult,
  AdminPreviewData,
} from "../types/component";

export const adminComponentKeys = {
  all: ["admin", "components"] as const,
  list: () => ["admin", "components", "list"] as const,
  detail: (id: string) => ["admin", "components", "detail", id] as const,
  preview: (id: string) => ["admin", "components", "preview", id] as const,
  validate: (id: string) => ["admin", "components", "validate", id] as const,
};

/**
 * Hook to list all components (both draft and published) for administration
 */
export function useAdminComponents() {
  return useQuery<AdminComponent[], ApiError>({
    queryKey: adminComponentKeys.list(),
    queryFn: () => fetchAdminComponents(),
  });
}

/**
 * Hook to retrieve full component details by ID
 */
export function useAdminComponent(id: string) {
  return useQuery<AdminComponent, ApiError>({
    queryKey: adminComponentKeys.detail(id),
    queryFn: () => fetchAdminComponentById(id),
    enabled: Boolean(id),
  });
}

/**
 * Mutation hook to create a new component draft
 */
export function useCreateDraft() {
  const queryClient = useQueryClient();

  return useMutation<AdminComponent, ApiError, CreateComponentInput>({
    mutationFn: (input: CreateComponentInput) => createComponentDraft(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminComponentKeys.list() });
    },
  });
}

/**
 * Mutation hook to update an existing draft or component
 */
export function useUpdateDraft() {
  const queryClient = useQueryClient();

  return useMutation<
    AdminComponent,
    ApiError,
    { id: string; input: UpdateComponentInput }
  >({
    mutationFn: ({ id, input }) => updateComponentDraft(id, input),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({
        queryKey: adminComponentKeys.detail(updated._id),
      });
      queryClient.invalidateQueries({ queryKey: adminComponentKeys.list() });
    },
  });
}

/**
 * Mutation hook to upload component source, supporting, and theme files
 */
export function useUploadComponentFiles() {
  const queryClient = useQueryClient();

  return useMutation<
    AdminComponent,
    ApiError,
    { id: string; formData: FormData }
  >({
    mutationFn: ({ id, formData }) => uploadComponentFiles(id, formData),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({
        queryKey: adminComponentKeys.detail(updated._id),
      });
      queryClient.invalidateQueries({ queryKey: adminComponentKeys.list() });
    },
  });
}

/**
 * Mutation hook to validate a draft before publishing
 */
export function useValidateDraft() {
  return useMutation<ValidationResult, ApiError, string>({
    mutationFn: (id: string) => validateComponentDraft(id),
  });
}

/**
 * Mutation hook to preview a draft component with source and preview data
 */
export function usePreviewDraft() {
  return useMutation<AdminPreviewData, ApiError, string>({
    mutationFn: (id: string) => previewComponentDraft(id),
  });
}

/**
 * Mutation hook to publish a component to the public catalogue
 */
export function usePublishComponent() {
  const queryClient = useQueryClient();

  return useMutation<AdminComponent, ApiError, string>({
    mutationFn: (id: string) => publishComponent(id),
    onSuccess: (published) => {
      queryClient.invalidateQueries({
        queryKey: adminComponentKeys.detail(published._id),
      });
      queryClient.invalidateQueries({ queryKey: adminComponentKeys.list() });
    },
  });
}

/**
 * Mutation hook to unpublish a component and revert to draft status
 */
export function useUnpublishComponent() {
  const queryClient = useQueryClient();

  return useMutation<AdminComponent, ApiError, string>({
    mutationFn: (id: string) => unpublishComponent(id),
    onSuccess: (draft) => {
      queryClient.invalidateQueries({
        queryKey: adminComponentKeys.detail(draft._id),
      });
      queryClient.invalidateQueries({ queryKey: adminComponentKeys.list() });
    },
  });
}
