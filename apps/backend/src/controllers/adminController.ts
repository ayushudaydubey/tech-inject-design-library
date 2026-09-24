import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AdminService } from "../services/adminService";
import { ApiError } from "../middleware/errorHandler";

const componentFileSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  content: z.string().min(1, "Content cannot be empty"),
  fileType: z.string().min(1, "File type is required"),
});

const createComponentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  version: z.string().optional(),
  accessType: z.enum(["free", "premium"]).optional(),
  propsDocumentation: z.string().optional(),
  usageDocumentation: z.string().optional(),
  declaredDependencies: z.record(z.string(), z.string()).optional(),
  previewData: z.string().optional(),
  sourceFiles: z.array(componentFileSchema).optional(),
  supportingFiles: z.array(componentFileSchema).optional(),
  themeFiles: z.array(componentFileSchema).optional(),
  installInfo: z
    .object({
      packageManagerCommand: z.string().optional(),
      notes: z.string().optional(),
    })
    .optional(),
  agentPrompt: z.string().optional(),
});

const updateComponentSchema = createComponentSchema.partial();

const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export class AdminController {
  static async listComponents(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const components = await AdminService.listComponents();
      res.status(200).json({
        success: true,
        data: components,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getComponent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const component = await AdminService.getComponentById(id);
      res.status(200).json({
        success: true,
        data: component,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createDraft(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = createComponentSchema.parse(req.body);
      const adminUserId = req.user!._id.toString();
      const component = await AdminService.createDraft(data, adminUserId);

      res.status(201).json({
        success: true,
        data: component,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateComponent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const data = updateComponentSchema.parse(req.body);
      const updated = await AdminService.updateComponent(id, data);

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async uploadFiles(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        throw new ApiError(400, "No files uploaded");
      }

      const updated = await AdminService.attachUploadedFiles(id, files);

      res.status(200).json({
        success: true,
        message: `Successfully uploaded ${files.length} file(s)`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async validateDraft(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const result = await AdminService.validateDraft(id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async previewDraft(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const component = await AdminService.getComponentById(id);

      res.status(200).json({
        success: true,
        data: {
          component,
          previewData: component.previewData,
          sourceFiles: component.sourceFiles,
          themeFiles: component.themeFiles,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async publishComponent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const published = await AdminService.publishComponent(id);

      res.status(200).json({
        success: true,
        message: `Component "${published.name}" has been published successfully`,
        data: published,
      });
    } catch (error) {
      next(error);
    }
  }

  static async unpublishComponent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const draft = await AdminService.unpublishComponent(id);

      res.status(200).json({
        success: true,
        message: `Component "${draft.name}" has been unpublished and moved to draft`,
        data: draft,
      });
    } catch (error) {
      next(error);
    }
  }

  static async listCustomers(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const customers = await AdminService.listCustomers();
      res.status(200).json({
        success: true,
        data: customers,
      });
    } catch (error) {
      next(error);
    }
  }

  static async grantPremium(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const updatedCustomer = await AdminService.grantPremium(id);

      res.status(200).json({
        success: true,
        message: `Premium granted to ${updatedCustomer.email}`,
        data: updatedCustomer,
      });
    } catch (error) {
      next(error);
    }
  }

  static async revokePremium(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const updatedCustomer = await AdminService.revokePremium(id);

      res.status(200).json({
        success: true,
        message: `Premium revoked from ${updatedCustomer.email}`,
        data: updatedCustomer,
      });
    } catch (error) {
      next(error);
    }
  }
}
