
import { NavLink } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold tracking-tight">WearX</h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Experience the future of fashion with our AI-powered virtual try-on technology.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <NavLink to="/" className="text-sm text-gray-500 hover:text-black transition-colors">
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/try-on" className="text-sm text-gray-500 hover:text-black transition-colors">
                  Try On
                </NavLink>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-black transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-black transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-black transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-2">
              <li className="text-sm text-gray-500">
                support@wearx.com
              </li>
              <li className="text-sm text-gray-500">
                +1 (555) 123-4567
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} WearX. All rights reserved.
          </p>
          
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-black transition-colors">
              Instagram
            </a>
            <a href="#" className="text-gray-400 hover:text-black transition-colors">
              Twitter
            </a>
            <a href="#" className="text-gray-400 hover:text-black transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
