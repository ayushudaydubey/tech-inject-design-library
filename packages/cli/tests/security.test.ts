import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { assertSafePath } from "../src/paths";
import {
  assertSafeDependency,
  isVersionCompatible,
  evaluateDependencyPlan,
} from "../src/dependencies";
import { ComponentDownloadResponseSchema } from "../src/types";

describe("CLI Security Suite", () => {
  const mockProjectRoot = path.resolve("/mock/project");

  describe("Path Traversal Protection", () => {
    it("should reject ../ relative path traversal", () => {
      assert.throws(
        () => assertSafePath(mockProjectRoot, "../outside.tsx"),
        /Security check failed: Path traversal detected/
      );
    });

    it("should reject nested path traversal sequences", () => {
      assert.throws(
        () => assertSafePath(mockProjectRoot, "src/components/../../evil.js"),
        /Security check failed: Path traversal detected/
      );
    });

    it("should reject absolute paths", () => {
      assert.throws(
        () => assertSafePath(mockProjectRoot, "/etc/passwd"),
        /Security check failed: Absolute filesystem paths are prohibited/
      );
    });

    it("should reject Windows drive paths", () => {
      assert.throws(
        () => assertSafePath(mockProjectRoot, "C:\\Windows\\System32\\cmd.exe"),
        /Security check failed: Absolute filesystem paths are prohibited/
      );
    });

    it("should accept valid safe relative paths within project", () => {
      const safe = assertSafePath(mockProjectRoot, "src/components/Button.tsx");
      assert.equal(safe, path.resolve(mockProjectRoot, "src/components/Button.tsx"));
    });
  });

  describe("Dependency Injection Protection", () => {
    it("should reject package names with shell semicolon injection", () => {
      assert.throws(
        () => assertSafeDependency("lucide-react; rm -rf /", "^1.0.0"),
        /Security check failed: Package name .* contains invalid characters/
      );
    });

    it("should reject package names with command substitution backticks", () => {
      assert.throws(
        () => assertSafeDependency("`curl evil.com`", "^1.0.0"),
        /Security check failed: Package name .* contains invalid characters/
      );
    });

    it("should reject package names with pipe operators", () => {
      assert.throws(
        () => assertSafeDependency("clsx | sh", "^1.0.0"),
        /Security check failed: Package name .* contains invalid characters/
      );
    });

    it("should reject version strings with shell metacharacters", () => {
      assert.throws(
        () => assertSafeDependency("lucide-react", "1.0.0 && whoami"),
        /Security check failed: Version range .* contains unsafe characters/
      );
    });

    it("should accept standard and scoped package names with valid semver", () => {
      assert.doesNotThrow(() => assertSafeDependency("lucide-react", "^0.475.0"));
      assert.doesNotThrow(() => assertSafeDependency("@dnd-kit/core", ">=6.1.0"));
      assert.doesNotThrow(() => assertSafeDependency("clsx", "~2.1.0"));
    });
  });

  describe("Dependency Compatibility & Reuse Strategy", () => {
    it("should reuse package when consumer installed version is newer or equal", () => {
      // Consumer has clsx ^2.2.0, component requires ^2.1.0 (both in v2.x range)
      const check = isVersionCompatible("^2.2.0", "^2.1.0");
      assert.equal(check.compatible, true);
    });

    it("should reuse package when ranges intersect directly", () => {
      const check = isVersionCompatible("2.1.0", "^2.0.0");
      assert.equal(check.compatible, true);
    });

    it("should detect conflict when consumer installed version is strictly lower than required", () => {
      // Consumer has clsx ^1.0.0, component requires ^2.1.0
      const check = isVersionCompatible("^1.0.0", "^2.1.0");
      assert.equal(check.compatible, false);
      assert.match(check.reason, /does not satisfy required range/);
    });
  });

  describe("Backend Response Validation", () => {
    it("should reject responses missing required sourceFiles", () => {
      const malformed = {
        success: true,
        data: {
          name: "Broken Component",
          slug: "broken-component",
          version: "1.0.0",
          sourceFiles: [], // empty
        },
      };

      const result = ComponentDownloadResponseSchema.safeParse(malformed);
      assert.equal(result.success, false);
    });

    it("should reject responses missing component slug", () => {
      const malformed = {
        success: true,
        data: {
          name: "Broken Component",
          sourceFiles: [{ filename: "Foo.tsx", content: "export default () => null;" }],
        },
      };

      const result = ComponentDownloadResponseSchema.safeParse(malformed);
      assert.equal(result.success, false);
    });

    it("should parse and validate complete published component payloads", () => {
      const valid = {
        success: true,
        data: {
          name: "Sales Metric Card",
          slug: "sales-metric-card",
          version: "1.0.0",
          accessType: "free",
          declaredDependencies: {
            "lucide-react": "^0.475.0",
          },
          sourceFiles: [
            {
              filename: "SalesMetricCard.tsx",
              content: "export const SalesMetricCard = () => <div />;",
              fileType: "tsx",
            },
          ],
          supportingFiles: [],
          themeFiles: [],
        },
      };

      const result = ComponentDownloadResponseSchema.safeParse(valid);
      assert.equal(result.success, true);
    });
  });
});
