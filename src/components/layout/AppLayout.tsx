import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, User, BarChart3, Plus, Home, Calendar, Wallet, Settings, Receipt } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user);
      setLoading(false);
      
      if (!session) {
        navigate("/login");
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user);
        if (!session) {
          navigate("/login");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו להתנתק, נסה שוב",
        variant: "destructive",
      });
    } else {
      toast({
        title: "התנתקת בהצלחה",
        description: "נתראה בקרוב!",
      });
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">טוען...</div>
      </div>
    );
  }

  const navItems = [
    { path: "/dashboard", label: "דשבורד", icon: Home },
    { path: "/add-shift", label: "רישום משמרת", icon: Plus },
    { path: "/shift-management", label: "ניהול משמרות", icon: Calendar },
    { path: "/budget-management", label: "ניהול תקציב", icon: Wallet },
    { path: "/expense-management", label: "הוצאות מתקדמות", icon: Receipt },
    { path: "/job-settings", label: "הגדרות עבודה", icon: Settings },
    { path: "/reports", label: "דוחות", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-primary">
              מעקב הכנסות
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              {user?.user_metadata?.full_name || user?.email}
            </span>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              התנתק
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-2">
          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;