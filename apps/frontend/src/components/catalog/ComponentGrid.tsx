import React from "react";
import { ComponentSummary } from "../../types/component";
import { ComponentCard } from "./ComponentCard";
import { EmptyState } from "../common/EmptyState";

export interface ComponentGridProps {
  components: ComponentSummary[];
  onResetFilters?: () => void;
  className?: string;
}

export const ComponentGrid: React.FC<ComponentGridProps> = ({
  components,
  onResetFilters,
  className = "",
}) => {
  if (components.length === 0) {
    return (
      <EmptyState
        title="No components match your criteria"
        description="Try adjusting your search terms or clearing the category filter to find components."
        actionText={onResetFilters ? "Reset Filters" : undefined}
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4.5 lg:gap-5 2xl:gap-6 ${className}`}
      role="region"
      aria-label="Component Catalogue Grid"
    >
      {components.map((component, i) => (
        <ComponentCard key={component.id} component={component} index={i} />
      ))}
    </div>
  );
};
