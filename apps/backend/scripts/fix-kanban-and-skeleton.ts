import dotenv from "dotenv";
import path from "node:path";
import mongoose from "mongoose";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI;

const updatedPipelineKanbanSource = `// Confidential Premium Component Source
import React from 'react';

export interface Deal {
  id: string;
  title: string;
  value: number;
  stageId: string;
}

export interface Stage {
  id: string;
  name: string;
  totalValue: number;
}

export const PipelineKanbanBoard: React.FC<{ stages?: Stage[]; deals?: Deal[] }> = ({
  stages = [],
  deals = []
}) => {
  const safeStages = Array.isArray(stages) ? stages : [];
  const safeDeals = Array.isArray(deals) ? deals : [];

  return (
    <div className="flex gap-4 overflow-x-auto p-4 bg-slate-50 dark:bg-slate-950 rounded-xl min-w-[700px]">
      {safeStages.map((stage) => (
        <div key={stage.id} className="w-80 flex-shrink-0 bg-slate-100 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-100 mb-3">
            <span>{stage.name}</span>
            <span className="text-xs font-mono text-slate-500">${stage.totalValue ? stage.totalValue.toLocaleString() : '0'}</span>
          </div>
          <div className="space-y-3">
            {safeDeals.filter((d) => d && d.stageId === stage.id).map((deal) => (
              <div key={deal.id} className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{deal.title}</div>
                <div className="text-xs text-emerald-600 font-semibold mt-1.5 font-mono">${deal.value ? deal.value.toLocaleString() : '0'}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};`;

const updatedPipelineKanbanPreviewData = JSON.stringify({
  stages: [
    { id: "lead", name: "Lead In", totalValue: 45000 },
    { id: "demo", name: "Demo Scheduled", totalValue: 82000 },
    { id: "closed", name: "Closed Won", totalValue: 120000 }
  ],
  deals: [
    { id: "d1", title: "Acme Cloud Infrastructure", value: 45000, stageId: "lead" },
    { id: "d2", title: "Starlight Enterprise License", value: 52000, stageId: "demo" },
    { id: "d3", title: "Global Logistics Pilot", value: 30000, stageId: "demo" },
    { id: "d4", title: "Omega Corp Q4 Contract", value: 120000, stageId: "closed" }
  ]
});

const updatedSkeletonSource = `import React from 'react';
import clsx from 'clsx';
import { SkeletonProps } from './types';
import './skeleton.css';

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'card',
  count = 3,
  className = '',
}) => {
  const pulseClass = 'skeleton-pulse bg-slate-200 dark:bg-slate-800/90 rounded-lg';

  if (variant === 'avatar') {
    return (
      <div className={clsx('flex items-center gap-3 w-full max-w-sm p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl', className)}>
        <div className={clsx(pulseClass, 'w-12 h-12 rounded-full shrink-0')} />
        <div className="space-y-2 flex-1 min-w-[120px]">
          <div className={clsx(pulseClass, 'h-3.5 w-2/3')} />
          <div className={clsx(pulseClass, 'h-2.5 w-1/2')} />
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={clsx('w-full max-w-md p-6 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4', className)}>
        <div className="flex items-center gap-3">
          <div className={clsx(pulseClass, 'w-10 h-10 rounded-full shrink-0')} />
          <div className="space-y-2 flex-1">
            <div className={clsx(pulseClass, 'h-3.5 w-1/2')} />
            <div className={clsx(pulseClass, 'h-2.5 w-1/3')} />
          </div>
        </div>
        <div className={clsx(pulseClass, 'h-16 w-full rounded-xl')} />
        <div className="space-y-2 pt-1">
          <div className={clsx(pulseClass, 'h-3 w-full')} />
          <div className={clsx(pulseClass, 'h-3 w-4/5')} />
          <div className={clsx(pulseClass, 'h-3 w-3/5')} />
        </div>
      </div>
    );
  }

  if (variant === 'table-row') {
    return (
      <div className={clsx('w-full max-w-lg space-y-3 p-4 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm', className)}>
        {Array.from({ length: Math.max(count, 3) }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
            <div className={clsx(pulseClass, 'w-8 h-8 rounded-lg shrink-0')} />
            <div className={clsx(pulseClass, 'h-3.5 w-1/4')} />
            <div className={clsx(pulseClass, 'h-3.5 w-1/3')} />
            <div className={clsx(pulseClass, 'h-3.5 w-1/5')} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={clsx('w-full max-w-md space-y-2.5 p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl', className)}>
      {Array.from({ length: Math.max(count, 3) }).map((_, i) => (
        <div
          key={i}
          className={clsx(pulseClass, 'h-3.5 w-full', i === count - 1 && 'w-3/4')}
        />
      ))}
    </div>
  );
};`;

const updatedSkeletonCss = `@keyframes skeletonPulse {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}

.skeleton-pulse {
  animation: skeletonPulse 1.6s ease-in-out infinite;
}`;

const updatedSkeletonPreviewData = JSON.stringify({
  variant: "card",
  count: 3
});

async function main() {
  await mongoose.connect(MONGODB_URI!);
  const col = mongoose.connection.collection("components");

  // 1. Update pipeline-kanban-board
  const pkbRes = await col.updateOne(
    { slug: "pipeline-kanban-board" },
    {
      $set: {
        previewData: updatedPipelineKanbanPreviewData,
        "sourceFiles.0.content": updatedPipelineKanbanSource,
      },
    }
  );
  console.log(`Updated pipeline-kanban-board in DB (matched: ${pkbRes.matchedCount}, modified: ${pkbRes.modifiedCount})`);

  // 2. Update skeleton
  const skelRes = await col.updateOne(
    { slug: "skeleton" },
    {
      $set: {
        previewData: updatedSkeletonPreviewData,
        "sourceFiles.0.content": updatedSkeletonSource,
        "themeFiles.0.content": updatedSkeletonCss,
      },
    }
  );
  console.log(`Updated skeleton in DB (matched: ${skelRes.matchedCount}, modified: ${skelRes.modifiedCount})`);

  await mongoose.disconnect();
}

main().catch(console.error);
