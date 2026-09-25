"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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

export default function ComponentDetailPage() {
  const routeParams = useParams();
  const slug = ((routeParams?.slug as string) || "").trim();

  const {
    data: component,
    isLoading,
    isPending,
    isError,
    error,
    refetch,
  } = useComponent(slug);

  if (isLoading || isPending || (!component && !isError)) {
    return (
      <div className="px-6 lg:px-8 py-8 w-full flex-1">
        <LoadingState type="detail" />
      </div>
    );
  }

  if (isError || !component) {
    return (
      <div className="px-6 lg:px-8 py-12 w-full flex-1">
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
    <div className="px-5 sm:px-8 lg:px-10 py-8 w-full space-y-8 max-w-7xl mx-auto pb-16">
      {/* 1. Component Header (Title, Category, Badges, Breadcrumb) */}
      <ComponentHeader component={component} />

      {/* 2. Primary Interactive Preview */}
      <section className="w-full space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Interactive Preview
          </h2>
          <span className="text-xs text-zinc-500 font-mono">
            {component.version ? `v${component.version}` : "1.0.0"}
          </span>
        </div>
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
            sourceFiles={component.sourceFiles}
            supportingFiles={component.supportingFiles}
            themeFiles={component.themeFiles}
            declaredDependencies={component.declaredDependencies}
            propsDocumentation={component.propsDocumentation}
          />
        )}
      </section>

      {/* 3. Source Code Viewer */}
      {!isLocked && (
        <section className="space-y-2.5 w-full">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">
              Source Code
            </h2>
            <span className="text-xs text-zinc-400">
              Production TypeScript + Tailwind CSS
            </span>
          </div>
          <SourceCodeViewer
            sourceFiles={component.sourceFiles}
            supportingFiles={component.supportingFiles}
            themeFiles={component.themeFiles}
            isLocked={isLocked}
          />
        </section>
      )}

      {/* 4. Usage Documentation */}
      <section className="w-full">
        <ComponentUsage usageDocumentation={component.usageDocumentation} />
      </section>

      {/* 5. Component Properties */}
      <section className="w-full">
        <ComponentProps
          propsDocumentation={component.propsDocumentation}
        />
      </section>

      {/* 6. CLI Installation Card */}
      <section className="w-full">
        <InstallCommand
          slug={component.slug}
          isLocked={isLocked}
          installInfo={component.installInfo}
          accessType={component.accessType}
        />
      </section>

      {/* 7. AI Coding Agent Prompt Card */}
      <section className="w-full">
        <CopyAgentPrompt
          name={component.name}
          slug={component.slug}
          isLocked={isLocked}
          agentPrompt={component.agentPrompt}
          installCommand={component.installInfo?.packageManagerCommand}
          dependencies={component.declaredDependencies}
          propsDocumentation={component.propsDocumentation}
        />
      </section>

      {/* 8. Declared Dependencies */}
      {component.declaredDependencies &&
        Object.keys(component.declaredDependencies).length > 0 && (
          <section className="rounded-lg border border-zinc-700/60 bg-zinc-800 p-5 space-y-3 w-full">
            <div className="flex items-center justify-between border-b border-zinc-700/60 pb-2">
              <h3 className="text-xs font-semibold text-zinc-200">
                Declared Dependencies
              </h3>
              <span className="text-xs text-zinc-500">
                {Object.keys(component.declaredDependencies).length} package(s)
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {Object.entries(component.declaredDependencies).map(
                ([pkg, version]) => (
                  <span
                    key={pkg}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-zinc-900 text-zinc-300 border border-zinc-700"
                  >
                    <span className="font-medium text-blue-200">{pkg}</span>
                    <span className="text-zinc-500">{version}</span>
                  </span>
                )
              )}
            </div>
          </section>
        )}

      {/* 9. Theme Variants */}
      {!isLocked && (
        <section className="w-full">
          <ComponentVariants
            slug={component.slug}
            themeFiles={component.themeFiles}
          />
        </section>
      )}

      {/* 10. Helpful Footnote */}
      <div className="p-4 rounded-lg border border-zinc-700/60 bg-zinc-800 text-xs text-zinc-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span>
          Need help integrating this component? Check the{" "}
          <Link
            href="/get-started"
            className="text-blue-200 hover:underline font-medium"
          >
            CLI Integration Guide
          </Link>{" "}
          for syntax and AI agent prompts.
        </span>
        <span className="font-mono text-xs text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-700 self-start sm:self-auto">
          tech-inject add {component.slug}
        </span>
      </div>
    </div>
  );
}
