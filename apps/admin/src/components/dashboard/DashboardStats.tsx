import React from "react";
import { AdminComponent } from "../../types/component";
import { Customer } from "../../types/customer";

export interface DashboardStatsProps {
  components: AdminComponent[];
  customers: Customer[];
  className?: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  components,
  customers,
  className = "",
}) => {
  const totalComponents = components.length;
  const publishedCount = components.filter((c) => c.status === "published").length;
  const draftCount = components.filter((c) => c.status === "draft").length;
  const premiumCount = components.filter((c) => c.accessType === "premium").length;
  const freeCount = components.filter((c) => c.accessType === "free").length;

  const totalCustomers = customers.length;
  const premiumCustomers = customers.filter((c) => c.isPremium).length;

  const stats = [
    {
      label: "Total Components",
      value: totalComponents,
      sublabel: `${publishedCount} published, ${draftCount} draft`,
      badge: "Library",
    },
    {
      label: "Published Items",
      value: publishedCount,
      sublabel: "Active in public catalogue",
      badge: "Public",
    },
    {
      label: "Draft Items",
      value: draftCount,
      sublabel: "Hidden from public catalogue",
      badge: "Draft",
    },
    {
      label: "Premium Components",
      value: premiumCount,
      sublabel: `${freeCount} free community items`,
      badge: "Monetized",
    },
    {
      label: "Registered Customers",
      value: totalCustomers,
      sublabel: `${premiumCustomers} premium active`,
      badge: "Accounts",
    },
    {
      label: "Premium Members",
      value: premiumCustomers,
      sublabel: "Granted full source access",
      badge: "VIP",
    },
  ];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-zinc-700/60 bg-zinc-800 p-4.5 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-zinc-400">
              {stat.label}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded border border-zinc-700/80 bg-zinc-850 text-zinc-300">
              {stat.badge}
            </span>
          </div>

          <div className="mt-3">
            <div className="text-2xl font-semibold text-zinc-100 tracking-tight">
              {stat.value}
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              {stat.sublabel}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
