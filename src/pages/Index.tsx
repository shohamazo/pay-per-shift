import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, Calculator, Shield, Smartphone, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">ShiftTracker</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost">
              <Link to="/login">התחבר</Link>
            </Button>
            <Button asChild variant="hero">
              <Link to="/register">התחל חינם</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="outline" className="w-fit">
                המוצר הראשון שפותח במיוחד עבור עובדי משמרות בישראל
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                כמה <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">הרווחת</span> החודש?
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                עקוב אחרי המשמרות שלך, חשב את ההכנסות באופן אוטומטי, ותמיד תדע אם יש לך מספיק כסף לכסות את החשבונות.
              </p>
              <div className="flex gap-4">
                <Button asChild size="lg" className="text-lg px-8 py-6" variant="income">
                  <Link to="/register">
                    התחל עכשיו - חינם
                  </Link>
                </Button>
                <Button asChild size="lg" className="text-lg px-8 py-6" variant="outline">
                  <Link to="/login">
                    התחבר לחשבון
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-20 blur-3xl rounded-full"></div>
              <img 
                src={heroImage} 
                alt="ShiftTracker App Interface" 
                className="relative z-10 w-full h-auto rounded-2xl shadow-large"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            נמאס לך לא לדעת כמה כסף יש לך?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mx-auto">
                <Calculator className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="font-semibold text-foreground">חישובים מסובכים</h3>
              <p className="text-muted-foreground">
                אתה עובד שעות משתנות ולא יודע בדיוק כמה הרווחת בחודש
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto">
                <TrendingUp className="w-6 h-6 text-warning" />
              </div>
              <h3 className="font-semibold text-foreground">הכנסה לא צפויה</h3>
              <p className="text-muted-foreground">
                כל חודש אתה מפחד שלא יהיה לך מספיק כסף לחשבונות
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">חוסר ביטחון</h3>
              <p className="text-muted-foreground">
                אתה לא יודע אם אתה יכול להרשות לעצמך דברים או לחסוך
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              השגת שליטה מלאה על הכספים שלך
            </h2>
            <p className="text-xl text-muted-foreground">
              במקום לנחש, תדע בדיוק איפה אתה עומד כלכלית
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Dashboard Preview */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  הדשבורד שלך
                </CardTitle>
                <CardDescription>מבט מהיר על המצב הכלכלי שלך</CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="bg-income/10 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">הכנסות החודש</p>
                  <p className="text-2xl font-bold text-income">₪3,450</p>
                </div>
                <div className="bg-expense/10 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">חשבונות קבועים</p>
                  <p className="text-2xl font-bold text-expense">₪2,800</p>
                </div>
                <div className="bg-success/10 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">נשאר לך</p>
                  <p className="text-2xl font-bold text-success">₪650</p>
                </div>
              </CardContent>
            </Card>

            {/* Features List */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">רישום משמרות קל ומהיר</h3>
                  <p className="text-muted-foreground">תעקוב אחרי כל משמרת ב-30 שניות. רק תאריך, שעות, ושכר לשעה</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">חישוב אוטומטי של הכנסות</h3>
                  <p className="text-muted-foreground">האפליקציה תחשב בדיוק כמה הרווחת מכל משמרת ובסך הכל</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">מעקב אחרי הוצאות קבועות</h3>
                  <p className="text-muted-foreground">הזן את החשבונות הקבועים שלך ותמיד תדע אם יש לך מספיק</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">ביטחון פיננסי</h3>
                  <p className="text-muted-foreground">תמיד תדע בדיוק איפה אתה עומד ואם אתה יכול להרשות לעצמך משהו</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            מוכן לקבל שליטה על הכספים שלך?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            התחל עכשיו וחווה מה זה לדעת בדיוק כמה כסף יש לך
          </p>
          <Button asChild variant="secondary" size="lg" className="text-lg">
            <Link to="/register">התחל עכשיו - חינם</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-card">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">
            © 2024 ShiftTracker - אפליקציה ישראלית לעובדי משמרות
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;