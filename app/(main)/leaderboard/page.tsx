import { StreakChart } from "./_components/streak-chart";
import { XPChart } from "./_components/xp-chart";
import { WeeklyLeaderboard } from "./_components/weekly-leaderboard";

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Bảng xếp hạng</h1>
        <p className="text-muted-foreground mt-2">
          Theo dõi tiến độ học tập và so sánh với bạn bè cùng lớp
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side - Charts */}
        <div className="lg:col-span-2 space-y-6">
          <StreakChart />
          <XPChart />
        </div>

        {/* Right side - Leaderboard */}
        <div className="lg:col-span-1">
          <WeeklyLeaderboard />
        </div>
      </div>
    </div>
  );
}