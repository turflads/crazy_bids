
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { getGradeBgClass } from "@/lib/gradeUtils";
import { useEffect } from "react";

interface CategoryTransitionScreenProps {
  completedGrade: string;
  nextGrade?: string;
  onTransitionComplete?: () => void;
  autoHideDuration?: number;  // milliseconds, default 3000
}

export default function CategoryTransitionScreen({ 
  completedGrade, 
  nextGrade,
  onTransitionComplete,
  autoHideDuration = 3000
}: CategoryTransitionScreenProps) {
  
  useEffect(() => {
    if (onTransitionComplete && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        onTransitionComplete();
      }, autoHideDuration);
      
      return () => clearTimeout(timer);
    }
  }, [onTransitionComplete, autoHideDuration]);
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="flex justify-center">
            <CheckCircle2 className="w-24 h-24 text-auction-sold animate-bounce" />
          </div>
          <CardTitle className="text-3xl font-bold">
            Category Completed!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-8">
          <div className="space-y-4">
            <p className="text-lg text-muted-foreground">
              All players from Grade <strong>{completedGrade}</strong> have been sold.
            </p>
            
            <div className="flex items-center justify-center gap-4 py-6">
              <Badge 
                className={`text-2xl py-3 px-6 ${getGradeBgClass(completedGrade, true)} text-white`}
              >
                Grade {completedGrade}
              </Badge>
              
              {nextGrade && (
                <>
                  <ArrowRight className="w-8 h-8 text-muted-foreground" />
                  <Badge 
                    className={`text-2xl py-3 px-6 ${getGradeBgClass(nextGrade, false)} text-white`}
                  >
                    Grade {nextGrade}
                  </Badge>
                </>
              )}
            </div>
            
            {nextGrade ? (
              <p className="text-lg font-semibold text-primary">
                Moving to Grade {nextGrade}...
              </p>
            ) : (
              <p className="text-lg font-semibold text-primary">
                Auction Complete! 🎉
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
