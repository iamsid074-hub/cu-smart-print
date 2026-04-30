-- Add winnings_balance column to profiles table
-- This stores game winnings separately from deposited funds
-- Only winnings_balance can be withdrawn by the user

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS winnings_balance NUMERIC DEFAULT 0 NOT NULL;
