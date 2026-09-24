"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchComponents,
  fetchComponentBySlug,
  fetchComponentPreview,
  fetchComponentSource,
  fetchComponentInstall,
  fetchComponentAgentPrompt,
  ApiError,
} from "../lib/api";
import { ComponentListParams } from "../types/api";
import {
  ComponentSummary,
  ComponentDetail,
  ComponentPreview,
  ComponentSource,
  ComponentInstallPayload,
  ComponentAgentPrompt,
} from "../types/component";

export const componentKeys = {
  all: ["components"] as const,
  list: (params?: ComponentListParams) =>
    ["components", "list", params ?? {}] as const,
  detail: (slug: string) => ["components", "detail", slug] as const,
  preview: (slug: string) => ["components", "preview", slug] as const,
  source: (slug: string) => ["components", "source", slug] as const,
  install: (slug: string) => ["components", "install", slug] as const,
  agentPrompt: (slug: string) => ["components", "agent-prompt", slug] as const,
};

/**
 * Hook to retrieve published components list for the public catalogue
 */
export function useComponents(params?: ComponentListParams) {
  return useQuery<ComponentSummary[], ApiError>({
    queryKey: componentKeys.list(params),
    queryFn: () => fetchComponents(params),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to retrieve full component detail by slug
 */
export function useComponent(slug: string) {
  return useQuery<ComponentDetail, ApiError>({
    queryKey: componentKeys.detail(slug),
    queryFn: () => fetchComponentBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to retrieve component preview mock data and primary component code
 */
export function useComponentPreview(
  slug: string,
  options?: { enabled?: boolean }
) {
  return useQuery<ComponentPreview, ApiError>({
    queryKey: componentKeys.preview(slug),
    queryFn: () => fetchComponentPreview(slug),
    enabled: Boolean(slug) && (options?.enabled ?? true),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to retrieve protected copyable source code files.
 * Rule: Only enabled when user has permission; never called merely to hide content.
 */
export function useComponentSource(
  slug: string,
  options?: { enabled?: boolean }
) {
  return useQuery<ComponentSource, ApiError>({
    queryKey: componentKeys.source(slug),
    queryFn: () => fetchComponentSource(slug),
    enabled: Boolean(slug) && (options?.enabled ?? true),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to retrieve verified package manager installation command & dependencies
 */
export function useComponentInstall(
  slug: string,
  options?: { enabled?: boolean }
) {
  return useQuery<ComponentInstallPayload, ApiError>({
    queryKey: componentKeys.install(slug),
    queryFn: () => fetchComponentInstall(slug),
    enabled: Boolean(slug) && (options?.enabled ?? true),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to retrieve AI coding agent integration prompt
 */
export function useComponentAgentPrompt(
  slug: string,
  options?: { enabled?: boolean }
) {
  return useQuery<ComponentAgentPrompt, ApiError>({
    queryKey: componentKeys.agentPrompt(slug),
    queryFn: () => fetchComponentAgentPrompt(slug),
    enabled: Boolean(slug) && (options?.enabled ?? true),
    staleTime: 30 * 1000,
  });
}
