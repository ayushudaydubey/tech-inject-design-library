export type ComponentAccessType = "free" | "premium";
export type ComponentStatus = "draft" | "published";

export type SourceFileLanguage =
  | "typescript"
  | "typescriptreact"
  | "javascript"
  | "javascriptreact"
  | "css"
  | "scss"
  | "json"
  | "markdown"
  | "plaintext";

export interface ComponentFile {
  filename: string;
  path?: string;
  content: string;
  fileType: string;
  language?: SourceFileLanguage;
}

export interface ComponentInstallInfo {
  packageManagerCommand?: string;
  notes?: string;
}

export interface AdminComponent {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  version: string;
  accessType: ComponentAccessType;
  status: ComponentStatus;
  propsDocumentation: string;
  usageDocumentation: string;
  declaredDependencies: Record<string, string>;
  previewData: string;
  sourceFiles: ComponentFile[];
  supportingFiles: ComponentFile[];
  themeFiles: ComponentFile[];
  installInfo: ComponentInstallInfo;
  agentPrompt: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  } | string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateComponentInput {
  name: string;
  slug?: string;
  description: string;
  category: string;
  version?: string;
  accessType?: ComponentAccessType;
  propsDocumentation?: string;
  usageDocumentation?: string;
  declaredDependencies?: Record<string, string>;
  previewData?: string;
  sourceFiles?: ComponentFile[];
  supportingFiles?: ComponentFile[];
  themeFiles?: ComponentFile[];
  installInfo?: ComponentInstallInfo;
  agentPrompt?: string;
}

export type UpdateComponentInput = Partial<CreateComponentInput>;

export interface DetailedValidationError {
  file?: string;
  line?: number;
  column?: number;
  message: string;
  type?: "error" | "warning";
}

export interface ValidationCheck {
  name: string;
  passed: boolean;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  detailedErrors?: DetailedValidationError[];
  checks?: ValidationCheck[];
}

export interface AdminPreviewData {
  component: AdminComponent;
  previewData: string;
  sourceFiles: ComponentFile[];
  themeFiles: ComponentFile[];
}
