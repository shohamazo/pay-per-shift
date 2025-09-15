import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Calendar, PieChart } from "lucide-react";
import ReportsCharts from "@/components/reports/ReportsCharts";

const Reports = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">דוחות והיסטוריה</h1>
        <p className="text-muted-foreground">
          צפה בדוחות מפורטים על ההכנסות וההוצאות שלך עם גרפים ונתונים מדויקים
        </p>
      </div>

      <ReportsCharts />

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              סיכום השנה
            </CardTitle>
            <CardDescription>
              נתונים מצטברים לשנה הנוכחית
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-6">
            <div className="space-y-2">
              <p className="text-2xl font-bold text-primary">₪24,680</p>
              <p className="text-sm text-muted-foreground">סה"כ הכנסות השנה</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              ממוצע חודשי
            </CardTitle>
            <CardDescription>
              הכנסה ממוצעת לחודש
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-6">
            <div className="space-y-2">
              <p className="text-2xl font-bold text-green-600">₪4,113</p>
              <p className="text-sm text-muted-foreground">ממוצע 6 חודשים אחרונים</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              ימי עבודה
            </CardTitle>
            <CardDescription>
              סטטיסטיקות ימי עבודה
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-6">
            <div className="space-y-2">
              <p className="text-2xl font-bold text-blue-600">142</p>
              <p className="text-sm text-muted-foreground">ימי עבודה השנה</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;