"use client";

import { syncStatusLabel, type SyncStatus } from "@/lib/sync";

const STYLES: Record<SyncStatus, string> = {
  synced: "bg-primary-soft text-primary-dark",
  syncing: "bg-surface-2 text-ink-2",
  offline: "bg-warn-soft text-warn",
  "not-connected": "bg-surface-2 text-ink-3",
};

export default function SyncStatusChip({ status }: { status: SyncStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STYLES[status]}`}
      title="Presidency sync"
    >
      {syncStatusLabel(status)}
    </span>
  );
}
