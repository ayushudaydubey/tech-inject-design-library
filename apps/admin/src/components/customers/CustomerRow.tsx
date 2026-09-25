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
    <tr className="hover:bg-zinc-750/50 transition-colors">
      <td className="py-3 px-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-750 text-zinc-200 font-semibold text-xs flex items-center justify-center shrink-0 border border-zinc-700">
            {initials}
          </div>
          <div>
            <div className="font-medium text-xs text-zinc-100">
              {customer.name || "Customer"}
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">
              {customer.email}
            </div>
          </div>
        </div>
      </td>

      <td className="py-3 px-5">
        <CustomerStatusBadge isPremium={customer.isPremium} />
      </td>

      <td className="py-3 px-5 text-xs text-zinc-400">
        {memberSince}
      </td>

      <td className="py-3 px-5 text-right">
        <PremiumAccessButton customer={customer} />
      </td>
    </tr>
  );
}
