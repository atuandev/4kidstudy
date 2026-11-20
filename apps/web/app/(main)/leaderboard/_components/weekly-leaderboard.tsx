"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";
import { getWeeklyLeaderboard, LeaderboardEntry } from "@/actions/leaderboard";

const GRADE_LABELS: Record<string, string> = {
  GRADE_1: "Lớp 1",
  GRADE_2: "Lớp 2",
  GRADE_3: "Lớp 3",
  GRADE_4: "Lớp 4",
  GRADE_5: "Lớp 5",
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Award className="h-5 w-5 text-orange-500" />;
  return null;
};

const getRankBadgeColor = (rank: number) => {
  if (rank === 1) return "bg-yellow-100 text-yellow-800 border-yellow-300";
  if (rank === 2) return "bg-gray-100 text-gray-800 border-gray-300";
  if (rank === 3) return "bg-orange-100 text-orange-800 border-orange-300";
  return "bg-blue-100 text-blue-800 border-blue-300";
};

export function WeeklyLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number>(0);
  const [currentUserEntry, setCurrentUserEntry] = useState<LeaderboardEntry | null>(null);
  const [grade, setGrade] = useState<string>("");
  const [weekStart, setWeekStart] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getWeeklyLeaderboard();
      if (result) {
        setEntries(result.entries);
        setCurrentUserRank(result.currentUserRank);
        setGrade(result.grade);
        setWeekStart(result.weekStart);

        // Find current user entry
        const userEntry = result.entries.find((entry) => entry.rank === result.currentUserRank);
        setCurrentUserEntry(userEntry || null);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const getWeekLabel = () => {
    if (!weekStart) return "";
    const date = new Date(weekStart);
    return `Tuần ${Math.ceil(date.getDate() / 7)} - Tháng ${date.getMonth() + 1}`;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Bảng xếp hạng
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {GRADE_LABELS[grade]} • {getWeekLabel()}
            </p>
          </div>
          {currentUserRank > 0 && (
            <Badge variant="outline" className="text-lg px-3 py-1">
              Hạng #{currentUserRank}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Chưa có dữ liệu xếp hạng</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {/* Show top 10 users */}
              {entries.slice(0, 10).map((entry) => (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    entry.rank <= 3
                      ? "bg-gradient-to-r from-yellow-50 to-white"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 flex items-center justify-center">
                    {getRankIcon(entry.rank) || (
                      <Badge variant="outline" className={getRankBadgeColor(entry.rank)}>
                        #{entry.rank}
                      </Badge>
                    )}
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={entry.avatarUrl || undefined} />
                    <AvatarFallback>{entry.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{entry.name}</p>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{entry.totalScore}</p>
                    <p className="text-xs text-muted-foreground">điểm</p>
                  </div>
                </div>
              ))}

              {/* Show dots if there are more users */}
              {entries.length > 10 && currentUserRank > 10 && (
                <div className="flex items-center justify-center py-2">
                  <p className="text-muted-foreground text-sm">•••</p>
                </div>
              )}
            </div>

            {/* Current User Ranking - Fixed at bottom */}
            {currentUserEntry && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2 text-center">Hạng của bạn</p>
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-blue-50 border-blue-200">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 flex items-center justify-center">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                      #{currentUserEntry.rank}
                    </Badge>
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-10 w-10 ring-2 ring-blue-400">
                    <AvatarImage src={currentUserEntry.avatarUrl || undefined} />
                    <AvatarFallback className="bg-blue-200">
                      {currentUserEntry.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate text-blue-900">{currentUserEntry.name}</p>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-700">{currentUserEntry.totalScore}</p>
                    <p className="text-xs text-blue-600">điểm</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
