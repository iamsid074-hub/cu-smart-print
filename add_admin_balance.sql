-- =========================================================================
-- SCRIPT: ADD 1000 RS TO ADMIN ACCOUNT
-- Target User: iamsid074@gmail.com
-- =========================================================================

-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- 1. Look up the user ID by email in the auth schema
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'iamsid074@gmail.com';

    IF target_user_id IS NOT NULL THEN
        -- 2. Update the wallet_balance in the profiles table
        UPDATE public.profiles 
        SET wallet_balance = COALESCE(wallet_balance, 0) + 1000 
        WHERE id = target_user_id;
        
        -- 3. Log the transaction for transparency
        INSERT INTO public.wallet_transactions (user_id, amount, type, description)
        VALUES (target_user_id, 1000, 'reward', 'Official Admin Credit / Reward');
        
        RAISE NOTICE 'SUCCESS: Added 1000rs to wallet of iamsid074@gmail.com (ID: %)', target_user_id;
    ELSE
        -- If user is not found, raise an error
        RAISE EXCEPTION 'USER NOT FOUND: The email iamsid074@gmail.com does not exist in the database.';
    END IF;
END $$;
