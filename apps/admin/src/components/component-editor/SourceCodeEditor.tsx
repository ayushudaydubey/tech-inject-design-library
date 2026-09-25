"use client";

import React, { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import Editor, { OnMount, OnChange } from "@monaco-editor/react";
import type * as monacoEditor from "monaco-editor";
import { EditorFileState, SourceFileLanguage } from "./types";
import { FileTabs } from "./FileTabs";
import { AddFileDialog } from "./AddFileDialog";
import {
  REACT_TSX_TEMPLATE,
  CSS_TEMPLATE,
  TYPES_TS_TEMPLATE,
} from "./templates";
import { getMonacoLanguage, getLanguageFromExtension, validateClientFilePath } from "./pathValidation";

export interface SourceCodeEditorHandle {
  navigateToFileAndLine: (filename: string, line?: number, column?: number) => void;
  getFiles: () => EditorFileState[];
}

export interface SourceCodeEditorProps {
  initialFiles?: Array<{
    filename?: string;
    path?: string;
    content?: string;
    fileType?: string;
    language?: SourceFileLanguage;
  }>;
  onChangeFiles?: (files: EditorFileState[]) => void;
  hasUnsavedChanges?: boolean;
  className?: string;
}

export const SourceCodeEditor = forwardRef<SourceCodeEditorHandle, SourceCodeEditorProps>(
  (
    {
      initialFiles = [],
      onChangeFiles,
      hasUnsavedChanges = false,
      className = "",
    },
    ref
  ) => {
    // Initialize files list
    const [files, setFiles] = useState<EditorFileState[]>(() => {
      if (initialFiles.length > 0) {
        return initialFiles.map((f, idx) => {
          const filePath = (f.path || f.filename || `Component.tsx`).trim();
          const ext = filePath.split(".").pop()?.toLowerCase() || f.fileType || "tsx";
          const lang = f.language || getLanguageFromExtension(ext);
          return {
            id: `file-${idx}-${filePath}`,
            filename: filePath,
            path: filePath,
            content: f.content || "",
            fileType: ext,
            language: lang,
            isModified: false,
          };
        });
      }

      // Default initial file: Component.tsx with TSX template
      return [
        {
          id: "file-default-tsx",
          filename: "Component.tsx",
          path: "Component.tsx",
          content: REACT_TSX_TEMPLATE,
          fileType: "tsx",
          language: "typescriptreact",
          isModified: false,
        },
      ];
    });

    const [activeFileId, setActiveFileId] = useState<string>(() => {
      return files[0]?.id || "file-default-tsx";
    });

    const [isAddFileDialogOpen, setIsAddFileDialogOpen] = useState(false);
    const [cursorPosition, setCursorPosition] = useState<{ line: number; col: number }>({
      line: 1,
      col: 1,
    });
    const [lineCount, setLineCount] = useState<number>(1);

    const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<typeof monacoEditor | null>(null);

    const activeFile = files.find((f) => f.id === activeFileId) || files[0];

    // Expose imperative handle for navigation
    useImperativeHandle(ref, () => ({
      navigateToFileAndLine: (filename: string, line = 1, column = 1) => {
        const target = files.find(
          (f) =>
            f.path.toLowerCase() === filename.toLowerCase() ||
            f.filename.toLowerCase() === filename.toLowerCase()
        );
        if (target) {
          setActiveFileId(target.id);
          setTimeout(() => {
            if (editorRef.current) {
              editorRef.current.revealLineInCenter(line);
              editorRef.current.setPosition({ lineNumber: line, column });
              editorRef.current.focus();
            }
          }, 50);
        }
      },
      getFiles: () => files,
    }));

    // Handle Editor mount
    const handleEditorDidMount: OnMount = (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      // Configure Monaco TypeScript/JSX settings
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.Latest,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        esModuleInterop: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        reactNamespace: "React",
        allowJs: true,
      });

      // Disable semantic validation (type errors) but keep syntax validation
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: false,
      });

      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: false,
      });

      // Update cursor and lines
      editor.onDidChangeCursorPosition((e) => {
        setCursorPosition({
          line: e.position.lineNumber,
          col: e.position.column,
        });
      });

      const model = editor.getModel();
      if (model) {
        setLineCount(model.getLineCount());
      }
    };

    // Handle code change
    const handleCodeChange: OnChange = (value) => {
      const newContent = value ?? "";
      setFiles((prev) => {
        const next = prev.map((f) =>
          f.id === activeFileId
            ? { ...f, content: newContent, isModified: true }
            : f
        );
        onChangeFiles?.(next);
        return next;
      });

      if (editorRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          setLineCount(model.getLineCount());
        }
      }
    };

    // Add new file
    const handleAddFile = (newFilename: string, initialContent = "") => {
      const check = validateClientFilePath(newFilename);
      const newFile: EditorFileState = {
        id: `file-${Date.now()}-${check.normalizedPath}`,
        filename: check.normalizedPath,
        path: check.normalizedPath,
        content: initialContent,
        fileType: check.extension,
        language: check.language,
        isModified: true,
      };

      setFiles((prev) => {
        const next = [...prev, newFile];
        onChangeFiles?.(next);
        return next;
      });

      setActiveFileId(newFile.id);
    };

    // Delete a file
    const handleDeleteFile = (idToDelete: string) => {
      setFiles((prev) => {
        const next = prev.filter((f) => f.id !== idToDelete);
        onChangeFiles?.(next);
        return next;
      });

      if (activeFileId === idToDelete) {
        const remaining = files.filter((f) => f.id !== idToDelete);
        if (remaining.length > 0) {
          setActiveFileId(remaining[0].id);
        }
      }
    };

    // Insert template into active file
    const handleInsertTemplate = (templateType: "tsx" | "css" | "types") => {
      let codeToInsert = "";
      if (templateType === "tsx") codeToInsert = REACT_TSX_TEMPLATE;
      else if (templateType === "css") codeToInsert = CSS_TEMPLATE;
      else if (templateType === "types") codeToInsert = TYPES_TS_TEMPLATE;

      setFiles((prev) => {
        const next = prev.map((f) =>
          f.id === activeFileId
            ? { ...f, content: codeToInsert, isModified: true }
            : f
        );
        onChangeFiles?.(next);
        return next;
      });

      if (editorRef.current) {
        editorRef.current.setValue(codeToInsert);
      }
    };

    const monacoLang = activeFile ? getMonacoLanguage(activeFile.language) : "typescript";

    return (
      <div
        className={`rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden flex flex-col ${className}`}
      >
        {/* Editor Title & Description */}
        <div className="px-5 py-3.5 border-b border-zinc-800 bg-zinc-850 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <span>Source Files</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 font-normal">
                {files.length} file{files.length === 1 ? "" : "s"}
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Write or paste component source code, supporting utilities, and styles. All files are persisted to the database.
            </p>
          </div>
        </div>

        {/* Tab Bar */}
        <FileTabs
          files={files}
          activeFileId={activeFileId}
          onSelectFile={setActiveFileId}
          onDeleteFile={handleDeleteFile}
          onRenameFile={(id, newName) => {
            const check = validateClientFilePath(newName);
            if (!check.isValid) return;
            setFiles((prev) => {
              const next = prev.map((f) =>
                f.id === id
                  ? {
                      ...f,
                      filename: check.normalizedPath,
                      path: check.normalizedPath,
                      fileType: check.extension,
                      language: check.language || f.language,
                      isModified: true,
                    }
                  : f
              );
              onChangeFiles?.(next);
              return next;
            });
          }}
          onOpenAddFileDialog={() => setIsAddFileDialogOpen(true)}
          onInsertTemplate={handleInsertTemplate}
          hasUnsavedChanges={hasUnsavedChanges}
        />

        {/* Monaco Editor Container */}
        <div className="w-full h-[540px] bg-zinc-950 relative">
          <Editor
            height="100%"
            path={activeFile?.path || "Component.tsx"}
            language={monacoLang}
            value={activeFile?.content || ""}
            theme="vs-dark"
            onMount={handleEditorDidMount}
            onChange={handleCodeChange}
            options={{
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Menlo', 'Consolas', monospace",
              fontLigatures: true,
              tabSize: 2,
              minimap: { enabled: true, maxColumn: 80, scale: 0.75 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              lineNumbers: "on",
              renderLineHighlight: "all",
              smoothScrolling: true,
              wordWrap: "on",
              padding: { top: 12, bottom: 12 },
              cursorBlinking: "smooth",
              formatOnPaste: true,
            }}
            loading={
              <div className="flex items-center justify-center h-full bg-zinc-950 text-zinc-400 text-xs gap-2">
                <svg className="w-4 h-4 animate-spin text-blue-200" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Loading Code Editor...</span>
              </div>
            }
          />
        </div>

        {/* Editor Status Bar Footer */}
        <div className="px-4 py-1.5 border-t border-zinc-850 bg-zinc-950 text-[11px] font-mono text-zinc-400 flex flex-wrap items-center justify-between gap-3 select-none">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-200"></span>
              <strong className="text-zinc-200">{activeFile?.path || activeFile?.filename}</strong>
            </span>
            <span>
              Ln {cursorPosition.line}, Col {cursorPosition.col}
            </span>
            <span>{lineCount} lines</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="capitalize">{activeFile?.language || "TypeScript"}</span>
            <span>UTF-8</span>
            <span>Spaces: 2</span>
          </div>
        </div>

        {/* Add File Dialog */}
        <AddFileDialog
          isOpen={isAddFileDialogOpen}
          onClose={() => setIsAddFileDialogOpen(false)}
          onAddFile={handleAddFile}
          existingFilenames={files.map((f) => f.path || f.filename)}
        />
      </div>
    );
  }
);

SourceCodeEditor.displayName = "SourceCodeEditor";
