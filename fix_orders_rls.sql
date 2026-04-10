-- =====================================================
-- FIX FOR ORDERS NOT PLACING FOR NORMAL USERS
-- Run this in your Supabase SQL Editor
-- =====================================================

-- This fixes the issue where only the Admin can place orders.
-- The current policies likely require (select auth.uid()) = seller_id or are completely missing for buyers.

-- 1. Drop the restrictive or broken policies (if they exist)
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.orders;
DROP POLICY IF EXISTS "Users can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can insert" ON public.orders;

-- 2. Create the correct policy allowing ANY authenticated user to place an order
--    as long as they are setting themselves as the buyer.
CREATE POLICY "Users can insert their own orders" 
ON public.orders 
FOR INSERT 
TO authenticated 
WITH CHECK ((select auth.uid()) = buyer_id);

-- 3. (Optional but recommended) Ensure buyers and sellers can view their own orders
DROP POLICY IF EXISTS "Users and admins can view orders" ON public.orders;
CREATE POLICY "Users and admins can view orders" ON public.orders FOR SELECT
  USING (
    (select auth.uid()) = buyer_id
    OR (select auth.uid()) = seller_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND is_admin = true)
  );
