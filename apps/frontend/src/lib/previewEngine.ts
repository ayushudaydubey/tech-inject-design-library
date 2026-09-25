/**
 * Generic Dynamic Preview Engine
 * 
 * Data-driven, source-aware preview discovery, schema introspection,
 * and fixture normalization for EVERY component in the Tech Inject Design Library.
 * 
 * Core Guarantees:
 * - ZERO hardcoded component names (no `if (slug === 'button')`, `if (slug === 'badge')`, etc.).
 * - Automatic TypeScript AST/regex type alias resolution (e.g. `size?: AvatarSize` -> `['sm', 'md', 'lg']`).
 * - Dictionary map key extraction (e.g. `sizeStyles = { sm: ..., md: ..., lg: ... }` -> prevents `reading 'container'`).
 * - Safe array normalization (prevents `Cannot read properties of undefined (reading 'map')`).
 * - Multi-example showcase generation (renders all supported variants, sizes, and states).
 * - Component layout classification (inline showcase, full-width table, card grid, overlay).
 */

export interface ComponentFileRef {
  filename?: string;
  path?: string;
  content?: string;
  fileType?: string;
}

export interface PreviewExample {
  name: string;
  description?: string;
  props: Record<string, any>;
  isDefault?: boolean;
}

export interface PropDiagnostic {
  isMissing: boolean;
  propName?: string;
  message?: string;
}

export interface ComponentTypeSchema {
  unions: Record<string, string[]>;
  booleans: string[];
  arrays: string[];
  dictionaries: Record<string, string[]>;
  requiredProps: string[];
  layoutType: "inline" | "table" | "kanban" | "card" | "overlay" | "form" | "stacked";
}

/**
 * Capitalizes string nicely for UI display labels (e.g., "primary" -> "Primary", "data-table" -> "Data Table")
 */
export function formatLabel(str: string): string {
  if (!str) return "";
  return str
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

/**
 * Resolves a TypeScript type alias definition across source files
 * Example: `type AvatarSize = 'sm' | 'md' | 'lg';` -> ["sm", "md", "lg"]
 */
export function resolveTypeAliasValues(typeName: string, sourceText: string): string[] {
  if (!typeName || !sourceText) return [];
  const cleanTypeName = typeName.trim();

  // Pattern: type TypeName = 'a' | 'b' | 'c';
  const typeRegex = new RegExp(
    `(?:export\\s+)?type\\s+${cleanTypeName}\\s*=\\s*([\\s\\S]*?);`,
    "i"
  );
  const match = typeRegex.exec(sourceText);
  if (!match) return [];

  const rawUnion = match[1];
  const stringLiterals = rawUnion.match(/['"]([^'"]+)['"]/g);
  if (!stringLiterals) return [];

  const values: string[] = [];
  for (const lit of stringLiterals) {
    const clean = lit.replace(/['"]/g, "").trim();
    if (clean && !values.includes(clean) && !clean.includes("$") && !clean.includes("{")) {
      values.push(clean);
    }
  }
  return values;
}

/**
 * Extracts ONLY top-level keys from a JavaScript/TypeScript object literal body,
 * properly tracking brace depth to avoid capturing nested object properties
 * like `container: "..."`, `text: "..."`, `dot: "..."` inside nested style definitions.
 */
export function extractTopLevelObjectKeys(dictBody: string): string[] {
  if (!dictBody) return [];
  const topKeys: string[] = [];
  const nonVariantKeys = new Set([
    "default", "classname", "style", "container", "text", "dot",
    "icon", "wrapper", "root", "base", "indicator", "content", "label"
  ]);

  let depth = 0;
  let inString: string | null = null;
  let isEscaped = false;
  let currentKey = "";
  let isCollectingKey = true;

  for (let i = 0; i < dictBody.length; i++) {
    const ch = dictBody[i];
    if (isEscaped) {
      isEscaped = false;
      continue;
    }
    if (ch === "\\") {
      isEscaped = true;
      continue;
    }
    if (inString) {
      if (ch === inString) {
        inString = null;
      } else if (depth === 0 && isCollectingKey) {
        currentKey += ch;
      }
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
      continue;
    }

    if (ch === "{" || ch === "[" || ch === "(") {
      depth++;
      isCollectingKey = false;
      continue;
    }
    if (ch === "}" || ch === "]" || ch === ")") {
      depth--;
      if (depth === 0) {
        isCollectingKey = false;
      }
      continue;
    }

    if (depth === 0) {
      if (ch === ":") {
        const cleanKey = currentKey.trim().replace(/['"]/g, "");
        if (
          cleanKey &&
          !nonVariantKeys.has(cleanKey.toLowerCase()) &&
          /^[a-zA-Z0-9_-]+$/.test(cleanKey)
        ) {
          if (!topKeys.includes(cleanKey)) {
            topKeys.push(cleanKey);
          }
        }
        currentKey = "";
        isCollectingKey = false;
      } else if (ch === "," || ch === "\n") {
        currentKey = "";
        isCollectingKey = true;
      } else if (isCollectingKey) {
        if (!/\s/.test(ch) || currentKey.length > 0) {
          currentKey += ch;
        }
      }
    }
  }

  return topKeys;
}

/**
 * Extracts union string values from TypeScript definitions and dictionary maps.
 * Handles both inline unions (`variant?: "primary" | "secondary"`)
 * and type aliases (`variant?: ButtonVariant;` -> `type ButtonVariant = ...`).
 */
export function extractUnionValues(propName: string, sourceText: string): string[] {
  if (!sourceText) return [];

  const values = new Set<string>();

  // 1. Direct inline union: prop?: "val1" | 'val2' | "val3"
  const propRegex = new RegExp(
    `(?:${propName})\\??:\\s*([\\s\\S]*?)(?:;|\\n|\\})`,
    "gi"
  );
  let match: RegExpExecArray | null;
  while ((match = propRegex.exec(sourceText)) !== null) {
    const rawUnion = match[1].trim();

    // Check for inline string literals
    const stringLiterals = rawUnion.match(/['"]([^'"]+)['"]/g);
    if (stringLiterals && stringLiterals.length > 0) {
      for (const lit of stringLiterals) {
        const clean = lit.replace(/['"]/g, "").trim();
        if (clean && !clean.includes("$") && !clean.includes("{")) {
          values.add(clean);
        }
      }
    } else {
      // If it refers to a type alias identifier (e.g. AvatarSize, ButtonVariant)
      const aliasIdentifierMatch = rawUnion.match(/^[a-zA-Z0-9_]+/);
      if (aliasIdentifierMatch) {
        const aliasName = aliasIdentifierMatch[0];
        const aliasValues = resolveTypeAliasValues(aliasName, sourceText);
        for (const v of aliasValues) {
          values.add(v);
        }
      }
    }
  }

  // 2. Dictionary maps like const variantStyles = { primary: '...', secondary: '...' }
  const dictRegex = new RegExp(
    `(?:${propName}Styles|${propName}Map|${propName}Classes|${propName}Colors)\\s*(?::\\s*Record<[^>]+>)?\\s*=\\s*\\{([\\s\\S]*?)\\};`,
    "gi"
  );
  while ((match = dictRegex.exec(sourceText)) !== null) {
    const dictBody = match[1];
    const topKeys = extractTopLevelObjectKeys(dictBody);
    for (const k of topKeys) {
      values.add(k);
    }
  }

  return Array.from(values);
}

/**
 * Checks if a boolean prop is supported in the component's TypeScript source
 */
export function isBooleanPropSupported(propName: string, sourceText: string): boolean {
  if (!sourceText) return false;
  const regex = new RegExp(`(?:${propName})\\??:\\s*boolean`, "i");
  return regex.test(sourceText);
}

/**
 * Introspects full TypeScript source to extract all schema information:
 * unions, booleans, arrays, dictionaries, and layout classification.
 */
export function introspectComponentSchema(sourceText: string): ComponentTypeSchema {
  const unions: Record<string, string[]> = {};
  const booleans: string[] = [];
  const arrays: string[] = [];
  const dictionaries: Record<string, string[]> = {};
  const requiredProps: string[] = [];

  if (!sourceText) {
    return {
      unions,
      booleans,
      arrays,
      dictionaries,
      requiredProps,
      layoutType: "inline",
    };
  }

  // 1. Detect Standard Prop Names for Unions
  const candidateUnionProps = [
    "variant", "size", "status", "position", "orientation",
    "trend", "type", "color", "align", "side", "theme"
  ];
  for (const p of candidateUnionProps) {
    const vals = extractUnionValues(p, sourceText);
    if (vals.length > 0) {
      unions[p] = vals;
    }
  }

  // 2. Detect Dictionary Maps in source (e.g. sizeStyles = { sm: ..., md: ..., lg: ... })
  const dictMapRegex = /const\s+([a-zA-Z0-9_]+Styles|[a-zA-Z0-9_]+Map|[a-zA-Z0-9_]+Colors)\s*(?::\s*Record<[^>]+>)?\s*=\s*\{([\s\S]*?)\};/g;
  let dMatch: RegExpExecArray | null;
  while ((dMatch = dictMapRegex.exec(sourceText)) !== null) {
    const mapName = dMatch[1];
    const dictBody = dMatch[2];
    const cleanKeys = extractTopLevelObjectKeys(dictBody);
    if (cleanKeys.length > 0) {
      dictionaries[mapName] = cleanKeys;
    }
  }

  // 3. Detect Booleans
  const candidateBooleans = [
    "loading", "disabled", "error", "isOpen", "open", "selectable",
    "indeterminate", "checked", "dismissible", "highlighted", "required", "sortable"
  ];
  for (const b of candidateBooleans) {
    if (isBooleanPropSupported(b, sourceText)) {
      booleans.push(b);
    }
  }

  // 4. Detect Arrays from Interface Definitions and Source Method Calls (.map / .filter)
  const arrayPropRegex = /(?:([a-zA-Z0-9_]+)\??\s*:\s*(?:[A-Za-z0-9_]+\[\]|Array<[^>]+>))/g;
  let aMatch: RegExpExecArray | null;
  while ((aMatch = arrayPropRegex.exec(sourceText)) !== null) {
    const propName = aMatch[1];
    if (propName && !arrays.includes(propName)) {
      arrays.push(propName);
    }
  }

  // Also scan source code for `.map(` and `.filter(` calls
  const mapRegex = /(?:props\.)?([a-zA-Z0-9_]+)\.(?:map|filter)\s*\(/g;
  let mMatch: RegExpExecArray | null;
  while ((mMatch = mapRegex.exec(sourceText)) !== null) {
    const propName = mMatch[1];
    if (
      propName &&
      !arrays.includes(propName) &&
      !["Array", "Object", "React", "files", "allFiles", "lines", "classes", "children", "Object.keys"].includes(propName)
    ) {
      arrays.push(propName);
    }
  }

  // 5. Layout Classification
  let layoutType: ComponentTypeSchema["layoutType"] = "inline";
  if (arrays.includes("columns") || arrays.includes("data") || arrays.includes("rows") || sourceText.includes("<table")) {
    layoutType = "table";
  } else if (arrays.includes("stages") || arrays.includes("deals") || sourceText.includes("kanban")) {
    layoutType = "kanban";
  } else if (sourceText.includes("Dialog") || sourceText.includes("Drawer") || sourceText.includes("Modal") || booleans.includes("isOpen")) {
    layoutType = "overlay";
  } else if (arrays.includes("steps") || arrays.includes("breadcrumbs") || arrays.includes("tabs")) {
    layoutType = "stacked";
  } else if (sourceText.includes("title") && sourceText.includes("value") && sourceText.includes("trend")) {
    layoutType = "card";
  } else if (sourceText.includes("label") && (sourceText.includes("<input") || sourceText.includes("<textarea") || sourceText.includes("<select"))) {
    layoutType = "form";
  } else if (unions.variant && unions.variant.length > 0) {
    layoutType = "inline";
  }

  return {
    unions,
    booleans,
    arrays,
    dictionaries,
    requiredProps,
    layoutType,
  };
}

/**
 * Provides safe sample data for arrays when missing from the preview fixture
 */
export function getSafeArrayFallback(propName: string): any[] {
  const p = propName.toLowerCase();

  if (p === "steps") {
    return [
      { label: "Account Setup", description: "Enter company credentials", status: "complete" },
      { label: "Verification", description: "Verify phone and email", status: "current" },
      { label: "Launch", description: "Review and activate workspace", status: "upcoming" },
    ];
  }
  if (p === "breadcrumbs") {
    return [
      { label: "Workspace", href: "#" },
      { label: "Settings", href: "#" },
      { label: "Integrations" },
    ];
  }
  if (p === "columns") {
    return [
      { key: "name", header: "Record Name", sortable: true },
      { key: "category", header: "Category", sortable: true },
      { key: "status", header: "Status", sortable: true },
    ];
  }
  if (p === "data" || p === "rows") {
    return [
      { id: "1", name: "Global Cloud Migration", category: "Infrastructure", status: "Active" },
      { id: "2", name: "Executive CRM Suite", category: "Software", status: "Pending" },
      { id: "3", name: "Starlight Enterprise", category: "Security", status: "Completed" },
    ];
  }
  if (p === "stages") {
    return [
      { id: "lead", name: "Qualified Leads", totalValue: 45000 },
      { id: "demo", name: "Demo Scheduled", totalValue: 82000 },
      { id: "closed", name: "Closed Won", totalValue: 120000 },
    ];
  }
  if (p === "deals") {
    return [
      { id: "d1", title: "Acme Cloud Infrastructure", value: 45000, stageId: "lead" },
      { id: "d2", title: "Starlight Enterprise License", value: 52000, stageId: "demo" },
      { id: "d3", title: "Omega Corp Q4 Contract", value: 120000, stageId: "closed" },
    ];
  }
  if (p === "tabs") {
    return [
      { id: "overview", label: "Overview" },
      { id: "activity", label: "Activity Log" },
      { id: "settings", label: "Settings" },
    ];
  }
  if (p === "options" || p === "statusoptions") {
    return [
      { label: "In Progress", value: "in_progress" },
      { label: "Under Review", value: "under_review" },
      { label: "Approved", value: "approved" },
    ];
  }
  if (p === "tags") {
    return ["Enterprise", "High Priority", "Verified"];
  }
  if (p === "features") {
    return ["Unlimited CRM pipelines", "Real-time audit log", "Dedicated enterprise SLA"];
  }
  if (p === "commands") {
    return [
      { id: "c1", title: "Create Opportunity", section: "Actions", shortcut: "⌘N" },
      { id: "c2", title: "Search Contacts", section: "Navigation", shortcut: "⌘F" },
      { id: "c3", title: "System Preferences", section: "Settings", shortcut: "⌘," },
    ];
  }
  if (p === "activities" || p === "events") {
    return [
      { id: "e1", title: "Contract signed by CFO", timestamp: "10 mins ago", type: "deal" },
      { id: "e2", title: "Technical demo completed", timestamp: "2 hours ago", type: "meeting" },
      { id: "e3", title: "Security review approved", timestamp: "Yesterday", type: "audit" },
    ];
  }

  // Generic 3-item fallback for any other unknown array prop:
  return [
    { id: "1", label: "Item 1", title: "Item 1", value: "value-1" },
    { id: "2", label: "Item 2", title: "Item 2", value: "value-2" },
    { id: "3", label: "Item 3", title: "Item 3", value: "value-3" },
  ];
}

/**
 * Validates whether required collection props (.map / .filter) are present in props
 */
export function validateRequiredProps(
  sourceText: string,
  props: Record<string, any>
): PropDiagnostic {
  if (!sourceText || !props) return { isMissing: false };

  const collectionRegex = /(?:props\.)?([a-zA-Z0-9_]+)\.(?:map|filter)\s*\(/g;
  let match: RegExpExecArray | null;
  const inspectedProps = new Set<string>();

  while ((match = collectionRegex.exec(sourceText)) !== null) {
    const propName = match[1];
    if (
      ["Array", "Object", "React", "files", "allFiles", "lines", "classes", "children"].includes(
        propName
      )
    ) {
      continue;
    }
    if (inspectedProps.has(propName)) continue;
    inspectedProps.add(propName);

    const val = props[propName];
    if (val === undefined || (val !== null && typeof val !== "object" && !Array.isArray(val))) {
      return {
        isMissing: true,
        propName,
        message: `Preview fixture is missing required collection prop: "${propName}". Please provide an array for this property in the fixture.`,
      };
    }
  }

  return { isMissing: false };
}

/**
 * Main generic discovery engine: Produces all relevant preview examples from
 * fixture data, TypeScript definitions, and source files.
 */
export function discoverPreviewExamples(input: {
  previewData?: string;
  sourceFiles?: ComponentFileRef[];
  supportingFiles?: ComponentFileRef[];
  propsDocumentation?: string;
  name?: string;
}): PreviewExample[] {
  const {
    previewData = "",
    sourceFiles = [],
    supportingFiles = [],
    propsDocumentation = "",
    name = "Component",
  } = input;

  let parsedFixture: any = {};
  if (previewData && previewData.trim().length > 0) {
    try {
      parsedFixture = JSON.parse(previewData);
    } catch (e) {
      console.warn("[PreviewEngine] Invalid JSON fixture:", e);
    }
  }

  // Combine all source & types code for source-driven analysis
  const combinedSource = [
    ...sourceFiles.map((f) => f.content || ""),
    ...supportingFiles.map((f) => f.content || ""),
    propsDocumentation || "",
  ].join("\n");

  const schema = introspectComponentSchema(combinedSource);

  // 1. Explicit Examples Array provided in Fixture
  if (Array.isArray(parsedFixture.examples) && parsedFixture.examples.length > 0) {
    return parsedFixture.examples.map((item: any, idx: number) => {
      const exName = item.name || `Example ${idx + 1}`;
      const exProps = item.props && typeof item.props === "object" ? { ...item.props } : { ...item };
      
      // Auto-normalize any missing array props
      for (const arrKey of schema.arrays) {
        if (exProps[arrKey] === undefined) {
          exProps[arrKey] = getSafeArrayFallback(arrKey);
        }
      }

      return {
        name: exName,
        description: item.description,
        props: exProps,
        isDefault: idx === 0,
      };
    });
  }

  const baseProps =
    typeof parsedFixture === "object" && parsedFixture !== null && !Array.isArray(parsedFixture)
      ? { ...parsedFixture }
      : {};

  delete baseProps.examples;

  // Auto-normalize missing array props in baseProps
  for (const arrKey of schema.arrays) {
    if (baseProps[arrKey] === undefined) {
      baseProps[arrKey] = getSafeArrayFallback(arrKey);
    }
  }

  // Safe defaults for overlay components
  if (schema.booleans.includes("isOpen") && baseProps.isOpen === undefined) {
    baseProps.isOpen = true;
  }

  // 2. Explicit Variants Array provided in Fixture
  if (Array.isArray(parsedFixture.variants) && parsedFixture.variants.length > 0) {
    const { variants, ...restProps } = baseProps;
    return variants.map((v: string, idx: number) => ({
      name: formatLabel(v),
      props: { ...restProps, variant: v },
      isDefault: idx === 0,
    }));
  }

  // 3. Source-Driven Discovery: Extract union variants from TypeScript types / interfaces
  const detectedVariants = schema.unions.variant || [];
  const detectedSizes = schema.unions.size || [];
  const detectedStatuses = schema.unions.status || [];
  const supportsLoading = schema.booleans.includes("loading");
  const supportsDisabled = schema.booleans.includes("disabled");
  const supportsError = schema.booleans.includes("error");

  const examples: PreviewExample[] = [];

  // A. Component with Variants (e.g. Button, Badge, Toast, Notification Banner)
  if (detectedVariants.length > 0) {
    for (let i = 0; i < detectedVariants.length; i++) {
      const v = detectedVariants[i];
      examples.push({
        name: formatLabel(v),
        props: {
          ...baseProps,
          variant: v,
        },
        isDefault: i === 0,
      });
    }

    if (supportsLoading) {
      examples.push({
        name: "Loading",
        description: "Active loading state",
        props: {
          ...baseProps,
          variant: detectedVariants[0] || baseProps.variant,
          loading: true,
        },
      });
    }

    if (supportsDisabled) {
      examples.push({
        name: "Disabled",
        description: "Disabled interaction state",
        props: {
          ...baseProps,
          variant: detectedVariants[0] || baseProps.variant,
          disabled: true,
        },
      });
    }

    if (supportsError && !detectedVariants.includes("error")) {
      examples.push({
        name: "Error State",
        description: "Validation error state",
        props: {
          ...baseProps,
          error: true,
        },
      });
    }

    if (detectedSizes.length > 1) {
      for (const s of detectedSizes) {
        if (s === "md" || s === "medium") continue;
        examples.push({
          name: `Size: ${formatLabel(s)}`,
          props: {
            ...baseProps,
            variant: detectedVariants[0] || baseProps.variant,
            size: s,
          },
        });
      }
    }

    return examples;
  }

  // B. Component with Sizes and/or Statuses (e.g. Avatar)
  if (detectedSizes.length > 1 || detectedStatuses.length > 1) {
    if (detectedSizes.length > 1) {
      for (let i = 0; i < detectedSizes.length; i++) {
        const s = detectedSizes[i];
        examples.push({
          name: `Size: ${formatLabel(s)}`,
          props: {
            ...baseProps,
            size: s,
          },
          isDefault: i === 0,
        });
      }
    }

    if (detectedStatuses.length > 1) {
      for (let i = 0; i < detectedStatuses.length; i++) {
        const st = detectedStatuses[i];
        examples.push({
          name: `Status: ${formatLabel(st)}`,
          props: {
            ...baseProps,
            status: st,
          },
        });
      }
    }

    // Avatar initials fallback example if it accepts src and name
    if (baseProps.src && baseProps.name) {
      const { src, ...noSrcProps } = baseProps;
      examples.push({
        name: "Initials Fallback",
        description: "Automatic high-contrast fallback when image is omitted",
        props: noSrcProps,
      });
    }

    if (supportsDisabled) {
      examples.push({
        name: "Disabled",
        props: { ...baseProps, disabled: true },
      });
    }

    return examples;
  }

  // C. Component with boolean states (e.g. Switch, Checkbox, Dialog, Drawer)
  const supportsChecked = schema.booleans.includes("checked");
  if (supportsDisabled || supportsLoading || supportsError || schema.booleans.includes("isOpen") || supportsChecked) {
    examples.push({
      name: supportsChecked ? "Checked" : "Default",
      props: supportsChecked ? { ...baseProps, checked: true } : { ...baseProps },
      isDefault: true,
    });

    if (supportsChecked) {
      examples.push({
        name: "Unchecked",
        props: { ...baseProps, checked: false },
      });
    }

    if (supportsDisabled) {
      examples.push({
        name: "Disabled",
        props: { ...baseProps, disabled: true },
      });
    }

    if (supportsLoading) {
      examples.push({
        name: "Loading",
        props: { ...baseProps, loading: true },
      });
    }

    if (supportsError) {
      examples.push({
        name: "Error",
        props: { ...baseProps, error: "Invalid value provided" },
      });
    }

    return examples;
  }

  // Fallback: Single Default Example with whatever baseProps are defined
  return [
    {
      name: formatLabel(name) || "Default",
      props: baseProps,
      isDefault: true,
    },
  ];
}
