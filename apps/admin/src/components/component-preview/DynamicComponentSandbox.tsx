"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  discoverPreviewExamples,
  PreviewExample,
  validateRequiredProps,
  introspectComponentSchema,
  getSafeArrayFallback,
} from "../../lib/previewEngine";

export interface ComponentFile {
  filename: string;
  path?: string;
  content: string;
  fileType: string;
}

export interface DynamicComponentSandboxProps {
  name: string;
  slug?: string;
  previewData?: string;
  sourceFiles?: ComponentFile[];
  supportingFiles?: ComponentFile[];
  themeFiles?: ComponentFile[];
  declaredDependencies?: Record<string, string>;
  mainComponentFile?: string;
  propsDocumentation?: string;
  viewportMode?: "desktop" | "tablet" | "mobile";
  className?: string;
}

/**
 * Safely serialize data into JavaScript/HTML source, escaping `<` as `\u003c`
 * to strictly prevent any `</script>` tag breakout in srcdoc.
 */
function safeJsonSerialize(val: unknown): string {
  return JSON.stringify(val).replace(/</g, "\\u003c");
}

/**
 * Validate that the generated JavaScript in the srcdoc is structurally valid
 * before mounting it into an iframe, without using eval() or new Function().
 */
export function validateSandboxScript(htmlDoc: string): { isValid: boolean; error?: string } {
  try {
    const scriptMatches = htmlDoc.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi);
    if (!scriptMatches) return { isValid: true };

    for (const tag of scriptMatches) {
      if (/\bsrc\s*=/i.test(tag)) continue;
      const innerCode = tag.replace(/<script\b[^>]*>/i, "").replace(/<\/script>/i, "");
      
      let paren = 0;
      let brace = 0;
      let bracket = 0;
      let inString: string | null = null;
      let isEscaped = false;

      for (let i = 0; i < innerCode.length; i++) {
        const ch = innerCode[i];
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
          }
          continue;
        }
        if (ch === '"' || ch === "'" || ch === "`") {
          inString = ch;
          continue;
        }
        if (ch === "(") paren++;
        else if (ch === ")") paren--;
        else if (ch === "{") brace++;
        else if (ch === "}") brace--;
        else if (ch === "[") bracket++;
        else if (ch === "]") bracket--;
      }

      if (paren !== 0 || brace !== 0 || bracket !== 0) {
        return { isValid: false, error: "Unbalanced brackets or syntax error in preview script template." };
      }
    }
    return { isValid: true };
  } catch (err: unknown) {
    return { isValid: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Builds an isolated, sandboxed HTML document string with Babel, React, Tailwind,
 * Lucide icon shims, Generic Props Normalizer, Interactive State Manager, and Error Boundary.
 */
export function buildSandboxDoc(props: DynamicComponentSandboxProps): string {
  const {
    name,
    previewData = "{}",
    sourceFiles = [],
    supportingFiles = [],
    themeFiles = [],
    mainComponentFile,
    slug = "component",
  } = props;

  // Collect all files into a lookup list
  const allFiles: ComponentFile[] = [...sourceFiles, ...supportingFiles, ...themeFiles];
  
  // Extract ALL CSS files from themeFiles, supportingFiles, and sourceFiles
  const customCss = allFiles
    .filter((f) => {
      const fn = (f.path || f.filename || "").toLowerCase();
      return fn.endsWith(".css") || fn.endsWith(".scss");
    })
    .map((f) => f.content || "")
    .join("\n\n");

  // Determine main component file
  let mainFile = mainComponentFile;
  if (!mainFile && sourceFiles.length > 0) {
    const tsxOrJsx = sourceFiles.find((f) => {
      const fn = (f.path || f.filename || "").toLowerCase();
      return fn.endsWith(".tsx") || fn.endsWith(".jsx");
    });
    mainFile = (tsxOrJsx || sourceFiles[0]).path || (tsxOrJsx || sourceFiles[0]).filename;
  }

  // Combine all source code for AST schema analysis
  const combinedSource = allFiles.map((f) => f.content || "").join("\n");
  const schema = introspectComponentSchema(combinedSource);

  // Discover all relevant preview examples from fixture, TypeScript definitions, and source
  const discoveredExamples = discoverPreviewExamples({
    previewData,
    sourceFiles,
    supportingFiles,
    propsDocumentation: props.propsDocumentation,
    name,
  });

  // Safe JSON serialization of files, props, schema, and discovered examples
  const serializedFiles = safeJsonSerialize(
    allFiles.map((f) => ({
      name: f.filename,
      path: f.path || f.filename,
      content: f.content,
      type: f.fileType,
    }))
  );
  const serializedMainFile = safeJsonSerialize(mainFile || "");
  const serializedPreviewData = safeJsonSerialize(previewData || "{}");
  const serializedComponentName = safeJsonSerialize(name || "Component");
  const serializedSlug = safeJsonSerialize(slug || "component");
  const serializedCustomCss = safeJsonSerialize(customCss);
  const serializedExamples = safeJsonSerialize(discoveredExamples);
  const serializedSchema = safeJsonSerialize(schema);

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Component Sandbox</title>
  
  <!-- Google Fonts: Inter & JetBrains Mono for exact design typography -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            zinc: {
              750: '#303036',
              850: '#1d1d20',
            },
            brand: {
              50: '#eef2ff',
              100: '#e0e7ff',
              500: '#6366f1',
              600: '#4f46e5',
              700: '#4338ca',
              900: '#312e81',
            }
          },
          fontFamily: {
            sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          }
        }
      }
    };
  </script>

  <!-- React 18 & ReactDOM UMD -->
  <script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
  <!-- Babel Standalone for runtime compilation -->
  <script src="https://unpkg.com/@babel/standalone@7.24.0/babel.min.js"></script>

  <style>
    :root {
      --background: #18181b;
      --surface: #27272a;
      --surface-muted: #27272a;
      --border: #3f3f46;
      --text-primary: #f4f4f5;
      --text-secondary: #e4e4e7;
      --text-muted: #a1a1aa;
      --accent-blue: #bfdbfe;
      --success: #86efac;
    }

    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #f1f5f9;
      box-sizing: border-box;
      overflow-x: hidden;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(148, 163, 184, 0.2) transparent;
    }
    html::-webkit-scrollbar, body::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    html::-webkit-scrollbar-thumb, body::-webkit-scrollbar-thumb {
      background: rgba(148, 163, 184, 0.2);
      border-radius: 3px;
    }
    #root {
      min-height: 100%;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 24px;
      box-sizing: border-box;
    }
    .sandbox-error {
      width: 100%;
      max-width: 520px;
      margin: auto;
      padding: 18px 20px;
      border-radius: 12px;
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(239, 68, 68, 0.4);
      box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.5);
      text-align: left;
    }
    .sandbox-error h4 {
      margin: 0 0 6px 0;
      color: #f87171;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.025em;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .sandbox-error p {
      margin: 0;
      color: #cbd5e1;
      font-size: 12px;
      line-height: 1.5;
    }
    .sandbox-error pre {
      margin: 10px 0 0 0;
      padding: 8px 10px;
      background: #020617;
      border-radius: 6px;
      color: #fca5a5;
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .showcase-toolbar {
      display: flex;
      align-items: center;
      gap: 6px;
      overflow-x: auto;
      padding: 6px 12px;
      margin-bottom: 22px;
      border-radius: 9999px;
      background: rgba(24, 24, 27, 0.85);
      border: 1px solid rgba(63, 63, 70, 0.5);
      max-width: 100%;
      backdrop-filter: blur(8px);
    }
    .showcase-pill {
      padding: 4px 11px;
      font-size: 11px;
      font-weight: 500;
      border-radius: 9999px;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
      border: 1px solid transparent;
      outline: none;
    }
    .showcase-pill-active {
      background: #4f46e5;
      color: #ffffff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
    .showcase-pill-inactive {
      background: rgba(39, 39, 42, 0.6);
      color: #a1a1aa;
      border-color: rgba(63, 63, 70, 0.4);
    }
    .showcase-pill-inactive:hover {
      background: #27272a;
      color: #f4f4f5;
    }
    .example-frame {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 18px;
      background: rgba(24, 24, 27, 0.45);
      border: 1px solid rgba(63, 63, 70, 0.4);
      border-radius: 12px;
      position: relative;
      min-width: 120px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .example-frame:hover {
      border-color: rgba(99, 102, 241, 0.45);
    }
    .example-badge {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #a1a1aa;
      background: rgba(39, 39, 42, 0.85);
      padding: 2px 7px;
      border-radius: 4px;
      border: 1px solid rgba(63, 63, 70, 0.45);
      margin-bottom: 10px;
      align-self: flex-start;
    }
    .event-toast {
      position: fixed;
      bottom: 14px;
      right: 14px;
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(99, 102, 241, 0.5);
      color: #e0e7ff;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      z-index: 9999;
      animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>
  <div id="root">
    <div id="loading-spinner" style="color: #64748b; font-size: 12px; display: flex; align-items: center; gap: 8px;">
      <svg style="animation: spin 1s linear infinite; width: 18px; height: 18px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Initializing preview...</span>
    </div>
  </div>

  <script>
    (function() {
      var files = ${serializedFiles};
      var mainFileName = ${serializedMainFile};
      var rawPreviewData = ${serializedPreviewData};
      var componentName = ${serializedComponentName};
      var componentSlug = ${serializedSlug};
      var customCssContent = ${serializedCustomCss};
      var componentExamples = ${serializedExamples};
      var componentSchema = ${serializedSchema};

      // Safely inject custom theme CSS
      if (customCssContent) {
        var styleEl = document.createElement('style');
        styleEl.setAttribute('data-theme-css', 'true');
        styleEl.textContent = customCssContent;
        document.head.appendChild(styleEl);
      }

      function escapeHtml(str) {
        if (!str) return '';
        return String(str)
          .split('&').join('&amp;')
          .split('<').join('&lt;')
          .split('>').join('&gt;')
          .split('"').join('&quot;');
      }

      function stripLeadingPath(str) {
        if (!str) return '';
        var s = String(str);
        while (s.indexOf('./') === 0) {
          s = s.slice(2);
        }
        while (s.indexOf('/') === 0) {
          s = s.slice(1);
        }
        return s;
      }

      function sanitizeAlphaNumeric(str) {
        if (!str) return '';
        return String(str).toLowerCase().split('').filter(function(c) {
          return (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9');
        }).join('');
      }

      function renderError(title, reason, details) {
        var root = document.getElementById('root');
        if (!root) return;
        var detailsHtml = details ? '<pre>' + escapeHtml(details) + '</pre>' : '';
        root.innerHTML = 
          '<div class="sandbox-error">' +
            '<h4><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>' + escapeHtml(title) + '</h4>' +
            '<p><strong>Reason:</strong> ' + escapeHtml(reason) + '</p>' +
            detailsHtml +
            '<button type="button" onclick="window.retryPreview()" style="margin-top: 12px; padding: 6px 12px; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 6px; color: #fca5a5; font-size: 11px; font-weight: 600; cursor: pointer;">Retry Preview</button>' +
          '</div>';
        try {
          window.parent.postMessage({ type: 'PREVIEW_ERROR', slug: componentSlug, error: reason + (details ? ': ' + details : '') }, '*');
        } catch(e) {}
      }

      window.retryPreview = function() {
        try {
          window.parent.postMessage({ type: 'PREVIEW_RETRY', slug: componentSlug }, '*');
        } catch(e) {}
        var root = document.getElementById('root');
        if (root) {
          root.innerHTML = '<div id="loading-spinner" style="color: #64748b; font-size: 12px; display: flex; align-items: center; gap: 8px;"><svg style="animation: spin 1s linear infinite; width: 18px; height: 18px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Initializing preview...</span></div>';
        }
        retryCount = 0;
        startExecution();
      };

      var retryCount = 0;
      var maxRetries = 200;
      function startExecution() {
        if (typeof window.React === 'undefined' || typeof window.ReactDOM === 'undefined' || typeof window.Babel === 'undefined') {
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(startExecution, 50);
            return;
          }
          if (typeof window.React === 'undefined' || typeof window.ReactDOM === 'undefined') {
            renderError('Preview failed to initialize', 'React runtime could not be loaded in sandbox within timeout.');
            return;
          }
          if (typeof window.Babel === 'undefined') {
            renderError('Preview failed to initialize', 'Babel compiler could not be loaded in sandbox within timeout.');
            return;
          }
        }
        executeSandbox();
      }

      function executeSandbox() {
        try {
          // Module resolution cache
          var moduleCache = {};

          // Comprehensive Lucide React Icon Shim
          var lucideIconCache = {};
          function createLucideIcon(iconName) {
            if (lucideIconCache[iconName]) return lucideIconCache[iconName];

            var iconPaths = {
              Loader2: '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
              Loader: '<line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>',
              Check: '<polyline points="20 6 9 17 4 12" />',
              CheckCheck: '<path d="M18 6 7 17l-5-5" /><path d="m22 10-7.5 7.5L13 16" />',
              CheckCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
              CheckCircle2: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
              X: '<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />',
              XCircle: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
              XOctagon: '<polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
              AlertCircle: '<circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />',
              AlertTriangle: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />',
              AlertOctagon: '<polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
              Info: '<circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />',
              HelpCircle: '<circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />',
              ChevronDown: '<polyline points="6 9 12 15 18 9" />',
              ChevronRight: '<polyline points="9 18 15 12 9 6" />',
              ChevronUp: '<polyline points="18 15 12 9 6 15" />',
              ChevronLeft: '<polyline points="15 18 9 12 15 6" />',
              ChevronFirst: '<polyline points="17 18 11 12 17 6"/><line x1="7" y1="6" x2="7" y2="18"/>',
              ChevronLast: '<polyline points="7 6 13 12 7 18"/><line x1="17" y1="6" x2="17" y2="18"/>',
              ArrowRight: '<line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />',
              ArrowLeft: '<line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />',
              ArrowUpDown: '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>',
              ArrowUp: '<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>',
              ArrowDown: '<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>',
              ArrowUpRight: '<line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>',
              ArrowDownRight: '<line x1="7" y1="7" x2="17" y2="17"/><polyline points="17 7 17 7 17 17"/>',
              Search: '<circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />',
              SlidersHorizontal: '<line x1="21" y1="4" x2="14" y2="4"/><line x1="10" y1="4" x2="3" y2="4"/><line x1="21" y1="12" x2="12" y2="12"/><line x1="8" y1="12" x2="3" y2="12"/><line x1="21" y1="20" x2="16" y2="20"/><line x1="12" y1="20" x2="3" y2="20"/><line x1="14" y1="2" x2="14" y2="6"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="16" y1="18" x2="16" y2="22"/>',
              Filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
              RotateCcw: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
              RefreshCw: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
              Bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />',
              Calendar: '<rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />',
              CalendarDays: '<rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
              User: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />',
              Users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />',
              UserCheck: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>',
              Sparkles: '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />',
              Copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />',
              Trash: '<path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />',
              Trash2: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
              Plus: '<line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />',
              Minus: '<line x1="5" y1="12" x2="19" y2="12" />',
              ExternalLink: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />',
              Shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />',
              Star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />',
              Upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
              Download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
              FileText: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
              File: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
              Folder: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>',
              Phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
              Mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
              Inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
              Building2: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
              Building: '<rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>',
              Clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
              MoreVertical: '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>',
              MoreHorizontal: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
              Layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
              Table: '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>',
              Eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
              EyeOff: '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>',
              Lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
              Unlock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
              Key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
              Tag: '<path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><circle cx="7" cy="7" r=".5" fill="currentColor"/>',
              Globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
              Link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
              Settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
              TrendingUp: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />',
              TrendingDown: '<polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" />',
            };

            var pathInner = iconPaths[iconName] || '<circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />';
            
            var IconComponent = React.forwardRef(function(props, ref) {
              var size = props.size || props.width || 18;
              var className = props.className || '';
              var color = props.color || 'currentColor';
              var strokeWidth = props.strokeWidth || 2;
              
              return React.createElement('svg', {
                ref: ref,
                xmlns: 'http://www.w3.org/2000/svg',
                width: size,
                height: size,
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: color,
                strokeWidth: strokeWidth,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                className: className,
                dangerouslySetInnerHTML: { __html: pathInner },
              });
            });
            IconComponent.displayName = iconName;
            lucideIconCache[iconName] = IconComponent;
            return IconComponent;
          }

          var LucideProxy = new Proxy({}, {
            get: function(target, prop) {
              if (typeof prop === 'string') {
                if (prop === '__esModule') return true;
                if (prop === 'default') return LucideProxy;
                return createLucideIcon(prop);
              }
              return undefined;
            }
          });

          // clsx & classnames shim
          function clsx() {
            var classes = [];
            for (var i = 0; i < arguments.length; i++) {
              var arg = arguments[i];
              if (!arg) continue;
              var argType = typeof arg;
              if (argType === 'string' || argType === 'number') {
                classes.push(arg);
              } else if (Array.isArray(arg)) {
                if (arg.length) {
                  var inner = clsx.apply(null, arg);
                  if (inner) classes.push(inner);
                }
              } else if (argType === 'object') {
                for (var key in arg) {
                  if (Object.prototype.hasOwnProperty.call(arg, key) && arg[key]) {
                    classes.push(key);
                  }
                }
              }
            }
            return classes.join(' ');
          }
          clsx.default = clsx;
          clsx.clsx = clsx;
          clsx.__esModule = true;

          // cva shim
          function cva(base, config) {
            return function(props) {
              props = props || {};
              var result = [base];
              if (config && config.variants) {
                for (var variantName in config.variants) {
                  var val = props[variantName] !== undefined ? props[variantName] : (config.defaultVariants && config.defaultVariants[variantName]);
                  if (val !== undefined && config.variants[variantName][val]) {
                    result.push(config.variants[variantName][val]);
                  }
                }
              }
              if (props.className) {
                result.push(props.className);
              }
              return clsx(result);
            };
          }
          cva.default = cva;
          cva.cva = cva;
          cva.__esModule = true;

          // React Module Object with interop
          var ReactModule = Object.assign({}, window.React, {
            default: window.React,
            __esModule: true,
          });

          var ReactDOMModule = Object.assign({}, window.ReactDOM, {
            default: window.ReactDOM,
            __esModule: true,
          });

          // In-Memory CommonJS Require Resolver
          function resolveModule(specifier, currentFilePath) {
            if (specifier === 'react') return ReactModule;
            if (specifier === 'react-dom' || specifier === 'react-dom/client') return ReactDOMModule;
            if (specifier === 'react/jsx-runtime') {
              return {
                jsx: window.React.createElement,
                jsxs: window.React.createElement,
                Fragment: window.React.Fragment,
                default: {
                  jsx: window.React.createElement,
                  jsxs: window.React.createElement,
                  Fragment: window.React.Fragment,
                },
                __esModule: true,
              };
            }
            if (specifier === 'lucide-react') return LucideProxy;
            if (specifier === 'clsx' || specifier === 'classnames') return clsx;
            if (specifier === 'tailwind-merge') return Object.assign(clsx, { twMerge: clsx, default: clsx, __esModule: true });
            if (specifier === 'class-variance-authority') return cva;

            if (specifier.indexOf('@dnd-kit/') === 0) {
              return {
                DndContext: function(p) { return p.children; },
                useDroppable: function() { return { setNodeRef: function() {}, isOver: false }; },
                useDraggable: function() { return { setNodeRef: function() {}, attributes: {}, listeners: {}, transform: null }; },
                DragOverlay: function(p) { return p.children; },
                default: { DndContext: function(p) { return p.children; } },
                __esModule: true,
              };
            }

            if (specifier === 'framer-motion') {
              var motionProxy = new Proxy({}, {
                get: function(target, prop) {
                  if (prop === '__esModule') return true;
                  return function(props) {
                    return window.React.createElement(prop === 'default' ? 'div' : prop, props);
                  };
                }
              });
              return {
                motion: motionProxy,
                AnimatePresence: function(p) { return p.children; },
                default: { motion: motionProxy },
                __esModule: true,
              };
            }

            // Relative local files (e.g. ./types, ./utils, ./styles.css)
            if (specifier.indexOf('.') === 0 || specifier.indexOf('/') === 0) {
              var cleanSpec = stripLeadingPath(specifier);
              var candidates = [
                cleanSpec,
                cleanSpec + '.ts',
                cleanSpec + '.tsx',
                cleanSpec + '.js',
                cleanSpec + '.jsx',
                cleanSpec + '.css',
                cleanSpec + '.json',
                cleanSpec + '/index.ts',
                cleanSpec + '/index.tsx',
                cleanSpec + '/index.js',
              ];

              var foundFile = null;
              for (var i = 0; i < candidates.length; i++) {
                var cand = candidates[i].toLowerCase();
                foundFile = files.find(function(f) {
                  var p = stripLeadingPath((f.path || f.name || '').toLowerCase());
                  return p === cand || p.endsWith('/' + cand);
                });
                if (foundFile) break;
              }

              if (!foundFile) {
                throw new Error('Missing local file "' + specifier + '" referenced in "' + currentFilePath + '".');
              }

              var filePathKey = foundFile.path || foundFile.name;
              if (moduleCache[filePathKey]) {
                return moduleCache[filePathKey];
              }

              // If JSON
              if (foundFile.name.endsWith('.json') || (foundFile.path && foundFile.path.endsWith('.json'))) {
                try {
                  var parsedJson = JSON.parse(foundFile.content || '{}');
                  moduleCache[filePathKey] = Object.assign({ default: parsedJson, __esModule: true }, parsedJson);
                  return moduleCache[filePathKey];
                } catch(e) {
                  throw new Error('Invalid JSON in local file "' + filePathKey + '": ' + e.message);
                }
              }

              // If CSS
              if (foundFile.name.endsWith('.css') || (foundFile.path && foundFile.path.endsWith('.css'))) {
                var styleEl = document.createElement('style');
                styleEl.textContent = foundFile.content || '';
                document.head.appendChild(styleEl);
                moduleCache[filePathKey] = { __esModule: true, default: {} };
                return moduleCache[filePathKey];
              }

              // Transpile TSX/TS/JS with CommonJS transform
              var transformed;
              try {
                transformed = Babel.transform(foundFile.content || '', {
                  presets: [
                    ['env', { modules: 'commonjs' }],
                    ['typescript', { isTSX: true, allExtensions: true }],
                    ['react', { runtime: 'classic' }],
                  ],
                  filename: filePathKey,
                }).code;
              } catch(transpileErr) {
                try {
                  transformed = Babel.transform(foundFile.content || '', {
                    presets: [
                      'env',
                      ['typescript', { isTSX: true, allExtensions: true }],
                      'react',
                    ],
                    filename: filePathKey,
                  }).code;
                } catch(e2) {
                  throw new Error('Compilation error in "' + filePathKey + '": ' + transpileErr.message);
                }
              }

              var localModule = { exports: {} };
              var localRequire = function(subSpec) {
                return resolveModule(subSpec, filePathKey);
              };

              try {
                var execFn = new Function('exports', 'require', 'module', 'React', transformed);
                execFn(localModule.exports, localRequire, localModule, window.React);
                moduleCache[filePathKey] = localModule.exports;
                return localModule.exports;
              } catch(execErr) {
                throw new Error('Execution error in "' + filePathKey + '": ' + execErr.message);
              }
            }

            // Generic fallback for any other unshimmed NPM package
            console.warn('[Preview Dependency Shim]', specifier);
            return new Proxy({}, {
              get: function(t, k) {
                if (k === '__esModule') return true;
                if (k === 'default') return function(props) { return window.React.createElement('div', props); };
                return function(props) { return (props && props.children) ? props.children : null; };
              }
            });
          }

          // GENERIC PROPS NORMALIZER & SAFE ADAPTER
          function normalizeComponentProps(rawProps, cName, onEvent, schema) {
            var p = Object.assign({}, rawProps);
            schema = schema || {};

            // 1. Generic Safe Callbacks for any handler
            var knownHandlers = [
              'onSearchChange', 'onStatusChange', 'onReset', 'onChange', 'onSelect',
              'onClose', 'onOpen', 'onToggle', 'onDismiss', 'onAction', 'onClick',
              'onPageChange', 'onFileSelect', 'onCardClick', 'onItemClick',
              'onSelectionChange', 'onSubmit', 'onFilterChange', 'onDealMove',
              'onDragEnd', 'onTabChange', 'onStepClick', 'onNavigate'
            ];
            for (var i = 0; i < knownHandlers.length; i++) {
              var h = knownHandlers[i];
              if (typeof p[h] !== 'function') {
                p[h] = (function(name) {
                  return function() {
                    if (onEvent) onEvent(name, arguments[0]);
                    console.log('[Action Event]', name, arguments);
                  };
                })(h);
              }
            }

            // 2. Safe Dictionary Guarding: prevents Cannot read properties of undefined (reading container)
            // If component defines sizeStyles or variantStyles, ensure props[key] is one of the valid keys
            if (schema.dictionaries) {
              for (var dName in schema.dictionaries) {
                var rawValidKeys = schema.dictionaries[dName];
                if (rawValidKeys && rawValidKeys.length > 0) {
                  var validKeys = rawValidKeys.filter(function(k) {
                    return !['container', 'text', 'dot', 'icon', 'wrapper', 'root', 'base', 'default', 'className', 'style'].includes(k.toLowerCase());
                  });
                  if (validKeys.length > 0) {
                    var targetProp = dName.replace(/Styles|Map|Colors/i, '').toLowerCase();
                    if (p[targetProp] !== undefined && !validKeys.includes(p[targetProp])) {
                      // Fallback to 'md' or first valid key
                      p[targetProp] = validKeys.includes('md') ? 'md' : validKeys[0];
                    }
                  }
                }
              }
            }

            // 3. Safe array guarding: guarantees no .map() or .filter() crash
            var standardArrayKeys = [
              'items', 'tabs', 'stages', 'deals', 'events', 'commands', 'columns',
              'data', 'rows', 'options', 'statusOptions', 'tags', 'selectedFiles',
              'features', 'steps', 'breadcrumbs', 'activities'
            ];
            var allArraysToCheck = Array.from(new Set(standardArrayKeys.concat(schema.arrays || [])));
            for (var k = 0; k < allArraysToCheck.length; k++) {
              var ak = allArraysToCheck[k];
              if (p[ak] !== undefined && !Array.isArray(p[ak])) {
                p[ak] = [];
              }
            }

            // 4. Safe defaults for modal/overlay components so preview renders visible UI
            if (p.isOpen === undefined && schema.booleans && schema.booleans.includes('isOpen')) {
              p.isOpen = true;
            }

            // 5. Generic Children & Void Element Safeguarding (prevents React error #137 on <input>)
            var isVoidInputElement = p.type === 'checkbox' ||
                                     p.type === 'radio' ||
                                     p.checked !== undefined ||
                                     (cName && /checkbox|radio|switch|input|slider/i.test(cName));
            if (isVoidInputElement) {
              delete p.children;
            } else if (p.children === undefined) {
              if (p.targetText && typeof p.targetText === 'string') {
                p.children = p.targetText;
              }
            }

            return p;
          }

          // React Error Boundary Class for Isolated Per-Example Failure Handling
          class ErrorBoundary extends React.Component {
            constructor(props) {
              super(props);
              this.state = { hasError: false, error: null };
            }
            static getDerivedStateFromError(error) {
              return { hasError: true, error: error };
            }
            componentDidCatch(error, errorInfo) {
              console.error("Preview render error:", error, errorInfo);
            }
            render() {
              if (this.state.hasError) {
                var err = this.state.error;
                var msg = (err && err.message) || 'Unable to render this preview.';
                return React.createElement('div', { className: 'sandbox-error' },
                  React.createElement('h4', null,
                    React.createElement('svg', { width: 16, height: 16, fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
                      React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' })
                    ),
                    'Preview unavailable'
                  ),
                  React.createElement('p', null,
                    React.createElement('strong', null, 'Component: '),
                    componentName,
                    this.props.exampleName ? ' | Example: ' + this.props.exampleName : ''
                  ),
                  React.createElement('p', { style: { marginTop: '4px' } },
                    React.createElement('strong', null, 'Reason: '),
                    msg
                  ),
                  React.createElement('button', {
                    type: 'button',
                    style: {
                      marginTop: '10px',
                      padding: '4px 10px',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: '6px',
                      color: '#fca5a5',
                      fontSize: '11px',
                      cursor: 'pointer'
                    },
                    onClick: () => this.setState({ hasError: false, error: null })
                  }, 'Retry')
                );
              }
              return this.props.children;
            }
          }

          // 1. Single Example Component Instance with Live Interaction
          function SingleExampleInstance(props) {
            var Component = props.Component;
            var initialProps = props.initialProps;
            var compName = props.componentName;
            var onEvent = props.onEvent;
            var schema = props.schema;

            var [state, setState] = React.useState(function() {
              return normalizeComponentProps(initialProps, compName, onEvent, schema);
            });

            var interactiveHandlers = React.useMemo(function() {
              return {
                onSearchChange: function(val) {
                  if (onEvent) onEvent('onSearchChange', val);
                  setState(function(prev) { return Object.assign({}, prev, { search: val, searchQuery: val }); });
                },
                onStatusChange: function(val) {
                  if (onEvent) onEvent('onStatusChange', val);
                  setState(function(prev) { return Object.assign({}, prev, { selectedStatus: val }); });
                },
                onReset: function() {
                  if (onEvent) onEvent('onReset');
                  setState(function(prev) { return Object.assign({}, prev, { search: '', searchQuery: '', selectedStatus: 'all' }); });
                },
                onChange: function(val) {
                  var v = typeof val === 'object' && val && val.target ? (val.target.type === 'checkbox' ? val.target.checked : val.target.value) : val;
                  if (onEvent) onEvent('onChange', v);
                  setState(function(prev) {
                    if (typeof v === 'boolean') {
                      return Object.assign({}, prev, { checked: v });
                    }
                    if (typeof v === 'string') {
                      if (prev.tabs) return Object.assign({}, prev, { activeTab: v });
                      return Object.assign({}, prev, { value: v });
                    }
                    return Object.assign({}, prev, { value: v });
                  });
                },
                onPageChange: function(page) {
                  if (onEvent) onEvent('onPageChange', page);
                  setState(function(prev) { return Object.assign({}, prev, { currentPage: page }); });
                },
                onClose: function() {
                  if (onEvent) onEvent('onClose');
                  setState(function(prev) { return Object.assign({}, prev, { isOpen: false, isDismissed: true }); });
                },
                onOpen: function() {
                  if (onEvent) onEvent('onOpen');
                  setState(function(prev) { return Object.assign({}, prev, { isOpen: true, isDismissed: false }); });
                },
                onDismiss: function() {
                  if (onEvent) onEvent('onDismiss');
                  setState(function(prev) { return Object.assign({}, prev, { isDismissed: true, isOpen: false }); });
                },
                onSelect: function(val) {
                  if (onEvent) onEvent('onSelect', val);
                },
                onClick: function() {
                  if (onEvent) onEvent('onClick');
                },
                onStepClick: function(step) {
                  if (onEvent) onEvent('onStepClick', step);
                  setState(function(prev) { return Object.assign({}, prev, { currentStep: step }); });
                },
                onNavigate: function(item) {
                  if (onEvent) onEvent('onNavigate', item);
                },
                onSelectionChange: function(selected) {
                  if (onEvent) onEvent('onSelectionChange', selected);
                  setState(function(prev) { return Object.assign({}, prev, { selectedIds: selected }); });
                },
                onCardClick: function(cardId) {
                  if (onEvent) onEvent('onCardClick', cardId);
                },
                onItemClick: function(itemId) {
                  if (onEvent) onEvent('onItemClick', itemId);
                },
                onFileSelect: function() {
                  if (onEvent) onEvent('onFileSelect');
                },
                onAction: function() {
                  if (onEvent) onEvent('onAction');
                },
                onDealMove: function() {
                  if (onEvent) onEvent('onDealMove');
                }
              };
            }, [onEvent]);

            var mergedProps = Object.assign({}, state, interactiveHandlers);

            // Safeguard for void elements in HTML (<input>, etc.): cannot receive children (React error #137)
            var isVoidInputElement = mergedProps.type === 'checkbox' ||
                                     mergedProps.type === 'radio' ||
                                     mergedProps.checked !== undefined ||
                                     (compName && /checkbox|radio|switch|input|slider/i.test(compName));
            if (isVoidInputElement && mergedProps.children !== undefined) {
              delete mergedProps.children;
            }
            if (mergedProps.value !== undefined && mergedProps.onChange && mergedProps.children) {
              delete mergedProps.children;
            }

            if (mergedProps.isDismissed) {
              return React.createElement('div', { className: 'p-4 text-center text-xs text-slate-400 bg-slate-900/60 rounded-xl border border-slate-800 w-full max-w-sm' },
                React.createElement('p', null, 'Component has been dismissed.'),
                React.createElement('button', {
                  type: 'button',
                  className: 'mt-2 text-indigo-400 hover:text-indigo-300 font-semibold underline cursor-pointer',
                  onClick: function() {
                    setState(function(prev) { return Object.assign({}, prev, { isDismissed: false, isOpen: true }); });
                  }
                }, 'Reset / Re-open')
              );
            }

            return React.createElement(Component, mergedProps);
          }

          // 2. Generic Component Showcase Engine (Multi-Example Gallery & Interactive Explorer)
          function GenericComponentShowcase(props) {
            var Component = props.Component;
            var examples = props.examples;
            var compName = props.componentName;
            var schema = props.schema || {};

            if (!examples || !Array.isArray(examples) || examples.length === 0) {
              examples = [{ name: 'Default', props: {} }];
            }

            var [activeFilter, setActiveFilter] = React.useState('all');
            var [lastEvent, setLastEvent] = React.useState(null);

            var triggerEventNotice = React.useCallback(function(eventName, detail) {
              setLastEvent(eventName);
              setTimeout(function() {
                setLastEvent(function(curr) { return curr === eventName ? null : curr; });
              }, 1800);
            }, []);

            var layoutType = schema.layoutType || 'inline';

            return React.createElement('div', { className: 'w-full flex flex-col items-center' },
              // 1. Showcase Toolbar when more than 1 example
              examples.length > 1 ? React.createElement('div', { className: 'showcase-toolbar' },
                React.createElement('span', { className: 'text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mr-2 select-none' }, 'Showcase:'),
                React.createElement('button', {
                  type: 'button',
                  className: 'showcase-pill ' + (activeFilter === 'all' ? 'showcase-pill-active' : 'showcase-pill-inactive'),
                  onClick: function() { setActiveFilter('all'); }
                }, 'All (' + examples.length + ')'),
                examples.map(function(ex, idx) {
                  var isSel = activeFilter === String(idx);
                  return React.createElement('button', {
                    key: idx,
                    type: 'button',
                    className: 'showcase-pill ' + (isSel ? 'showcase-pill-active' : 'showcase-pill-inactive'),
                    onClick: function() { setActiveFilter(String(idx)); }
                  }, ex.name);
                })
              ) : null,

              // 2. Action feedback notification
              lastEvent ? React.createElement('div', { className: 'event-toast' },
                '⚡ Event fired: ' + lastEvent
              ) : null,

              // 3. Render Canvas adapted to Component Category/Layout
              activeFilter === 'all'
                ? (layoutType === 'table' || layoutType === 'kanban' || layoutType === 'stacked'
                    // Full-width layout for wide data tables, kanban boards, and step flows
                    ? React.createElement('div', { className: 'flex flex-col gap-6 w-full max-w-5xl' },
                        examples.map(function(ex, idx) {
                          return React.createElement('div', { key: idx, className: 'example-frame w-full text-left overflow-x-auto' },
                            React.createElement('span', { className: 'example-badge' }, ex.name),
                            ex.description ? React.createElement('p', { className: 'text-xs text-zinc-400 mb-3 w-full' }, ex.description) : null,
                            React.createElement(ErrorBoundary, { exampleName: ex.name },
                              React.createElement(SingleExampleInstance, {
                                Component: Component,
                                initialProps: ex.props,
                                exampleName: ex.name,
                                componentName: compName,
                                onEvent: triggerEventNotice,
                                schema: schema,
                              })
                            )
                          );
                        })
                      )
                    : (layoutType === 'card'
                        // Responsive card grid layout
                        ? React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl' },
                            examples.map(function(ex, idx) {
                              return React.createElement('div', { key: idx, className: 'example-frame w-full text-left' },
                                React.createElement('span', { className: 'example-badge' }, ex.name),
                                ex.description ? React.createElement('p', { className: 'text-xs text-zinc-400 mb-3 w-full' }, ex.description) : null,
                                React.createElement(ErrorBoundary, { exampleName: ex.name },
                                  React.createElement(SingleExampleInstance, {
                                    Component: Component,
                                    initialProps: ex.props,
                                    exampleName: ex.name,
                                    componentName: compName,
                                    onEvent: triggerEventNotice,
                                    schema: schema,
                                  })
                                )
                              );
                            })
                          )
                        // Compact flex wrap showcase for buttons, badges, avatars, switches, etc.
                        : React.createElement('div', { className: 'flex flex-wrap items-center justify-center gap-6 p-4 w-full' },
                            examples.map(function(ex, idx) {
                              return React.createElement('div', { key: idx, className: 'example-frame' },
                                React.createElement('span', { className: 'example-badge' }, ex.name),
                                React.createElement(ErrorBoundary, { exampleName: ex.name },
                                  React.createElement(SingleExampleInstance, {
                                    Component: Component,
                                    initialProps: ex.props,
                                    exampleName: ex.name,
                                    componentName: compName,
                                    onEvent: triggerEventNotice,
                                    schema: schema,
                                  })
                                )
                              );
                            })
                          )
                      )
                  )
                // Focused single view
                : (function() {
                    var selectedIdx = parseInt(activeFilter, 10);
                    var ex = examples[selectedIdx] || examples[0];
                    return React.createElement('div', { className: 'w-full max-w-4xl flex flex-col items-center justify-center p-4' },
                      ex.description ? React.createElement('p', { className: 'text-xs text-zinc-400 mb-4 text-center' }, ex.description) : null,
                      React.createElement(ErrorBoundary, { exampleName: ex.name },
                        React.createElement(SingleExampleInstance, {
                          Component: Component,
                          initialProps: ex.props,
                          exampleName: ex.name,
                          componentName: compName,
                          onEvent: triggerEventNotice,
                          schema: schema,
                        })
                      )
                    );
                  })()
            );
          }

          // Compile and mount the main component
          if (!mainFileName || files.length === 0) {
            renderError('Preview unavailable', 'No component source files attached.');
            return;
          }

          var mainFileObj = files.find(function(f) {
            var p = (f.path || f.name || '').toLowerCase();
            return p === mainFileName.toLowerCase() || p.endsWith('/' + mainFileName.toLowerCase());
          }) || files[0];

          if (!mainFileObj) {
            renderError('Preview unavailable', 'Main component file "' + mainFileName + '" could not be found.');
            return;
          }

          var mainMod = resolveModule('./' + (mainFileObj.path || mainFileObj.name), 'entry');
          
          // Find Component function/class
          var ComponentToRender = mainMod.default;
          if (!ComponentToRender) {
            if (mainMod[componentName]) {
              ComponentToRender = mainMod[componentName];
            } else {
              var cleanName = sanitizeAlphaNumeric(componentName);
              if (mainMod[cleanName]) {
                ComponentToRender = mainMod[cleanName];
              } else {
                for (var k in mainMod) {
                  if (k !== '__esModule' && (typeof mainMod[k] === 'function' || (typeof mainMod[k] === 'object' && mainMod[k] !== null && mainMod[k].$$typeof))) {
                    ComponentToRender = mainMod[k];
                    break;
                  }
                }
              }
            }
          }

          if (!ComponentToRender) {
            renderError('Preview unavailable', 'Could not locate exported React component in "' + (mainFileObj.path || mainFileObj.name) + '".');
            return;
          }

          // Mount Component with GenericComponentShowcase wrapped in ErrorBoundary
          var rootElement = document.getElementById('root');
          rootElement.innerHTML = '';

          var reactElement = React.createElement(
            ErrorBoundary,
            null,
            React.createElement(GenericComponentShowcase, {
              Component: ComponentToRender,
              examples: componentExamples,
              componentName: componentName,
              componentSlug: componentSlug,
              schema: componentSchema,
            })
          );
          
          if (ReactDOM.createRoot) {
            var root = ReactDOM.createRoot(rootElement);
            root.render(reactElement);
          } else {
            ReactDOM.render(reactElement, rootElement);
          }

          try {
            window.parent.postMessage({ type: 'PREVIEW_SUCCESS', slug: componentSlug }, '*');
          } catch(e) {}
        } catch(renderErr) {
          console.error('[Preview] Render error:', renderErr);
          renderError('Preview could not be rendered', renderErr.message || 'Unknown runtime error');
        }
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startExecution);
      } else {
        startExecution();
      }
    })();
  </script>
</body>
</html>`;
}

export const DynamicComponentSandbox: React.FC<DynamicComponentSandboxProps> = (props) => {
  const { className = "", slug = "component" } = props;
  const [mounted, setMounted] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const docSrc = useMemo(() => {
    return buildSandboxDoc(props);
  }, [props]);

  // Validate the generated HTML / JavaScript syntax before mounting iframe
  const validation = useMemo(() => {
    return validateSandboxScript(docSrc);
  }, [docSrc]);

  useEffect(() => {
    if (!validation.isValid) return;

    let isSuccess = false;

    // Timeout fallback after 12s - strictly cancelled when PREVIEW_SUCCESS is received
    let timer: NodeJS.Timeout | null = setTimeout(() => {
      if (isSuccess) return;

      // Check if iframe DOM actually rendered content without errors
      try {
        const doc = iframeRef.current?.contentDocument;
        const root = doc?.getElementById("root");
        if (
          root &&
          root.children.length > 0 &&
          !root.querySelector(".sandbox-error") &&
          !root.querySelector("#loading-spinner")
        ) {
          isSuccess = true;
          setRuntimeError(null);
          return;
        }
      } catch (_) {}

      setRuntimeError((current) => current || "Preview initialization timed out. Failed to render within 12 seconds.");
    }, 12000);

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;
      if (iframeRef.current && event.source && event.source !== iframeRef.current.contentWindow) return;
      if (event.data.slug && event.data.slug !== slug) return;

      if (event.data.type === "PREVIEW_SUCCESS") {
        isSuccess = true;
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        setRuntimeError(null);
      } else if (event.data.type === "PREVIEW_ERROR") {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        setRuntimeError(event.data.error || "An error occurred during preview rendering.");
      } else if (event.data.type === "PREVIEW_RETRY") {
        isSuccess = false;
        setRuntimeError(null);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      window.removeEventListener("message", handleMessage);
    };
  }, [validation.isValid, slug, retryKey]);

  const handleRetry = () => {
    setRuntimeError(null);
    setRetryKey((k) => k + 1);
  };

  const contentKey = useMemo(() => {
    return `${props.slug || "comp"}-${(props.sourceFiles || []).length}-${(props.themeFiles || []).length}-${retryKey}`;
  }, [props.slug, props.sourceFiles, props.themeFiles, retryKey]);

  if (!mounted) {
    return (
      <div className={`w-full h-full min-h-[300px] relative flex items-center justify-center bg-zinc-900 ${className}`}>
        <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
          <svg className="w-4 h-4 animate-spin text-blue-200/60" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Initializing preview...</span>
        </div>
      </div>
    );
  }

  const hasError = !validation.isValid || Boolean(runtimeError);
  const displayedErrorMessage = !validation.isValid ? (validation.error || "Generated preview script has invalid syntax.") : runtimeError;

  return (
    <div className={`w-full h-full relative flex items-center justify-center ${className}`}>
      {hasError && (
        <div className="z-20 sandbox-error w-full max-w-md mx-auto p-5 rounded-xl bg-zinc-900 border border-rose-500/40 shadow-2xl text-left">
          <h4 className="text-rose-400 font-medium text-xs uppercase tracking-wide flex items-center gap-2 mb-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Preview failed to initialize
          </h4>
          <p className="text-zinc-300 text-xs leading-relaxed">
            {displayedErrorMessage || "Preview could not be initialized."}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-3.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-rose-300 border border-zinc-700 rounded-lg text-xs font-medium cursor-pointer transition-colors"
          >
            Retry Preview
          </button>
        </div>
      )}

      {/* Render iframe only if syntax validation succeeded */}
      {validation.isValid && (
        <iframe
          ref={iframeRef}
          key={contentKey}
          srcDoc={docSrc}
          title={`Preview for ${props.name}`}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          allow="clipboard-read; clipboard-write"
          className={`w-full h-full border-0 bg-transparent transition-opacity duration-200 ${
            hasError ? "hidden" : "block"
          }`}
          style={{ minHeight: "100%", width: "100%" }}
        />
      )}
    </div>
  );
};
