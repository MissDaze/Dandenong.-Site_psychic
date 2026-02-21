import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Star, Eye, Heart, Sun, Calendar, MessageCircle, Phone, ChevronRight } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const HERO_BG = "https://images.unsplash.com/photo-1754851539824-5a87c5c7cb86?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwyfHxteXN0aWNhbCUyMGdhbGF4eSUyMHB1cnBsZSUyMGNvbnN0ZWxsYXRpb24lMjBiYWNrZ3JvdW5kJTIwZXRoZXJlYWx8ZW58MHx8fHwxNzcxNjM5ODM2fDA&ixlib=rb-4.1.0&q=85";

const services = [
  {
    title: 'Psychic Reading',
    description: 'Gain profound insights into your past, present, and future through our expert psychic readings.',
    icon: Eye,
    size: 'large',
    gradient: 'from-purple-600/20 to-pink-600/20'
  },
  {
    title: 'Astrology Consultation',
    description: 'Discover your cosmic blueprint and navigate lifes challenges with celestial guidance.',
    icon: Star,
    size: 'tall',
    gradient: 'from-amber-500/20 to-orange-600/20'
  },
  {
    title: 'Love Reading',
    description: 'Find clarity in matters of the heart and attract your soulmate.',
    icon: Heart,
    size: 'normal',
    gradient: 'from-rose-500/20 to-red-600/20'
  },
  {
    title: 'Spiritual Healing',
    description: 'Restore balance and harmony to your mind, body, and spirit.',
    icon: Sun,
    size: 'normal',
    gradient: 'from-teal-500/20 to-emerald-600/20'
  }
];

const testimonials = [
  {
    name: 'Sarah M.',
    text: 'The reading was incredibly accurate. I finally have clarity about my career path.',
    rating: 5
  },
  {
    name: 'James K.',
    text: 'Helped me understand my relationship better. Highly recommend!',
    rating: 5
  },
  {
    name: 'Priya R.',
    text: 'A life-changing experience. The spiritual guidance was exactly what I needed.',
    rating: 5
  },
  {
    name: 'Michael T.',
    text: 'Professional and insightful. The astrology consultation opened my eyes.',
    rating: 5
  },
  {
    name: 'Emma L.',
    text: 'Best psychic in Dandenong. Accurate predictions and genuine care.',
    rating: 5
  }
];

const HomePage = () => {
  useEffect(() => {
    // Track page view
    axios.get(`${API}/analytics/page-views?page=home`).catch(() => {});
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden" data-testid="hero-section">
        {/* Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-mystic-dark/60 via-mystic-dark/40 to-mystic-dark" />
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-6 animate-fade-in-up opacity-0 stagger-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-mystic-gold text-mystic-gold" />
            ))}
            <span className="ml-2 text-white/70 text-sm">248+ Five Star Reviews</span>
          </div>
          
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in-up opacity-0 stagger-2">
            <span className="text-white">Unlock Your</span>
            <br />
            <span className="gradient-text-gold">Destiny</span>
            <span className="text-white"> in Dandenong</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto animate-fade-in-up opacity-0 stagger-3">
            Ancient wisdom meets modern guidance. Trusted by hundreds of souls seeking clarity in psychic readings, astrology, and spiritual healing.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up opacity-0 stagger-4">
            <Link to="/booking">
              <Button 
                size="lg" 
                className="bg-white text-black hover:bg-slate-200 rounded-full px-8 py-6 text-base font-medium hover:scale-105 transition-transform"
                data-testid="hero-book-btn"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book a Reading
              </Button>
            </Link>
            <Link to="/contact">
              <Button 
                size="lg" 
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 rounded-full px-8 py-6 text-base"
                data-testid="hero-contact-btn"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Ask a Question
              </Button>
            </Link>
          </div>
          
          <a 
            href="tel:+61426272559"
            className="inline-flex items-center gap-2 mt-8 text-white/60 hover:text-mystic-gold transition-colors animate-fade-in-up opacity-0 stagger-5"
          >
            <Phone className="w-4 h-4" />
            <span>Or call: +61 426 272 559</span>
          </a>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-6" data-testid="services-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Our <span className="gradient-text-purple">Services</span>
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Discover the path that's right for you with our range of spiritual services
            </p>
          </div>

          <div className="services-grid">
            {services.map((service, idx) => (
              <Card
                key={service.title}
                className={`
                  glass p-8 rounded-2xl cursor-pointer group
                  hover:scale-[1.02] hover:border-mystic-purple/50
                  transition-transform duration-300
                  ${service.size === 'large' ? 'service-large' : ''}
                  ${service.size === 'tall' ? 'service-tall' : ''}
                `}
                data-testid={`service-card-${idx}`}
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-mystic-purple/20 flex items-center justify-center mb-6 group-hover:bg-mystic-purple/30 transition-colors">
                    <service.icon className="w-7 h-7 text-mystic-purple" />
                  </div>
                  <h3 className="font-serif text-2xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-white/60 mb-6">{service.description}</p>
                  <Link to="/booking" className="inline-flex items-center text-mystic-gold hover:gap-3 gap-2 transition-all">
                    <span className="text-sm font-medium">Book Now</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6 relative overflow-hidden" data-testid="testimonials-section">
        <div className="absolute inset-0 bg-gradient-to-r from-mystic-purple/5 via-transparent to-mystic-gold/5" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Trusted by <span className="gradient-text-gold">248+</span> Souls
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              See what our clients have to say about their transformative experiences
            </p>
          </div>

          <div className="testimonials-scroll pb-4">
            {testimonials.map((testimonial, idx) => (
              <Card
                key={idx}
                className="glass p-6 rounded-2xl w-80 flex-shrink-0"
                data-testid={`testimonial-${idx}`}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-mystic-gold text-mystic-gold" />
                  ))}
                </div>
                <p className="text-white/80 mb-4 italic">"{testimonial.text}"</p>
                <p className="text-sm text-white/50">— {testimonial.name}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6" data-testid="cta-section">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass rounded-3xl p-12 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-mystic-purple/20 to-mystic-gold/10" />
            <div className="relative z-10">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                Ready to Discover Your Path?
              </h2>
              <p className="text-white/60 mb-8 max-w-lg mx-auto">
                Take the first step towards clarity and enlightenment. Book your reading today or reach out with any questions.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/booking">
                  <Button 
                    size="lg" 
                    className="bg-mystic-purple hover:bg-mystic-purple/80 rounded-full px-8"
                    data-testid="cta-book-btn"
                  >
                    Book Your Reading
                  </Button>
                </Link>
                <a href="tel:+61426272559">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-white/20 hover:bg-white/10 rounded-full px-8"
                    data-testid="cta-call-btn"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
