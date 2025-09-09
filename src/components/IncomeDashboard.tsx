import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Clock, DollarSign, Target, Plus } from "lucide-react";

// Mock data for demonstration
const mockData = {
  currentMonth: {
    earned: 3450,
    projected: 4200,
    fixedExpenses: 2800,
    remaining: 650,
    shiftsWorked: 12,
    hoursWorked: 98,
  },
  recentShifts: [
    { id: 1, date: "2024-01-15", duration: 8, earnings: 280, location: "מקום עבודה ראשי" },
    { id: 2, date: "2024-01-14", duration: 6, earnings: 210, location: "משמרת לילה" },
    { id: 3, date: "2024-01-13", duration: 8.5, earnings: 297.5, location: "מקום עבודה ראשי" },
  ],
  thisWeek: {
    shifts: 3,
    hours: 22.5,
    earnings: 787.5,
  }
};

const IncomeDashboard = () => {
  const { currentMonth, recentShifts, thisWeek } = mockData;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">שלום, משה!</h1>
          <p className="text-muted-foreground">הנה המצב הכלכלי שלך לחודש {new Date().toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}</p>
        </div>
        <Button variant="income" className="gap-2">
          <Plus className="w-4 h-4" />
          רשום משמרת
        </Button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Earnings */}
        <Card className="bg-gradient-to-br from-income/10 to-income/5 border-income/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              הרווחת החודש
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-income">₪{currentMonth.earned.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              מתוך ₪{currentMonth.projected.toLocaleString()} צפוי
            </p>
          </CardContent>
        </Card>

        {/* Fixed Expenses */}
        <Card className="bg-gradient-to-br from-expense/10 to-expense/5 border-expense/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4" />
              חשבונות קבועים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-expense">₪{currentMonth.fixedExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              דירה, ביטוח, חשמל
            </p>
          </CardContent>
        </Card>

        {/* Remaining */}
        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              נשאר לך
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">₪{currentMonth.remaining.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              לחיסכון ובילויים
            </p>
          </CardContent>
        </Card>

        {/* Hours Worked */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              שעות עבודה
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{currentMonth.hoursWorked}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ב-{currentMonth.shiftsWorked} משמרות
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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground font-medium">
                הרווחת ₪{currentMonth.earned.toLocaleString()} החודש. החשבונות שלך עומדים על ₪{currentMonth.fixedExpenses.toLocaleString()}.
              </p>
              <p className="text-success font-semibold mt-2">
                ✅ יש לך מספיק כסף לכסות את כל החשבונות! נשאר לך ₪{currentMonth.remaining.toLocaleString()} לחיסכון.
              </p>
            </div>
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              מצב יציב
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* This Week Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            השבוע הזה
          </CardTitle>
          <CardDescription>סיכום המשמרות של השבוע הנוכחי</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{thisWeek.shifts}</p>
              <p className="text-sm text-muted-foreground">משמרות</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{thisWeek.hours}</p>
              <p className="text-sm text-muted-foreground">שעות</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">₪{thisWeek.earnings}</p>
              <p className="text-sm text-muted-foreground">רווחים</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Shifts */}
      <Card>
        <CardHeader>
          <CardTitle>המשמרות האחרונות</CardTitle>
          <CardDescription>הרווחים מהמשמרות שעבדת לאחרונה</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentShifts.map((shift) => (
              <div key={shift.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {new Date(shift.date).toLocaleDateString('he-IL')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {shift.duration} שעות • {shift.location}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-bold text-income">₪{shift.earnings}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomeDashboard;