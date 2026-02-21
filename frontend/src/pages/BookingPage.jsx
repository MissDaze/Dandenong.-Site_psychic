import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Clock, CheckCircle, Eye, Star, Heart, Sun, Loader2 } from 'lucide-react';
import axios from 'axios';
import { format, addDays, isBefore, startOfToday } from 'date-fns';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const services = [
  { id: 'psychic-reading', name: 'Psychic Reading', icon: Eye, duration: '60 min' },
  { id: 'astrology-consultation', name: 'Astrology Consultation', icon: Star, duration: '90 min' },
  { id: 'love-reading', name: 'Love Reading', icon: Heart, duration: '60 min' },
  { id: 'spiritual-healing', name: 'Spiritual Healing', icon: Sun, duration: '45 min' },
];

const BookingPage = () => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  useEffect(() => {
    axios.get(`${API}/analytics/page-views?page=booking`).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(format(selectedDate, 'yyyy-MM-dd'));
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async (dateStr) => {
    setIsLoadingSlots(true);
    try {
      const response = await axios.get(`${API}/time-slots/${dateStr}`);
      setAvailableSlots(response.data.available_slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime) {
      toast.error('Please complete all steps before booking');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${API}/bookings`, {
        ...formData,
        service: selectedService.name,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time_slot: selectedTime
      });
      
      toast.success('Booking confirmed! We will contact you shortly.');
      setStep(4);
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const disabledDays = (date) => {
    return isBefore(date, startOfToday());
  };

  return (
    <Layout>
      <div className="min-h-screen py-12 px-6" data-testid="booking-page">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Book Your <span className="gradient-text-gold">Reading</span>
            </h1>
            <p className="text-white/60 max-w-xl mx-auto">
              Select your service, choose a time, and take the first step towards clarity.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                    step >= s
                      ? 'bg-mystic-purple text-white'
                      : 'bg-white/10 text-white/50'
                  }`}
                >
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-16 h-0.5 ${step > s ? 'bg-mystic-purple' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Success State */}
          {step === 4 && (
            <Card className="glass max-w-lg mx-auto p-12 text-center rounded-2xl" data-testid="booking-success">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="font-serif text-2xl font-bold mb-4">Booking Confirmed!</h2>
              <p className="text-white/60 mb-6">
                Thank you for booking with us. We will contact you shortly to confirm your appointment for <span className="text-white">{selectedService?.name}</span> on <span className="text-white">{selectedDate && format(selectedDate, 'MMMM d, yyyy')}</span> at <span className="text-white">{selectedTime}</span>.
              </p>
              <Button
                onClick={() => {
                  setStep(1);
                  setSelectedService(null);
                  setSelectedDate(null);
                  setSelectedTime(null);
                  setFormData({ name: '', email: '', phone: '', notes: '' });
                }}
                className="bg-mystic-purple hover:bg-mystic-purple/80"
                data-testid="book-another-btn"
              >
                Book Another Reading
              </Button>
            </Card>
          )}

          {step < 4 && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Side - Selection */}
              <div className="space-y-8">
                {/* Step 1: Service Selection */}
                <Card className={`glass p-6 rounded-2xl ${step !== 1 ? 'opacity-60' : ''}`}>
                  <h3 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-mystic-purple text-xs flex items-center justify-center">1</span>
                    Select Service
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => {
                          setSelectedService(service);
                          setStep(2);
                        }}
                        disabled={step !== 1}
                        className={`p-4 rounded-xl text-left transition-all ${
                          selectedService?.id === service.id
                            ? 'bg-mystic-purple/30 border-mystic-purple border'
                            : 'bg-white/5 border-white/10 border hover:bg-white/10'
                        }`}
                        data-testid={`service-${service.id}`}
                      >
                        <service.icon className="w-6 h-6 text-mystic-purple mb-2" />
                        <p className="font-medium text-sm">{service.name}</p>
                        <p className="text-xs text-white/50">{service.duration}</p>
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Step 2: Date & Time */}
                <Card className={`glass p-6 rounded-2xl ${step < 2 ? 'opacity-60 pointer-events-none' : ''}`}>
                  <h3 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-mystic-purple text-xs flex items-center justify-center">2</span>
                    Choose Date & Time
                  </h3>
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          setSelectedTime(null);
                        }}
                        disabled={disabledDays}
                        className="rounded-lg border border-white/10 bg-white/5 p-3"
                        data-testid="booking-calendar"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-sm text-white/60 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {selectedDate ? `Available times for ${format(selectedDate, 'MMM d')}` : 'Select a date first'}
                      </p>
                      
                      {isLoadingSlots ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-mystic-purple" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot}
                              onClick={() => {
                                setSelectedTime(slot);
                                setStep(3);
                              }}
                              className={`py-2 px-3 rounded-lg text-sm transition-all ${
                                selectedTime === slot
                                  ? 'bg-mystic-purple text-white'
                                  : 'bg-white/5 hover:bg-white/10 text-white/80'
                              }`}
                              data-testid={`time-slot-${slot.replace(/[:\s]/g, '-')}`}
                            >
                              {slot}
                            </button>
                          ))}
                          {availableSlots.length === 0 && selectedDate && (
                            <p className="col-span-3 text-center text-white/50 py-4">
                              No slots available
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Side - Form */}
              <Card className={`glass p-6 rounded-2xl h-fit ${step < 3 ? 'opacity-60 pointer-events-none' : ''}`}>
                <h3 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-mystic-purple text-xs flex items-center justify-center">3</span>
                  Your Details
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-white/70">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="bg-white/5 border-white/10 mt-1"
                      placeholder="Enter your name"
                      data-testid="booking-name"
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
                      data-testid="booking-email"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-white/70">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="bg-white/5 border-white/10 mt-1"
                      placeholder="+61 XXX XXX XXX"
                      data-testid="booking-phone"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes" className="text-white/70">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/10 mt-1 min-h-[100px]"
                      placeholder="Any specific questions or topics you'd like to discuss..."
                      data-testid="booking-notes"
                    />
                  </div>

                  {/* Summary */}
                  {selectedService && selectedDate && selectedTime && (
                    <div className="bg-white/5 rounded-xl p-4 mt-6">
                      <h4 className="font-medium mb-3">Booking Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/60">Service:</span>
                          <span>{selectedService.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Date:</span>
                          <span>{format(selectedDate, 'MMMM d, yyyy')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Time:</span>
                          <span>{selectedTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Duration:</span>
                          <span>{selectedService.duration}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.name || !formData.email || !formData.phone}
                    className="w-full bg-mystic-purple hover:bg-mystic-purple/80 rounded-full py-6 mt-4"
                    data-testid="booking-submit"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Confirming...
                      </>
                    ) : (
                      'Confirm Booking'
                    )}
                  </Button>
                </form>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BookingPage;
