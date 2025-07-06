import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Users, Award, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BookCard from "@/components/BookCard";
import FeaturedSection from "@/components/FeaturedSection";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  original_price: number | null;
  image_url: string | null;
  rating: number | null;
  review_count: number | null;
  categories: { name: string } | null;
}

const Home = () => {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [newBooks, setNewBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    // Fetch featured books
    const { data: featured } = await supabase
      .from('books')
      .select(`
        id,
        title,
        author,
        price,
        original_price,
        image_url,
        rating,
        review_count,
        categories (name)
      `)
      .eq('is_featured', true)
      .limit(4);

    // Fetch newest books
    const { data: newest } = await supabase
      .from('books')
      .select(`
        id,
        title,
        author,
        price,
        original_price,
        image_url,
        rating,
        review_count,
        categories (name)
      `)
      .order('created_at', { ascending: false })
      .limit(8);

    setFeaturedBooks(featured || []);
    setNewBooks(newest || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 font-sans">
              Welcome to BookVault
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto font-sans">
              Discover your next favorite book from our vast collection of literature, 
              spanning every genre and interest. Start your reading journey today.
            </p>
            <div className="flex justify-center">
              <Link to="/books">
                <Button size="lg" className="text-sm sm:text-base bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 font-sans px-8">
                  Browse Books
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-indigo-500 dark:text-indigo-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 font-sans">
                Vast Collection
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-sans">
                Over 10,000 books across all genres
              </p>
            </div>
            <div className="text-center">
              <Truck className="h-12 w-12 text-indigo-500 dark:text-indigo-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 font-sans">
                Free Shipping
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-sans">
                Free delivery on all orders
              </p>
            </div>
            <div className="text-center">
              <Award className="h-12 w-12 text-indigo-500 dark:text-indigo-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 font-sans">
                Quality Assured
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-sans">
                Authentic books, guaranteed quality
              </p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 text-indigo-500 dark:text-indigo-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 font-sans">
                Community
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-sans">
                Join thousands of book lovers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <FeaturedSection />

      {/* Featured Books */}
      {featuredBooks.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-sans">
                Featured Books
              </h2>
              <Link to="/books?featured=true">
                <Button 
                  variant="outline" 
                  className="text-sm sm:text-base border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900 font-sans"
                >
                  View All
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {featuredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    id={book.id}
                    title={book.title}
                    author={book.author}
                    price={book.price}
                    originalPrice={book.original_price}
                    image={book.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop'}
                    category={book.categories?.name || 'Uncategorized'}
                    rating={book.rating || 0}
                    reviewCount={book.review_count || 0}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newBooks.length > 0 && (
        <section className="py-16 bg-gray-100 dark:bg-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-sans">
                New Arrivals
              </h2>
              <Link to="/books?sort=newest">
                <Button 
                  variant="outline" 
                  className="text-sm sm:text-base border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900 font-sans"
                >
                  View All
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {newBooks.slice(0, 4).map((book) => (
                <BookCard
                  key={book.id}
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  price={book.price}
                  originalPrice={book.original_price}
                  image={book.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop'}
                  category={book.categories?.name || 'Uncategorized'}
                  rating={book.rating || 0}
                  reviewCount={book.review_count || 0}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Home;