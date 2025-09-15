import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Camera, CreditCard, Plus, FileText, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { he } from "date-fns/locale";

interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  subcategory?: string;
  is_recurring: boolean;
  created_at: string;
}

interface Receipt {
  id: string;
  expense_id?: string;
  image_url?: string;
  extracted_text?: string;
  extracted_amount?: number;
  extracted_vendor?: string;
  extracted_date?: string;
  processed_at?: string;
}

interface CategoryProgress {
  category: string;
  label: string;
  spent: number;
  budget: number;
  percentage: number;
}

const categories = [
  { key: "food", label: "מזון", icon: "🍽️" },
  { key: "transportation", label: "תחבורה", icon: "🚗" },
  { key: "entertainment", label: "בידור", icon: "🎬" },
  { key: "shopping", label: "קניות", icon: "🛍️" },
  { key: "utilities", label: "שירותים", icon: "💡" },
  { key: "miscellaneous", label: "שונות", icon: "📦" }
];

const ExpenseTracker = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [categoryProgress, setCategoryProgress] = useState<CategoryProgress[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("manual");
  const [formData, setFormData] = useState({
    name: "",
    amount: 0,
    category: "",
    subcategory: "",
    is_recurring: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load current month expenses
      const currentMonth = new Date();
      const startDate = startOfMonth(currentMonth);
      const endDate = endOfMonth(currentMonth);

      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      setExpenses(expensesData || []);

      // Load receipts
      const { data: receiptsData } = await supabase
        .from('receipts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setReceipts(receiptsData || []);

      // Load monthly budgets for progress calculation
      const monthKey = format(currentMonth, 'yyyy-MM-01');
      const { data: budgets } = await supabase
        .from('monthly_budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', monthKey);

      // Calculate category progress
      const progress = categories.map(cat => {
        const categoryExpenses = expensesData?.filter(exp => exp.category === cat.key) || [];
        const spent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const budget = budgets?.find(b => b.category === cat.key)?.planned_amount || 0;
        const percentage = budget > 0 ? (spent / budget) * 100 : 0;

        return {
          category: cat.key,
          label: cat.label,
          spent,
          budget,
          percentage: Math.min(percentage, 100)
        };
      });

      setCategoryProgress(progress);

    } catch (error) {
      console.error('Error loading expense data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualExpense = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          name: formData.name,
          amount: formData.amount,
          category: formData.category,
          subcategory: formData.subcategory,
          is_recurring: formData.is_recurring
        });

      if (error) throw error;

      toast({
        title: "הוצאה נוספה בהצלחה",
        description: `${formData.name} נרשמה בסכום ₪${formData.amount}`,
      });

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "שגיאה בהוספת הוצאה",
        description: "נסה שוב",
        variant: "destructive",
      });
    }
  };

  const handleReceiptUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Convert image to base64 for simple storage/processing
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        // Store receipt with basic extracted info (in real app, you'd use OCR service)
        const { error } = await supabase
          .from('receipts')
          .insert({
            user_id: user.id,
            image_data: base64,
            extracted_text: "OCR לא מותקן - הוסף ידנית",
            processed_at: new Date().toISOString()
          });

        if (error) throw error;

        toast({
          title: "קבלה הועלתה בהצלחה",
          description: "תוכל לעבד את הנתונים ידנית",
        });

        loadData();
      };
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Error uploading receipt:', error);
      toast({
        title: "שגיאה בהעלאת קבלה",
        description: "נסה שוב",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      amount: 0,
      category: "",
      subcategory: "",
      is_recurring: false
    });
  };

  const getCategoryIcon = (categoryKey: string) => {
    return categories.find(c => c.key === categoryKey)?.icon || "📦";
  };

  const getCategoryLabel = (categoryKey: string) => {
    return categories.find(c => c.key === categoryKey)?.label || categoryKey;
  };

  if (loading) {
    return <div>טוען...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            מעקב הוצאות מתקדם
          </h3>
          <p className="text-sm text-muted-foreground">
            נהל את ההוצאות שלך עם סריקת קבלות ומעקב תקציב
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              הוסף הוצאה
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>הוספת הוצאה חדשה</DialogTitle>
              <DialogDescription>
                בחר איך תרצה להוסיף את ההוצאה
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="manual">ידני</TabsTrigger>
                <TabsTrigger value="receipt">קבלה</TabsTrigger>
                <TabsTrigger value="card">אשראי</TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">שם ההוצאה</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="למשל: ארוחת צהריים"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">סכום (₪)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">קטגוריה</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר קטגוריה" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.key} value={cat.key}>
                          <span className="flex items-center gap-2">
                            <span>{cat.icon}</span>
                            {cat.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    ביטול
                  </Button>
                  <Button onClick={handleManualExpense} disabled={!formData.name || formData.amount <= 0 || !formData.category}>
                    הוסף הוצאה
                  </Button>
                </DialogFooter>
              </TabsContent>

              <TabsContent value="receipt" className="space-y-4">
                <div className="text-center space-y-4">
                  <Camera className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">סרוק קבלה</h4>
                    <p className="text-sm text-muted-foreground">העלה תמונה של קבלה לעיבוד אוטומטי</p>
                  </div>
                  
                  <Label htmlFor="receipt-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 hover:border-muted-foreground/50 transition-colors">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">לחץ להעלאת קבלה</p>
                    </div>
                    <Input
                      id="receipt-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptUpload}
                      className="hidden"
                    />
                  </Label>
                </div>
              </TabsContent>

              <TabsContent value="card" className="space-y-4">
                <div className="text-center space-y-4">
                  <CreditCard className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">חיבור אשראי</h4>
                    <p className="text-sm text-muted-foreground">חבר את כרטיס האשראי לייבוא אוטומטי</p>
                  </div>
                  
                  <Button variant="outline" className="w-full" disabled>
                    <CreditCard className="w-4 h-4 mr-2" />
                    חבר כרטיס אשראי (בפיתוח)
                  </Button>
                  
                  <p className="text-xs text-muted-foreground">
                    תכונה זו תהיה זמינה בקרוב
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Progress */}
      <Card>
        <CardHeader>
          <CardTitle>התקדמות תקציב החודש</CardTitle>
          <CardDescription>
            כמה הוצאת בכל קטגוריה ביחס לתקציב המתוכנן
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryProgress.map((cat) => (
              <div key={cat.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{getCategoryIcon(cat.category)}</span>
                    <span className="font-medium">{cat.label}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ₪{cat.spent.toLocaleString()} / ₪{cat.budget.toLocaleString()}
                  </div>
                </div>
                <Progress value={cat.percentage} className="h-2" />
                <div className="text-xs text-muted-foreground text-right">
                  {cat.percentage.toFixed(0)}% מהתקציב
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>הוצאות אחרונות</CardTitle>
          <CardDescription>
            כל ההוצאות שלך החודש ({format(new Date(), 'MMMM yyyy', { locale: he })})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">אין הוצאות רשומות החודש</p>
              <p className="text-sm text-muted-foreground">הוסף הוצאה ראשונה כדי להתחיל לעקוב</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.slice(0, 10).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getCategoryIcon(expense.category)}</span>
                    <div>
                      <p className="font-medium">{expense.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {getCategoryLabel(expense.category)} • {format(new Date(expense.created_at), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">₪{expense.amount.toLocaleString()}</p>
                    {expense.is_recurring && (
                      <Badge variant="secondary" className="text-xs">
                        חוזר
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receipts */}
      {receipts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>קבלות שהועלו</CardTitle>
            <CardDescription>
              קבלות שסרקת לאחרונה
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {receipts.slice(0, 5).map((receipt) => (
                <div key={receipt.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Camera className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {receipt.extracted_vendor || 'קבלה'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {receipt.processed_at && format(new Date(receipt.processed_at), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    {receipt.extracted_amount && (
                      <p className="font-semibold">₪{receipt.extracted_amount.toLocaleString()}</p>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {receipt.expense_id ? 'מעובד' : 'ממתין'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExpenseTracker;