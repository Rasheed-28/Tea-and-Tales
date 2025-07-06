import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Calendar, MapPin, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReviewDialog from "@/components/ReviewDialog";

interface Order {
  id: string;
  total_amount: number;
  status: string;
  shipping_address: string;
  created_at: string;
  order_items: Array<{
    quantity: number;
    price: number;
    books: {
      id: string;
      title: string;
      author: string;
      image_url: string | null;
    };
  }>;
}

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        total_amount,
        status,
        shipping_address,
        created_at,
        order_items (
          quantity,
          price,
          books (
            id,
            title,
            author,
            image_url
          )
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const getStatusBadgeClassName = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-sm font-sans";
      case "shipped":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-sm font-sans";
      case "confirmed":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-sm font-sans";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 text-sm font-sans";
    }
  };

  const openReviewDialog = (bookId: string, bookTitle: string) => {
    setSelectedBook({ id: bookId, title: bookTitle });
    setReviewDialogOpen(true);
  };

  const handleReviewSubmitted = () => {
    setReviewDialogOpen(false);
    setSelectedBook(null);
    toast.success("Review submitted successfully!");
  };

  const fallbackImageUrl = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 font-sans">
        <div className="text-2xl font-medium text-gray-600 dark:text-gray-300 animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-sans">
            My Orders
          </h1>
          <p className="mt-2 text-base sm:text-lg text-gray-600 dark:text-gray-400 font-sans">
            View and manage your order history
          </p>
        </div>

        {orders.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl">
            <CardContent className="text-center py-16">
              <Package className="h-16 w-16 text-indigo-500 dark:text-indigo-400 mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-sans mb-2">
                No orders yet
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-sans">
                Start shopping to see your orders here!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card
                key={order.id}
                className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl"
              >
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-sans">
                    Order #{order.id.slice(0, 8)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center text-sm sm:text-base text-gray-700 dark:text-gray-300 font-sans mt-1">
                        <Calendar className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mr-2" />
                        {new Date(order.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusBadgeClassName(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white font-sans mt-2">
                        ${order.total_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start mb-4">
                    <MapPin className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-200 font-sans">
                        Shipping Address
                      </p>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-sans">
                        {order.shipping_address}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 font-sans mb-3">
                      Order Items
                    </h4>
                    <div className="space-y-3">
                      {order.order_items.map((item) => (
                        <div key={item.books.id} className="flex items-center space-x-4">
                          <img
                            src={item.books.image_url || fallbackImageUrl}
                            alt={item.books.title}
                            className="w-12 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = fallbackImageUrl;
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white font-sans truncate">
                              {item.books.title}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-sans">
                              {item.books.author}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-sans">
                              Qty: {item.quantity} × ${item.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right flex flex-col items-end space-y-2">
                            <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white font-sans">
                              ${(item.quantity * item.price).toFixed(2)}
                            </p>
                            {order.status === "delivered" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-sm border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900 font-sans"
                                onClick={() => openReviewDialog(item.books.id, item.books.title)}
                              >
                                <Star className="h-4 w-4 mr-1" />
                                Write Review
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedBook && (
        <ReviewDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          bookId={selectedBook.id}
          bookTitle={selectedBook.title}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      <Footer />
    </div>
  );
};

export default Orders;