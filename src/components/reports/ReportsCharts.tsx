import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { he } from "date-fns/locale";

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  shifts: number;
  hours: number;
}

interface CategoryData {
  category: string;
  amount: number;
  color: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff0000'];

const categories = [
  { key: "food", label: "מזון", color: "#8884d8" },
  { key: "transportation", label: "תחבורה", color: "#82ca9d" },
  { key: "entertainment", label: "בידור", color: "#ffc658" },
  { key: "shopping", label: "קניות", color: "#ff7300" },
  { key: "utilities", label: "שירותים", color: "#00ff00" },
  { key: "miscellaneous", label: "שונות", color: "#ff0000" }
];

const ReportsCharts = () => {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<CategoryData[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUser(user);
      
      // Get last 6 months of data
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const startDate = startOfMonth(date);
        const endDate = endOfMonth(date);
        
        // Get shifts data for this month
        const { data: shifts } = await supabase
          .from('shifts')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', format(startDate, 'yyyy-MM-dd'))
          .lte('date', format(endDate, 'yyyy-MM-dd'));

        // Get expenses data for this month
        const { data: expenses } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        const monthIncome = shifts?.reduce((sum, shift) => sum + (shift.earnings || 0), 0) || 0;
        const monthExpenses = expenses?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;
        const totalHours = shifts?.reduce((sum, shift) => sum + (shift.duration || 0), 0) || 0;

        months.push({
          month: format(date, 'MMM', { locale: he }),
          income: monthIncome,
          expenses: monthExpenses,
          shifts: shifts?.length || 0,
          hours: totalHours
        });
      }

      setMonthlyData(months);

      // Get current month expense categories
      const currentMonth = new Date();
      const startOfCurrentMonth = startOfMonth(currentMonth);
      const endOfCurrentMonth = endOfMonth(currentMonth);

      const { data: currentExpenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startOfCurrentMonth.toISOString())
        .lte('created_at', endOfCurrentMonth.toISOString());

      const categoryTotals = categories.map(cat => {
        const total = currentExpenses
          ?.filter(expense => expense.category === cat.key)
          .reduce((sum, expense) => sum + expense.amount, 0) || 0;
        
        return {
          category: cat.label,
          amount: total,
          color: cat.color
        };
      }).filter(cat => cat.amount > 0);

      setExpenseCategories(categoryTotals);
      
    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">סקירה כללית</TabsTrigger>
          <TabsTrigger value="income">הכנסות</TabsTrigger>
          <TabsTrigger value="expenses">הוצאות</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>סקירת הכנסות מול הוצאות - 6 חודשים אחרונים</CardTitle>
              <CardDescription>השוואה בין הכנסותיך להוצאותיך</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `₪${Number(value).toLocaleString()}`, 
                      name === 'income' ? 'הכנסות' : 'הוצאות'
                    ]}
                  />
                  <Bar dataKey="income" fill="#22c55e" name="הכנסות" />
                  <Bar dataKey="expenses" fill="#ef4444" name="הוצאות" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>מגמת הכנסות</CardTitle>
                <CardDescription>התפתחות ההכנסות לאורך זמן</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₪${Number(value).toLocaleString()}`, 'הכנסות']} />
                    <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>סה"כ שעות עבודה</CardTitle>
                <CardDescription>מספר השעות שעבדת כל חודש</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} שעות`, 'שעות עבודה']} />
                    <Bar dataKey="hours" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          {expenseCategories.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>פילוח הוצאות החודש הנוכחי</CardTitle>
                <CardDescription>התפלגות ההוצאות לפי קטגוריות</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {expenseCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₪${Number(value).toLocaleString()}`, 'סכום']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">אין הוצאות רשומות לחודש הנוכחי</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsCharts;