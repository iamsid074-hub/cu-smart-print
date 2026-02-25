-- =====================================================
-- CU BAZZAR — Real Order Lifecycle Migration
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Add buyer_phone column to orders (stores buyer contact for delivery)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS buyer_phone TEXT;

-- 2. Add timestamp columns for each lifecycle stage
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS picked_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS out_for_delivery_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS seller_notified_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 3. Drop the old status constraint and add new expanded statuses
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (
  status IN (
    'pending',           -- Buyer placed, waiting for seller
    'seller_accepted',   -- Seller confirmed the order
    'seller_rejected',   -- Seller rejected the order
    'confirmed',         -- Admin accepted / auto-forwarded from seller
    'picked',            -- Admin picked from seller
    'delivering',        -- Out for delivery
    'completed',         -- Delivered to buyer
    'cancelled'          -- Cancelled
  )
);

-- 4. Allow sellers to view orders for THEIR products
DROP POLICY IF EXISTS "Sellers can view their sale orders" ON public.orders;
CREATE POLICY "Sellers can view their sale orders" ON public.orders FOR SELECT
  USING (auth.uid() = seller_id OR auth.uid() = buyer_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- 5. Allow sellers to update status on their orders (accept / reject)
DROP POLICY IF EXISTS "Sellers can update their sale orders" ON public.orders;
CREATE POLICY "Sellers can update their sale orders" ON public.orders FOR UPDATE
  USING (auth.uid() = seller_id OR auth.uid() = buyer_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- 6. Allow buyers to insert orders (existing policy may already cover this)
DROP POLICY IF EXISTS "Buyers can create orders." ON public.orders;
CREATE POLICY "Buyers can create orders." ON public.orders FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = buyer_id);
