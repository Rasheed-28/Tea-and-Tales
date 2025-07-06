import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: Array<{
    id: string;
    quantity: number;
    books: {
      id: string;
      title: string;
      price: number;
    };
  }>;
  total: number;
  onOrderComplete: () => void;
}

const CheckoutDialog = ({ open, onOpenChange, cartItems, total, onOrderComplete }: CheckoutDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [cardNumber, setCardNumber] = useState("4242424242424242");
  const [expiryDate, setExpiryDate] = useState("12/25");
  const [cvv, setCvv] = useState("123");

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("Please log in to place an order");
      return;
    }

    if (!shippingAddress.trim()) {
      toast.error("Please enter a shipping address");
      return;
    }

    setLoading(true);

    try {
      // Create the order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: total,
          shipping_address: shippingAddress,
          status: "confirmed",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: orderData.id,
        book_id: item.books.id,
        quantity: item.quantity,
        price: item.books.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear the cart
      const { error: clearCartError } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);

      if (clearCartError) throw clearCartError;

      toast.success("Order placed successfully! Order ID: " + orderData.id.slice(0, 8));
      onOrderComplete();
      onOpenChange(false);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[18rem] bg-white dark:bg-gray-800 shadow-lg rounded-2xl font-sans p-3.5">
        <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-1.5 mb-3">
          <DialogTitle className="flex items-center gap-1.5 text-base font-bold text-gray-900 dark:text-white font-sans">
            <div className="w-5 h-5 bg-indigo-500 dark:bg-indigo-600 rounded-full flex items-center justify-center">
              <Lock className="h-2.5 w-2.5 text-white" />
            </div>
            Secure Checkout
          </DialogTitle>
          <DialogDescription className="text-[0.65rem] sm:text-xs text-gray-600 dark:text-gray-400 font-sans">
            Secure payment (Demo Mode)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Order Summary */}
          <Card className="bg-white dark:bg-gray-800 shadow-md rounded-2xl border-0">
            <CardContent className="p-3">
              <h3 className="text-[0.65rem] sm:text-xs font-semibold text-gray-900 dark:text-white font-sans mb-1">
                Order Summary
              </h3>
              <div className="space-y-0.5 text-[0.65rem] sm:text-xs">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 font-sans truncate">{item.books.title} × {item.quantity}</span>
                    <span className="font-semibold text-gray-900 dark:text-white font-sans">
                      ${(item.books.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-0.5 font-bold flex justify-between items-center">
                  <span className="text-gray-900 dark:text-white font-sans">Total</span>
                  <span className="text-xs sm:text-sm bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-sans">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <div className="space-y-0.5">
            <label className="text-[0.65rem] sm:text-xs font-semibold text-gray-700 dark:text-gray-300 font-sans">
              Shipping Address
            </label>
            <Input
              placeholder="Full address"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              className="text-[0.65rem] sm:text-xs text-gray-900 dark:text-white font-sans bg-gray-50 dark:bg-gray-700 rounded-md border-gray-200 dark:border-gray-600 h-8"
            />
          </div>

          {/* Mock Payment Form */}
          <Card className="bg-white dark:bg-gray-800 shadow-md rounded-2xl border-0">
            <CardContent className="p-3">
              <div className="flex items-center gap-1 mb-1">
                <div className="w-4 h-4 bg-indigo-500 dark:bg-indigo-600 rounded-full flex items-center justify-center">
                  <CreditCard className="h-2 w-2 text-white" />
                </div>
                <span className="text-[0.65rem] sm:text-xs font-semibold text-gray-900 dark:text-white font-sans">
                  Payment (Demo)
                </span>
              </div>

              <div className="space-y-1">
                <div>
                  <label className="text-[0.65rem] sm:text-xs font-semibold text-gray-700 dark:text-gray-300 font-sans">
                    Card Number
                  </label>
                  <Input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    className="text-[0.65rem] sm:text-xs text-gray-900 dark:text-white font-sans bg-gray-50 dark:bg-gray-700 rounded-md border-gray-200 dark:border-gray-600 h-8"
                  />
                </div>

                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <label className="text-[0.65rem] sm:text-xs font-semibold text-gray-700 dark:text-gray-300 font-sans">
                      Expiry
                    </label>
                    <Input
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      placeholder="MM/YY"
                      className="text-[0.65rem] sm:text-xs text-gray-900 dark:text-white font-sans bg-gray-50 dark:bg-gray-700 rounded-md border-gray-200 dark:border-gray-600 h-8"
                    />
                  </div>
                  <div>
                    <label className="text-[0.65rem] sm:text-xs font-semibold text-gray-700 dark:text-gray-300 font-sans">
                      CVV
                    </label>
                    <Input
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="123"
                      className="text-[0.65rem] sm:text-xs text-gray-900 dark:text-white font-sans bg-gray-50 dark:bg-gray-700 rounded-md border-gray-200 dark:border-gray-600 h-8"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-gray-50 dark:bg-gray-700 p-1 rounded-md border border-gray-200 dark:border-gray-600">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-indigo-500 dark:bg-indigo-600 rounded-full flex items-center justify-center mr-1">
                <Lock className="h-2 w-2 text-white" />
              </div>
              <span className="text-[0.65rem] sm:text-xs text-gray-600 dark:text-gray-400 font-sans">
                Mock payment. No charge.
              </span>
            </div>
          </div>

          <Button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full text-[0.65rem] sm:text-xs bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-sans font-semibold rounded-md transition-all duration-200 hover:scale-[1.02] shadow-md h-8"
            size="sm"
          >
            {loading ? "Processing..." : `Order - $${total.toFixed(2)}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;