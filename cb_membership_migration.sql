-- Migration: Add CB Membership Fields to Profiles Table
-- Run this snippet in your Supabase SQL Editor

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS membership_plan TEXT DEFAULT NULL, -- 'plus', 'prime', 'prime_plus'
ADD COLUMN IF NOT EXISTS membership_start_date TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS free_deliveries_used INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS membership_last_reset TIMESTAMPTZ DEFAULT NULL;

-- Description of added columns:
-- membership_plan: stores which plan the user is on. Null if no plan.
-- membership_start_date: the day they subscribed to their current plan.
-- free_deliveries_used: count of how many free deliveries were used in the current 7-day period.
-- membership_last_reset: timestamp of when the weekly delivery limits were last reset.
