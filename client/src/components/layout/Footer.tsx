import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-spiritual-maroon text-spiritual-cream py-12 px-4 border-t border-spiritual-golden">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-spiritual-golden rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">🕉</span>
              </div>
              <span className="text-xl font-bold">DivyaYatri</span>
            </div>
            <p className="text-gray-400 mb-4">
              Your guide to India's sacred temples and spiritual heritage.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-spiritual-cream/70 hover:text-spiritual-golden transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/temples" className="text-spiritual-cream/70 hover:text-spiritual-golden transition-colors">
                  Temples
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-spiritual-cream/70 hover:text-spiritual-golden transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-spiritual-cream/70 hover:text-spiritual-golden transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-spiritual-cream/70 hover:text-spiritual-golden transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-spiritual-cream/70 hover:text-spiritual-golden transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-spiritual-cream/70 hover:text-spiritual-golden transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <p className="text-gray-400 mb-4">
              Follow us for updates and spiritual insights.
            </p>
            {/* Social media links would go here */}
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 DivyaYatri. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
