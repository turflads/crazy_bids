import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface GradeQuotaTrackerProps {
  quotas: {
    grade: string;
    required: number;
    current: number;
    color: string;
  }[];
}

export default function GradeQuotaTracker({ quotas }: GradeQuotaTrackerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {quotas.map((quota) => {
        const percentage = (quota.current / quota.required) * 100;
        const isComplete = quota.current >= quota.required;

        return (
          <Card key={quota.grade} data-testid={`card-quota-${quota.grade}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Grade {quota.grade}</span>
                <span 
                  className="font-mono text-lg"
                  data-testid={`text-quota-count-${quota.grade}`}
                >
                  {quota.current}/{quota.required}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress 
                value={percentage} 
                className="h-2"
              />
              {isComplete && (
                <p className="text-xs text-auction-sold font-medium" data-testid={`text-quota-complete-${quota.grade}`}>
                  ✓ Quota Complete
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
