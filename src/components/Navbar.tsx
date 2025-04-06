
import { useState, useEffect } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { ShoppingCart, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/AuthStore';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/try-on', label: 'Try On' },
  ];

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300",
        scrolled 
          ? "bg-white/80 backdrop-blur-lg shadow-sm" 
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight logo-animation">
            WearX
          </span>
        </NavLink>

        <ul className="hidden md:flex items-center space-x-8">
          {navLinks.map(({ path, label }) => (
            <li key={path}>
              <NavLink 
                to={path} 
                className={({ isActive }) => cn(
                  "relative text-sm font-medium transition-colors hover:text-black",
                  {
                    "text-black": isActive,
                    "text-gray-500": !isActive,
                  },
                  "after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-black after:transition-all after:duration-300",
                  {
                    "after:w-full": location.pathname === path,
                    "after:w-0 hover:after:w-full": location.pathname !== path,
                  }
                )}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link
                to="/cart"
                className="text-gray-600 hover:text-gray-900"
              >
                <ShoppingCart className="h-6 w-6" />
              </Link>
              <button
                onClick={() => signOut()}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </>
          ) : (
            <Link
              to="/signin"
              className="text-gray-600 hover:text-gray-900"
            >
              <User className="h-6 w-6" />
            </Link>
          )}
        </div>
        <div className="flex items-center gap-4">
          <NavLink 
            to="/try-on" 
            className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium transition-all hover:bg-gray-800"
          >
            Try Now
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
