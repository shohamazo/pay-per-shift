import ExpenseTracker from "@/components/expenses/ExpenseTracker";

const ExpenseManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">ניהול הוצאות מתקדם</h1>
        <p className="text-muted-foreground">
          נהל את ההוצאות שלך עם סריקת קבלות, חיבור אשראי ומעקב תקציב בזמן אמת
        </p>
      </div>

      <ExpenseTracker />
    </div>
  );
};

export default ExpenseManagement;