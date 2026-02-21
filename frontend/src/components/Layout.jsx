import { Link, useLocation } from 'react-router-dom';
import { Star, Phone, MapPin, Clock, Menu, X } from 'lucide-react';
import { useState } from 'react';

const HERO_BG = "https://images.unsplash.com/photo-1754851539824-5a87c5c7cb86?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwyfHxteXN0aWNhbCUyMGdhbGF4eSUyMHB1cnBsZSUyMGNvbnN0ZWxsYXRpb24lMjBiYWNrZ3JvdW5kJTIwZXRoZXJlYWx8ZW58MHx8fHwxNzcxNjM5ODM2fDA&ixlib=rb-4.1.0&q=85";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/booking', label: 'Book Now' },
    { path: '/blog', label: 'Blog' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" data-testid="nav-logo">
            <div className="w-10 h-10 rounded-full bg-purple-gradient flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-xl font-semibold text-white">
              Astrologer Dandenong
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-mystic-gold ${
                  location.pathname === link.path ? 'text-mystic-gold' : 'text-white/80'
                }`}
                data-testid={`nav-${link.label.toLowerCase().replace(' ', '-')}`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/admin"
              className="text-sm text-white/50 hover:text-white/80 transition-colors"
              data-testid="nav-admin"
            >
              Admin
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-white"
            data-testid="mobile-menu-btn"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block py-2 text-sm font-medium ${
                  location.pathname === link.path ? 'text-mystic-gold' : 'text-white/80'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="block py-2 text-sm text-white/50"
            >
              Admin
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export const Footer = () => {
  return (
    <footer className="relative py-16 mt-auto" data-testid="footer">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(https://images.unsplash.com/photo-1626553683558-dd8dc97e40a4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHw0fHxteXN0aWNhbCUyMGdhbGF4eSUyMHB1cnBsZSUyMGNvbnN0ZWxsYXRpb24lMjBiYWNrZ3JvdW5kJTIwZXRoZXJlYWx8ZW58MHx8fHwxNzcxNjM5ODM2fDA&ixlib=rb-4.1.0&q=85)` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-mystic-dark to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-gradient flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <span className="font-serif text-xl font-semibold">
                Best Astrologer
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Trusted psychic readings and astrology consultations in Dandenong. 
              Unlock your destiny with ancient wisdom and modern guidance.
            </p>
            <div className="flex items-center gap-1 mt-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-mystic-gold text-mystic-gold" />
              ))}
              <span className="ml-2 text-sm text-white/60">248+ Reviews</span>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3 text-sm">
              <a 
                href="tel:+61426272559" 
                className="flex items-center gap-3 text-white/70 hover:text-mystic-gold transition-colors"
                data-testid="footer-phone"
              >
                <Phone className="w-4 h-4" />
                +61 426 272 559
              </a>
              <div className="flex items-start gap-3 text-white/70">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>16 Grant St, Dandenong VIC 3175, Australia</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <Clock className="w-4 h-4" />
                Open 24 Hours, 7 Days
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <Link to="/booking" className="block text-white/70 hover:text-mystic-gold transition-colors">
                Book a Reading
              </Link>
              <Link to="/blog" className="block text-white/70 hover:text-mystic-gold transition-colors">
                Spiritual Insights Blog
              </Link>
              <Link to="/contact" className="block text-white/70 hover:text-mystic-gold transition-colors">
                Contact Us
              </Link>
              <Link to="/#services" className="block text-white/70 hover:text-mystic-gold transition-colors">
                Our Services
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-white/40">
          <p>&copy; {new Date().getFullYear()} Best Astrologer in Dandenong. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

const Layout = ({ children, showFooter = true }) => {
  return (
    <div className="min-h-screen flex flex-col bg-mystic-dark noise-overlay">
      <Navbar />
      <main className="flex-1 pt-20">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
