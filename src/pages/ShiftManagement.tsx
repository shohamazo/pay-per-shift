import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, DollarSign, Edit, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Shift {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  hourly_rate: number;
  duration: number;
  earnings: number;
}

const ShiftManagement = () => {
  const { toast } = useToast();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user);
      if (session?.user) {
        loadShifts(session.user.id);
      }
    };
    getUser();
  }, []);

  const loadShifts = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      // Filter to only shifts data  
      const shiftsData = (data || []).filter((item: any) => item.date && item.start_time) as Shift[];
      setShifts(shiftsData);
    } catch (error) {
      console.error('Error loading shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteShift = async (shiftId: string) => {
    try {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', shiftId);

      if (error) throw error;

      setShifts(shifts.filter(shift => shift.id !== shiftId));
      toast({
        title: "המשמרת נמחקה בהצלחה",
        description: "המשמרת הוסרה מהרשימה",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו למחוק את המשמרת",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">טוען משמרות...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ניהול משמרות</h1>
          <p className="text-muted-foreground mt-2">
            צפייה ועריכה של כל המשמרות שלך
          </p>
        </div>
        <Link to="/add-shift">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            הוסף משמרת חדשה
          </Button>
        </Link>
      </div>

      {shifts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">אין משמרות עדיין</h3>
            <p className="text-muted-foreground mb-4">
              התחל לרשום את המשמרות שלך כדי לעקוב אחר הרווחים
            </p>
            <Link to="/add-shift">
              <Button>רשום משמרת ראשונה</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shifts.map((shift) => (
            <Card key={shift.id} className="shadow-medium hover:shadow-elegant transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(shift.date)}
                  </Badge>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>מחיקת משמרת</AlertDialogTitle>
                          <AlertDialogDescription>
                            האם אתה בטוח שברצונך למחוק את המשמרת מתאריך {formatDate(shift.date)}?
                            פעולה זו לא ניתנת לביטול.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ביטול</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteShift(shift.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            מחק משמרת
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">שכר לשעה:</span>
                  <span className="font-medium">₪{shift.hourly_rate}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">משך זמן:</span>
                  <span className="font-medium">{shift.duration} שעות</span>
                </div>
                
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">סך רווחים:</span>
                    <div className="flex items-center gap-1 text-income font-bold">
                      <DollarSign className="w-4 h-4" />
                      ₪{shift.earnings.toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShiftManagement;