import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 mt-16 font-sans border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <BookOpen className="h-7 w-7 text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors duration-200" />
            <span className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent tracking-tight font-sans">
              Tea & Tales
            </span>
          </div>

          {/* Links and Copyright */}
          <div className="flex items-center space-x-6 text-sm sm:text-base text-white dark:text-white font-sans">
            <Link
              to="/privacy"
              className="relative group hover:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200"
            >
              Privacy Policy
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-400 dark:bg-indigo-300 group-hover:w-full transition-all duration-200"></span>
            </Link>
            <Link
              to="/terms"
              className="relative group hover:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200"
            >
              Terms of Service
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-400 dark:bg-indigo-300 group-hover:w-full transition-all duration-200"></span>
            </Link>
            <span className="tracking-tight">© All Rights Reserved</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;