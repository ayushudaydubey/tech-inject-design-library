import React from "react";

export interface PropsFieldsProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const PropsFields: React.FC<PropsFieldsProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const insertTemplate = () => {
    const template = `### Props
- \`title\` (string): Headline label for the widget
- \`value\` (string | number): Primary metric value to display
- \`change\` (number): Percentage delta compared to prior period
- \`trend\` ('up' | 'down' | 'neutral'): Directional indicator`;
    onChange(template);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-zinc-300">
          Props Documentation (Markdown)
        </label>
        <button
          type="button"
          onClick={insertTemplate}
          disabled={disabled}
          className="text-[11px] font-medium text-blue-200 hover:underline disabled:opacity-50"
        >
          Insert Example Template
        </button>
      </div>

      <textarea
        rows={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`### Props\n- \`propName\` (type): Description`}
        disabled={disabled}
        className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-700 bg-zinc-800 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200 disabled:opacity-50 leading-relaxed transition-colors"
      />
      <p className="text-[11px] text-zinc-400">
        Format using standard Markdown with list items: <code className="text-zinc-300">- `propName` (type): Description</code>
      </p>
    </div>
  );
};
