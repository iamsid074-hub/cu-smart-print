-- Create the game_bets table to track all wagers
CREATE TABLE public.game_bets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    game TEXT NOT NULL, -- 'crash' or 'mines'
    bet_amount NUMERIC NOT NULL,
    payout NUMERIC NOT NULL DEFAULT 0,
    multiplier NUMERIC NOT NULL DEFAULT 0,
    is_win BOOLEAN NOT NULL DEFAULT false,
    server_seed TEXT,
    client_seed TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_bets ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own bets
CREATE POLICY "Users can view their own game bets"
ON public.game_bets
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own bets (assuming client-side logic for MVP)
CREATE POLICY "Users can insert their own game bets"
ON public.game_bets
FOR INSERT
WITH CHECK (auth.uid() = user_id);
