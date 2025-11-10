import { Card, CardContent } from "@/components/ui/card";
import { UnitCard } from "./unit-card";
import { TopicWithProgress } from "@/types/topic-with-progress";

interface UnitListProps {
  readonly topics: TopicWithProgress[];
}

const renderHeader = () => (
  <div className="flex items-center gap-4">
    <div>
      <h2 className="text-2xl font-bold">Danh sách chủ đề</h2>
    </div>
  </div>
);

export function UnitList({ topics }: UnitListProps) {
  if (topics.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            Không có chủ đề nào cho lớp học này.
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-4">
      {renderHeader()}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {topics.map((topic) => (
          <div key={topic.id}>
            <UnitCard topic={topic} />
          </div>
        ))}
      </div>
    </div>
  );
}
