-- CU Bazaar Quick Delivery Migration
-- Run this in your Supabase SQL Editor

-- 1. Add room_number to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS room_number TEXT;

-- 2. Add is_quick to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_quick BOOLEAN DEFAULT false;

-- 3. Update orders to include more specific tracking info if needed (optional, existing status might be enough)
-- But let's add specific timestamps for better tracking
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS picked_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS out_for_delivery_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

-- 4. Create a specific category for Quick Store if needed
-- (Not strictly necessary, but good for filtering)
-- UPDATE public.products SET is_quick = true WHERE category = 'QuickStore';
