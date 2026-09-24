import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ComponentService } from "../services/componentService";

const querySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
});

const slugParamSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
});

export class ComponentController {
  static async getComponents(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = querySchema.parse(req.query);
      const components = await ComponentService.getPublishedComponents(query);

      res.status(200).json({
        success: true,
        data: components,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getComponentBySlug(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { slug } = slugParamSchema.parse(req.params);
      const component = await ComponentService.getPublishedComponentBySlug(
        slug,
        req.user
      );

      res.status(200).json({
        success: true,
        data: component,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPreview(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { slug } = slugParamSchema.parse(req.params);
      const preview = await ComponentService.getPreview(slug, req.user);

      res.status(200).json({
        success: true,
        data: preview,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSource(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { slug } = slugParamSchema.parse(req.params);
      const source = await ComponentService.getSource(slug, req.user);

      res.status(200).json({
        success: true,
        data: source,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getInstall(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { slug } = slugParamSchema.parse(req.params);
      const install = await ComponentService.getInstall(slug, req.user);

      res.status(200).json({
        success: true,
        data: install,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAgentPrompt(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { slug } = slugParamSchema.parse(req.params);
      const prompt = await ComponentService.getAgentPrompt(slug, req.user);

      res.status(200).json({
        success: true,
        data: prompt,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDownload(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { slug } = slugParamSchema.parse(req.params);
      const bundle = await ComponentService.getDownloadPackage(slug, req.user);

      res.status(200).json({
        success: true,
        data: bundle,
      });
    } catch (error) {
      next(error);
    }
  }
}
