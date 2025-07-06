
-- First, drop the existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage books" ON public.books;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Recreate the policies using the security definer function
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage books" ON public.books
  FOR ALL USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can view all order items" ON public.order_items
  FOR SELECT USING (public.get_current_user_role() = 'admin');
