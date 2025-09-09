import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Calendar } from "lucide-react";

const Reports = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">דוחות והיסטוריה</h1>
        <p className="text-muted-foreground">
          צפה בדוחות מפורטים על ההכנסות וההתקדמות שלך
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              דוח חודשי
            </CardTitle>
            <CardDescription>
              השוואת הכנסות בין חודשים
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>דוחות מפורטים יגיעו בקרוב</p>
              <p className="text-sm">המשך לרשום משמרות כדי לראות מגמות</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              היסטוריית משמרות
            </CardTitle>
            <CardDescription>
              כל המשמרות שרשמת עד כה
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>היסטוריה מפורטת בפיתוח</p>
              <p className="text-sm">תוכל לראות את כל המשמרות שלך כאן</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;