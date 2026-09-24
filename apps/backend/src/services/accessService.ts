import { IComponentDocument } from "../models/Component";
import { IUserDocument } from "../models/User";
import { ApiError } from "../middleware/errorHandler";

export class AccessService {
  /**
   * Evaluates if user has permission to access the component's full content (source, preview, install, prompt).
   */
  static hasAccess(
    component: IComponentDocument,
    user?: IUserDocument
  ): boolean {
    // Non-published components are only accessible to administrators
    if (component.status !== "published") {
      return user?.role === "admin";
    }

    // Free published components are universally accessible (including guests)
    if (component.accessType === "free") {
      return true;
    }

    // Premium components require an active premium account or admin privileges
    if (!user) {
      return false;
    }

    return user.isPremium === true || user.role === "admin";
  }

  /**
   * Enforces access control on protected sub-resources.
   * Throws 404 for unpublished components, 401 for unauthenticated guests, or 403 for free accounts.
   */
  static assertAccess(
    component: IComponentDocument,
    user?: IUserDocument
  ): void {
    // Drafts and unpublished components must not be discoverable by regular users
    if (component.status !== "published") {
      if (user?.role !== "admin") {
        throw new ApiError(404, "Component not found");
      }
      return;
    }

    // Free published components require no authorization
    if (component.accessType === "free") {
      return;
    }

    // Premium components
    if (!user) {
      throw new ApiError(
        401,
        "Authentication required. Please sign in to access this premium component."
      );
    }

    if (!user.isPremium && user.role !== "admin") {
      throw new ApiError(
        403,
        "Access denied. An active premium membership is required to access this component."
      );
    }
  }
}
