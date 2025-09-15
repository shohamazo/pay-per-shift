import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Mail, Lock, DollarSign, User } from "lucide-react";

const RegisterForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    hourlyRate: 35,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "שגיאה",
        description: "הסיסמאות לא תואמות",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.fullName,
            hourly_rate: formData.hourlyRate,
          }
        }
      });

      if (error) {
        toast({
          title: "שגיאה ברישום",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        toast({
          title: "נרשמת בהצלחה!",
          description: "ברוך הבא, אתה יכול להתחיל לרשום משמרות",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "משהו השתבש, נסה שוב",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-medium">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <UserPlus className="w-6 h-6 text-primary" />
            הרשמה
          </CardTitle>
          <CardDescription>
            צור חשבון חדש לניהול ההכנסות שלך
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                שם מלא
              </Label>
              <Input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="הכנס את השם המלא שלך"
                required
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                כתובת אימייל
              </Label>
              <Input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="הכנס את כתובת האימייל שלך"
                required
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourlyRate" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                שכר לשעה (₪)
              </Label>
              <Input
                type="number"
                id="hourlyRate"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                min="0"
                step="0.5"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                סיסמה
              </Label>
              <Input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="בחר סיסמה חזקה"
                required
                className="text-right"
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                אישור סיסמה
              </Label>
              <Input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="הכנס את הסיסמה שוב"
                required
                className="text-right"
                minLength={6}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              variant="default"
              disabled={loading}
            >
              {loading ? "נרשם..." : "הירשם"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                כבר יש לך חשבון?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  התחבר כאן
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterForm;