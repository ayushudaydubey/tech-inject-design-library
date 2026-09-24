"use client";

import React from "react";
import { AdminLayout } from "../../../components/layout/AdminLayout";
import { CustomerTable } from "../../../components/customers/CustomerTable";

export default function AdminCustomersPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Customer Account Management
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Audit registered customer accounts and grant or revoke premium design library access. Changes take effect on subsequent backend requests.
          </p>
        </div>

        <CustomerTable />
      </div>
    </AdminLayout>
  );
}
