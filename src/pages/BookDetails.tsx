import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ShoppingCart, Heart, Star, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReviewDialog from "@/components/ReviewDialog";

interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  original_price: number | null;
  image_url: string | null;
  description: string | null;
  isbn: string | null;
  rating: number | null;
  review_count: number | null;
  stock_quantity: number;
  categories: { name: string } | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
}

const BookDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    const fetchBookAndReviews = async () => {
      if (!id) return;

      // Fetch book details
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select(`
          *,
          categories (name)
        `)
        .eq('id', id)
        .single();

      if (bookError) {
        console.error('Error fetching book:', bookError);
        toast.error('Failed to load book details');
      }

      // Fetch reviews with manual join to profiles
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          user_id
        `)
        .eq('book_id', id)
        .order('created_at', { ascending: false });

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError);
        setReviews([]);
      } else if (reviewsData) {
        // Fetch profile information for each review
        const reviewsWithProfiles = await Promise.all(
          reviewsData.map(async (review) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', review.user_id)
              .single();

            return {
              ...review,
              profiles: profileData || null
            };
          })
        );
        setReviews(reviewsWithProfiles);

        // Calculate real review statistics
        if (bookData) {
          const reviewCount = reviewsData.length;
          const averageRating = reviewCount > 0 
            ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewCount 
            : 0;

          setBook({
            ...bookData,
            rating: averageRating,
            review_count: reviewCount
          });
        }
      } else {
        setReviews([]);
        if (bookData) {
          setBook({
            ...bookData,
            rating: 0,
            review_count: 0
          });
        }
      }

      // Check if user can review (has purchased and received the book)
      if (user) {
        const { data: orderItems } = await supabase
          .from('order_items')
          .select(`
            *,
            orders!inner (
              status,
              user_id
            )
          `)
          .eq('book_id', id)
          .eq('orders.user_id', user.id)
          .eq('orders.status', 'delivered');

        setCanReview((orderItems && orderItems.length > 0) || false);
      }

      setLoading(false);
    };

    fetchBookAndReviews();
  }, [id, user]);

  const addToCart = async () => {
    if (!user || !book) {
      toast.error('Please login to add items to cart');
      return;
    }

    setAddingToCart(true);
    const { error } = await supabase
      .from('cart_items')
      .upsert({
        user_id: user.id,
        book_id: book.id,
        quantity: 1
      });

    if (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } else {
      toast.success('Added to cart successfully!');
    }
    setAddingToCart(false);
  };

  const handleReviewSubmitted = () => {
    setReviewDialogOpen(false);
    toast.success('Review submitted successfully!');
    // Refresh reviews and book data
    window.location.reload();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 font-sans">
            Book not found
          </h1>
          <Link to="/">
            <Button className="text-sm sm:text-base border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900 font-sans">
              Return to Home
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const discountPercentage = book.original_price ? 
    Math.round(((book.original_price - book.price) / book.original_price) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link 
          to="/" 
          className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline text-base sm:text-lg mb-8 font-sans"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Books
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Book Image */}
          <div className="relative">
            <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <img
                  src={book.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop'}
                  alt={book.title}
                  className="w-full h-[500px] object-cover"
                />
                {discountPercentage > 0 && (
                  <Badge className="absolute top-4 left-4 bg-red-500 text-white text-sm font-sans">
                    -{discountPercentage}%
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Book Details */}
          <div className="space-y-6">
            <div>
              {book.categories && (
                <Badge 
                  variant="secondary" 
                  className="mb-2 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 text-sm font-sans"
                >
                  {book.categories.name}
                </Badge>
              )}
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2 font-sans">
                {book.title}
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-4 font-sans">
                by {book.author}
              </p>
              
              {book.rating && book.rating > 0 && (
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex">
                    {renderStars(book.rating)}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-sans">
                    ({book.review_count} reviews)
                  </span>
                </div>
              )}
            </div>

            {book.description && (
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 font-sans">
                  Description
                </h3>
                <p className="text front-size-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed font-sans">
                  {book.description}
                </p>
              </div>
            )}

            {book.isbn && (
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400 font-sans">
                  ISBN: {book.isbn}
                </span>
              </div>
            )}

            <div className="flex items-center space-x-4 py-4 border-t border-b border-gray-200 dark:border-gray-700">
              <span className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400 font-sans">
                ${book.price.toFixed(2)}
              </span>
              {book.original_price && (
                <>
                  <span className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 line-through font-sans">
                    ${book.original_price.toFixed(2)}
                  </span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-sm font-sans">
                    Save {discountPercentage}%
                  </Badge>
                </>
              )}
            </div>

            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 font-sans">
                Stock: {book.stock_quantity > 0 ? `${book.stock_quantity} available` : 'Out of stock'}
              </div>
              
              <div className="flex space-x-4">
                <Button 
                  className="flex-1 text-sm sm:text-base bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 font-sans" 
                  onClick={addToCart}
                  disabled={addingToCart || book.stock_quantity === 0}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900"
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </div>

              {canReview && (
                <Button 
                  variant="outline" 
                  onClick={() => setReviewDialogOpen(true)}
                  className="w-full text-sm sm:text-base border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900 font-sans"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Write a Review
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-sans">
                <MessageSquare className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                Customer Reviews ({reviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center py-8 font-sans">
                  No reviews yet. Be the first to review this book!
                </p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review, index) => (
                    <div key={review.id}>
                      <div className="flex items-start space-x-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex">
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white font-sans">
                              {review.profiles?.full_name || review.profiles?.email || 'Anonymous'}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400 font-sans">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-sans">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                      {index < reviews.length - 1 && <Separator className="mt-6 bg-gray-200 dark:bg-gray-700" />}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />

      <ReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        bookId={id!}
        bookTitle={book.title}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
};

export default BookDetails;