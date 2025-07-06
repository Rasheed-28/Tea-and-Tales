import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star, Award } from "lucide-react";

const FeaturedSection = () => {
  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Featured Book */}
          <div className="relative">
            <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden border-0">
              <CardContent className="p-0">
                <img
                  src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&h=600&fit=crop"
                  alt="Featured Book"
                  className="w-full h-[400px] sm:h-[500px] object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop";
                  }}
                />
                <Badge className="absolute top-4 left-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-sm font-sans font-semibold shadow-md">
                  <Award className="h-4 w-4 mr-1 text-indigo-500 dark:text-indigo-400" />
                  Featured
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-4 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-sm font-sans font-semibold shadow-md">
                <Star className="h-4 w-4 mr-1 text-indigo-500 dark:text-indigo-400" />
                Bestseller
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-sans">
                Book of the Month
              </h2>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-sans mt-2">
                The Art of Reading
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-sans">
                by Sarah Johnson
              </p>
              <p className="text-sm sm:text-base leading-relaxed text-gray-600 dark:text-gray-400 font-sans">
                Discover the transformative power of reading in this compelling exploration 
                of literature's impact on human consciousness. A must-read for book lovers 
                and curious minds alike.
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current text-yellow-400" />
                ))}
              </div>
              <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-sans">
                (2,847 reviews)
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-sans">
                $24.99
              </span>
              <span className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 line-through font-sans">
                $34.99
              </span>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-sm font-sans font-semibold shadow-md">
                Save 29%
              </Badge>
            </div>

            <div className="flex space-x-4">
              <Button
                size="lg"
                className="flex-1 text-sm sm:text-base bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-sans font-semibold rounded-lg transition-all duration-200 hover:scale-[1.02] shadow-lg"
                asChild
              >
                <Link to="/book/featured">
                  <ShoppingCart className="h-5 w-5 mr-2 text-white" />
                  Buy Now
                </Link>
              </Button>
              
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;