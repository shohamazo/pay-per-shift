import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Calendar, DollarSign, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  hourlyRate: number;
  earnings: number;
  duration: number;
}

const ShiftLogger = () => {
  const { toast } = useToast();
  const [shift, setShift] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: "",
    endTime: "",
    hourlyRate: 35,
  });

  const calculateEarnings = () => {
    if (!shift.startTime || !shift.endTime) return 0;
    
    const start = new Date(`${shift.date}T${shift.startTime}`);
    const end = new Date(`${shift.date}T${shift.endTime}`);
    
    if (end < start) {
      // Handle shifts that cross midnight
      end.setDate(end.getDate() + 1);
    }
    
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return duration * shift.hourlyRate;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shift.startTime || !shift.endTime) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות",
        variant: "destructive",
      });
      return;
    }

    const earnings = calculateEarnings();
    
    toast({
      title: "המשמרת נוספה בהצלחה!",
      description: `הרווחת ₪${earnings.toFixed(2)} מהמשמרת הזו`,
      variant: "default",
    });

    // Reset form
    setShift({
      date: new Date().toISOString().split('T')[0],
      startTime: "",
      endTime: "",
      hourlyRate: 35,
    });
  };

  const earnings = calculateEarnings();

  return (
    <div className="max-w-md mx-auto p-4">
      <Card className="shadow-medium">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            רישום משמרת חדשה
          </CardTitle>
          <CardDescription>
            מלא את הפרטים ונחשב לך את הרווחים אוטומטי
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                תאריך
              </Label>
              <Input
                type="date"
                id="date"
                value={shift.date}
                onChange={(e) => setShift({ ...shift, date: e.target.value })}
                className="text-right"
              />
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  שעת התחלה
                </Label>
                <Input
                  type="time"
                  id="startTime"
                  value={shift.startTime}
                  onChange={(e) => setShift({ ...shift, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  שעת סיום
                </Label>
                <Input
                  type="time"
                  id="endTime"
                  value={shift.endTime}
                  onChange={(e) => setShift({ ...shift, endTime: e.target.value })}
                />
              </div>
            </div>

            {/* Hourly Rate */}
            <div className="space-y-2">
              <Label htmlFor="hourlyRate" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                שכר לשעה (₪)
              </Label>
              <Input
                type="number"
                id="hourlyRate"
                value={shift.hourlyRate}
                onChange={(e) => setShift({ ...shift, hourlyRate: Number(e.target.value) })}
                min="0"
                step="0.5"
              />
            </div>

            {/* Earnings Preview */}
            {earnings > 0 && (
              <Card className="bg-income/5 border-income/20">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">רווחים צפויים מהמשמרת</p>
                    <p className="text-2xl font-bold text-income">₪{earnings.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button type="submit" className="w-full" variant="income">
              שמור משמרת
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShiftLogger;