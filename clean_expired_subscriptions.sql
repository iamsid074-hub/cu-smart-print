-- 1. Disable all subscriptions that are exactly 7 days old or older
UPDATE profiles 
SET 
  membership_plan = NULL,
  membership_start_date = NULL,
  membership_last_reset = NULL,
  free_deliveries_used = 0
WHERE membership_plan IS NOT NULL 
  AND membership_start_date IS NOT NULL
  AND EXTRACT(DAY FROM (NOW() - membership_start_date::timestamp)) >= 7;

-- 2. Disable all subscriptions that have exhausted their delivery limits
UPDATE profiles 
SET 
  membership_plan = NULL,
  membership_start_date = NULL,
  membership_last_reset = NULL,
  free_deliveries_used = 0
WHERE membership_plan IS NOT NULL 
  AND (
    (membership_plan = 'plus' AND free_deliveries_used >= 5) OR
    (membership_plan = 'prime' AND free_deliveries_used >= 15) OR
    (membership_plan = 'prime_plus' AND free_deliveries_used >= 25)
  );

-- This entirely cleans the database and enforces the strict 1-week and limit durations globally.
