-- Migration: Add Face Lock System fields to profiles table

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS biometric_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS face_embedding JSONB,
ADD COLUMN IF NOT EXISTS failed_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_unlock_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS wallet_pin TEXT;
