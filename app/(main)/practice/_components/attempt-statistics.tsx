import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/types";
import { BookAIcon, Flame, Trophy } from "lucide-react";

export function AttemptStatistics({ profile }: { profile: User }) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookAIcon className="h-5 w-5 text-primary" />
            Thống kê luyện tập
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-yellow-500 rounded-full">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {profile.xp.toLocaleString()}
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                Tổng kinh nghiệm
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-orange-500 rounded-full">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {profile.streakDays}
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                Chuỗi ngày
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
