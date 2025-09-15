import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell, AlertTriangle, Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

interface BudgetAlert {
  id: string;
  category: string;
  threshold_amount: number;
  threshold_percentage: number;
  is_active: boolean;
  last_triggered_at?: string;
}

interface CategorySpending {
  category: string;
  spent: number;
  label: string;
}

const categories = [
  { key: "food", label: "מזון" },
  { key: "transportation", label: "תחבורה" },
  { key: "entertainment", label: "בידור" },
  { key: "shopping", label: "קניות" },
  { key: "utilities", label: "שירותים" },
  { key: "miscellaneous", label: "שונות" }
];

const BudgetAlerts = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<BudgetAlert | null>(null);
  const [formData, setFormData] = useState({
    category: "",
    threshold_amount: 0,
    threshold_percentage: 80,
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load budget alerts
      const { data: alertsData } = await supabase
        .from('budget_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setAlerts(alertsData || []);

      // Load current month spending by category
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());

      const spending = categories.map(cat => {
        const categoryExpenses = expenses?.filter(exp => exp.category === cat.key) || [];
        const total = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        
        return {
          category: cat.key,
          spent: total,
          label: cat.label
        };
      });

      setCategorySpending(spending);
      
      // Check for alerts that should be triggered
      await checkAlerts(alertsData || [], spending);
      
    } catch (error) {
      console.error('Error loading budget alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAlerts = async (alertsList: BudgetAlert[], spending: CategorySpending[]) => {
    for (const alert of alertsList) {
      if (!alert.is_active) continue;
      
      const categorySpend = spending.find(s => s.category === alert.category);
      if (!categorySpend) continue;

      const shouldTrigger = 
        (alert.threshold_amount > 0 && categorySpend.spent >= alert.threshold_amount) ||
        (alert.threshold_percentage > 0 && alert.threshold_amount > 0 && 
         categorySpend.spent >= (alert.threshold_amount * alert.threshold_percentage / 100));

      if (shouldTrigger) {
        const categoryLabel = categories.find(c => c.key === alert.category)?.label || alert.category;
        
        toast({
          title: "🚨 אזהרת תקציב!",
          description: `הגעת לסף התקציב עבור ${categoryLabel}. הוצאת כבר ₪${categorySpend.spent.toLocaleString()}`,
          variant: "destructive",
        });

        // Update last triggered time
        await supabase
          .from('budget_alerts')
          .update({ last_triggered_at: new Date().toISOString() })
          .eq('id', alert.id);
      }
    }
  };

  const saveAlert = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editingAlert) {
        // Update existing alert
        const { error } = await supabase
          .from('budget_alerts')
          .update({
            category: formData.category,
            threshold_amount: formData.threshold_amount,
            threshold_percentage: formData.threshold_percentage,
            is_active: formData.is_active
          })
          .eq('id', editingAlert.id);

        if (error) throw error;

        toast({
          title: "התזכורת עודכנה בהצלחה",
          description: "הגדרות התזכורת נשמרו",
        });
      } else {
        // Create new alert
        const { error } = await supabase
          .from('budget_alerts')
          .insert({
            user_id: user.id,
            category: formData.category,
            threshold_amount: formData.threshold_amount,
            threshold_percentage: formData.threshold_percentage,
            is_active: formData.is_active
          });

        if (error) throw error;

        toast({
          title: "תזכורת נוצרה בהצלחה",
          description: "תקבל התראה כשתגיע לסף שהגדרת",
        });
      }

      setIsDialogOpen(false);
      setEditingAlert(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving alert:', error);
      toast({
        title: "שגיאה בשמירת התזכורת",
        description: "נסה שוב",
        variant: "destructive",
      });
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('budget_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "התזכורת נמחקה",
        description: "התזכורת הוסרה בהצלחה",
      });

      loadData();
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast({
        title: "שגיאה במחיקת התזכורת",
        description: "נסה שוב",
        variant: "destructive",
      });
    }
  };

  const toggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('budget_alerts')
        .update({ is_active: isActive })
        .eq('id', alertId);

      if (error) throw error;

      loadData();
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  const startEdit = (alert: BudgetAlert) => {
    setEditingAlert(alert);
    setFormData({
      category: alert.category,
      threshold_amount: alert.threshold_amount,
      threshold_percentage: alert.threshold_percentage,
      is_active: alert.is_active
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      category: "",
      threshold_amount: 0,
      threshold_percentage: 80,
      is_active: true
    });
  };

  const getCategoryLabel = (categoryKey: string) => {
    return categories.find(c => c.key === categoryKey)?.label || categoryKey;
  };

  const getAlertStatus = (alert: BudgetAlert) => {
    const spending = categorySpending.find(s => s.category === alert.category);
    if (!spending) return { status: 'safe', message: 'לא נמצאו הוצאות' };

    if (alert.threshold_amount > 0 && spending.spent >= alert.threshold_amount) {
      return { status: 'exceeded', message: 'חרגת מהתקציב!' };
    }

    if (alert.threshold_percentage > 0 && alert.threshold_amount > 0) {
      const percentage = (spending.spent / alert.threshold_amount) * 100;
      if (percentage >= alert.threshold_percentage) {
        return { status: 'warning', message: `${percentage.toFixed(0)}% מהתקציב` };
      }
    }

    return { status: 'safe', message: 'בטווח התקציב' };
  };

  if (loading) {
    return <div>טוען...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5" />
            תזכורות תקציב
          </h3>
          <p className="text-sm text-muted-foreground">
            הגדר התראות כשאתה מתקרב לגבולות התקציב שלך
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingAlert(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              הוסף תזכורת
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAlert ? 'עריכת תזכורת תקציב' : 'תזכורת תקציב חדשה'}
              </DialogTitle>
              <DialogDescription>
                הגדר התראה שתופיע כשתגיע לסף מסוים בקטגוריה
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
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
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">סכום תקציב (₪)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.threshold_amount}
                  onChange={(e) => setFormData({ ...formData, threshold_amount: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="percentage">אחוז להתראה (%)</Label>
                <Input
                  id="percentage"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.threshold_percentage}
                  onChange={(e) => setFormData({ ...formData, threshold_percentage: Number(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">
                  תקבל התראה כשתגיע ל-{formData.threshold_percentage}% מהתקציב
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="active">תזכורת פעילה</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                ביטול
              </Button>
              <Button onClick={saveAlert} disabled={!formData.category || formData.threshold_amount <= 0}>
                {editingAlert ? 'עדכן' : 'צור'} תזכורת
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">אין תזכורות תקציב</p>
            <p className="text-sm text-muted-foreground">צור תזכורת ראשונה כדי להתחיל לעקוב אחר התקציב</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => {
            const status = getAlertStatus(alert);
            const spending = categorySpending.find(s => s.category === alert.category);
            
            return (
              <Card key={alert.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{getCategoryLabel(alert.category)}</h4>
                        <Badge variant={
                          status.status === 'exceeded' ? 'destructive' : 
                          status.status === 'warning' ? 'default' : 'secondary'
                        }>
                          {status.message}
                        </Badge>
                        {!alert.is_active && <Badge variant="outline">לא פעיל</Badge>}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>תקציב: ₪{alert.threshold_amount.toLocaleString()}</span>
                        <span>התראה: {alert.threshold_percentage}%</span>
                        {spending && (
                          <span>הוצאות החודש: ₪{spending.spent.toLocaleString()}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={alert.is_active}
                        onCheckedChange={(checked) => toggleAlert(alert.id, checked)}
                      />
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(alert)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>מחיקת תזכורת</AlertDialogTitle>
                            <AlertDialogDescription>
                              האם אתה בטוח שברצונך למחוק את התזכורת עבור {getCategoryLabel(alert.category)}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ביטול</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteAlert(alert.id)}>
                              מחק
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetAlerts;