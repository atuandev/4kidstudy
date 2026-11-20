"use client";

import { type ReactNode, use, useId, useMemo, useState } from "react";
import { BookOpenIcon, CaretDownIcon, ChatTextIcon, TargetIcon } from "@/components/icons";
import type { GradeLearningStats, TopItem } from "@/actions/learning-progress/stats-by-grade";
import { cn } from "@/lib/utils";

type Section = "flashcard" | "sentence" | "topic";

const PREVIEW_COUNT = 5;

interface ProgressStripProps {
  readonly statsPromise: Promise<GradeLearningStats>;
}

/**
 * The grade's learning progress, always on the page: three stat tiles, and tapping one
 * opens its detail list in place below the row (one at a time).
 */
export function ProgressStrip({ statsPromise }: ProgressStripProps) {
  const stats = use(statsPromise);
  const [open, setOpen] = useState<Section | null>(null);
  const panelId = useId();

  const toggle = (section: Section) => setOpen((current) => (current === section ? null : section));

  return (
    <section aria-label="Tiến trình học" className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <StatTile
          icon={<TargetIcon />}
          tone="sky"
          name="Thẻ từ"
          en="Words"
          value={`${stats.flashcardStats.reviewed}/${stats.flashcardStats.total}`}
          percentage={stats.flashcardStats.percentage}
          expanded={open === "flashcard"}
          controls={panelId}
          onClick={() => toggle("flashcard")}
        />
        <StatTile
          icon={<ChatTextIcon />}
          tone="leaf"
          name="Thẻ câu"
          en="Sentences"
          value={`${stats.sentenceStats.reviewed}/${stats.sentenceStats.total}`}
          percentage={stats.sentenceStats.percentage}
          expanded={open === "sentence"}
          controls={panelId}
          onClick={() => toggle("sentence")}
        />
        <StatTile
          icon={<BookOpenIcon />}
          tone="grape"
          name="Chủ đề xong"
          en="Topics done"
          value={String(stats.topicCount)}
          expanded={open === "topic"}
          controls={panelId}
          onClick={() => toggle("topic")}
        />
      </div>

      {open ? (
        <div id={panelId} className="rounded-[22px] bg-white p-4 shadow-sheet-lime sm:p-5">
          {open === "topic" ? (
            <TopicList topics={stats.topTopics} />
          ) : (
            <ItemList
              key={open}
              items={
                open === "flashcard" ? stats.flashcardStats.allItems : stats.sentenceStats.allItems
              }
              topics={stats.topics}
              empty={open === "flashcard" ? "Bé chưa học thẻ từ nào." : "Bé chưa học thẻ câu nào."}
            />
          )}
        </div>
      ) : null}
    </section>
  );
}

/** Placeholder with the strip's shape while the stats stream in. */
export function ProgressStripSkeleton() {
  return (
    <div
      className="grid grid-cols-3 gap-2 sm:gap-4"
      aria-busy="true"
      aria-label="Đang tải tiến trình"
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-[104px] animate-pulse rounded-[22px] bg-white/70 sm:h-[112px]"
        />
      ))}
    </div>
  );
}

const TONES = {
  sky: { tile: "bg-sky", bar: "bg-sky", ring: "ring-sky" },
  leaf: { tile: "bg-leaf", bar: "bg-leaf", ring: "ring-leaf" },
  grape: { tile: "bg-grape", bar: "bg-grape", ring: "ring-grape" },
} as const;

interface StatTileProps {
  readonly icon: ReactNode;
  readonly tone: keyof typeof TONES;
  readonly name: string;
  readonly en: string;
  readonly value: string;
  readonly percentage?: number;
  readonly expanded: boolean;
  readonly controls: string;
  readonly onClick: () => void;
}

function StatTile({
  icon,
  tone,
  name,
  en,
  value,
  percentage,
  expanded,
  controls,
  onClick,
}: StatTileProps) {
  const colors = TONES[tone];
  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-controls={expanded ? controls : undefined}
      onClick={onClick}
      className={cn(
        "flex min-w-0 cursor-pointer flex-col gap-2 rounded-[22px] bg-white p-3 text-left shadow-sheet-lime outline-none transition-colors hover:bg-wash focus-visible:ring-4 focus-visible:ring-sky/50 sm:p-4",
        expanded && `ring-[3px] ${colors.ring}`,
      )}
    >
      <span className="flex items-center gap-2">
        <span
          className={cn(
            "hidden size-9 shrink-0 items-center justify-center rounded-xl text-white sm:flex [&_svg]:size-5",
            colors.tile,
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-sm font-black text-ink sm:text-base">{name}</span>
          <span className="hidden truncate text-sm font-bold text-ink-meta sm:block">{en}</span>
        </span>
        <CaretDownIcon
          className={cn(
            "size-4 shrink-0 text-ink-meta transition-transform duration-200",
            expanded && "rotate-180",
          )}
          aria-hidden="true"
        />
      </span>
      <span className="flex items-baseline gap-1.5">
        <span className="text-xl font-black tabular-nums text-ink sm:text-2xl">{value}</span>
        {percentage !== undefined ? (
          <span className="text-sm font-bold tabular-nums text-ink-meta">
            {percentage.toFixed(0)}%
          </span>
        ) : null}
      </span>
      {percentage !== undefined ? (
        <span className="block h-2 rounded-full bg-wash" aria-hidden="true">
          <span
            className={cn("block h-full rounded-full", colors.bar)}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </span>
      ) : null}
    </button>
  );
}

interface ItemListProps {
  readonly items: TopItem[];
  readonly topics: { id: number; name: string }[];
  readonly empty: string;
}

/** Most-reviewed cards, filtered by topic chips; shows five until asked for more. */
function ItemList({ items, topics, empty }: ItemListProps) {
  const [topicId, setTopicId] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Only offer chips for topics that actually have reviewed items.
  const chips = useMemo(() => {
    const used = new Set(items.map((item) => item.topicId));
    return topics.filter((topic) => used.has(topic.id));
  }, [items, topics]);

  const filtered = topicId === null ? items : items.filter((item) => item.topicId === topicId);
  const visible = showAll ? filtered : filtered.slice(0, PREVIEW_COUNT);

  if (items.length === 0) {
    return <p className="py-6 text-center text-base text-ink-body">{empty}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {chips.length > 1 ? (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <Chip active={topicId === null} onClick={() => setTopicId(null)}>
            Tất cả
          </Chip>
          {chips.map((topic) => (
            <Chip key={topic.id} active={topicId === topic.id} onClick={() => setTopicId(topic.id)}>
              {topic.name}
            </Chip>
          ))}
        </div>
      ) : null}
      <ol className="divide-y-2 divide-wash">
        {visible.map((item, index) => (
          <li key={item.id} className="flex items-center gap-3 py-2.5">
            <Rank n={index + 1} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-base font-extrabold text-ink">{item.name}</span>
              {topicId === null && item.topicName ? (
                <span className="block truncate text-sm text-ink-meta">{item.topicName}</span>
              ) : null}
            </span>
            <ReviewCount n={item.reviewCount} />
          </li>
        ))}
      </ol>
      {filtered.length > PREVIEW_COUNT ? (
        <button
          type="button"
          onClick={() => setShowAll((value) => !value)}
          className="cursor-pointer self-center rounded-full px-3 py-1 text-sm font-extrabold text-sky-deep transition-colors hover:bg-sky-wash hover:text-sky-ink"
        >
          {showAll ? "Thu gọn" : `Xem thêm ${filtered.length - PREVIEW_COUNT}`}
        </button>
      ) : null}
    </div>
  );
}

/** Finished topics; each jumps to its card in the grid below. */
function TopicList({ topics }: { readonly topics: GradeLearningStats["topTopics"] }) {
  if (topics.length === 0) {
    return <p className="py-6 text-center text-base text-ink-body">Bé chưa học xong chủ đề nào.</p>;
  }
  return (
    <ol className="divide-y-2 divide-wash">
      {topics.map((topic, index) => (
        <li key={topic.id}>
          <a
            href={`#topic-${topic.id}`}
            className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-wash"
          >
            <Rank n={index + 1} />
            <span className="min-w-0 flex-1 truncate text-base font-extrabold text-ink">
              {topic.name}
            </span>
            <ReviewCount n={topic.reviewCount} />
          </a>
        </li>
      ))}
    </ol>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  readonly active: boolean;
  readonly onClick: () => void;
  readonly children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "shrink-0 cursor-pointer whitespace-nowrap rounded-full border-2 px-3 py-1 text-sm font-extrabold transition-colors",
        active
          ? "border-sky bg-sky-wash text-sky-ink"
          : "border-edge bg-white text-ink-body hover:bg-wash",
      )}
    >
      {children}
    </button>
  );
}

function Rank({ n }: { readonly n: number }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-wash text-sm font-black tabular-nums text-ink-body">
      {n}
    </span>
  );
}

function ReviewCount({ n }: { readonly n: number }) {
  return (
    <span className="shrink-0 rounded-full bg-sky-wash px-2.5 py-0.5 text-sm font-black tabular-nums text-sky-ink">
      {n} lần
    </span>
  );
}
