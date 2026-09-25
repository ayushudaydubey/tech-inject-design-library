import mongoose, { Document, Schema, Model, Types } from "mongoose";

export type ComponentAccessType = "free" | "premium";
export type ComponentStatus = "draft" | "published";

export interface IComponentFile {
  filename: string;
  path?: string;
  content: string;
  fileType: string;
  language?: string;
}

export interface IInstallInfo {
  packageManagerCommand: string;
  notes?: string;
}

export interface IComponent {
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
  sourceFiles: IComponentFile[];
  supportingFiles: IComponentFile[];
  themeFiles: IComponentFile[];
  installInfo: IInstallInfo;
  agentPrompt: string;
  createdBy: Types.ObjectId;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComponentDocument extends IComponent, Document {
  toPublicSummary(): PublicComponentSummary;
  toPublicDetail(hasAccess: boolean): PublicComponentDetail;
}

export interface PublicComponentSummary {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  version: string;
  accessType: ComponentAccessType;
  status: ComponentStatus;
  publishedAt: Date | null;
  updatedAt: Date;
}

export interface PublicComponentDetail extends PublicComponentSummary {
  isLocked: boolean;
  accessMessage?: string;
  propsDocumentation?: string;
  usageDocumentation?: string;
  declaredDependencies?: Record<string, string>;
  previewData?: string;
  installInfo?: IInstallInfo;
  agentPrompt?: string;
  sourceFiles?: IComponentFile[];
  supportingFiles?: IComponentFile[];
  themeFiles?: IComponentFile[];
}

const ComponentFileSchema = new Schema<IComponentFile>(
  {
    filename: { type: String, required: true },
    path: { type: String },
    content: { type: String, required: true },
    fileType: { type: String, required: true },
    language: { type: String },
  },
  { _id: false }
);

const InstallInfoSchema = new Schema<IInstallInfo>(
  {
    packageManagerCommand: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const ComponentSchema = new Schema<IComponentDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    version: { type: String, required: true, default: "1.0.0" },
    accessType: {
      type: String,
      enum: ["free", "premium"],
      default: "free",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      required: true,
      index: true,
    },
    propsDocumentation: { type: String, default: "" },
    usageDocumentation: { type: String, default: "" },
    declaredDependencies: {
      type: Schema.Types.Mixed,
      default: {},
    },
    previewData: { type: String, default: "" },
    sourceFiles: { type: [ComponentFileSchema], default: [] },
    supportingFiles: { type: [ComponentFileSchema], default: [] },
    themeFiles: { type: [ComponentFileSchema], default: [] },
    installInfo: { type: InstallInfoSchema, default: () => ({}) },
    agentPrompt: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    publishedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

ComponentSchema.methods.toPublicSummary = function (): PublicComponentSummary {
  return {
    id: this._id.toString(),
    name: this.name,
    slug: this.slug,
    description: this.description,
    category: this.category,
    version: this.version,
    accessType: this.accessType,
    status: this.status,
    publishedAt: this.publishedAt,
    updatedAt: this.updatedAt,
  };
};

ComponentSchema.methods.toPublicDetail = function (
  hasAccess: boolean
): PublicComponentDetail {
  const summary = this.toPublicSummary();

  if (!hasAccess && this.accessType === "premium") {
    return {
      ...summary,
      isLocked: true,
      accessMessage:
        "This is a premium component. An active premium account is required to view source code, previews, and installation instructions.",
      propsDocumentation: this.propsDocumentation,
      usageDocumentation: this.usageDocumentation,
      declaredDependencies: this.declaredDependencies,
    };
  }

  return {
    ...summary,
    isLocked: false,
    propsDocumentation: this.propsDocumentation,
    usageDocumentation: this.usageDocumentation,
    declaredDependencies: this.declaredDependencies,
    previewData: this.previewData,
    installInfo: this.installInfo,
    agentPrompt: this.agentPrompt,
    sourceFiles: this.sourceFiles,
    supportingFiles: this.supportingFiles,
    themeFiles: this.themeFiles,
  };
};

export const Component: Model<IComponentDocument> =
  mongoose.models.Component ||
  mongoose.model<IComponentDocument>("Component", ComponentSchema);
