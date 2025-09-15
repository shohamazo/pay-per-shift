-- Create budget_alerts table for budget reminders
CREATE TABLE IF NOT EXISTS public.budget_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  threshold_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  threshold_percentage NUMERIC(5,2) NOT NULL DEFAULT 80,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create receipts table for receipt scanning
CREATE TABLE IF NOT EXISTS public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  expense_id UUID,
  image_url TEXT,
  image_data TEXT, -- base64 encoded image for processing
  extracted_text TEXT,
  extracted_amount NUMERIC(12,2),
  extracted_vendor TEXT,
  extracted_date DATE,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create monthly_budgets table for budget planning
CREATE TABLE IF NOT EXISTS public.monthly_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  month DATE NOT NULL, -- First day of the month
  category TEXT NOT NULL,
  planned_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  spent_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, month, category)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_budget_alerts_user_category ON public.budget_alerts(user_id, category);
CREATE INDEX IF NOT EXISTS idx_receipts_user_expense ON public.receipts(user_id, expense_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budgets_user_month ON public.monthly_budgets(user_id, month);

-- RLS for budget_alerts
ALTER TABLE public.budget_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own budget alerts" ON public.budget_alerts;
DROP POLICY IF EXISTS "Users can insert their own budget alerts" ON public.budget_alerts;
DROP POLICY IF EXISTS "Users can update their own budget alerts" ON public.budget_alerts;
DROP POLICY IF EXISTS "Users can delete their own budget alerts" ON public.budget_alerts;

CREATE POLICY "Users can view their own budget alerts"
ON public.budget_alerts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget alerts"
ON public.budget_alerts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget alerts"
ON public.budget_alerts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget alerts"
ON public.budget_alerts FOR DELETE
USING (auth.uid() = user_id);

-- RLS for receipts
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own receipts" ON public.receipts;
DROP POLICY IF EXISTS "Users can insert their own receipts" ON public.receipts;
DROP POLICY IF EXISTS "Users can update their own receipts" ON public.receipts;
DROP POLICY IF EXISTS "Users can delete their own receipts" ON public.receipts;

CREATE POLICY "Users can view their own receipts"
ON public.receipts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own receipts"
ON public.receipts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own receipts"
ON public.receipts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own receipts"
ON public.receipts FOR DELETE
USING (auth.uid() = user_id);

-- RLS for monthly_budgets
ALTER TABLE public.monthly_budgets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own monthly budgets" ON public.monthly_budgets;
DROP POLICY IF EXISTS "Users can insert their own monthly budgets" ON public.monthly_budgets;
DROP POLICY IF EXISTS "Users can update their own monthly budgets" ON public.monthly_budgets;
DROP POLICY IF EXISTS "Users can delete their own monthly budgets" ON public.monthly_budgets;

CREATE POLICY "Users can view their own monthly budgets"
ON public.monthly_budgets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own monthly budgets"
ON public.monthly_budgets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly budgets"
ON public.monthly_budgets FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monthly budgets"
ON public.monthly_budgets FOR DELETE
USING (auth.uid() = user_id);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trg_budget_alerts_updated_at ON public.budget_alerts;
CREATE TRIGGER trg_budget_alerts_updated_at
BEFORE UPDATE ON public.budget_alerts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_receipts_updated_at ON public.receipts;
CREATE TRIGGER trg_receipts_updated_at
BEFORE UPDATE ON public.receipts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_monthly_budgets_updated_at ON public.monthly_budgets;
CREATE TRIGGER trg_monthly_budgets_updated_at
BEFORE UPDATE ON public.monthly_budgets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();