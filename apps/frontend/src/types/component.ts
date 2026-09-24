export type ComponentAccessType = "free" | "premium";
export type ComponentStatus = "draft" | "published";

export interface ComponentFile {
  filename: string;
  content: string;
  fileType: string;
}

export interface ComponentInstallInfo {
  packageManagerCommand?: string;
  notes?: string;
}

export interface ComponentSummary {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  version: string;
  accessType: ComponentAccessType;
  status: ComponentStatus;
  publishedAt: string | null;
  updatedAt: string;
}

export interface ComponentDetail extends ComponentSummary {
  isLocked: boolean;
  accessMessage?: string;
  propsDocumentation?: string;
  usageDocumentation?: string;
  declaredDependencies?: Record<string, string>;
  previewData?: string;
  installInfo?: ComponentInstallInfo;
  agentPrompt?: string;
  sourceFiles?: ComponentFile[];
  supportingFiles?: ComponentFile[];
  themeFiles?: ComponentFile[];
}

export interface ComponentPreview {
  name: string;
  slug: string;
  version: string;
  previewData: string;
  primarySource: ComponentFile | null;
  themeFiles: ComponentFile[];
}

export interface ComponentSource {
  name: string;
  slug: string;
  version: string;
  sourceFiles: ComponentFile[];
  supportingFiles: ComponentFile[];
  themeFiles: ComponentFile[];
  declaredDependencies: Record<string, string>;
  usageDocumentation: string;
  propsDocumentation: string;
}

export interface ComponentInstallPayload {
  name: string;
  slug: string;
  version: string;
  packageManagerCommand: string;
  notes: string;
  declaredDependencies: Record<string, string>;
  requiredFiles: string[];
}

export interface ComponentAgentPrompt {
  name: string;
  slug: string;
  version: string;
  agentPrompt: string;
  declaredDependencies: Record<string, string>;
}
