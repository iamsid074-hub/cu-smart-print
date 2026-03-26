-- =========================================================================
-- RESET ALL WALLET BALANCES AND TRANSACTION HISTORY
-- Run this in your Supabase SQL Editor to clear all demo data!
-- =========================================================================

-- 1. Reset all wallet balances to 0 in the profiles table
UPDATE public.profiles 
SET wallet_balance = 0;

-- 2. Clear all transaction history
DELETE FROM public.wallet_transactions;

-- Optional: If you also want to reset the lifetime "total_orders" count for everyone:
-- UPDATE public.profiles SET total_orders = 0;
