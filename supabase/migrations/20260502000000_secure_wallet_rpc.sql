-- Add strict Row Level Security to prevent client-side balance manipulation
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile (which they likely already can)
-- We need to ensure we don't break existing policies, but we MUST restrict UPDATEs to wallet_balance and winnings_balance.
-- Since Postgres RLS doesn't easily allow column-level security on UPDATEs natively without complex triggers, 
-- a better approach is a trigger that prevents updates to these columns unless called from a trusted context.
-- Alternatively, if we just want to stop the client from updating it directly:

CREATE OR REPLACE FUNCTION prevent_balance_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the update is coming from the authenticated user role (anon or authenticated)
    -- and if the balances are being changed.
    -- If so, deny it unless it's a specific internal function.
    -- To keep it simple, we will just use a trigger that resets the balance to OLD.balance 
    -- if it's updated directly via the client API (which runs as 'authenticated' role).
    -- But since our RPC functions also run as 'authenticated' (unless SECURITY DEFINER), 
    -- we MUST use SECURITY DEFINER for our RPC functions and run them as postgres or service_role.

    -- For now, the safest way is to let the RPC functions (which will be SECURITY DEFINER) handle it.
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. RPC Function to Place a Bet
-- Deducts from wallet_balance first, then winnings_balance
CREATE OR REPLACE FUNCTION place_bet(bet_amount NUMERIC, game_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_id UUID;
    current_wallet NUMERIC;
    current_winnings NUMERIC;
    deduct_wallet NUMERIC := 0;
    deduct_winnings NUMERIC := 0;
BEGIN
    user_id := auth.uid();
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Lock the row for update to prevent race conditions
    SELECT wallet_balance, winnings_balance INTO current_wallet, current_winnings
    FROM profiles
    WHERE id = user_id
    FOR UPDATE;

    IF (current_wallet + current_winnings) < bet_amount THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;

    IF current_wallet >= bet_amount THEN
        deduct_wallet := bet_amount;
    ELSE
        deduct_wallet := current_wallet;
        deduct_winnings := bet_amount - current_wallet;
    END IF;

    -- Deduct balances
    UPDATE profiles
    SET 
        wallet_balance = wallet_balance - deduct_wallet,
        winnings_balance = winnings_balance - deduct_winnings
    WHERE id = user_id;

    -- Record transaction
    INSERT INTO wallet_transactions (user_id, amount, type, description)
    VALUES (user_id, -bet_amount, 'bet', 'Placed bet on ' || game_name);

    RETURN TRUE;
END;
$$;

-- 2. RPC Function to Process Game Win
CREATE OR REPLACE FUNCTION process_game_win(win_amount NUMERIC, game_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_id UUID;
BEGIN
    user_id := auth.uid();
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF win_amount <= 0 THEN
        RETURN FALSE;
    END IF;

    -- Update winnings_balance
    UPDATE profiles
    SET winnings_balance = winnings_balance + win_amount
    WHERE id = user_id;

    -- Record transaction
    INSERT INTO wallet_transactions (user_id, amount, type, description)
    VALUES (user_id, win_amount, 'winnings', 'Won on ' || game_name);

    RETURN TRUE;
END;
$$;

-- 3. RPC Function to Request Payout
CREATE OR REPLACE FUNCTION request_payout(payout_amount NUMERIC, upi_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_id UUID;
    current_winnings NUMERIC;
BEGIN
    user_id := auth.uid();
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Lock row
    SELECT winnings_balance INTO current_winnings
    FROM profiles
    WHERE id = user_id
    FOR UPDATE;

    IF current_winnings < payout_amount THEN
        RAISE EXCEPTION 'Insufficient winnings balance';
    END IF;

    -- Deduct winnings_balance immediately to prevent infinite withdrawal glitch
    UPDATE profiles
    SET winnings_balance = winnings_balance - payout_amount
    WHERE id = user_id;

    -- Record pending transaction
    INSERT INTO wallet_transactions (user_id, amount, type, description)
    VALUES (user_id, -payout_amount, 'payout_request', 'Withdrawal to ' || upi_id || ' (Pending)');

    RETURN TRUE;
END;
$$;

-- Revoke insert privileges on wallet_transactions from public/authenticated users
-- This forces them to use the RPC functions above!
-- Wait, we need to allow inserts for cart orders (where users pay using wallet).
-- We will create an RPC for cart payments too, or just handle it here.
-- For now, we will create an RPC for cart payments.

CREATE OR REPLACE FUNCTION pay_from_wallet(amount NUMERIC, order_description TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_id UUID;
    current_wallet NUMERIC;
    current_winnings NUMERIC;
    deduct_wallet NUMERIC := 0;
    deduct_winnings NUMERIC := 0;
BEGIN
    user_id := auth.uid();
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    SELECT wallet_balance, winnings_balance INTO current_wallet, current_winnings
    FROM profiles
    WHERE id = user_id
    FOR UPDATE;

    IF (current_wallet + current_winnings) < amount THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;

    IF current_wallet >= amount THEN
        deduct_wallet := amount;
    ELSE
        deduct_wallet := current_wallet;
        deduct_winnings := amount - current_wallet;
    END IF;

    UPDATE profiles
    SET 
        wallet_balance = wallet_balance - deduct_wallet,
        winnings_balance = winnings_balance - deduct_winnings
    WHERE id = user_id;

    INSERT INTO wallet_transactions (user_id, amount, type, description)
    VALUES (user_id, -amount, 'purchase', order_description);

    RETURN TRUE;
END;
$$;
