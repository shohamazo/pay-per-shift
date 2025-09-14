import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Calendar, DollarSign, Plus, Play, Square, Settings, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { calculateShiftEarnings, getSelectedJob } from "@/utils/shiftCalculations";

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
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [jobs, setJobs] = useState<any[]>([]);
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
    };
    
    const loadJobs = () => {
      const savedJobs = localStorage.getItem('userJobs');
      const savedSelectedJob = localStorage.getItem('selectedJob');
      
      if (savedJobs) {
        const jobsData = JSON.parse(savedJobs);
        setJobs(jobsData);
        
        if (savedSelectedJob && jobsData.find((j: any) => j.id === savedSelectedJob)) {
          setSelectedJobId(savedSelectedJob);
        } else if (jobsData.length > 0) {
          setSelectedJobId(jobsData[0].id);
        }
      }
    };
    
    getUser();
    loadJobs();
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
    if (!shift.startTime || !shift.endTime || !selectedJobId) return { totalEarnings: 0, breakdown: [] };
    
    const selectedJob = jobs.find(job => job.id === selectedJobId);
    if (!selectedJob) return { totalEarnings: 0, breakdown: [] };
    
    return calculateShiftEarnings(shift.startTime, shift.endTime, shift.date, selectedJob);
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
      const selectedJob = jobs.find(job => job.id === selectedJobId);
      if (!selectedJob) {
        toast({
          title: "שגיאה",
          description: "אנא בחר עבודה",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const calculation = calculateShiftEarnings(shift.startTime, shift.endTime, shift.date, selectedJob);

      const { error } = await supabase
        .from('shifts')
        .insert({
          user_id: user.id,
          job_id: selectedJobId,
          job_name: selectedJob.name,
          date: shift.date,
          start_time: shift.startTime,
          end_time: shift.endTime,
          hourly_rate: selectedJob.baseRate,
          duration: calculation.baseHours + calculation.overtimeHours + calculation.shabbatHours,
          earnings: calculation.totalEarnings,
          overtime_hours: calculation.overtimeHours,
          shabbat_hours: calculation.shabbatHours,
          night_hours: calculation.nightHours,
          transport_cost: calculation.transportCost,
        });

      if (error) {
        throw error;
      }

      toast({
        title: "המשמרת נוספה בהצלחה!",
        description: `הרווחת ₪${calculation.totalEarnings.toFixed(2)} מהמשמרת הזו`,
        variant: "default",
      });

      // Reset form
      setShift({
        date: new Date().toISOString().split('T')[0],
        startTime: "",
        endTime: "",
        hourlyRate: shift.hourlyRate,
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

  const earningsData = calculateEarnings();
  const selectedJob = jobs.find(job => job.id === selectedJobId);

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
          {/* Job Selection */}
          {jobs.length > 0 ? (
            <div className="mb-6 space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  בחר עבודה
                </Label>
                <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר עבודה למשמרת" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map(job => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.name} - ₪{job.baseRate}/שעה
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedJob && (
                <Card className="bg-muted/30">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>שעה רגילה:</span>
                        <Badge variant="secondary">₪{selectedJob.baseRate}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>שעה נוספת:</span>
                        <Badge variant="outline">₪{selectedJob.overtimeRate}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>שבת:</span>
                        <Badge>₪{selectedJob.shabbatRate}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>נסיעה:</span>
                        <Badge variant="secondary">₪{selectedJob.transportCost}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="mb-6 p-4 border border-yellow-200 rounded-lg bg-yellow-50">
              <p className="text-center text-yellow-800">
                לא הוגדרו עבודות. 
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-normal text-yellow-900 underline"
                  onClick={() => navigate("/job-settings")}
                >
                  לחץ כאן להגדרת עבודה ראשונה
                </Button>
              </p>
            </div>
          )}

          {/* Quick Start/Stop Shift */}
          <div className="mb-6 p-4 border border-border rounded-lg bg-card/30">
            <h3 className="text-lg font-semibold mb-3 text-center">מעקב זמן אמת</h3>
            <div className="flex justify-center">
              {!isShiftActive ? (
                <Button 
                  onClick={startShift}
                  size="lg"
                  className="flex items-center gap-2 bg-income hover:bg-income/90"
                  disabled={!selectedJobId}
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

            {/* Earnings Preview */}
            {earningsData.totalEarnings > 0 && selectedJob && (
              <Card className="bg-income/5 border-income/20">
                <CardContent className="pt-4">
                  <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground">רווחים צפויים מהמשמרת</p>
                    <p className="text-3xl font-bold text-income">₪{earningsData.totalEarnings.toFixed(2)}</p>
                  </div>
                  
                  {earningsData.breakdown.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Calculator className="w-4 h-4" />
                        פירוט החישוב:
                      </p>
                      {earningsData.breakdown.map((item, index) => (
                        <p key={index} className="text-xs text-muted-foreground">{item}</p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              variant="income"
              disabled={loading || !selectedJobId}
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