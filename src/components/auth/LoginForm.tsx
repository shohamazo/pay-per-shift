import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Mail, Lock } from "lucide-react";

const LoginForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        toast({
          title: "שגיאה בהתחברות",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "התחברת בהצלחה!",
        description: "ברוך הבא חזרה",
      });

      navigate("/dashboard");
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
            <LogIn className="w-6 h-6 text-primary" />
            התחברות
          </CardTitle>
          <CardDescription>
            התחבר לחשבון שלך לניהול ההכנסות
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                סיסמה
              </Label>
              <Input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="הכנס את הסיסמה שלך"
                required
                className="text-right"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              variant="default"
              disabled={loading}
            >
              {loading ? "מתחבר..." : "התחבר"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                אין לך חשבון עדיין?{" "}
                <Link to="/register" className="text-primary hover:underline">
                  הירשם כאן
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;