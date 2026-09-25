"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Pos = { x: number; y: number };


function ChipShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900/95 border border-white/20 rounded-2xl p-4 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.06)]">
      {children}
    </div>
  );
}
function Label({ text }: { text: string }) {
  return <p className="text-[10px] text-zinc-500 mb-2.5 font-mono tracking-wider">{text}</p>;
}

const CHIPS: { id: string; content: React.ReactNode }[] = [
  {
    id: "button",
    content: (
      <ChipShell>
        <Label text="<Button />" />
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-blue-500 rounded-md text-[11px] text-white font-medium">Primary</span>
          <span className="px-3 py-1 border border-zinc-600 rounded-md text-[11px] text-zinc-300">Ghost</span>
          <span className="px-3 py-1 bg-zinc-800 rounded-md text-[11px] text-zinc-400">Outline</span>
        </div>
      </ChipShell>
    ),
  },
  {
    id: "badge",
    content: (
      <ChipShell>
        <Label text="<Badge />" />
        <div className="flex gap-1.5 flex-wrap">
          <span className="px-2.5 py-1 bg-green-500/20 border border-green-700/50 rounded-full text-[10px] text-green-300 font-medium">Success</span>
          <span className="px-2.5 py-1 bg-red-500/20 border border-red-700/50 rounded-full text-[10px] text-red-300 font-medium">Error</span>
          <span className="px-2.5 py-1 bg-yellow-500/20 border border-yellow-700/50 rounded-full text-[10px] text-yellow-300 font-medium">Warn</span>
        </div>
      </ChipShell>
    ),
  },
  {
    id: "input",
    content: (
      <ChipShell>
        <Label text="<Input />" />
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-[11px] text-zinc-400 min-w-[170px]">
          <svg className="w-3.5 h-3.5 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          Search components...
        </div>
      </ChipShell>
    ),
  },
  {
    id: "switch",
    content: (
      <ChipShell>
        <Label text="<Switch />" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-5.5 bg-blue-500 rounded-full flex items-center px-0.5" style={{height:'22px',width:'40px'}}>
            <div className="w-4 h-4 bg-white rounded-full ml-auto shadow" />
          </div>
          <span className="text-[10px] text-zinc-400">On</span>
          <div className="w-10 bg-zinc-700 rounded-full flex items-center px-0.5" style={{height:'22px',width:'40px'}}>
            <div className="w-4 h-4 bg-zinc-400 rounded-full shadow" />
          </div>
          <span className="text-[10px] text-zinc-500">Off</span>
        </div>
      </ChipShell>
    ),
  },
  {
    id: "select",
    content: (
      <ChipShell>
        <Label text="<Select />" />
        <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-[11px] text-zinc-300 min-w-[165px]">
          <span>All Components</span>
          <svg className="w-3 h-3 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </ChipShell>
    ),
  },
  {
    id: "avatar",
    content: (
      <ChipShell>
        <Label text="<Avatar />" />
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[11px] text-white font-bold">AK</div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-[10px] text-white font-bold">JD</div>
          <div className="w-8 h-8 rounded-full bg-zinc-700 border border-zinc-600 flex items-center justify-center text-[10px] text-zinc-300">+3</div>
        </div>
      </ChipShell>
    ),
  },
  {
    id: "progress",
    content: (
      <ChipShell>
        <Label text="<Progress />" />
        <div className="space-y-2 min-w-[165px]">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full w-[72%] bg-blue-400 rounded-full" />
            </div>
            <span className="text-[10px] text-zinc-400 w-7 text-right">72%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full w-[40%] bg-green-400 rounded-full" />
            </div>
            <span className="text-[10px] text-zinc-400 w-7 text-right">40%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full w-[88%] bg-purple-400 rounded-full" />
            </div>
            <span className="text-[10px] text-zinc-400 w-7 text-right">88%</span>
          </div>
        </div>
      </ChipShell>
    ),
  },
  {
    id: "alert",
    content: (
      <ChipShell>
        <Label text="<Alert />" />
        <div className="flex items-start gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/25 rounded-xl min-w-[180px]">
          <div className="w-3.5 h-3.5 rounded-full bg-blue-400 mt-0.5 flex-shrink-0" />
          <span className="text-[10px] text-blue-300 leading-snug">Component installed successfully</span>
        </div>
      </ChipShell>
    ),
  },
  {
    id: "card",
    content: (
      <ChipShell>
        <Label text="<Card />" />
        <div className="border border-zinc-700/60 rounded-xl p-3 bg-zinc-800/60 min-w-[155px]">
          <div className="h-2.5 w-20 bg-zinc-600 rounded-md mb-2" />
          <div className="h-1.5 w-28 bg-zinc-700 rounded mb-1.5" />
          <div className="h-1.5 w-20 bg-zinc-700 rounded mb-1.5" />
          <div className="h-1.5 w-24 bg-zinc-700/60 rounded" />
        </div>
      </ChipShell>
    ),
  },
  {
    id: "checkbox",
    content: (
      <ChipShell>
        <Label text="<Checkbox />" />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4.5 h-4.5 rounded bg-blue-500 flex items-center justify-center flex-shrink-0" style={{width:'18px',height:'18px'}}>
              <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span className="text-[11px] text-zinc-300">Dark mode</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4.5 h-4.5 rounded border-2 border-zinc-600 flex-shrink-0" style={{width:'18px',height:'18px'}} />
            <span className="text-[11px] text-zinc-500">Animations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4.5 h-4.5 rounded border-2 border-zinc-600 flex-shrink-0" style={{width:'18px',height:'18px'}} />
            <span className="text-[11px] text-zinc-500">Tooltips</span>
          </div>
        </div>
      </ChipShell>
    ),
  },
  {
    id: "tabs",
    content: (
      <ChipShell>
        <Label text="<Tabs />" />
        <div className="flex gap-0.5 p-1 bg-zinc-800 rounded-xl">
          <span className="px-3 py-1 bg-zinc-700 rounded-lg text-[11px] text-zinc-200 font-medium">Preview</span>
          <span className="px-3 py-1 text-[11px] text-zinc-500">Code</span>
          <span className="px-3 py-1 text-[11px] text-zinc-500">Props</span>
        </div>
      </ChipShell>
    ),
  },
  {
    id: "breadcrumb",
    content: (
      <ChipShell>
        <Label text="<Breadcrumb />" />
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-blue-300">Home</span>
          <span className="text-zinc-600">/</span>
          <span className="text-blue-300">Components</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-300 font-medium">Button</span>
        </div>
      </ChipShell>
    ),
  },
  {
    id: "spinner",
    content: (
      <ChipShell>
        <Label text="<Spinner />" />
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-zinc-300 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <span className="text-[11px] text-zinc-400">Loading...</span>
        </div>
      </ChipShell>
    ),
  },
  {
    id: "tooltip",
    content: (
      <ChipShell>
        <Label text="<Tooltip />" />
        <div className="relative inline-block mt-5 mb-2">
          <div className="px-6 py-2.5 bg-zinc-800 border border-zinc-700 rounded-full text-[13px] text-zinc-300 font-medium min-w-[130px] text-center">Hover me</div>
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-zinc-700 rounded-xl text-[11px] text-zinc-200 whitespace-nowrap shadow-xl font-medium">
            Copy to clipboard
          </div>
        </div>
      </ChipShell>
    ),
  },
  {
    id: "radio",
    content: (
      <ChipShell>
        <Label text="<Radio />" />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4.5 h-4.5 rounded-full border-2 border-blue-500 flex items-center justify-center flex-shrink-0" style={{width:'18px',height:'18px'}}>
              <div className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
            <span className="text-[11px] text-zinc-300">Free tier</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full border-2 border-zinc-600 flex-shrink-0" style={{width:'18px',height:'18px'}} />
            <span className="text-[11px] text-zinc-500">Pro</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full border-2 border-zinc-600 flex-shrink-0" style={{width:'18px',height:'18px'}} />
            <span className="text-[11px] text-zinc-500">Enterprise</span>
          </div>
        </div>
      </ChipShell>
    ),
  },
  {
    id: "code",
    content: (
      <ChipShell>
        <Label text="<CodeBlock />" />
        <div className="font-mono text-[10px] space-y-1 bg-zinc-800/60 rounded-xl px-3 py-2.5 min-w-[185px]">
          <p><span className="text-purple-400">import</span> <span className="text-zinc-200">Button</span> <span className="text-purple-400">from</span> <span className="text-green-300">&apos;./Button&apos;</span></p>
          <p><span className="text-purple-400">import</span> <span className="text-zinc-200">Badge</span> <span className="text-purple-400">from</span> <span className="text-green-300">&apos;./Badge&apos;</span></p>
          <p><span className="text-zinc-500">// tech-inject-ui v1.0</span></p>
        </div>
      </ChipShell>
    ),
  },
];

type Slot = { minX: number; maxX: number; minY: number; maxY: number };

const CANVAS_SLOTS: Slot[] = [
  // Far Left Column
  { minX: 1, maxX: 4, minY: 7, maxY: 14 },
  { minX: 1, maxX: 4, minY: 26, maxY: 34 },
  { minX: 1, maxX: 4, minY: 46, maxY: 54 },
  { minX: 1, maxX: 4, minY: 66, maxY: 74 },
  { minX: 1, maxX: 4, minY: 84, maxY: 90 },

  // Mid Left Column
  { minX: 14, maxX: 21, minY: 4, maxY: 11 },
  { minX: 13, maxX: 20, minY: 32, maxY: 40 },
  { minX: 14, maxX: 21, minY: 62, maxY: 70 },
  { minX: 15, maxX: 22, minY: 84, maxY: 90 },

  // Far Right Column
  { minX: 78, maxX: 84, minY: 7, maxY: 14 },
  { minX: 77, maxX: 83, minY: 26, maxY: 34 },
  { minX: 78, maxX: 84, minY: 46, maxY: 54 },
  { minX: 77, maxX: 83, minY: 66, maxY: 74 },
  { minX: 76, maxX: 82, minY: 84, maxY: 90 },

  // Mid Right Column
  { minX: 67, maxX: 74, minY: 4, maxY: 11 },
  { minX: 66, maxX: 73, minY: 82, maxY: 88 },
];

function generateRandomPositions(): Record<string, Pos> {
  const chipIds = CHIPS.map((c) => c.id);
  // Fisher-Yates shuffle
  const shuffledSlots = [...CANVAS_SLOTS];
  for (let i = shuffledSlots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledSlots[i], shuffledSlots[j]] = [shuffledSlots[j], shuffledSlots[i]];
  }

  const result: Record<string, Pos> = {};
  chipIds.forEach((id, index) => {
    const slot = shuffledSlots[index % shuffledSlots.length];
    const x = Math.round(slot.minX + Math.random() * (slot.maxX - slot.minX));
    const y = Math.round(slot.minY + Math.random() * (slot.maxY - slot.minY));
    result[id] = { x, y };
  });

  return result;
}

const FLOAT_CLASSES = ["fc-1", "fc-2", "fc-3", "fc-4", "fc-5", "fc-6"];

export function HeroChips() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Record<string, Pos>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const dragState = useRef<{
    id: string;
    startMouseX: number;
    startMouseY: number;
    startPosX: number;
    startPosY: number;
  } | null>(null);

  useEffect(() => {
    // Generate fresh random positions on every page refresh/load
    setPositions(generateRandomPositions());
    setMounted(true);
  }, []);

  const getPos = (id: string): Pos =>
    positions[id] ?? { x: 10, y: 50 };

  const onMouseDown = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const pos = getPos(id);
    dragState.current = {
      id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startPosX: pos.x,
      startPosY: pos.y,
    };
    setDraggingId(id);
  };

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.current || !containerRef.current) return;
    const { id, startMouseX, startMouseY, startPosX, startPosY } = dragState.current;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - startMouseX) / rect.width) * 100;
    const dy = ((e.clientY - startMouseY) / rect.height) * 100;
    const newX = Math.max(0, Math.min(88, startPosX + dx));
    const newY = Math.max(0, Math.min(92, startPosY + dy));
    setPositions(prev => ({ ...prev, [id]: { x: newX, y: newY } }));
  }, []);

  const onMouseUp = useCallback(() => {
    dragState.current = null;
    setDraggingId(null);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="absolute inset-0 overflow-hidden select-none"
    >
      {CHIPS.map((chip, i) => {
        const pos = getPos(chip.id);
        const isDragging = draggingId === chip.id;
        return (
          <div
            key={chip.id}
            onMouseDown={onMouseDown(chip.id)}
            className={`absolute ${!isDragging ? FLOAT_CLASSES[i % 6] : ""}`}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              opacity: isDragging ? 0.96 : 0.75,
              cursor: isDragging ? "grabbing" : "grab",
              pointerEvents: "all",
              zIndex: isDragging ? 50 : 10,
              transition: isDragging ? "none" : "opacity 0.2s ease",
              userSelect: "none",
            }}
          >
            {chip.content}
          </div>
        );
      })}
    </div>
  );
}
