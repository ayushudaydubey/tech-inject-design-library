import React from "react";
import type { Metadata } from "next";
import { CatalogueShell } from "../../components/layout/CatalogueShell";

export const metadata: Metadata = {
  title: "Component Catalogue",
  description:
    "Explore, preview, and install production-ready React components with TypeScript and Tailwind CSS.",
};

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CatalogueShell>{children}</CatalogueShell>;
}
