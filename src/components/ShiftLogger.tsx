import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Calendar, DollarSign, Plus, Play, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [shift, setShift] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: "",
    endTime: "",
    hourlyRate: 35,
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user);
      
      if (session?.user?.user_metadata?.hourly_rate) {
        setShift(prev => ({ 
          ...prev, 
          hourlyRate: session.user.user_metadata.hourly_rate 
        }));
      }
    };
    getUser();
  }, []);

  const startShift = () => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    
    setShift(prev => ({
      ...prev,
      startTime: currentTime,
      endTime: "",
      date: now.toISOString().split('T')[0]
    }));
    
    setIsShiftActive(true);
    
    toast({
      title: "המשמרת התחילה!",
      description: `המשמרת התחילה בשעה ${currentTime}`,
    });
  };

  const endShift = () => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    
    setShift(prev => ({
      ...prev,
      endTime: currentTime
    }));
    
    setIsShiftActive(false);
    
    toast({
      title: "המשמרת הסתיימה!",
      description: `המשמרת הסתיימה בשעה ${currentTime}`,
    });
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!shift.startTime || !shift.endTime) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!user) {
      toast({
        title: "שגיאה",
        description: "יש להתחבר כדי לשמור משמרת",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const start = new Date(`${shift.date}T${shift.startTime}`);
      const end = new Date(`${shift.date}T${shift.endTime}`);
      
      if (end < start) {
        end.setDate(end.getDate() + 1);
      }
      
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      const earnings = duration * shift.hourlyRate;

      const { error } = await supabase
        .from('shifts')
        .insert({
          user_id: user.id,
          date: shift.date,
          start_time: shift.startTime,
          end_time: shift.endTime,
          hourly_rate: shift.hourlyRate,
          duration: duration,
          earnings: earnings,
        });

      if (error) {
        throw error;
      }

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
        hourlyRate: shift.hourlyRate, // Keep the same hourly rate
      });

      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו לשמור את המשמרת, נסה שוב",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
          {/* Quick Start/Stop Shift */}
          <div className="mb-6 p-4 border border-border rounded-lg bg-card/30">
            <h3 className="text-lg font-semibold mb-3 text-center">מעקב זמן אמת</h3>
            <div className="flex justify-center">
              {!isShiftActive ? (
                <Button 
                  onClick={startShift}
                  size="lg"
                  className="flex items-center gap-2 bg-income hover:bg-income/90"
                >
                  <Play className="w-5 h-5" />
                  התחל משמרת
                </Button>
              ) : (
                <Button 
                  onClick={endShift}
                  size="lg"
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <Square className="w-5 h-5" />
                  סיים משמרת
                </Button>
              )}
            </div>
            {isShiftActive && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                המשמרת פעילה מאז {shift.startTime}
              </p>
            )}
          </div>

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

            <Button 
              type="submit" 
              className="w-full" 
              variant="income"
              disabled={loading}
            >
              {loading ? "שומר..." : "שמור משמרת"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShiftLogger;