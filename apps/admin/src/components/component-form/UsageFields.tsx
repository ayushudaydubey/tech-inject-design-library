import React from "react";

export interface UsageFieldsProps {
  value: string;
  componentName?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const UsageFields: React.FC<UsageFieldsProps> = ({
  value,
  componentName = "MyComponent",
  onChange,
  disabled = false,
}) => {
  const insertTemplate = () => {
    const cleanName = componentName.replace(/\s+/g, "");
    const template = `import React from 'react';
import { ${cleanName} } from './${cleanName}';

export default function Demo() {
  return (
    <div className="p-6">
      <${cleanName} />
    </div>
  );
}`;
    onChange(template);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-zinc-300">
          Usage Documentation (React/TSX Example)
        </label>
        <button
          type="button"
          onClick={insertTemplate}
          disabled={disabled}
          className="text-[11px] font-medium text-blue-200 hover:underline disabled:opacity-50"
        >
          Insert TSX Template
        </button>
      </div>

      <textarea
        rows={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`import React from 'react';\nimport { Component } from './Component';\n...`}
        disabled={disabled}
        className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-700 bg-zinc-800 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200 disabled:opacity-50 leading-relaxed transition-colors"
      />
    </div>
  );
};
