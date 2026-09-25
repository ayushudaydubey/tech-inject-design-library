import bcrypt from "bcryptjs";
import { User, IUserDocument } from "../models/User";
import { Component } from "../models/Component";
import { env } from "../config/env";

export const seedDatabase = async (): Promise<void> => {
  try {
    // 1. Seed Admin
    let adminUser = await User.findOne({ email: env.ADMIN_EMAIL.toLowerCase() });
    if (!adminUser) {
      const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
      adminUser = await User.create({
        name: "Admin User",
        email: env.ADMIN_EMAIL.toLowerCase(),
        passwordHash,
        role: "admin",
        isPremium: true,
      });
      console.log(`[Seed] Created admin account: ${env.ADMIN_EMAIL}`);
    }

    // 2. Seed Free Customer
    const freeCustomer = await User.findOne({
      email: env.FREE_CUSTOMER_EMAIL.toLowerCase(),
    });
    if (!freeCustomer) {
      const passwordHash = await bcrypt.hash(env.FREE_CUSTOMER_PASSWORD, 10);
      await User.create({
        name: "Free Customer",
        email: env.FREE_CUSTOMER_EMAIL.toLowerCase(),
        passwordHash,
        role: "customer",
        isPremium: false,
      });
      console.log(
        `[Seed] Created free customer account: ${env.FREE_CUSTOMER_EMAIL}`
      );
    }

    // 3. Seed Premium Customer
    const premiumCustomer = await User.findOne({
      email: env.PREMIUM_CUSTOMER_EMAIL.toLowerCase(),
    });
    if (!premiumCustomer) {
      const passwordHash = await bcrypt.hash(env.PREMIUM_CUSTOMER_PASSWORD, 10);
      await User.create({
        name: "Premium Customer",
        email: env.PREMIUM_CUSTOMER_EMAIL.toLowerCase(),
        passwordHash,
        role: "customer",
        isPremium: true,
      });
      console.log(
        `[Seed] Created premium customer account: ${env.PREMIUM_CUSTOMER_EMAIL}`
      );
    }

    // 4. Seed initial component fixtures if none exist
    if (adminUser) {
      const existingSales = await Component.findOne({ slug: "sales-metric-card" });
      if (!existingSales) {
        // Free Published Component
        await Component.create({
          name: "Sales Metric Card",
          slug: "sales-metric-card",
        description:
          "Executive KPI metric card with positive/negative trend indicators and CRM theme styling.",
        category: "Analytics",
        version: "1.0.0",
        accessType: "free",
        status: "published",
        propsDocumentation:
          "### Props\n- `title` (string): Metric label\n- `value` (string | number): Headline value\n- `change` (number): Percentage delta\n- `trend` ('up' | 'down' | 'neutral'): Directional indicator",
        usageDocumentation:
          "```tsx\nimport { SalesMetricCard } from './SalesMetricCard';\n\nexport default function Dashboard() {\n  return <SalesMetricCard title='Quarterly Revenue' value='$428,500' change={12.4} trend='up' />;\n}\n```",
        declaredDependencies: {
          "lucide-react": "^0.475.0",
          clsx: "^2.1.0",
        },
        previewData: JSON.stringify({
          examples: [
            { name: "Positive Trend", props: { title: "Quarterly Revenue", value: "$428,500", change: 12.4, trend: "up" } },
            { name: "Negative Trend", props: { title: "Customer Churn", value: "2.1%", change: -0.8, trend: "down" } },
            { name: "Neutral Metric", props: { title: "Active Accounts", value: "1,420", change: 0.0, trend: "neutral" } },
          ],
        }, null, 2),
        sourceFiles: [
          {
            filename: "SalesMetricCard.tsx",
            fileType: "tsx",
            content: `import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface SalesMetricCardProps {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

export const SalesMetricCard: React.FC<SalesMetricCardProps> = ({ title, value, change, trend }) => {
  const isPositive = trend === 'up';
  return (
    <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
      <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</div>
      <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</div>
      <div className="mt-3 flex items-center text-sm font-medium">
        <span className={isPositive ? 'text-emerald-600 flex items-center' : 'text-rose-600 flex items-center'}>
          {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
          {Math.abs(change)}%
        </span>
        <span className="ml-2 text-slate-400 text-xs">vs last period</span>
      </div>
    </div>
  );
};`,
          },
        ],
        supportingFiles: [
          {
            filename: "types.ts",
            fileType: "ts",
            content: `export type TrendDirection = 'up' | 'down' | 'neutral';`,
          },
        ],
        themeFiles: [
          {
            filename: "metric-card.css",
            fileType: "css",
            content: `.metric-card { border-radius: 0.75rem; transition: box-shadow 0.2s; }`,
          },
        ],
        installInfo: {
          packageManagerCommand: "npx tech-inject add sales-metric-card",
          notes: "Requires React 18+ and Lucide React icon library.",
        },
        agentPrompt:
          "Integrate the SalesMetricCard component into the dashboard page. Pass revenue data with formatted currency and trend deltas. Ensure styles use the theme tokens.",
        createdBy: adminUser._id,
        });
      }

      const existingKanban = await Component.findOne({ slug: "pipeline-kanban-board" });
      const pipelineKanbanPreviewData = JSON.stringify({
        examples: [
          {
            name: "Active Deals Pipeline",
            props: {
              stages: [
                { id: "lead", name: "Lead In", totalValue: 45000 },
                { id: "demo", name: "Demo Scheduled", totalValue: 82000 },
                { id: "closed", name: "Closed Won", totalValue: 120000 },
              ],
              deals: [
                { id: "d1", title: "Acme Cloud Infrastructure", value: 45000, stageId: "lead" },
                { id: "d2", title: "Starlight Enterprise License", value: 52000, stageId: "demo" },
                { id: "d3", title: "Global Logistics Pilot", value: 30000, stageId: "demo" },
                { id: "d4", title: "Omega Corp Q4 Contract", value: 120000, stageId: "closed" },
              ],
            },
          },
          {
            name: "Empty Pipeline",
            props: {
              stages: [
                { id: "lead", name: "Lead In", totalValue: 0 },
                { id: "demo", name: "Demo Scheduled", totalValue: 0 },
                { id: "closed", name: "Closed Won", totalValue: 0 },
              ],
              deals: [],
            },
          },
        ],
      }, null, 2);

      const pipelineKanbanSource = `// Confidential Premium Component Source
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
            <span className="text-xs font-mono text-slate-500">$\` + '{stage.totalValue ? stage.totalValue.toLocaleString() : "0"}' + \`</span>
          </div>
          <div className="space-y-3">
            {safeDeals.filter((d) => d && d.stageId === stage.id).map((deal) => (
              <div key={deal.id} className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{deal.title}</div>
                <div className="text-xs text-emerald-600 font-semibold mt-1.5 font-mono">$\` + '{deal.value ? deal.value.toLocaleString() : "0"}' + \`</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};`;

      if (!existingKanban) {
        // Premium Published Component
        await Component.create({
          name: "Pipeline Kanban Board",
          slug: "pipeline-kanban-board",
          description:
            "Enterprise CRM drag-and-drop opportunity pipeline with stages, stage velocity, and deal probabilities.",
          category: "CRM Pipeline",
          version: "1.0.0",
          accessType: "premium",
          status: "published",
          propsDocumentation:
            "### Props\n- `stages` (Stage[]): Pipeline stages\n- `deals` (Deal[]): List of opportunities\n- `onDealMove` ((dealId: string, targetStage: string) => void): Move callback",
          usageDocumentation:
            "```tsx\nimport { PipelineKanbanBoard } from './PipelineKanbanBoard';\n\nexport default function DealsPage() {\n  return <PipelineKanbanBoard stages={stages} deals={deals} onDealMove={handleMove} />;\n}\n```",
          declaredDependencies: {
            "@dnd-kit/core": "^6.1.0",
            "lucide-react": "^0.300.0",
          },
          previewData: pipelineKanbanPreviewData,
          sourceFiles: [
            {
              filename: "PipelineKanbanBoard.tsx",
              fileType: "tsx",
              content: pipelineKanbanSource,
            },
          ],
          supportingFiles: [],
          themeFiles: [
            {
              filename: "kanban.css",
              fileType: "css",
              content: `.kanban-column { min-height: 400px; }`,
            },
          ],
          installInfo: {
            packageManagerCommand: "npx tech-inject add pipeline-kanban-board --auth",
            notes: "Requires an authenticated Tech Inject premium developer token.",
          },
          agentPrompt:
            "Incorporate the PipelineKanbanBoard into the CRM layout. Connect the onDealMove handler to the opportunities API mutation.",
          createdBy: adminUser._id,
          publishedAt: new Date(),
        });
      } else {
        // Update existing record with complete deals fixture and safe source
        existingKanban.previewData = pipelineKanbanPreviewData;
        if (existingKanban.sourceFiles?.[0]) {
          existingKanban.sourceFiles[0].content = pipelineKanbanSource;
        }
        await existingKanban.save();
      }

      // Ensure Skeleton in database has rich card & text preview layout
      const existingSkeleton = await Component.findOne({ slug: "skeleton" });
      if (existingSkeleton) {
        existingSkeleton.sourceFiles = [
          {
            filename: "Skeleton.tsx",
            path: "Skeleton.tsx",
            fileType: "tsx",
            language: "typescriptreact",
            content: `import React from 'react';
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
};`,
          },
        ];
        existingSkeleton.themeFiles = [
          {
            filename: "skeleton.css",
            path: "skeleton.css",
            fileType: "css",
            language: "css",
            content: "@keyframes skeletonPulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } } .skeleton-pulse { animation: skeletonPulse 1.6s ease-in-out infinite;",
          },
        ];
        existingSkeleton.previewData = JSON.stringify({
          examples: [
            { name: "Card Skeleton", props: { variant: "card", count: 3 } },
            { name: "Avatar Skeleton", props: { variant: "avatar" } },
            { name: "Table Row Skeleton", props: { variant: "table-row", count: 4 } },
            { name: "Text Skeleton", props: { variant: "text", count: 3 } },
          ],
        }, null, 2);
        await existingSkeleton.save();
      }

      const existingDraft = await Component.findOne({ slug: "customer-activity-feed" });
      if (!existingDraft) {
        // Draft Component (Unpublished)
        await Component.create({
          name: "Customer Activity Feed",
          slug: "customer-activity-feed",
        description: "Real-time timeline of customer events, calls, emails and deals.",
        category: "CRM Activity",
        version: "0.1.0",
        accessType: "free",
        status: "draft",
        propsDocumentation: "### Draft Props\n- `activities` (Activity[])",
        usageDocumentation: "// Work in progress",
        declaredDependencies: {
          "lucide-react": "^0.300.0",
        },
        previewData: JSON.stringify({ items: [] }),
        sourceFiles: [
          {
            filename: "CustomerActivityFeed.tsx",
            fileType: "tsx",
            content: `export const CustomerActivityFeed = () => <div>Work in progress</div>;`,
          },
        ],
        supportingFiles: [],
        themeFiles: [],
        installInfo: {
          packageManagerCommand: "npx tech-inject add customer-activity-feed",
          notes: "Draft component - not for production use.",
        },
        agentPrompt: "Draft activity feed prompt.",
        createdBy: adminUser._id,
        publishedAt: null,
      });
      }

      console.log("[Seed] Created default free, premium, and draft component fixtures");
    }
  } catch (error) {
    console.error("[Seed] Error during seeding:", error);
  }
};
