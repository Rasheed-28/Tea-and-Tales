
-- Insert default admin user profile (this will create the user in profiles table)
-- Note: The actual auth user will need to be created through Supabase Auth UI or programmatically
INSERT INTO public.profiles (id, email, full_name, role) 
VALUES ('00000000-0000-0000-0000-000000000001', 'admin@admin.com', 'Admin User', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Create a function to handle admin user creation
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function can be called to ensure admin user exists
  INSERT INTO public.profiles (id, email, full_name, role) 
  VALUES ('00000000-0000-0000-0000-000000000001', 'admin@admin.com', 'Admin User', 'admin')
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- Add blocked status to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

-- Create RLS policy for blocked users
CREATE POLICY "Blocked users cannot access data" ON public.profiles
FOR ALL USING (NOT is_blocked OR auth.uid() = id OR get_current_user_role() = 'admin');
