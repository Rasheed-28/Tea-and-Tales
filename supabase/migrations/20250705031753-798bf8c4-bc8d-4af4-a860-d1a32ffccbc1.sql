
-- Add the is_blocked column to the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

-- Create RLS policy for blocked users (if not already exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Blocked users cannot access data'
    ) THEN
        CREATE POLICY "Blocked users cannot access data" ON public.profiles
        FOR ALL USING (NOT is_blocked OR auth.uid() = id OR get_current_user_role() = 'admin');
    END IF;
END $$;
