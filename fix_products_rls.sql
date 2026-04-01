-- Fix: Allow all authenticated users to INSERT products (not just admin)
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Allow any logged-in user to insert their own products
CREATE POLICY "Users can insert own products"
ON products
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = seller_id);

-- 2. Allow any logged-in user to update their own products
CREATE POLICY "Users can update own products"
ON products
FOR UPDATE
TO authenticated
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

-- 3. Allow any logged-in user to delete their own products
CREATE POLICY "Users can delete own products"
ON products
FOR DELETE
TO authenticated
USING (auth.uid() = seller_id);

-- 4. Allow everyone to read all products (already likely exists, but just in case)
CREATE POLICY "Anyone can view products"
ON products
FOR SELECT
TO public
USING (true);

-- 5. Fix storage: Allow authenticated users to upload to product-images bucket
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'Allow authenticated uploads',
  'product-images',
  'INSERT',
  '(auth.role() = ''authenticated'')'
)
ON CONFLICT DO NOTHING;
