import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Topic } from "@/types";
import Image from "next/image";

export const TopicCard = ({ topic }: { topic: Topic }) => {
  return (
    <Link key={topic.id} href={`/learn/flashcards/${topic.id}`}>
      <Card className="cursor-pointer transition-all hover:shadow-md hover:bg-muted/50">
        <CardHeader>
          {topic.coverImage ? (
            <div className="relative w-full h-32 rounded-lg overflow-hidden">
              <Image
                src={topic.coverImage}
                alt={topic.title || `Topic cover image`}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-32 rounded-lg bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">
                Không có ảnh
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <CardTitle className="text-lg font-bold">Unit {topic.order}: {topic.title}</CardTitle>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {topic?.description}
          </p>
          <div className="flex items-center justify-between">
            <Button size="sm" variant="primary">
              Học ngay
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
