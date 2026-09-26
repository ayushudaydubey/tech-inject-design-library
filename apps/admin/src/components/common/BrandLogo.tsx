import React from "react";
import Link from "next/link";

export interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  badgeText?: string;
  showBadge?: boolean;
  href?: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = "md",
  href = "/dashboard",
  className = "",
}) => {
  const textClasses =
    size === "sm"
      ? "text-sm font-semibold"
      : size === "lg" || size === "xl"
      ? "text-xl sm:text-2xl font-bold"
      : "text-lg sm:text-xl font-bold";

  const content = (
    <div className={`flex items-center group select-none ${className}`}>
      <span className={`${textClasses} tracking-tight text-zinc-100 group-hover:text-white transition-colors`}>
        Tech Inject <span className="text-blue-200 font-normal">Admin</span>
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-hidden inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
};
