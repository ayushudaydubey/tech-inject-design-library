import React from "react";
import { Customer } from "../../types/customer";
import { CustomerStatusBadge } from "./CustomerStatusBadge";
import { PremiumAccessButton } from "./PremiumAccessButton";

interface CustomerRowProps {
  customer: Customer;
}

export function CustomerRow({ customer }: CustomerRowProps) {
  const memberSince = customer.createdAt
    ? new Date(customer.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Unknown";

  const initials = customer.name
    ? customer.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : customer.email.slice(0, 2).toUpperCase();

  return (
    <tr className="border-b border-zinc-800 hover:bg-zinc-800/40 transition-colors">
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm border border-indigo-400/30">
            {initials}
          </div>
          <div>
            <div className="font-medium text-sm text-zinc-100">
              {customer.name || "Customer"}
            </div>
            <div className="text-xs text-zinc-400 font-mono">
              {customer.email}
            </div>
          </div>
        </div>
      </td>

      <td className="py-4 px-6">
        <CustomerStatusBadge isPremium={customer.isPremium} />
      </td>

      <td className="py-4 px-6 text-xs text-zinc-400">
        {memberSince}
      </td>

      <td className="py-4 px-6 text-right">
        <PremiumAccessButton customer={customer} />
      </td>
    </tr>
  );
}
