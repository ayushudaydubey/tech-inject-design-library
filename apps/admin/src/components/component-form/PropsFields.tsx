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
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Props Documentation (Markdown)
        </label>
        <button
          type="button"
          onClick={insertTemplate}
          disabled={disabled}
          className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
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
        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 leading-relaxed"
      />
      <p className="text-[11px] text-slate-400">
        Format using standard Markdown with list items: <code>- `propName` (type): Description</code>
      </p>
    </div>
  );
};
