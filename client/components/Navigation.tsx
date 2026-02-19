import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Bus,
  Search,
  MapPin,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar when scrolling up, hide when scrolling down
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);


  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-lg transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4 flex-1">
            <Link
              to="/"
              className="flex items-center space-x-2"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "/";
              }}
            >
              <div className="bg-red-500 text-white p-2 rounded-lg shadow-lg hover:bg-red-500 transition-colors">
                <Bus className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-black">Bus</span>
                <span className="text-red-500">नियोजक</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6 flex-2 justify-center">
            <Link
              to="/search"
              className={`flex items-center space-x-1 px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/search")
                  ? "bg-red-500 text-white"
                  : "text-gray-700 hover:text-white hover:bg-red-500"
                }`}
            >
              <Search className="h-4 w-4" />
              <span>Search Buses</span>
            </Link>
            <Link
              to="/routes"
              className={`flex items-center space-x-1 px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/routes")
                  ? "bg-red-500 text-white"
                  : "text-gray-700 hover:text-white hover:bg-red-500"
                }`}
            >
              <MapPin className="h-4 w-4" />
              <span>Routes</span>
            </Link>
            <Link
              to="/about"
              className={`flex items-center space-x-1 px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/about")
                  ? "bg-red-500 text-white"
                  : "text-gray-700 hover:text-white hover:bg-red-500"
                }`}
            >
              <span>About</span>
            </Link>
            <Link
              to="/contact"
              className={`flex items-center space-x-1 px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/contact")
                  ? "bg-red-500 text-white"
                  : "text-gray-700 hover:text-white hover:bg-red-500"
                }`}
            >
              <span>Contact</span>
            </Link>
            <Link
              to="/faq"
              className={`flex items-center space-x-1 px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/faq") || isActive("/help")
                  ? "bg-red-500 text-white"
                  : "text-gray-700 hover:text-white hover:bg-red-500"
                }`}
            >
              <HelpCircle className="h-4 w-4" />
              <span>Help</span>
            </Link>
            <Link
              to="/admin/login"
              className={`flex items-center space-x-1 px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/admin/login") || isActive("/admin")
                  ? "bg-gray-800 text-white"
                  : "text-gray-500 hover:text-white hover:bg-gray-700"
                }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Admin</span>
            </Link>
          </div>


          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-2 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/search"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${isActive("/search")
                    ? "bg-red-500 text-white"
                    : "text-gray-700 hover:text-red-500 hover:bg-red-100"
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Search className="h-5 w-5" />
                <span>Search Buses</span>
              </Link>
              <Link
                to="/routes"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${isActive("/routes")
                    ? "bg-red-500 text-white"
                    : "text-gray-700 hover:text-red-500 hover:bg-red-100"
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <MapPin className="h-5 w-5" />
                <span>Routes</span>
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-500 hover:bg-red-100 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-500 hover:bg-red-100 transition-colors"
              >
                Contact
              </Link>
              <Link
                to="/faq"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${isActive("/faq") || isActive("/help")
                    ? "bg-red-500 text-white"
                    : "text-gray-700 hover:text-red-500 hover:bg-red-100"
                  } transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                <HelpCircle className="h-5 w-5" />
                <span>Help & FAQ</span>
              </Link>
              <Link
                to="/admin/login"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${isActive("/admin/login") || isActive("/admin")
                    ? "bg-gray-800 text-white"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  } transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                <ShieldCheck className="h-5 w-5" />
                <span>Admin</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
