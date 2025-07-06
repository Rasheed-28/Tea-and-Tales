import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AddToCartButtonProps {
  bookId: string;
  title: string;
  className?: string;
}

const AddToCartButton = ({ bookId, title, className }: AddToCartButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    setLoading(true);
    
    try {
      // Check if item already exists in cart
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('book_id', bookId)
        .single();

      if (existing) {
        // Update quantity if item exists
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + 1 })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            book_id: bookId,
            quantity: 1
          });

        if (error) throw error;
      }

      toast.success(`"${title}" added to cart!`);
      
      // Trigger a page refresh to update cart count
      window.dispatchEvent(new Event('cartUpdated'));
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleAddToCart} 
      disabled={loading}
      className={className}
    >
      <ShoppingCart className="h-4 w-4 mr-2" />
      {loading ? 'Adding...' : 'Add to Cart'}
    </Button>
  );
};

export default AddToCartButton;
