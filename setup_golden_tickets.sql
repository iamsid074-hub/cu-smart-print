-- Create Golden Tickets Table
CREATE TABLE IF NOT EXISTS public.golden_tickets (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    creator_id UUID REFERENCES auth.users(id) NOT NULL,
    code TEXT UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT false,
    used_by_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Setup Row Level Security (RLS)
ALTER TABLE public.golden_tickets ENABLE ROW LEVEL SECURITY;

-- Creators can see their own tickets
CREATE POLICY "Users can view their own generated tickets" 
ON public.golden_tickets FOR SELECT 
USING (auth.uid() = creator_id);

-- Creators can insert new tickets
CREATE POLICY "Users can insert their own tickets" 
ON public.golden_tickets FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

-- Public can verify ticket validity (read-only for non-used tickets)
CREATE POLICY "Public can verify unused tickets" 
ON public.golden_tickets FOR SELECT 
USING (is_used = false);

-- Secure RPC to redeem a ticket and distribute rewards
CREATE OR REPLACE FUNCTION public.redeem_golden_ticket(p_ticket_code TEXT, p_new_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as DB admin to bypass RLS for balance updates
AS $$
DECLARE
    v_ticket_id UUID;
    v_creator_id UUID;
    v_is_used BOOLEAN;
BEGIN
    -- 1. Find the ticket and lock it for update to prevent race conditions
    SELECT id, creator_id, is_used INTO v_ticket_id, v_creator_id, v_is_used
    FROM public.golden_tickets
    WHERE code = p_ticket_code
    FOR UPDATE;

    -- 2. Verify ticket exists and is unused
    IF v_ticket_id IS NULL THEN
        RAISE EXCEPTION 'Invalid ticket code.';
    END IF;

    IF v_is_used THEN
        RAISE EXCEPTION 'This Golden Ticket has already been claimed.';
    END IF;

    -- 3. Mark ticket as used
    UPDATE public.golden_tickets
    SET is_used = true, used_by_id = p_new_user_id
    WHERE id = v_ticket_id;

    -- 4. Reward the Creator (add 15 to their wallet)
    UPDATE public.profiles
    SET wallet_balance = COALESCE(wallet_balance, 0) + 15
    WHERE id = v_creator_id;

    -- 5. Reward the New User (add 15 to their wallet)
    UPDATE public.profiles
    SET wallet_balance = COALESCE(wallet_balance, 0) + 15
    WHERE id = p_new_user_id;

    RETURN TRUE;
END;
$$;
