"use client";

import React from "react";
import { AdminLayout } from "../../../components/layout/AdminLayout";
import { CustomerTable } from "../../../components/customers/CustomerTable";

export default function AdminCustomersPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="pb-4 border-b border-zinc-800">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
            Customer Account Management
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Audit registered customer accounts and grant or revoke premium design library access. Changes take effect on subsequent backend requests.
          </p>
        </div>

        <CustomerTable />
      </div>
    </AdminLayout>
  );
}
