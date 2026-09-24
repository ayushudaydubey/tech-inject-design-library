import { Types } from "mongoose";
import { Component, IComponentDocument, IComponentFile } from "../models/Component";
import { User, SafeUser } from "../models/User";
import { slugify } from "../utils/slug";
import { ApiError } from "../middleware/errorHandler";

export interface CreateComponentInput {
  name: string;
  slug?: string;
  description: string;
  category: string;
  version?: string;
  accessType?: "free" | "premium";
  propsDocumentation?: string;
  usageDocumentation?: string;
  declaredDependencies?: Record<string, string>;
  previewData?: string;
  sourceFiles?: IComponentFile[];
  supportingFiles?: IComponentFile[];
  themeFiles?: IComponentFile[];
  installInfo?: { packageManagerCommand?: string; notes?: string };
  agentPrompt?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class AdminService {
  /**
   * Lists all components (both draft and published) for admin management
   */
  static async listComponents(): Promise<IComponentDocument[]> {
    return Component.find()
      .populate("createdBy", "name email")
      .sort({ updatedAt: -1 })
      .exec();
  }

  /**
   * Retrieves full component details by ID (including draft and source files)
   */
  static async getComponentById(id: string): Promise<IComponentDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid component ID format");
    }

    const component = await Component.findById(id).populate("createdBy", "name email").exec();
    if (!component) {
      throw new ApiError(404, "Component not found");
    }

    return component;
  }

  /**
   * Creates a new component in draft status
   */
  static async createDraft(
    data: CreateComponentInput,
    adminUserId: string
  ): Promise<IComponentDocument> {
    const slug = data.slug ? slugify(data.slug) : slugify(data.name);

    // Check if slug is taken
    const existing = await Component.findOne({ slug });
    if (existing) {
      throw new ApiError(409, `A component with slug "${slug}" already exists`);
    }

    const component = await Component.create({
      ...data,
      slug,
      status: "draft",
      version: data.version || "1.0.0",
      accessType: data.accessType || "free",
      sourceFiles: data.sourceFiles || [],
      supportingFiles: data.supportingFiles || [],
      themeFiles: data.themeFiles || [],
      createdBy: new Types.ObjectId(adminUserId),
      publishedAt: null,
    });

    return component;
  }

  /**
   * Updates an existing component draft or published item
   */
  static async updateComponent(
    id: string,
    data: Partial<CreateComponentInput>
  ): Promise<IComponentDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid component ID format");
    }

    const component = await Component.findById(id);
    if (!component) {
      throw new ApiError(404, "Component not found");
    }

    if (data.slug && data.slug !== component.slug) {
      const sanitizedSlug = slugify(data.slug);
      const existing = await Component.findOne({
        slug: sanitizedSlug,
        _id: { $ne: component._id },
      });
      if (existing) {
        throw new ApiError(409, `Slug "${sanitizedSlug}" is already taken`);
      }
      component.slug = sanitizedSlug;
    }

    if (data.name !== undefined) component.name = data.name;
    if (data.description !== undefined) component.description = data.description;
    if (data.category !== undefined) component.category = data.category;
    if (data.version !== undefined) component.version = data.version;
    if (data.accessType !== undefined) component.accessType = data.accessType;
    if (data.propsDocumentation !== undefined) component.propsDocumentation = data.propsDocumentation;
    if (data.usageDocumentation !== undefined) component.usageDocumentation = data.usageDocumentation;
    if (data.declaredDependencies !== undefined) component.declaredDependencies = data.declaredDependencies;
    if (data.previewData !== undefined) component.previewData = data.previewData;
    if (data.installInfo !== undefined) {
      component.installInfo = {
        packageManagerCommand: data.installInfo.packageManagerCommand || component.installInfo?.packageManagerCommand || "",
        notes: data.installInfo.notes ?? component.installInfo?.notes ?? "",
      };
    }
    if (data.agentPrompt !== undefined) component.agentPrompt = data.agentPrompt;
    if (data.sourceFiles !== undefined) component.sourceFiles = data.sourceFiles;
    if (data.supportingFiles !== undefined) component.supportingFiles = data.supportingFiles;
    if (data.themeFiles !== undefined) component.themeFiles = data.themeFiles;

    await component.save();
    return component;
  }

  /**
   * Uploads and attaches files into component document
   */
  static async attachUploadedFiles(
    id: string,
    files: Express.Multer.File[]
  ): Promise<IComponentDocument> {
    const component = await this.getComponentById(id);

    for (const file of files) {
      const filename = file.originalname;
      const content = file.buffer.toString("utf-8");
      const ext = filename.split(".").pop()?.toLowerCase() || "txt";

      const fileObj: IComponentFile = {
        filename,
        content,
        fileType: ext,
      };

      if (ext === "css") {
        // Replace if exists, or append to theme files
        const idx = component.themeFiles.findIndex((f) => f.filename === filename);
        if (idx >= 0) component.themeFiles[idx] = fileObj;
        else component.themeFiles.push(fileObj);
      } else if (filename.endsWith(".utils.ts") || filename.endsWith(".types.ts") || filename === "types.ts") {
        // Supporting helper files
        const idx = component.supportingFiles.findIndex((f) => f.filename === filename);
        if (idx >= 0) component.supportingFiles[idx] = fileObj;
        else component.supportingFiles.push(fileObj);
      } else {
        // Main component source files
        const idx = component.sourceFiles.findIndex((f) => f.filename === filename);
        if (idx >= 0) component.sourceFiles[idx] = fileObj;
        else component.sourceFiles.push(fileObj);
      }
    }

    await component.save();
    return component;
  }

  /**
   * Validates if a draft meets publishing requirements
   */
  static validateComponent(component: IComponentDocument): ValidationResult {
    const errors: string[] = [];

    if (!component.name || component.name.trim() === "") {
      errors.push("Component name is required.");
    }
    if (!component.slug || component.slug.trim() === "") {
      errors.push("Component slug is required.");
    }
    if (!component.description || component.description.trim() === "") {
      errors.push("Component description is required.");
    }
    if (!component.category || component.category.trim() === "") {
      errors.push("Component category is required.");
    }
    if (!component.version || component.version.trim() === "") {
      errors.push("Component version is required.");
    }
    if (!component.sourceFiles || component.sourceFiles.length === 0) {
      errors.push("At least one source file (.tsx, .ts, .jsx, .js) is required before publishing.");
    }

    // Verify dependencies is a valid key-value object
    if (
      component.declaredDependencies &&
      typeof component.declaredDependencies === "object" &&
      !Array.isArray(component.declaredDependencies)
    ) {
      for (const [pkg, ver] of Object.entries(component.declaredDependencies)) {
        if (typeof ver !== "string") {
          errors.push(`Invalid dependency version for package '${pkg}'. Must be a string.`);
        }
      }
    } else if (component.declaredDependencies) {
      errors.push("Declared dependencies must be a key-value record (e.g. { 'react': '^18.0.0' }).");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates draft readiness by ID
   */
  static async validateDraft(id: string): Promise<ValidationResult> {
    const component = await this.getComponentById(id);
    return this.validateComponent(component);
  }

  /**
   * Publishes a component: validates first, then marks published with timestamp
   */
  static async publishComponent(id: string): Promise<IComponentDocument> {
    const component = await this.getComponentById(id);

    const validation = this.validateComponent(component);
    if (!validation.isValid) {
      throw new ApiError(400, "Component cannot be published due to validation errors", validation.errors);
    }

    component.status = "published";
    component.publishedAt = new Date();
    await component.save();

    return component;
  }

  /**
   * Unpublishes a component: transitions back to draft status
   */
  static async unpublishComponent(id: string): Promise<IComponentDocument> {
    const component = await this.getComponentById(id);

    component.status = "draft";
    await component.save();

    return component;
  }

  /**
   * Lists customer accounts for premium management
   */
  static async listCustomers(): Promise<SafeUser[]> {
    const customers = await User.find({ role: "customer" })
      .sort({ createdAt: -1 })
      .exec();

    return customers.map((c) => c.toSafeUser());
  }

  /**
   * Grants premium access to a customer
   */
  static async grantPremium(customerId: string): Promise<SafeUser> {
    if (!Types.ObjectId.isValid(customerId)) {
      throw new ApiError(400, "Invalid customer ID");
    }

    const customer = await User.findById(customerId);
    if (!customer) {
      throw new ApiError(404, "Customer not found");
    }

    if (customer.role !== "customer") {
      throw new ApiError(400, "Cannot change premium status of admin accounts");
    }

    customer.isPremium = true;
    await customer.save();

    return customer.toSafeUser();
  }

  /**
   * Revokes premium access from a customer
   */
  static async revokePremium(customerId: string): Promise<SafeUser> {
    if (!Types.ObjectId.isValid(customerId)) {
      throw new ApiError(400, "Invalid customer ID");
    }

    const customer = await User.findById(customerId);
    if (!customer) {
      throw new ApiError(404, "Customer not found");
    }

    if (customer.role !== "customer") {
      throw new ApiError(400, "Cannot change premium status of admin accounts");
    }

    customer.isPremium = false;
    await customer.save();

    return customer.toSafeUser();
  }
}
