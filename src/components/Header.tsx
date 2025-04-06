import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="w-full bg-[#f4f4f5] shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold">
              Virtual Outfit Helper
            </Link>
          </div>
          <div className="ml-6 flex space-x-6">
            <Link
              to="/"
              className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Home
            </Link>
            {/* Removed duplicate Try On link */}
            <Link
              to="/try-on"
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 text-sm font-medium"
            >
              Try Now
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
