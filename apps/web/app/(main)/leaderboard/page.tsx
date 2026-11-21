import { PageHeading } from "@/components/page-heading";
import { XPChart } from "./_components/xp-chart";
import { PracticeChart } from "./_components/practice-charts";
import { WeeklyLeaderboard } from "./_components/weekly-leaderboard";

export default function LeaderboardPage() {
  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeading
        title="Bảng xếp hạng"
        echo="Leaderboard"
        description="Theo dõi tiến độ học tập và so sánh với bạn bè cùng lớp"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="lg:order-2">
          <div className="lg:sticky lg:top-6">
            <WeeklyLeaderboard />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-6 lg:order-1">
          <XPChart />
          <PracticeChart />
        </div>
      </div>
    </div>
  );
}
