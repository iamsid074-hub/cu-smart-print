-- =========================================================================
-- FIX FOR ADMIN WALLET REWARDS (RLS BLOCKING SILENTLY)
-- Run this in your Supabase SQL Editor to allow Admins to issue rewards!
-- =========================================================================

-- 1. Allow Admins to update ANY profile's wallet balance
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles" 
ON public.profiles FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND is_admin = true));

-- 2. Allow Admins to insert reward transactions into ANY user's wallet
DROP POLICY IF EXISTS "Admins can insert wallet transactions" ON public.wallet_transactions;
CREATE POLICY "Admins can insert wallet transactions" 
ON public.wallet_transactions FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND is_admin = true));

-- 3. Just to be safe, if we need to let admins view the transactions later:
DROP POLICY IF EXISTS "Admins can view all wallet transactions" ON public.wallet_transactions;
CREATE POLICY "Admins can view all wallet transactions" 
ON public.wallet_transactions FOR SELECT
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND is_admin = true));
