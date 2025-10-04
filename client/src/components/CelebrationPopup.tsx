import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trophy, Sparkles } from "lucide-react";
import Fireworks from "./Fireworks";

interface CelebrationPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerName: string;
  teamName: string;
  teamFlag: string;
  soldPrice: number;
  grade: string;
}

export default function CelebrationPopup({
  open,
  onOpenChange,
  playerName,
  teamName,
  teamFlag,
  soldPrice,
  grade,
}: CelebrationPopupProps) {
  const gradeColor = {
    A: 'bg-grade-a',
    B: 'bg-grade-b',
    C: 'bg-grade-c',
  }[grade] || 'bg-primary';

  return (
    <>
      {open && <Fireworks />}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-celebration">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl flex items-center justify-center gap-2">
              <Trophy className="w-8 h-8 text-auction-sold" />
              Congratulations!
              <Sparkles className="w-8 h-8 text-auction-sold" />
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Badge className={`${gradeColor} text-white text-lg px-3 py-1`}>
                  Grade {grade}
                </Badge>
              </div>
              <h3 className="text-3xl font-bold" data-testid="text-player-name">
                {playerName}
              </h3>
              <p className="text-muted-foreground text-lg">SOLD TO</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl">{teamFlag}</span>
                <h4 className="text-2xl font-bold text-primary" data-testid="text-team-name">
                  {teamName}
                </h4>
              </div>
            </div>
            
            <div className="bg-auction-sold/10 border-2 border-auction-sold rounded-lg p-4">
              <p className="text-center text-sm text-muted-foreground mb-1">
                Final Price
              </p>
              <p className="text-center text-4xl font-bold font-mono text-auction-sold" data-testid="text-sold-price">
                ₹{soldPrice.toLocaleString()}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
