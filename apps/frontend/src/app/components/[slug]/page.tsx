"use client";

import React, { use } from "react";
import Link from "next/link";
import { useComponent } from "../../../hooks/useComponents";
import { ComponentHeader } from "../../../components/component-view/ComponentHeader";
import { ComponentPreview } from "../../../components/component-view/ComponentPreview";
import { ComponentVariants } from "../../../components/component-view/ComponentVariants";
import { ComponentProps } from "../../../components/component-view/ComponentProps";
import { ComponentUsage } from "../../../components/component-view/ComponentUsage";
import { PremiumLock } from "../../../components/component-view/PremiumLock";
import { SourceCodeViewer } from "../../../components/code/SourceCodeViewer";
import { InstallCommand } from "../../../components/code/InstallCommand";
import { CopyAgentPrompt } from "../../../components/code/CopyAgentPrompt";
import { LoadingState } from "../../../components/common/LoadingState";
import { ErrorState } from "../../../components/common/ErrorState";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ComponentDetailPage({ params }: PageProps) {
  const { slug } = use(params);

  // Query backend detail endpoint
  const {
    data: component,
    isLoading,
    isError,
    error,
    refetch,
  } = useComponent(slug);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        <LoadingState type="detail" />
      </div>
    );
  }

  if (isError || !component) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex-1">
        <ErrorState
          statusCode={error?.status || 404}
          title={
            error?.status === 404
              ? "Component Not Found"
              : error?.status === 403
              ? "Premium Access Required"
              : "Unable to Load Component"
          }
          message={
            error?.status === 404
              ? `No published component matching "${slug}" exists in the catalogue.`
              : error?.userFriendlyMessage || error?.message
          }
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const isLocked = component.isLocked;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-10">
      {/* Component Header (Title, Category, Badges, Breadcrumb) */}
      <ComponentHeader component={component} />

      {/* Main Grid: Left preview & source, Right install & props */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Preview & Source Code */}
        <div className="lg:col-span-2 space-y-8">
          {/* Visual Preview or Premium Lock */}
          {isLocked ? (
            <PremiumLock
              componentName={component.name}
              slug={component.slug}
              message={component.accessMessage}
            />
          ) : (
            <ComponentPreview
              slug={component.slug}
              name={component.name}
              previewData={component.previewData}
            />
          )}

          {/* Source Code Viewer (Only rendered if unlocked and sourceFiles exist) */}
          {!isLocked && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Source Code
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Production TypeScript + Tailwind
                </span>
              </div>
              <SourceCodeViewer
                sourceFiles={component.sourceFiles}
                supportingFiles={component.supportingFiles}
                themeFiles={component.themeFiles}
                isLocked={isLocked}
              />
            </div>
          )}

          {/* Usage Documentation */}
          <ComponentUsage usageDocumentation={component.usageDocumentation} />

          {/* Theme Variants if theme files exist */}
          {!isLocked && (
            <ComponentVariants
              slug={component.slug}
              themeFiles={component.themeFiles}
            />
          )}
        </div>

        {/* Right Column: Install Command, Agent Prompt, Props Documentation */}
        <div className="space-y-6">
          {/* CLI Installation Card */}
          <InstallCommand
            slug={component.slug}
            isLocked={isLocked}
            installInfo={component.installInfo}
            accessType={component.accessType}
          />

          {/* AI Coding Agent Prompt Card */}
          <CopyAgentPrompt
            name={component.name}
            slug={component.slug}
            isLocked={isLocked}
            agentPrompt={component.agentPrompt}
            installCommand={component.installInfo?.packageManagerCommand}
            dependencies={component.declaredDependencies}
            propsDocumentation={component.propsDocumentation}
          />

          {/* Component Props & Dependencies */}
          <ComponentProps
            propsDocumentation={component.propsDocumentation}
            declaredDependencies={component.declaredDependencies}
          />

          {/* Helpful Navigation */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-xs text-slate-500 space-y-2">
            <div className="font-semibold text-slate-700 dark:text-slate-300">
              Need assistance?
            </div>
            <p>
              Check the{" "}
              <Link href="/get-started" className="text-blue-600 dark:text-blue-400 hover:underline">
                Getting Started Guide
              </Link>{" "}
              for CLI syntax and AI agent prompts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
