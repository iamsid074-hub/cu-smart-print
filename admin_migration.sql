-- =====================================================
-- CU BAZZAR — Admin Portal Migration
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Add is_admin column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- =====================================================
-- 2. Admin Notifications Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('new_product', 'new_order')),
  payload JSONB NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Only admins can read / update notifications
CREATE POLICY "Admin can view notifications" ON public.admin_notifications FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admin can update notifications" ON public.admin_notifications FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Functions (SECURITY DEFINER) need to insert without auth check
CREATE POLICY "System can insert notifications" ON public.admin_notifications FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- 3. Admin RLS Policies for Products
-- =====================================================
-- Allow admin to DELETE any product
DROP POLICY IF EXISTS "Admin can delete any product" ON public.products;
CREATE POLICY "Admin can delete any product" ON public.products FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- =====================================================
-- 4. Admin RLS Policies for Orders
-- =====================================================
-- Drop the existing SELECT policy and replace with an admin-aware one
DROP POLICY IF EXISTS "Users can view orders they bought or sold." ON public.orders;
CREATE POLICY "Users and admins can view orders" ON public.orders FOR SELECT
  USING (
    auth.uid() = buyer_id
    OR auth.uid() = seller_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Allow admin to UPDATE any order (status changes)
DROP POLICY IF EXISTS "Admin can update any order" ON public.orders;
CREATE POLICY "Admin can update any order" ON public.orders FOR UPDATE
  USING (
    auth.uid() = buyer_id
    OR auth.uid() = seller_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- =====================================================
-- 5. Trigger: notify admin when new product is listed
-- =====================================================
CREATE OR REPLACE FUNCTION public.notify_admin_new_product()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, payload)
  VALUES ('new_product', to_jsonb(NEW));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_admin_notify_product ON public.products;
CREATE TRIGGER trg_admin_notify_product
  AFTER INSERT ON public.products
  FOR EACH ROW EXECUTE PROCEDURE public.notify_admin_new_product();

-- =====================================================
-- 6. Trigger: notify admin when new order is placed
-- =====================================================
CREATE OR REPLACE FUNCTION public.notify_admin_new_order()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, payload)
  VALUES ('new_order', to_jsonb(NEW));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_admin_notify_order ON public.orders;
CREATE TRIGGER trg_admin_notify_order
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.notify_admin_new_order();

-- =====================================================
-- 7. Grant yourself admin access
-- Replace the UUID below with your actual Supabase user UUID
-- Find it in: Authentication > Users tab in your Supabase dashboard
-- =====================================================
-- UPDATE public.profiles SET is_admin = true WHERE id = 'YOUR_USER_UUID_HERE';
