-- Supabase Migration: Add Luxury Wallet Feature

-- 1. Add wallet columns to the existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS wallet_balance numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_orders integer DEFAULT 0;

-- 2. Create the wallet_transactions table to log history
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount numeric NOT NULL, -- Positive for rewards, negative for usage
    type text NOT NULL CHECK (type IN ('reward', 'usage', 'refund')),
    description text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Set up Row Level Security (RLS) for the new table
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own wallet transactions
CREATE POLICY "Users can view own wallet transactions"
    ON public.wallet_transactions FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Authenticated users can log their own transactions
CREATE POLICY "Users can insert own wallet transactions"
    ON public.wallet_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);
