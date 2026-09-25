import {
  ComponentFile,
  SourceFileLanguage,
  ValidationResult,
  DetailedValidationError,
  ValidationCheck,
} from "../../types/component";

export type {
  ComponentFile,
  SourceFileLanguage,
  ValidationResult,
  DetailedValidationError,
  ValidationCheck,
};

export interface EditorFileState {
  id: string;
  filename: string;
  path: string;
  content: string;
  fileType: string;
  language: SourceFileLanguage;
  isModified?: boolean;
}

export interface FileTemplate {
  name: string;
  extension: string;
  description: string;
  content: string;
}
