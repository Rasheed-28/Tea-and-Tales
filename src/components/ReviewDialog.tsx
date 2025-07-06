import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: string;
  bookTitle: string;
  onReviewSubmitted: () => void;
}

const ReviewDialog = ({ open, onOpenChange, bookId, bookTitle, onReviewSubmitted }: ReviewDialogProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("Please log in to submit a review");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);

    // Check if user has already reviewed this book
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("book_id", bookId)
      .eq("user_id", user.id)
      .single();

    if (existingReview) {
      toast.error("You have already reviewed this book");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase
      .from("reviews")
      .insert({
        book_id: bookId,
        user_id: user.id,
        rating,
        comment: comment.trim() || null,
      });

    if (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } else {
      onReviewSubmitted();
      setRating(0);
      setHoveredRating(0);
      setComment("");
    }

    setIsSubmitting(false);
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setComment("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-2xl font-sans">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-sans">
            Write a Review
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-6">
          <div>
            <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white font-sans mb-2">
              {bookTitle}
            </h4>
          </div>

          <div>
            <label className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 font-sans mb-2 block">
              Rating
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-5 w-5 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 dark:text-gray-500"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 font-sans mb-2 block">
              Comment (optional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this book..."
              rows={4}
              className="text-sm sm:text-base text-gray-900 dark:text-white font-sans bg-gray-50 dark:bg-gray-700"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="text-sm border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900 font-sans"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={isSubmitting || rating === 0}
              className="text-sm font-sans bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;