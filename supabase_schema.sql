-- Supabase Database Schema for CU Bazzar

-- 1. Users Table (Extends Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE,
  hostel_block TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Turn on Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Products Table
CREATE TABLE public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  reason_for_selling TEXT,
  original_price NUMERIC,
  age TEXT,
  image_url TEXT,
  is_trending BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone." ON public.products FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create products." ON public.products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Sellers can update their own products." ON public.products FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can delete their own products." ON public.products FOR DELETE USING (auth.uid() = seller_id);

-- 3. Messages Table (For Secure In-App Chat)
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
-- Users can only see messages they sent or received
CREATE POLICY "Users can view their own messages." ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Authenticated users can insert messages." ON public.messages FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = sender_id);

-- 4. Orders Table
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  base_price NUMERIC NOT NULL,
  commission NUMERIC NOT NULL,
  delivery_charge NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  delivery_location TEXT NOT NULL,
  delivery_room TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivering', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view orders they bought or sold." ON public.orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Buyers can create orders." ON public.orders FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = buyer_id);
-- Sellers update to 'confirmed', 'delivering', etc. Admin/System can also update.
CREATE POLICY "Involved parties can update order status." ON public.orders FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- 5. Storage Bucket for Products
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

