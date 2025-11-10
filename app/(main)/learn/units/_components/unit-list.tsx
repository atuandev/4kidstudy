"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Topic } from "@/types";
import { UnitCard } from "./unit-card";

interface UnitListProps {
  topics: Topic[];
}

export function UnitList({ topics }: UnitListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {/* TODO: Sidebar temp */}
        {/* <Link href='/learn/units'>
          <Button variant='ghost' size='sm' className='flex items-center gap-2'>
            <ArrowLeft className='h-4 w-4' />
          </Button>
        </Link> */}
        <div>
          <h2 className="text-2xl font-bold">Danh sách chủ đề</h2>
        </div>
      </div>

      {topics.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Không có unit nào cho lớp học này
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topics.map((topic) => (
            <div key={topic.id}>
              <UnitCard topic={topic} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
