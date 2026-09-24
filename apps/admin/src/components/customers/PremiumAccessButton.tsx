"use client";

import React, { useState } from "react";
import { Customer } from "../../types/customer";
import { useGrantPremium, useRevokePremium } from "../../hooks/useCustomers";
import { ConfirmDialog } from "../common/ConfirmDialog";

interface PremiumAccessButtonProps {
  customer: Customer;
}

export function PremiumAccessButton({ customer }: PremiumAccessButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grantMutation = useGrantPremium();
  const revokeMutation = useRevokePremium();

  const isPending = grantMutation.isPending || revokeMutation.isPending;
  const isPremium = customer.isPremium;
  const customerId = customer.id || customer._id || "";

  const handleAction = async () => {
    if (!customerId) return;
    setError(null);
    try {
      if (isPremium) {
        await revokeMutation.mutateAsync(customerId);
      } else {
        await grantMutation.mutateAsync(customerId);
      }
      setShowConfirm(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update customer premium status.";
      setError(message);
    }
  };

  return (
    <>
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setShowConfirm(true);
          }}
          disabled={isPending || !customerId}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50 ${
            isPremium
              ? "bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 focus:ring-2 focus:ring-rose-500"
              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 focus:ring-2 focus:ring-emerald-500"
          }`}
        >
          {isPending ? (
            <svg
              className="w-3.5 h-3.5 animate-spin text-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : isPremium ? (
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          ) : (
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          )}
          <span>{isPremium ? "Revoke Premium" : "Grant Premium"}</span>
        </button>

        {error && (
          <span className="text-[11px] text-rose-400 font-medium">
            {error}
          </span>
        )}
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title={
          isPremium
            ? `Revoke Premium Access for ${customer.name || customer.email}?`
            : `Grant Premium Access to ${customer.name || customer.email}?`
        }
        description={
          isPremium
            ? `This will immediately downgrade ${customer.email} to the Free tier. They will lose access to premium components on subsequent backend requests.`
            : `This will grant ${customer.email} full access to all premium components in the design catalogue immediately.`
        }
        confirmText={isPremium ? "Revoke Premium" : "Grant Premium"}
        cancelText="Cancel"
        variant={isPremium ? "danger" : "primary"}
        isLoading={isPending}
        onConfirm={handleAction}
        onClose={() => setShowConfirm(false)}
      />
    </>
  );
}
