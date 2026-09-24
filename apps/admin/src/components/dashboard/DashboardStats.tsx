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
      badgeColor: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
    },
    {
      label: "Published Items",
      value: publishedCount,
      sublabel: "Active in public catalogue",
      badge: "Public",
      badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    },
    {
      label: "Draft Items",
      value: draftCount,
      sublabel: "Hidden from public catalogue",
      badge: "Draft",
      badgeColor: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    },
    {
      label: "Premium Components",
      value: premiumCount,
      sublabel: `${freeCount} free community items`,
      badge: "Monetized",
      badgeColor: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    },
    {
      label: "Registered Customers",
      value: totalCustomers,
      sublabel: `${premiumCustomers} premium active`,
      badge: "Accounts",
      badgeColor: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
    },
    {
      label: "Premium Members",
      value: premiumCustomers,
      sublabel: "Granted full source access",
      badge: "VIP",
      badgeColor: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
    },
  ];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {stat.label}
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${stat.badgeColor}`}
            >
              {stat.badge}
            </span>
          </div>

          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {stat.value}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {stat.sublabel}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
