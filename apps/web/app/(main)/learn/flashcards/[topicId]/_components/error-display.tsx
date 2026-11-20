import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error</h3>
            <p className="text-muted-foreground">{message}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
