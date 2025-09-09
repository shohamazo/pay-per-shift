import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, DollarSign, Calendar, Target, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Shift {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  hourly_rate: number;
  duration: number;
  earnings: number;
}

const IncomeDashboard = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getShifts = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user);
      
      if (!session?.user) return;

      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('date', `${currentMonth}-01`)
        .lt('date', `${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().slice(0, 10)}`)
        .order('date', { ascending: false });

      if (!error && data) {
        setShifts(data);
      }
      setLoading(false);
    };

    getShifts();
  }, []);

  const monthlyIncome = shifts.reduce((total, shift) => total + shift.earnings, 0);
  const monthlyExpenses = 2800; // This could be made dynamic later
  const remainingIncome = monthlyIncome - monthlyExpenses;
  const progressPercentage = Math.min((monthlyIncome / 4000) * 100, 100);
  const totalHours = shifts.reduce((total, shift) => total + shift.duration, 0);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-card rounded-lg"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-card rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          שלום, {user?.user_metadata?.full_name || 'משתמש'}!
        </h1>
        <p className="text-muted-foreground">
          הנה המצב הכלכלי שלך לחודש {new Date().toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Financial Progress */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardHeader>
          <CardTitle>התקדמות החודש</CardTitle>
          <CardDescription>
            הגעת ל-{progressPercentage.toFixed(0)}% מיעד החודש (₪4,000)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>₪0</span>
            <span>₪4,000</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סה"כ הכנסות החודש</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-income">₪{monthlyIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              מ-{shifts.length} משמרות
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">הוצאות קבועות</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-expense">₪{monthlyExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              דירה, חשמל, אוכל
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">נותר לסוף החודש</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remainingIncome >= 0 ? 'text-income' : 'text-expense'}`}>
              ₪{Math.abs(remainingIncome).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {remainingIncome >= 0 ? 'יש לך עודף' : 'חסר לכיסוי הוצאות'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">שעות עבודה החודש</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              ממוצע {shifts.length > 0 ? (totalHours / shifts.length).toFixed(1) : 0} שעות למשמרת
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Health Check */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">בדיקת מצב כלכלי</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-foreground font-medium">
              הרווחת ₪{monthlyIncome.toLocaleString()} החודש. החשבונות שלך עומדים על ₪{monthlyExpenses.toLocaleString()}.
            </p>
            {remainingIncome >= 0 ? (
              <p className="text-income font-semibold">
                ✅ יש לך מספיק כסף לכסות את כל החשבונות! נשאר לך ₪{remainingIncome.toLocaleString()} לחיסכון.
              </p>
            ) : (
              <p className="text-expense font-semibold">
                ⚠️ אתה צריך לעבוד עוד כדי לכסות את החשבונות. חסר לך ₪{Math.abs(remainingIncome).toLocaleString()}.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>משמרות אחרונות</CardTitle>
          <CardDescription>
            הצג את המשמרות שעבדת השבוע
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shifts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>עדיין לא רשמת משמרות החודש</p>
                <p className="text-xs">התחל לרשום כדי לראות את ההכנסות שלך</p>
              </div>
            ) : (
              shifts.slice(0, 5).map((shift) => (
                <div key={shift.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(shift.date).toLocaleDateString('he-IL')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {shift.duration.toFixed(1)} שעות עבודה • ₪{shift.hourly_rate}/שעה
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-income">
                      ₪{shift.earnings.toFixed(0)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomeDashboard;