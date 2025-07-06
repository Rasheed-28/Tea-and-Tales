import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, User, LogIn, BookOpen, LogOut, Package, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  book_count: number;
}

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [topCategories, setTopCategories] = useState<Category[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      fetchCartItemsCount();
      fetchUserRole();
    } else {
      setCartItemsCount(0);
    }
    fetchTopCategories();

    // Listen for cart updates
    const handleCartUpdate = () => {
      if (user) {
        fetchCartItemsCount();
      }
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, [user]);

  const fetchUserRole = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setUserRole(data.role);
    }
  };

  const fetchCartItemsCount = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("cart_items")
      .select("quantity")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching cart items count:", error);
    } else {
      const totalCount = data?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      setCartItemsCount(totalCount);
    }
  };

  const fetchTopCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select(`
        id,
        name,
        books!inner (id)
      `)
      .limit(8);

    if (error) {
      console.error("Error fetching categories:", error);
    } else {
      // Transform data to count books per category
      const categoriesWithCount = data?.map((category) => ({
        id: category.id,
        name: category.name,
        book_count: category.books ? category.books.length : 0,
      })) || [];

      // Sort by book count and take top 8
      const sortedCategories = categoriesWithCount
        .sort((a, b) => b.book_count - a.book_count)
        .slice(0, 8);

      setTopCategories(sortedCategories);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    const searchParams = new URLSearchParams();
    searchParams.set("category", categoryName);
    navigate(`/books?${searchParams.toString()}`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
            <span className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-sans">
              Tea & Tales
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              <Input
                type="text"
                placeholder="Search for books, authors, genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm sm:text-base text-gray-900 dark:text-white font-sans bg-gray-50 dark:bg-gray-700 rounded-lg"
              />
            </div>
          </form>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {userRole === "admin" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 font-sans"
                  >
                    <Link to="/admin" className="flex items-center space-x-1">
                      <Settings className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                      <span>Admin</span>
                    </Link>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 font-sans"
                >
                  <Link to="/profile" className="flex items-center space-x-1">
                    <User className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                    <span>Profile</span>
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 font-sans"
                >
                  <Link to="/orders" className="flex items-center space-x-1">
                    <Package className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                    <span>Orders</span>
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 font-sans"
                >
                  <LogOut className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mr-1" />
                  <span>Sign Out</span>
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 font-sans"
              >
                <Link to="/login" className="flex items-center space-x-1">
                  <LogIn className="h-Subheading:5 w-5 text-indigo-500 dark:text-indigo-400" />
                  <span>Login</span>
                </Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="relative text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 font-sans"
            >
              <Link to="/cart" className="flex items-center space-x-1">
                <ShoppingCart className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                <span>Cart</span>
                {cartItemsCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-sans">
                    {cartItemsCount}
                  </Badge>
                )}
              </Link>
            </Button>
          </div>
        </div>

        {/* Categories Navigation */}
        <nav className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-8 overflow-x-auto">
            {topCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.name)}
                className="whitespace-nowrap text-sm sm:text-base font-semibold text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 font-sans transition-colors cursor-pointer"
              >
                {category.name}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;