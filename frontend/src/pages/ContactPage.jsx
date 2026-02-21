import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Send, Phone, MapPin, Clock, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    axios.get(`${API}/analytics/page-views?page=contact`).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post(`${API}/queries`, formData);
      toast.success('Message sent successfully! We will get back to you soon.');
      setIsSuccess(true);
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isSuccess) {
    return (
      <Layout>
        <div className="min-h-screen py-24 px-6 flex items-center justify-center" data-testid="contact-success">
          <Card className="glass max-w-lg p-12 text-center rounded-2xl">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="font-serif text-2xl font-bold mb-4">Message Sent!</h2>
            <p className="text-white/60 mb-6">
              Thank you for reaching out. We will review your query and get back to you as soon as possible.
            </p>
            <Button
              onClick={() => {
                setIsSuccess(false);
                setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
              }}
              className="bg-mystic-purple hover:bg-mystic-purple/80"
              data-testid="send-another-btn"
            >
              Send Another Message
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-12 px-6" data-testid="contact-page">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Get in <span className="gradient-text-purple">Touch</span>
            </h1>
            <p className="text-white/60 max-w-xl mx-auto">
              Have a specific question our AI couldn't answer? Send us a message and we'll get back to you personally.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-2xl font-semibold mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <a 
                    href="tel:+61426272559"
                    className="flex items-start gap-4 group"
                    data-testid="contact-phone"
                  >
                    <div className="w-12 h-12 rounded-xl bg-mystic-purple/20 flex items-center justify-center group-hover:bg-mystic-purple/30 transition-colors">
                      <Phone className="w-5 h-5 text-mystic-purple" />
                    </div>
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-white/60 group-hover:text-mystic-gold transition-colors">+61 426 272 559</p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-mystic-gold/20 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-mystic-gold" />
                    </div>
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-white/60">16 Grant St, Dandenong VIC 3175, Australia</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">Hours</p>
                      <p className="text-white/60">Open 24 Hours, 7 Days a Week</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <Card className="glass rounded-2xl overflow-hidden h-64">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3147.5!2d145.2252087!3d-37.9852867!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad615f6cf392eaf%3A0x9ae8a3d2d8a2fe5a!2s16%20Grant%20St%2C%20Dandenong%20VIC%203175%2C%20Australia!5e0!3m2!1sen!2sus!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Location Map"
                  data-testid="contact-map"
                />
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="glass p-8 rounded-2xl">
              <h2 className="font-serif text-2xl font-semibold mb-6">Send a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-white/70">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="bg-white/5 border-white/10 mt-1"
                      placeholder="Your name"
                      data-testid="contact-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-white/70">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="bg-white/5 border-white/10 mt-1"
                      placeholder="your@email.com"
                      data-testid="contact-email"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white/70">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/10 mt-1"
                    placeholder="+61 XXX XXX XXX"
                    data-testid="contact-phone-input"
                  />
                </div>

                <div>
                  <Label htmlFor="subject" className="text-white/70">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="bg-white/5 border-white/10 mt-1"
                    placeholder="What's this about?"
                    data-testid="contact-subject"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-white/70">Your Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="bg-white/5 border-white/10 mt-1 min-h-[150px]"
                    placeholder="Tell us about your question or concern..."
                    data-testid="contact-message"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-mystic-purple hover:bg-mystic-purple/80 rounded-full py-6"
                  data-testid="contact-submit"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;
