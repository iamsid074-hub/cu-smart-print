-- SUPABASE PERFORMANCE ADVISOR RLS FIXES
-- Copy and paste this directly into your Supabase SQL Editor

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Products are viewable by everyone." ON public.products;
CREATE POLICY "Products are viewable by everyone." ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create products." ON public.products;
CREATE POLICY "Authenticated users can create products." ON public.products FOR INSERT WITH CHECK ((select auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "Sellers can update their own products." ON public.products;
CREATE POLICY "Sellers can update their own products." ON public.products FOR UPDATE USING ((select auth.uid()) = seller_id);

DROP POLICY IF EXISTS "Sellers can delete their own products." ON public.products;
CREATE POLICY "Sellers can delete their own products." ON public.products FOR DELETE USING ((select auth.uid()) = seller_id);

DROP POLICY IF EXISTS "Users can view their own messages." ON public.messages;
CREATE POLICY "Users can view their own messages." ON public.messages FOR SELECT USING ((select auth.uid()) = sender_id OR (select auth.uid()) = receiver_id);

DROP POLICY IF EXISTS "Authenticated users can insert messages." ON public.messages;
CREATE POLICY "Authenticated users can insert messages." ON public.messages FOR INSERT WITH CHECK ((select auth.role()) = 'authenticated' AND (select auth.uid()) = sender_id);

DROP POLICY IF EXISTS "Users can view orders they bought or sold." ON public.orders;
CREATE POLICY "Users can view orders they bought or sold." ON public.orders FOR SELECT USING ((select auth.uid()) = buyer_id OR (select auth.uid()) = seller_id);

DROP POLICY IF EXISTS "Buyers can create orders." ON public.orders;
CREATE POLICY "Buyers can create orders." ON public.orders FOR INSERT
  WITH CHECK ((select auth.role()) = 'authenticated' AND (select auth.uid()) = buyer_id);

DROP POLICY IF EXISTS "Involved parties can update order status." ON public.orders;
CREATE POLICY "Involved parties can update order status." ON public.orders FOR UPDATE USING ((select auth.uid()) = buyer_id OR (select auth.uid()) = seller_id);

DROP POLICY IF EXISTS "Admin can delete any product" ON public.products;
CREATE POLICY "Admin can delete any product" ON public.products FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND is_admin = true)
  );

DROP POLICY IF EXISTS "Users and admins can view orders" ON public.orders;
CREATE POLICY "Users and admins can view orders" ON public.orders FOR SELECT
  USING (
    (select auth.uid()) = buyer_id
    OR (select auth.uid()) = seller_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND is_admin = true)
  );

DROP POLICY IF EXISTS "Admin can update any order" ON public.orders;
CREATE POLICY "Admin can update any order" ON public.orders FOR UPDATE
  USING (
    (select auth.uid()) = buyer_id
    OR (select auth.uid()) = seller_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND is_admin = true)
  );

DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles" 
ON public.profiles FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND is_admin = true));

DROP POLICY IF EXISTS "Admins can insert wallet transactions" ON public.wallet_transactions;
CREATE POLICY "Admins can insert wallet transactions" 
ON public.wallet_transactions FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND is_admin = true));

DROP POLICY IF EXISTS "Admins can view all wallet transactions" ON public.wallet_transactions;
CREATE POLICY "Admins can view all wallet transactions" 
ON public.wallet_transactions FOR SELECT
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND is_admin = true));

DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
CREATE POLICY "Users can insert their own orders" 
ON public.orders 
FOR INSERT 
TO authenticated 
WITH CHECK ((select auth.uid()) = buyer_id);

DROP POLICY IF EXISTS "Users can insert own products" ON products;
CREATE POLICY "Users can insert own products"
ON products
FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = seller_id);

DROP POLICY IF EXISTS "Users can update own products" ON products;
CREATE POLICY "Users can update own products"
ON products
FOR UPDATE
TO authenticated
USING ((select auth.uid()) = seller_id)
WITH CHECK ((select auth.uid()) = seller_id);

DROP POLICY IF EXISTS "Users can delete own products" ON products;
CREATE POLICY "Users can delete own products"
ON products
FOR DELETE
TO authenticated
USING ((select auth.uid()) = seller_id);

DROP POLICY IF EXISTS "Anyone can view products" ON products;
CREATE POLICY "Anyone can view products"
ON products
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Sellers can view their sale orders" ON public.orders;
CREATE POLICY "Sellers can view their sale orders" ON public.orders FOR SELECT
  USING ((select auth.uid()) = seller_id OR (select auth.uid()) = buyer_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND is_admin = true));

DROP POLICY IF EXISTS "Sellers can update their sale orders" ON public.orders;
CREATE POLICY "Sellers can update their sale orders" ON public.orders FOR UPDATE
  USING ((select auth.uid()) = seller_id OR (select auth.uid()) = buyer_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND is_admin = true));

DROP POLICY IF EXISTS "Users can view own wallet transactions" ON public.wallet_transactions;
CREATE POLICY "Users can view own wallet transactions"
    ON public.wallet_transactions FOR SELECT
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own wallet transactions" ON public.wallet_transactions;
CREATE POLICY "Users can insert own wallet transactions"
    ON public.wallet_transactions FOR INSERT
    WITH CHECK ((select auth.uid()) = user_id);


DROP POLICY IF EXISTS "Admins can update site_settings" ON public.site_settings;
CREATE POLICY "Admins can update site_settings" ON public.site_settings FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND is_admin = true));

