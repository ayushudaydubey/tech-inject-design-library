import {
  Component,
  IComponentDocument,
  PublicComponentSummary,
  PublicComponentDetail,
} from "../models/Component";
import { IUserDocument } from "../models/User";
import { AccessService } from "./accessService";
import { ApiError } from "../middleware/errorHandler";

export class ComponentService {
  /**
   * Returns list of published components for public catalogue.
   * Drafts are strictly excluded.
   */
  static async getPublishedComponents(filter: {
    category?: string;
    search?: string;
  }): Promise<PublicComponentSummary[]> {
    const query: Record<string, any> = { status: "published" };

    if (filter.category && filter.category.trim() !== "") {
      query.category = filter.category.trim();
    }

    if (filter.search && filter.search.trim() !== "") {
      const sanitized = filter.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { name: { $regex: sanitized, $options: "i" } },
        { description: { $regex: sanitized, $options: "i" } },
        { category: { $regex: sanitized, $options: "i" } },
      ];
    }

    const components = await Component.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .exec();

    return components.map((c) => c.toPublicSummary());
  }

  /**
   * Retrieves single published component detail.
   * If the component is premium and user is not authorized, source files are stripped and locked flag is returned.
   */
  static async getPublishedComponentBySlug(
    slug: string,
    user?: IUserDocument
  ): Promise<PublicComponentDetail> {
    const component = await Component.findOne({
      slug: slug.toLowerCase(),
    }).exec();

    if (!component) {
      throw new ApiError(404, "Component not found");
    }

    // Unpublished components must return 404 for non-admins
    if (component.status !== "published" && user?.role !== "admin") {
      throw new ApiError(404, "Component not found");
    }

    const hasAccess = AccessService.hasAccess(component, user);
    return component.toPublicDetail(hasAccess);
  }

  /**
   * Internal helper to find component and verify access
   */
  private static async getAuthorizedComponent(
    slug: string,
    user?: IUserDocument
  ): Promise<IComponentDocument> {
    const component = await Component.findOne({
      slug: slug.toLowerCase(),
    }).exec();

    if (!component) {
      throw new ApiError(404, "Component not found");
    }

    AccessService.assertAccess(component, user);
    return component;
  }

  /**
   * Returns component preview payload (previewData, primary component code, and theme files)
   */
  static async getPreview(slug: string, user?: IUserDocument) {
    const component = await this.getAuthorizedComponent(slug, user);
    return {
      name: component.name,
      slug: component.slug,
      version: component.version,
      previewData: component.previewData,
      primarySource: component.sourceFiles[0] || null,
      themeFiles: component.themeFiles,
    };
  }

  /**
   * Returns complete copyable source code files and supporting files
   */
  static async getSource(slug: string, user?: IUserDocument) {
    const component = await this.getAuthorizedComponent(slug, user);
    return {
      name: component.name,
      slug: component.slug,
      version: component.version,
      sourceFiles: component.sourceFiles,
      supportingFiles: component.supportingFiles,
      themeFiles: component.themeFiles,
      declaredDependencies: component.declaredDependencies,
      usageDocumentation: component.usageDocumentation,
      propsDocumentation: component.propsDocumentation,
    };
  }

  /**
   * Returns verified installation instructions and dependencies
   */
  static async getInstall(slug: string, user?: IUserDocument) {
    const component = await this.getAuthorizedComponent(slug, user);
    const defaultInstallCommand = `npx tech-inject add ${component.slug}${
      component.accessType === "premium" ? " --auth" : ""
    }`;

    return {
      name: component.name,
      slug: component.slug,
      version: component.version,
      packageManagerCommand:
        component.installInfo?.packageManagerCommand || defaultInstallCommand,
      notes: component.installInfo?.notes || "",
      declaredDependencies: component.declaredDependencies,
      requiredFiles: [
        ...component.sourceFiles.map((f) => f.filename),
        ...component.supportingFiles.map((f) => f.filename),
        ...component.themeFiles.map((f) => f.filename),
      ],
    };
  }

  /**
   * Returns specific AI agent integration prompt
   */
  static async getAgentPrompt(slug: string, user?: IUserDocument) {
    const component = await this.getAuthorizedComponent(slug, user);
    return {
      name: component.name,
      slug: component.slug,
      version: component.version,
      agentPrompt:
        component.agentPrompt ||
        `Add the ${component.name} component to your React project. Install dependencies: ${Object.keys(
          component.declaredDependencies
        ).join(", ")}. Follow the component props and theme definitions.`,
      declaredDependencies: component.declaredDependencies,
    };
  }

  /**
   * Returns full packaged component bundle for download/installer CLI
   */
  static async getDownloadPackage(slug: string, user?: IUserDocument) {
    const component = await this.getAuthorizedComponent(slug, user);
    return {
      name: component.name,
      slug: component.slug,
      version: component.version,
      accessType: component.accessType,
      declaredDependencies: component.declaredDependencies,
      sourceFiles: component.sourceFiles,
      supportingFiles: component.supportingFiles,
      themeFiles: component.themeFiles,
      installInfo: component.installInfo,
    };
  }
}
