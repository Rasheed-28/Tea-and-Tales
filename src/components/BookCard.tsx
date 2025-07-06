import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import AddToCartButton from "./AddToCartButton";

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
}

const BookCard = ({
  id,
  title,
  author,
  price,
  originalPrice,
  image,
  category,
  rating,
  reviewCount,
}: BookCardProps) => {
  return (
    <Card className="group bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-2xl border-0">
      <CardContent className="p-0">
        <Link to={`/book/${id}`}>
          <div className="relative overflow-hidden rounded-t-2xl">
            <img
              src={image}
              alt={title}
              className="w-full h-56 object-cover transition-transform duration-200 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop";
              }}
            />
            {originalPrice && originalPrice > price && (
              <Badge className="absolute top-2 right-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs font-sans font-semibold shadow-md">
                Save ${(originalPrice - price).toFixed(2)}
              </Badge>
            )}
          </div>
        </Link>
        
        <div className="p-3">
          <Link to={`/book/${id}`}>
            <Badge className="mb-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-sans font-semibold shadow-md">
              {category}
            </Badge>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white font-sans mb-1 line-clamp-2 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-sans mb-2">{author}</p>
          </Link>
          
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-sans ml-2">
              ({reviewCount})
            </span>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-sans">
                ${price.toFixed(2)}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-through font-sans">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <AddToCartButton 
            bookId={id} 
            title={title}
            className="w-full text-xs sm:text-sm bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-sans font-semibold rounded-md transition-all duration-200 hover:scale-[1.02] shadow-md h-8"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BookCard;