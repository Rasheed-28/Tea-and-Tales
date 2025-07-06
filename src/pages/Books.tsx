import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BookCard from "@/components/BookCard";
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

interface Category {
  id: string;
  name: string;
}

const Books = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'title');

  useEffect(() => {
    fetchCategories();
    fetchBooks();
  }, [searchQuery, selectedCategory, sortBy]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    let query = supabase
      .from('books')
      .select(`
        id,
        title,
        author,
        price,
        original_price,
        image_url,
        categories (name)
      `);

    // Apply search filter
    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%`);
    }

    // Apply category filter - only if not "all"
    if (selectedCategory && selectedCategory !== 'all') {
      const category = categories.find(c => c.name === selectedCategory);
      if (category) {
        query = query.eq('category_id', category.id);
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_low':
        query = query.order('price', { ascending: true });
        break;
      case 'price_high':
        query = query.order('price', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      default:
        query = query.order('title', { ascending: true });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching books:', error);
      setLoading(false);
      return;
    }

    if (data) {
      // Fetch real review data for each book
      const booksWithReviews = await Promise.all(
        data.map(async (book) => {
          const { data: reviewsData } = await supabase
            .from('reviews')
            .select('rating')
            .eq('book_id', book.id);

          const reviewCount = reviewsData?.length || 0;
          const averageRating = reviewCount > 0 
            ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewCount 
            : 0;

          return {
            ...book,
            rating: averageRating,
            review_count: reviewCount
          };
        })
      );

      setBooks(booksWithReviews);
    }

    setLoading(false);
  };

  const updateSearchParams = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams('search', searchQuery);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('title');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-sans">
            All Books
          </h1>
          <p className="mt-2 text-base sm:text-lg text-gray-600 dark:text-gray-400 font-sans">
            Explore our collection of books
          </p>
        </div>
        
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6">
          <form onSubmit={handleSearch} className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-500 dark:text-indigo-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search books or authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm sm:text-base border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-sans rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </form>
          
          <Select value={selectedCategory} onValueChange={(value) => {
            setSelectedCategory(value);
            updateSearchParams('category', value);
          }}>
            <SelectTrigger className="text-sm sm:text-base border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-sans rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-sans rounded-lg">
              <SelectItem value="all" className="text-sm sm:text-base font-sans">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name} className="text-sm sm:text-base font-sans">
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value) => {
            setSortBy(value);
            updateSearchParams('sort', value);
          }}>
            <SelectTrigger className="text-sm sm:text-base border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-sans rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-sans rounded-lg">
              <SelectItem value="title" className="text-sm sm:text-base font-sans">Title (A-Z)</SelectItem>
              <SelectItem value="price_low" className="text-sm sm:text-base font-sans">Price (Low to High)</SelectItem>
              <SelectItem value="price_high" className="text-sm sm:text-base font-sans">Price (High to Low)</SelectItem>
              <SelectItem value="rating" className="text-sm sm:text-base font-sans">Rating</SelectItem>
              <SelectItem value="newest" className="text-sm sm:text-base font-sans">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {searchQuery && (
            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 text-sm font-sans">
              Search: "{searchQuery}"
            </Badge>
          )}
          {selectedCategory && selectedCategory !== 'all' && (
            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 text-sm font-sans">
              Category: {selectedCategory}
            </Badge>
          )}
          {(searchQuery || (selectedCategory && selectedCategory !== 'all')) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-sm sm:text-base text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 font-sans"
            >
              <Filter className="h-5 w-5 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div class corridoor="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 font-sans">
              No books found
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 font-sans">
              Try adjusting your search or filters
            </p>
            <Button 
              onClick={clearFilters}
              className="text-sm sm:text-base bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 font-sans"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
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

      <Footer />
    </div>
  );
};

export default Books;