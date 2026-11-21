"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrophyIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { getWeeklyLeaderboard, LeaderboardEntry } from "@/actions/leaderboard";

const GRADE_LABELS: Record<string, string> = {
  GRADE_1: "Lớp 1",
  GRADE_2: "Lớp 2",
  GRADE_3: "Lớp 3",
  GRADE_4: "Lớp 4",
  GRADE_5: "Lớp 5",
};

const RANK_DISC: Record<number, string> = {
  1: "bg-sun text-ink shadow-[0_3px_0_#B78A00]",
  2: "bg-edge text-ink shadow-[0_3px_0_#CBD5E1]",
  3: "bg-tangerine text-ink shadow-[0_3px_0_#C2410C]",
};

function RankDisc({ rank }: { readonly rank: number }) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full text-base font-black tabular-nums",
        RANK_DISC[rank] ?? "bg-wash text-ink-body",
      )}
    >
      <span className="sr-only">Hạng </span>
      {rank}
    </span>
  );
}

interface RankRowProps {
  readonly entry: LeaderboardEntry;
  readonly isYou: boolean;
}

function RankRow({ entry, isYou }: RankRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl px-3 py-2.5",
        isYou ? "bg-sky-wash" : entry.rank <= 3 ? "bg-white" : "",
      )}
    >
      <RankDisc rank={entry.rank} />
      <Avatar className={cn("size-10", isYou && "ring-2 ring-sky")}>
        <AvatarImage src={entry.avatarUrl || undefined} alt="" />
        <AvatarFallback
          className={cn("font-black", isYou ? "bg-sky-deep text-white" : "bg-wash text-ink")}
        >
          {entry.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <p
        className={cn(
          "min-w-0 flex-1 truncate text-base font-extrabold",
          isYou ? "text-sky-ink" : "text-ink",
        )}
      >
        {entry.name}
        {isYou ? <span className="font-bold"> (bạn)</span> : null}
      </p>
      <p className="shrink-0 text-right text-lg font-black tabular-nums text-ink">
        {entry.totalScore}
        <span className="ml-1 text-sm font-bold text-ink-body">điểm</span>
      </p>
    </div>
  );
}

export function WeeklyLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserRank, setCurrentUserRank] = useState<number>(0);
  const [unrankedCount, setUnrankedCount] = useState<number>(0);
  const [grade, setGrade] = useState<string>("");
  const [weekStart, setWeekStart] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getWeeklyLeaderboard();
      if (result) {
        setEntries(result.entries);
        setCurrentUserId(result.currentUserId);
        setCurrentUserRank(result.currentUserRank);
        setUnrankedCount(result.unrankedCount);
        setGrade(result.grade);
        setWeekStart(result.weekStart);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const ownIndex = entries.findIndex((entry) => entry.userId === currentUserId);
  const isRanked = ownIndex !== -1;
  const othersUnranked = unrankedCount - (isRanked ? 0 : 1);

  const getWeekLabel = () => {
    if (!weekStart) return "";
    const date = new Date(weekStart);
    return `Tuần ${Math.ceil(date.getDate() / 7)} - Tháng ${date.getMonth() + 1}`;
  };

  return (
    <section
      aria-labelledby="weekly-title"
      className="rounded-[28px] bg-white p-5 shadow-sheet-lime sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 -rotate-6 items-center justify-center rounded-2xl bg-sun text-ink shadow-[0_4px_0_#B78A00]">
            <TrophyIcon size={26} weight="fill" aria-hidden="true" />
          </span>
          <div>
            <h2
              id="weekly-title"
              className="whitespace-nowrap text-lg font-black leading-tight text-ink"
            >
              Xếp hạng tuần này
            </h2>
            {grade || weekStart ? (
              <p className="text-sm font-extrabold text-sky-ink">
                {[GRADE_LABELS[grade], getWeekLabel()].filter(Boolean).map((part, i) => (
                  <span key={part} className="whitespace-nowrap">
                    {i > 0 ? " · " : null}
                    {part}
                  </span>
                ))}
              </p>
            ) : null}
          </div>
        </div>
        {currentUserRank > 0 && (
          <p className="shrink-0 rounded-full bg-sky-wash px-3 py-1 text-base font-black text-sky-ink">
            Hạng #{currentUserRank}
          </p>
        )}
      </div>

      <div className="mt-4">
        {loading ? (
          <p
            role="status"
            className="rounded-2xl bg-wash py-8 text-center text-base font-bold text-ink-body"
          >
            Đang tải...
          </p>
        ) : (
          <>
            {entries.length === 0 ? (
              <div className="rounded-2xl bg-wash px-4 py-8 text-center">
                <p className="text-base font-black text-ink">Tuần này chưa ai có điểm</p>
                <p className="text-sm font-bold text-ink-body">Học một bài để đứng đầu bảng nhé!</p>
              </div>
            ) : (
              <ol className="flex flex-col gap-1.5">
                {entries.slice(0, 10).map((entry) => (
                  <li key={entry.userId}>
                    <RankRow entry={entry} isYou={entry.userId === currentUserId} />
                  </li>
                ))}
              </ol>
            )}

            {ownIndex > 10 && (
              <p aria-hidden="true" className="py-1 text-center text-lg font-black text-ink-body">
                ⋮
              </p>
            )}

            {ownIndex >= 10 && (
              <div className="mt-2 border-t-2 border-wash pt-3">
                <p className="mb-1.5 px-3 text-sm font-extrabold text-ink-body">Hạng của bạn</p>
                <RankRow entry={entries[ownIndex]} isYou />
              </div>
            )}

            {!isRanked && entries.length > 0 && (
              <p className="mt-3 rounded-2xl bg-sun-wash px-3.5 py-2.5 text-sm font-bold text-sun-ink">
                Bạn chưa có điểm tuần này. Học một bài để vào bảng nhé!
              </p>
            )}

            {othersUnranked > 0 && (
              <p className="mt-3 px-3 text-sm font-bold text-ink-body">
                {entries.length > 0 ? "Còn " : ""}
                {othersUnranked} bạn {isRanked || entries.length === 0 ? "" : "khác "}chưa luyện tập
                tuần này
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
