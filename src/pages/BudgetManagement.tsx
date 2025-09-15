import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, Plus, Edit, Trash2, Home, Car, Phone, ShoppingCart, Coffee,
  Receipt, Stethoscope, GraduationCap, Shirt, Gift, CreditCard, PiggyBank, 
  Heart, Plane, Sparkles, Baby, MoreHorizontal
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  subcategory?: string;
  is_recurring: boolean;
}

const categories = [
  { 
    value: "housing", 
    label: "🏠 דיור", 
    icon: Home,
    subcategories: ["שכר דירה", "משכנתא", "ארנונה", "חשבון חשמל", "חשבון מים", "חשבון גז", "ועד בית"]
  },
  { 
    value: "shopping", 
    label: "🛒 קניות", 
    icon: ShoppingCart,
    subcategories: ["קניות בסופר", "קניות לבית", "מוצרי ניקיון"]
  },
  { 
    value: "transportation", 
    label: "🚗 תחבורה", 
    icon: Car,
    subcategories: ["דלק", "ביטוח רכב", "תחבורה ציבורית", "מוניות", "חניה"]
  },
  { 
    value: "food", 
    label: "🍔 אוכל ושתיה", 
    icon: Coffee,
    subcategories: ["מסעדות", "בתי קפה", "אוכל מהיר", "משלוחים"]
  },
  { 
    value: "utilities", 
    label: "💡 חשבונות ושירותים", 
    icon: Phone,
    subcategories: ["טלפון", "אינטרנט", "כבלים", "מנויי סטרימינג"]
  },
  { 
    value: "health", 
    label: "🏥 בריאות", 
    icon: Stethoscope,
    subcategories: ["רופאים", "תרופות", "ביטוח בריאות", "טיפולים"]
  },
  { 
    value: "education", 
    label: "🎓 חינוך", 
    icon: GraduationCap,
    subcategories: ["שכר לימוד", "ספרים", "חוגים", "קורסים"]
  },
  { 
    value: "clothing", 
    label: "👕 ביגוד והנעלה", 
    icon: Shirt,
    subcategories: ["בגדים", "נעליים", "אקססוריז"]
  },
  { 
    value: "entertainment", 
    label: "🎁 בילוי ופנאי", 
    icon: Gift,
    subcategories: ["סרטים", "הצגות", "טיולים", "תחביבים", "ספורט"]
  },
  { 
    value: "payments", 
    label: "💳 תשלומים וחיובים", 
    icon: CreditCard,
    subcategories: ["כרטיסי אשראי", "הלוואות", "תשלום חובות"]
  },
  { 
    value: "savings", 
    label: "🏦 חיסכון והשקעות", 
    icon: PiggyBank,
    subcategories: ["חיסכון לפנסיה", "קופת גמל", "השקעות", "ביטוח חיים"]
  },
  { 
    value: "pets", 
    label: "🐶 חיות מחמד", 
    icon: Heart,
    subcategories: ["אוכל לחיות", "וטרינר", "ציוד וצעצועים"]
  },
  { 
    value: "travel", 
    label: "✈️ נסיעות", 
    icon: Plane,
    subcategories: ["טיסות", "מלונות", "הוצאות בחו\"ל", "ביטוח נסיעות"]
  },
  { 
    value: "beauty", 
    label: "💃 יופי וטיפוח", 
    icon: Sparkles,
    subcategories: ["ספר", "קוסמטיקאית", "מוצרי טיפוח", "ציפורניים"]
  },
  { 
    value: "family", 
    label: "👪 משפחה וילדים", 
    icon: Baby,
    subcategories: ["צעצועים", "בגדי ילדים", "בייביסיטר", "פעילויות ילדים"]
  },
  { 
    value: "miscellaneous", 
    label: "📈 הוצאות שונות", 
    icon: MoreHorizontal,
    subcategories: ["מנויים לאפליקציות", "תרומות", "הוצאות לא מתוכננות", "מתנות"]
  }
];

const BudgetManagement = () => {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [newExpense, setNewExpense] = useState({
    name: "",
    amount: 0,
    category: "miscellaneous",
    subcategory: "",
    is_recurring: true,
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user);
      if (session?.user) {
        loadExpenses(session.user.id);
      }
    };
    getUser();
  }, []);

  const loadExpenses = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('amount', { ascending: false });

      if (error) throw error;
      // Filter to only expenses data
      const expensesData = (data || []).filter((item: any) => item.name && typeof item.amount === 'number') as Expense[];
      setExpenses(expensesData);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveExpense = async () => {
    if (!newExpense.name || newExpense.amount <= 0) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingExpense) {
        const { error } = await supabase
          .from('expenses')
          .update({
            name: newExpense.name,
            amount: newExpense.amount,
            category: newExpense.category,
            subcategory: newExpense.subcategory,
            is_recurring: newExpense.is_recurring,
          })
          .eq('id', editingExpense.id);

        if (error) throw error;
        
        setExpenses(expenses.map(exp => 
          exp.id === editingExpense.id 
            ? { ...exp, ...newExpense }
            : exp
        ));
        
        toast({
          title: "ההוצאה עודכנה בהצלחה",
          description: `${newExpense.name} עודכן`,
        });
      } else {
        const insertResult = await supabase
          .from('expenses')
          .insert({
            user_id: user.id,
            name: newExpense.name,
            amount: newExpense.amount,
            category: newExpense.category,
            subcategory: newExpense.subcategory,
            is_recurring: newExpense.is_recurring,
          });
        
        if (insertResult.error) throw insertResult.error;
        const newData = insertResult.data;
        
        setExpenses([newData, ...expenses]);
        
        toast({
          title: "ההוצאה נוספה בהצלחה",
          description: `${newExpense.name} נוסף לתקציב`,
        });
      }

      setIsDialogOpen(false);
      setEditingExpense(null);
      setNewExpense({ name: "", amount: 0, category: "miscellaneous", subcategory: "", is_recurring: true });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו לשמור את ההוצאה",
        variant: "destructive",
      });
    }
  };

  const deleteExpense = async (expenseId: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;

      setExpenses(expenses.filter(exp => exp.id !== expenseId));
      toast({
        title: "ההוצאה נמחקה בהצלחה",
        description: "ההוצאה הוסרה מהתקציב",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו למחוק את ההוצאה",
        variant: "destructive",
      });
    }
  };

  const startEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setNewExpense({
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
      subcategory: expense.subcategory || "",
      is_recurring: expense.is_recurring,
    });
    setIsDialogOpen(true);
  };

  const getCategoryLabel = (categoryValue: string) => {
    return categories.find(cat => cat.value === categoryValue)?.label || "📈 הוצאות שונות";
  };

  const getCategoryIcon = (categoryValue: string) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.icon : MoreHorizontal;
  };

  const getSubcategories = (categoryValue: string) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category?.subcategories || [];
  };

  const totalMonthlyExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">טוען תקציב...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ניהול תקציב</h1>
          <p className="text-muted-foreground mt-2">
            נהל את ההוצאות החודשיות שלך
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              הוסף הוצאה
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingExpense ? "עריכת הוצאה" : "הוספת הוצאה חדשה"}
              </DialogTitle>
              <DialogDescription>
                הוסף או ערוך הוצאה חודשית כדי לעקוב אחר התקציב שלך
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">שם ההוצאה</Label>
                <Input
                  id="name"
                  value={newExpense.name}
                  onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                  placeholder="למשל: שכר דירה"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">סכום (₪)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">קטגוריה</Label>
                <Select 
                  value={newExpense.category} 
                  onValueChange={(value) => setNewExpense({ ...newExpense, category: value, subcategory: "" })}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="בחר קטגוריה" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border shadow-lg z-50">
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} className="hover:bg-accent">
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {getSubcategories(newExpense.category).length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="subcategory">תת-קטגוריה (אופציונלי)</Label>
                  <Select 
                    value={newExpense.subcategory} 
                    onValueChange={(value) => setNewExpense({ ...newExpense, subcategory: value })}
                  >
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="בחר תת-קטגוריה" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border shadow-lg z-50">
                      <SelectItem value="none" className="hover:bg-accent">
                        ללא תת-קטגוריה
                      </SelectItem>
                      {getSubcategories(newExpense.category).map((subcat) => (
                        <SelectItem key={subcat} value={subcat} className="hover:bg-accent">
                          {subcat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                ביטול
              </Button>
              <Button onClick={saveExpense}>
                {editingExpense ? "עדכן" : "הוסף"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Card */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-expense" />
            סיכום תקציב חודשי
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">סך כל ההוצאות החודשיות</p>
            <p className="text-3xl font-bold text-expense">₪{totalMonthlyExpenses.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      {expenses.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">אין הוצאות עדיין</h3>
            <p className="text-muted-foreground mb-4">
              הוסף את ההוצאות החודשיות שלך כדי לנהל את התקציב
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              הוסף הוצאה ראשונה
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {expenses.map((expense) => {
            const IconComponent = getCategoryIcon(expense.category);
            
            return (
              <Card key={expense.id} className="shadow-medium hover:shadow-elegant transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <IconComponent className="w-3 h-3" />
                      {getCategoryLabel(expense.category)}
                    </Badge>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0"
                        onClick={() => startEdit(expense)}
                      >
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
                            <AlertDialogTitle>מחיקת הוצאה</AlertDialogTitle>
                            <AlertDialogDescription>
                              האם אתה בטוח שברצונך למחוק את ההוצאה "{expense.name}"?
                              פעולה זו לא ניתנת לביטול.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ביטול</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteExpense(expense.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              מחק הוצאה
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{expense.name}</h3>
                    {expense.subcategory && (
                      <p className="text-sm text-muted-foreground">{expense.subcategory}</p>
                    )}
                  </div>
                  
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">סכום חודשי:</span>
                      <div className="flex items-center gap-1 text-expense font-bold">
                        <DollarSign className="w-4 h-4" />
                        ₪{expense.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  {expense.is_recurring && (
                    <Badge variant="secondary" className="text-xs">
                      הוצאה קבועה
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetManagement;