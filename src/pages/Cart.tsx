import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutDialog from "@/components/CheckoutDialog";

interface CartItem {
  id: string;
  quantity: number;
  books: {
    id: string;
    title: string;
    author: string;
    price: number;
    image_url: string | null;
    stock_quantity: number;
  };
}

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCartItems();
  }, [user, navigate]);

  const fetchCartItems = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        books (
          id,
          title,
          author,
          price,
          image_url,
          stock_quantity
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Failed to load cart items');
    } else {
      setCartItems(data || []);
    }
    setLoading(false);
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdating(itemId);
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', itemId);

    if (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    } else {
      fetchCartItems();
    }
    setUpdating(null);
  };

  const removeItem = async (itemId: string) => {
    setUpdating(itemId);
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    } else {
      fetchCartItems();
      toast.success('Item removed from cart');
    }
    setUpdating(null);
  };

  const handleOrderComplete = () => {
    fetchCartItems();
    // Refresh the page to update cart count in header
    window.location.reload();
  };

  const total = cartItems.reduce((sum, item) => sum + (item.books.price * item.quantity), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-sans">
            Shopping Cart
          </h1>
          <p className="mt-2 text-base sm:text-lg text-gray-600 dark:text-gray-400 font-sans">
            Review and manage your selected books
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 text-indigo-500 dark:text-indigo-400 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 font-sans">
              Your cart is empty
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-8 font-sans">
              Add some books to get started!
            </p>
            <Link to="/">
              <Button className="text-sm sm:text-base bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 font-sans">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.books.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop'}
                        alt={item.books.title}
                        className="w-20 h-28 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <Link to={`/book/${item.books.id}`}>
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-sans">
                            {item.books.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-sans">
                          {item.books.author}
                        </p>
                        <p className="text-base sm:text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-2 font-sans">
                          ${item.books.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={updating === item.id || item.quantity <= 1}
                          className="border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900"
                        >
                          <Minus className="h-5 w-5" />
                        </Button>
                        <span className="w-12 text-center text-sm sm:text-base font-semibold text-gray-900 dark:text-white font-sans">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={updating === item.id || item.quantity >= item.books.stock_quantity}
                          className="border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900"
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        disabled={updating === item.id}
                        className="border-red-500 text-red-500 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4 bg-white dark:bg-gray-800 shadow-lg rounded-2xl">
                <CardContent className="p-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 font-sans">
                    Order Summary
                  </h2>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm sm:text-base text-gray-700 dark:text-gray-300 font-sans">
                      <span>Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base text-gray-700 dark:text-gray-300 font-sans">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 font-semibold">
                      <div className="flex justify-between text-base sm:text-lg text-gray-900 dark:text-white font-sans">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full text-sm sm:text-base bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 font-sans" 
                    size="lg"
                    onClick={() => setCheckoutOpen(true)}
                  >
                    Proceed to Checkout
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        cartItems={cartItems}
        total={total}
        onOrderComplete={handleOrderComplete}
      />

      <Footer />
    </div>
  );
};

export default Cart;