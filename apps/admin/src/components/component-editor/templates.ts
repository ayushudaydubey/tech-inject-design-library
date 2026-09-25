export const REACT_TSX_TEMPLATE = `import React from "react";

export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export const Component: React.FC<ComponentProps> = ({
  className = "",
  children,
}) => {
  return (
    <div className={\`p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 \${className}\`}>
      {children || <span>Component</span>}
    </div>
  );
};
`;

export const CSS_TEMPLATE = `/* Component Custom Styles */
.component-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
}

.component-header {
  font-size: 0.875rem;
  font-weight: 600;
  color: inherit;
}

.component-body {
  font-size: 0.75rem;
  line-height: 1.5;
}
`;

export const TYPES_TS_TEMPLATE = `import React from "react";

export interface ComponentProps {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}
`;

export const JSON_TEMPLATE = `{
  "title": "Sample Component Data",
  "value": 100,
  "enabled": true
}
`;
