
-- Create enum types for order status and user roles
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
CREATE TYPE public.user_role AS ENUM ('customer', 'admin');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create books table
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category_id UUID REFERENCES public.categories(id),
  image_url TEXT,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shopping cart table
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  shipping_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Books policies (public read, admin write)
CREATE POLICY "Anyone can view books" ON public.books
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage books" ON public.books
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Cart items policies
CREATE POLICY "Users can manage their own cart" ON public.cart_items
  FOR ALL USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Order items policies
CREATE POLICY "Users can view their own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for their orders" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own reviews" ON public.reviews
  FOR ALL USING (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample categories
INSERT INTO public.categories (name, description) VALUES
('Fiction', 'Novels, short stories, and other fictional works'),
('Non-Fiction', 'Biographies, memoirs, and factual books'),
('Science & Technology', 'Books about science, technology, and innovation'),
('Business', 'Business, entrepreneurship, and management books'),
('Self-Help', 'Personal development and self-improvement books'),
('History', 'Historical books and documentaries'),
('Romance', 'Romantic novels and love stories'),
('Mystery & Thriller', 'Mystery, thriller, and suspense novels'),
('Fantasy & Sci-Fi', 'Fantasy and science fiction books'),
('Cooking', 'Cookbooks and culinary guides');

-- Insert sample books
INSERT INTO public.books (title, author, price, original_price, category_id, image_url, stock_quantity, rating, review_count, is_featured, description) VALUES
('The Great Adventure', 'John Smith', 19.99, 24.99, (SELECT id FROM public.categories WHERE name = 'Fiction'), 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop', 50, 4, 128, true, 'An epic tale of adventure and discovery that will keep you on the edge of your seat.'),
('Digital Marketing Mastery', 'Emma Wilson', 29.99, null, (SELECT id FROM public.categories WHERE name = 'Business'), 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop', 30, 5, 89, false, 'Learn the secrets of successful digital marketing in the modern age.'),
('Mystery of the Lost City', 'Robert Brown', 16.99, 21.99, (SELECT id FROM public.categories WHERE name = 'Mystery & Thriller'), 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop', 25, 4, 203, true, 'A thrilling mystery that takes you through ancient civilizations and modern conspiracies.'),
('Cooking with Love', 'Maria Garcia', 34.99, null, (SELECT id FROM public.categories WHERE name = 'Cooking'), 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop', 40, 5, 156, false, 'Delicious recipes and cooking techniques from around the world.'),
('Future Technologies', 'Dr. Alex Chen', 39.99, null, (SELECT id FROM public.categories WHERE name = 'Science & Technology'), 'https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=400&h=600&fit=crop', 20, 4, 67, false, 'Explore the cutting-edge technologies that will shape our future.'),
('The Art of Mindfulness', 'Lisa Johnson', 22.99, null, (SELECT id FROM public.categories WHERE name = 'Self-Help'), 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400&h=600&fit=crop', 35, 5, 234, true, 'Discover inner peace and mindfulness in our fast-paced world.'),
('World History Chronicles', 'Prof. David Lee', 44.99, null, (SELECT id FROM public.categories WHERE name = 'History'), 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop', 15, 4, 92, false, 'A comprehensive journey through the most important events in world history.'),
('Romance in Paris', 'Sophie Martin', 18.99, null, (SELECT id FROM public.categories WHERE name = 'Romance'), 'https://images.unsplash.com/photo-1529148482759-b35b25c5f217?w=400&h=600&fit=crop', 60, 4, 178, false, 'A heartwarming love story set in the beautiful city of Paris.');
