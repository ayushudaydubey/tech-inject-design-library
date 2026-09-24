import React from "react";
import { AdminLoginForm } from "../../components/auth/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-zinc-950 text-zinc-100">
      <div className="w-full max-w-md">
        <AdminLoginForm />
      </div>
    </main>
  );
}
