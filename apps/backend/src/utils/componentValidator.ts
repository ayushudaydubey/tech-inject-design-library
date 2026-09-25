import * as ts from "typescript";

export interface ComponentSourceInputFile {
  filename?: string;
  path?: string;
  content?: string;
  fileType?: string;
  language?: string;
}

export interface ComponentValidationInput {
  name?: string;
  slug?: string;
  description?: string;
  category?: string;
  version?: string;
  accessType?: "free" | "premium" | string;
  sourceFiles?: ComponentSourceInputFile[];
  supportingFiles?: ComponentSourceInputFile[];
  themeFiles?: ComponentSourceInputFile[];
  declaredDependencies?: Record<string, string>;
  previewData?: string;
}

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

export interface ComponentValidationResult {
  isValid: boolean;
  errors: string[];
  detailedErrors: DetailedValidationError[];
  checks: ValidationCheck[];
}

const ALLOWED_EXTENSIONS = new Set([
  "ts",
  "tsx",
  "js",
  "jsx",
  "css",
  "scss",
  "json",
  "md",
]);

const MAIN_SOURCE_EXTENSIONS = new Set(["tsx", "ts", "jsx", "js"]);

const UNSAFE_PATTERNS = [
  { pattern: /\bchild_process\b/, label: "child_process" },
  { pattern: /\bexecSync\s*\(/, label: "execSync" },
  { pattern: /\bexec\s*\(/, label: "exec" },
  { pattern: /\bspawn\s*\(/, label: "spawn" },
  { pattern: /\beval\s*\(/, label: "eval" },
  { pattern: /\bnew\s+Function\s*\(/, label: "Function constructor" },
  { pattern: /\bFunction\s*\(/, label: "Function" },
  { pattern: /\bprocess\.exit\b/, label: "process.exit" },
  { pattern: /\bfs\.unlink\b/, label: "fs.unlink" },
  { pattern: /\bfs\.rmdir\b/, label: "fs.rmdir" },
  { pattern: /\bfs\.rm\b/, label: "fs.rm" },
  { pattern: /\bnode:child_process\b/, label: "node:child_process" },
];

export function validateSafeFilePath(rawPath: string): {
  isValid: boolean;
  error?: string;
  normalized: string;
  extension: string;
} {
  if (!rawPath || rawPath.trim() === "") {
    return { isValid: false, error: "File name/path cannot be empty.", normalized: "", extension: "" };
  }

  const trimmed = rawPath.trim();

  // Reject absolute paths and drive letters (e.g. C:\Windows or /etc/passwd)
  if (/^[a-zA-Z]:/.test(trimmed) || trimmed.startsWith("/") || trimmed.startsWith("\\")) {
    return {
      isValid: false,
      error: `Invalid file path "${trimmed}": absolute paths are forbidden.`,
      normalized: trimmed,
      extension: "",
    };
  }

  // Reject forbidden characters
  if (/[<>:"|?*]/.test(trimmed)) {
    return {
      isValid: false,
      error: `Invalid file path "${trimmed}": contains forbidden characters.`,
      normalized: trimmed,
      extension: "",
    };
  }

  // Normalize slashes
  const normalized = trimmed.replace(/\\/g, "/");

  // Check path segments for traversal or forbidden directories
  const segments = normalized.split("/");
  for (const seg of segments) {
    if (seg === ".." || seg === ".") {
      return {
        isValid: false,
        error: `Invalid file path "${trimmed}": path traversal ("..") is forbidden.`,
        normalized,
        extension: "",
      };
    }
    if (seg === "node_modules" || seg === ".git" || seg === ".env") {
      return {
        isValid: false,
        error: `Invalid file path "${trimmed}": forbidden directory "${seg}".`,
        normalized,
        extension: "",
      };
    }
  }

  // Extract extension
  const parts = normalized.split(".");
  if (parts.length < 2) {
    return {
      isValid: false,
      error: `Invalid file "${trimmed}": file must have an extension.`,
      normalized,
      extension: "",
    };
  }

  const ext = parts[parts.length - 1].toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      isValid: false,
      error: `Invalid file extension ".${ext}" for "${trimmed}". Allowed: .ts, .tsx, .js, .jsx, .css, .scss, .json, .md.`,
      normalized,
      extension: ext,
    };
  }

  return {
    isValid: true,
    normalized,
    extension: ext,
  };
}

const NPM_PACKAGE_NAME_REGEX =
  /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

const NPM_VERSION_REGEX = /^[a-zA-Z0-9^~.>=<* -]+$/;

const SEMVER_RANGE_REGEX =
  /^([~^<>=vV\s]*\d+(\.\d+)?(\.\d+)?(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?(\s*[-–]\s*[~^<>=vV\s]*\d+(\.\d+)?(\.\d+)?(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?)*(\s*\|\|\s*[~^<>=vV\s]*\d+(\.\d+)?(\.\d+)?(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?)*|\*|latest)$/;

export function isValidNpmPackageName(pkgName: string): boolean {
  if (!pkgName || typeof pkgName !== "string") return false;
  const trimmed = pkgName.trim();
  if (trimmed.length > 214) return false;
  if (
    trimmed.includes("..") ||
    trimmed.includes("\\") ||
    trimmed.includes(" ") ||
    trimmed.includes(";") ||
    trimmed.includes("&") ||
    trimmed.includes("|") ||
    trimmed.includes("$") ||
    trimmed.includes("`") ||
    trimmed.includes(":")
  ) {
    return false;
  }
  return NPM_PACKAGE_NAME_REGEX.test(trimmed);
}

export function isValidDependencyVersion(ver: string): boolean {
  if (!ver || typeof ver !== "string") return false;
  const trimmed = ver.trim();
  if (trimmed === "") return false;
  if (!NPM_VERSION_REGEX.test(trimmed)) return false;
  return SEMVER_RANGE_REGEX.test(trimmed);
}

function getScriptKindForFile(filename: string): ts.ScriptKind {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "tsx":
      return ts.ScriptKind?.TSX ?? 4;
    case "ts":
      return ts.ScriptKind?.TS ?? 3;
    case "jsx":
      return ts.ScriptKind?.JSX ?? 2;
    case "js":
      return ts.ScriptKind?.JS ?? 1;
    default:
      return ts.ScriptKind?.Unknown ?? 0;
  }
}

function checkTypeScriptSyntax(
  filename: string,
  content: string
): DetailedValidationError[] {
  const errors: DetailedValidationError[] = [];
  try {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    // Only check tsx, ts, jsx, js - never pass css, scss, json, md
    if (!["tsx", "ts", "jsx", "js"].includes(ext)) {
      return errors;
    }

    const scriptKind = getScriptKindForFile(filename);
    const scriptTarget = ts.ScriptTarget?.Latest ?? 99;

    const sourceFile = ts.createSourceFile(
      filename,
      content,
      scriptTarget,
      true,
      scriptKind
    );

    const parseDiagnostics = (
      sourceFile as unknown as { parseDiagnostics?: ts.Diagnostic[] }
    ).parseDiagnostics;

    if (parseDiagnostics && parseDiagnostics.length > 0) {
      for (const diag of parseDiagnostics) {
        if (diag.start !== undefined) {
          const { line, character } = sourceFile.getLineAndCharacterOfPosition(
            diag.start
          );
          errors.push({
            file: filename,
            line: line + 1,
            column: character + 1,
            message: ts.flattenDiagnosticMessageText(diag.messageText, " "),
            type: "error",
          });
        }
      }
    }
  } catch (err: unknown) {
    errors.push({
      file: filename,
      line: 1,
      column: 1,
      message: `Syntax parser error: ${err instanceof Error ? err.message : String(err)}`,
      type: "error",
    });
  }
  return errors;
}

function extractImportedPackages(
  filename: string,
  content: string
): Array<{ package: string; line: number }> {
  const imports: Array<{ package: string; line: number }> = [];

  try {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    if (!["tsx", "ts", "jsx", "js"].includes(ext)) {
      return imports;
    }

    const scriptKind = getScriptKindForFile(filename);
    const scriptTarget = ts.ScriptTarget?.Latest ?? 99;

    const sourceFile = ts.createSourceFile(
      filename,
      content,
      scriptTarget,
      true,
      scriptKind
    );

    function visit(node: ts.Node) {
      if (ts.isImportDeclaration(node)) {
        const specifier = node.moduleSpecifier;
        if (ts.isStringLiteral(specifier)) {
          const mod = specifier.text.trim();
          const { line } = sourceFile.getLineAndCharacterOfPosition(
            node.getStart()
          );
          imports.push({ package: mod, line: line + 1 });
        }
      } else if (ts.isCallExpression(node)) {
        if (
          (node.expression.getText(sourceFile) === "require" ||
            node.expression.kind === (ts.SyntaxKind?.ImportKeyword ?? 100)) &&
          node.arguments.length > 0 &&
          ts.isStringLiteral(node.arguments[0])
        ) {
          const mod = node.arguments[0].text.trim();
          const { line } = sourceFile.getLineAndCharacterOfPosition(
            node.getStart()
          );
          imports.push({ package: mod, line: line + 1 });
        }
      }
      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
  } catch {
    // Regex fallback
    const lines = content.split("\n");
    const importRegex =
      /(?:import\s+(?:[\w*\s{},]*\s+from\s+)?|require\s*\(\s*)["']([^"']+)["']/g;
    lines.forEach((lineText, idx) => {
      let match;
      while ((match = importRegex.exec(lineText)) !== null) {
        imports.push({ package: match[1], line: idx + 1 });
      }
    });
  }

  return imports;
}

export function resolveLocalFileExists(
  currentFilePath: string,
  localSpecifier: string,
  allNormalizedPaths: Set<string>
): boolean {
  let cleanPath = localSpecifier.trim();
  cleanPath = cleanPath.split("?")[0].split("#")[0];

  const currentDir = currentFilePath.includes("/")
    ? currentFilePath.substring(0, currentFilePath.lastIndexOf("/"))
    : "";

  let targetPath = cleanPath;
  if (cleanPath.startsWith("./")) {
    targetPath = cleanPath.slice(2);
  }

  const combined = currentDir ? `${currentDir}/${targetPath}` : targetPath;
  const normalized = combined.replace(/\\/g, "/").replace(/\/+/g, "/");

  const candidates = [
    normalized,
    `${normalized}.ts`,
    `${normalized}.tsx`,
    `${normalized}.js`,
    `${normalized}.jsx`,
    `${normalized}.d.ts`,
    `${normalized}/index.ts`,
    `${normalized}/index.tsx`,
    `${normalized}/index.js`,
    `${normalized}/index.jsx`,
  ];

  const baseName = targetPath.split("/").pop() || targetPath;
  candidates.push(
    baseName,
    `${baseName}.ts`,
    `${baseName}.tsx`,
    `${baseName}.js`,
    `${baseName}.jsx`,
    `${baseName}.d.ts`
  );

  for (const candidate of candidates) {
    if (allNormalizedPaths.has(candidate.toLowerCase())) {
      return true;
    }
  }

  return false;
}

function getRootPackageName(rawSpecifier: string): string | null {
  // Ignore relative imports and absolute paths and aliases
  if (
    rawSpecifier.startsWith(".") ||
    rawSpecifier.startsWith("/") ||
    rawSpecifier.startsWith("\\") ||
    rawSpecifier.startsWith("@/") ||
    rawSpecifier.startsWith("~/")
  ) {
    return null;
  }

  // Ignore built-ins or React peer runtime dependencies
  if (
    rawSpecifier === "react" ||
    rawSpecifier === "react-dom" ||
    rawSpecifier.startsWith("react/") ||
    rawSpecifier.startsWith("react-dom/") ||
    rawSpecifier.startsWith("node:")
  ) {
    return null;
  }

  // Scoped packages like @radix-ui/react-slot
  if (rawSpecifier.startsWith("@")) {
    const parts = rawSpecifier.split("/");
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }
    return rawSpecifier;
  }

  // Standard packages like lucide-react/dist/...
  return rawSpecifier.split("/")[0];
}

export function validateComponentPayload(
  data: ComponentValidationInput
): ComponentValidationResult {
  const errors: string[] = [];
  const detailedErrors: DetailedValidationError[] = [];
  const checks: ValidationCheck[] = [];

  // 1. Metadata Checks
  let metadataValid = true;
  if (!data.name || data.name.trim() === "") {
    errors.push("Component name is required.");
    detailedErrors.push({ message: "Component name is required.", type: "error" });
    metadataValid = false;
  }
  if (!data.slug || data.slug.trim() === "") {
    errors.push("Component slug is required.");
    detailedErrors.push({ message: "Component slug is required.", type: "error" });
    metadataValid = false;
  }
  if (!data.description || data.description.trim() === "") {
    errors.push("Component description is required.");
    detailedErrors.push({ message: "Component description is required.", type: "error" });
    metadataValid = false;
  }
  if (!data.category || data.category.trim() === "") {
    errors.push("Component category is required.");
    detailedErrors.push({ message: "Component category is required.", type: "error" });
    metadataValid = false;
  }
  if (!data.version || data.version.trim() === "") {
    errors.push("Component version is required.");
    detailedErrors.push({ message: "Component version is required.", type: "error" });
    metadataValid = false;
  }
  checks.push({
    name: "Metadata valid",
    passed: metadataValid,
    message: metadataValid ? "All required component metadata present" : "Missing required metadata fields",
  });

  // 2. Gather All Files
  const allFiles: ComponentSourceInputFile[] = [
    ...(data.sourceFiles || []),
    ...(data.supportingFiles || []),
    ...(data.themeFiles || []),
  ];

  // 3. File Structure & Path Validation
  let fileStructureValid = true;
  let hasMainSourceFile = false;
  const declaredDependencies = data.declaredDependencies || {};

  let dependenciesValid = true;

  if (allFiles.length === 0) {
    fileStructureValid = false;
    errors.push("At least one source file (.tsx, .ts, .jsx, .js) is required before publishing.");
    detailedErrors.push({
      message: "At least one source file is required.",
      type: "error",
    });
  }

  const allNormalizedPaths = new Set<string>();
  for (const file of allFiles) {
    const raw = (file.path || file.filename || "").trim().replace(/\\/g, "/");
    if (raw) {
      allNormalizedPaths.add(raw.toLowerCase());
      if (raw.startsWith("./")) {
        allNormalizedPaths.add(raw.slice(2).toLowerCase());
      }
    }
  }

  for (const file of allFiles) {
    const rawPath = file.path || file.filename || "";
    const pathCheck = validateSafeFilePath(rawPath);

    if (!pathCheck.isValid) {
      fileStructureValid = false;
      errors.push(pathCheck.error || `Invalid path "${rawPath}"`);
      detailedErrors.push({
        file: rawPath,
        line: 1,
        message: pathCheck.error || `Invalid path "${rawPath}"`,
        type: "error",
      });
      continue;
    }

    const content = file.content || "";
    if (content.length > 500 * 1024) {
      fileStructureValid = false;
      const msg = `File "${pathCheck.normalized}" exceeds 500 KB limit (${Math.round(content.length / 1024)} KB).`;
      errors.push(msg);
      detailedErrors.push({ file: pathCheck.normalized, line: 1, message: msg, type: "error" });
    }

    if (MAIN_SOURCE_EXTENSIONS.has(pathCheck.extension)) {
      if (content.trim().length > 0) {
        hasMainSourceFile = true;
      }
    }

    // Check JSON content if file is .json
    if (pathCheck.extension === "json") {
      try {
        JSON.parse(content);
      } catch (err: unknown) {
        fileStructureValid = false;
        const msg = `Invalid JSON in "${pathCheck.normalized}": ${err instanceof Error ? err.message : String(err)}`;
        errors.push(msg);
        detailedErrors.push({ file: pathCheck.normalized, line: 1, message: msg, type: "error" });
      }
    }

    // Check TypeScript / JavaScript Syntax
    if (["ts", "tsx", "js", "jsx"].includes(pathCheck.extension)) {
      const syntaxErrors = checkTypeScriptSyntax(pathCheck.normalized, content);
      if (syntaxErrors.length > 0) {
        fileStructureValid = false;
        for (const err of syntaxErrors) {
          const formatted = `${err.file} (Line ${err.line}): ${err.message}`;
          errors.push(formatted);
          detailedErrors.push(err);
        }
      }

      // Check for Unsafe Patterns
      for (const patternInfo of UNSAFE_PATTERNS) {
        if (patternInfo.pattern.test(content)) {
          const lines = content.split("\n");
          let matchLine = 1;
          for (let i = 0; i < lines.length; i++) {
            if (patternInfo.pattern.test(lines[i])) {
              matchLine = i + 1;
              break;
            }
          }
          const msg = `Unsafe code pattern detected: '${patternInfo.label}' is forbidden in component source files.`;
          errors.push(`${pathCheck.normalized} (Line ${matchLine}): ${msg}`);
          detailedErrors.push({
            file: pathCheck.normalized,
            line: matchLine,
            message: msg,
            type: "error",
          });
        }
      }

      // Check imports: both local import resolution and external dependencies
      const imports = extractImportedPackages(pathCheck.normalized, content);
      for (const imp of imports) {
        const specifier = imp.package.trim();
        if (specifier.startsWith(".") || specifier.startsWith("/")) {
          // Local import resolution
          const exists = resolveLocalFileExists(
            pathCheck.normalized,
            specifier,
            allNormalizedPaths
          );
          if (!exists) {
            fileStructureValid = false;
            const msg = `Missing local source file: "${specifier}" is imported in ${pathCheck.normalized} but does not exist in the component package.`;
            errors.push(`${pathCheck.normalized} (Line ${imp.line}): ${msg}`);
            detailedErrors.push({
              file: pathCheck.normalized,
              line: imp.line,
              message: msg,
              type: "error",
            });
          }
        } else {
          // External dependency
          const rootPkg = getRootPackageName(specifier);
          if (rootPkg && !(rootPkg in declaredDependencies)) {
            dependenciesValid = false;
            const msg = `Missing declared dependency: "${rootPkg}" is imported but not declared in dependencies.`;
            errors.push(`${pathCheck.normalized} (Line ${imp.line}): ${msg}`);
            detailedErrors.push({
              file: pathCheck.normalized,
              line: imp.line,
              message: msg,
              type: "error",
            });
          }
        }
      }
    }
  }

  checks.push({
    name: "Source file structure valid",
    passed: fileStructureValid,
    message: fileStructureValid ? "All file names and paths are valid" : "File structure or syntax errors detected",
  });

  checks.push({
    name: "Main component source found",
    passed: hasMainSourceFile,
    message: hasMainSourceFile
      ? "Component source file (.tsx, .ts, .jsx, .js) present and non-empty"
      : "A non-empty .tsx, .ts, .jsx, or .js source file is required",
  });

  if (!hasMainSourceFile && allFiles.length > 0) {
    errors.push("A non-empty main source file (.tsx, .ts, .jsx, .js) is required.");
    detailedErrors.push({
      message: "A non-empty main source file (.tsx, .ts, .jsx, .js) is required.",
      type: "error",
    });
  }

  // 4. Dependencies Format Check
  if (
    data.declaredDependencies &&
    typeof data.declaredDependencies === "object" &&
    !Array.isArray(data.declaredDependencies)
  ) {
    for (const [pkg, ver] of Object.entries(data.declaredDependencies)) {
      if (!isValidNpmPackageName(pkg)) {
        dependenciesValid = false;
        const msg = `Invalid or unsafe package name "${pkg}".`;
        errors.push(msg);
        detailedErrors.push({ message: msg, type: "error" });
      }
      if (typeof ver !== "string" || !isValidDependencyVersion(ver)) {
        dependenciesValid = false;
        const msg = `Invalid dependency version for package '${pkg}': "${ver}".`;
        errors.push(msg);
        detailedErrors.push({ message: msg, type: "error" });
      }
    }
  } else if (data.declaredDependencies) {
    dependenciesValid = false;
    const msg = "Declared dependencies must be a key-value record (e.g. { 'clsx': '^2.1.0' }).";
    errors.push(msg);
    detailedErrors.push({ message: msg, type: "error" });
  }

  checks.push({
    name: "Dependencies declared",
    passed: dependenciesValid,
    message: dependenciesValid
      ? "All imported and declared dependencies verified"
      : "Missing or invalid dependency declarations",
  });

  // 5. Preview Fixture Data Check
  let previewFixtureValid = true;
  if (data.previewData && data.previewData.trim() !== "") {
    try {
      const parsed = JSON.parse(data.previewData);
      if (typeof parsed !== "object" || parsed === null) {
        previewFixtureValid = false;
        const msg = "Preview fixture JSON must be an object.";
        errors.push(msg);
        detailedErrors.push({ message: msg, type: "error" });
      } else if (Array.isArray(parsed.examples)) {
        for (let i = 0; i < parsed.examples.length; i++) {
          const ex = parsed.examples[i];
          if (!ex || typeof ex !== "object") {
            previewFixtureValid = false;
            const msg = `Preview fixture example at index ${i} must be an object with name and props.`;
            errors.push(msg);
            detailedErrors.push({ message: msg, type: "error" });
          } else if (ex.props !== undefined && (typeof ex.props !== "object" || ex.props === null)) {
            previewFixtureValid = false;
            const msg = `Preview fixture example "${ex.name || i}" props must be an object.`;
            errors.push(msg);
            detailedErrors.push({ message: msg, type: "error" });
          }
        }
      }
    } catch (err: unknown) {
      previewFixtureValid = false;
      const msg = `Invalid preview fixture JSON: ${err instanceof Error ? err.message : String(err)}`;
      errors.push(msg);
      detailedErrors.push({ message: msg, type: "error" });
    }
  }

  checks.push({
    name: "Preview fixture valid",
    passed: previewFixtureValid,
    message: previewFixtureValid ? "Preview fixture JSON valid" : "Invalid preview fixture JSON",
  });

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    detailedErrors,
    checks,
  };
}
