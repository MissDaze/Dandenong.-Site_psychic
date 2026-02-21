import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  LayoutDashboard, Calendar, MessageSquare, BarChart3, LogOut, 
  CheckCircle, Clock, XCircle, Trash2, Eye, Star, RefreshCw,
  TrendingUp, Users, MessageCircle, Mail, Phone, PanelLeftClose, PanelLeft,
  RotateCcw, Save, PhoneCall, MailPlus, StickyNote
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminDashboard = () => {
  const { token, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [queries, setQueries] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [flippedBookings, setFlippedBookings] = useState({});
  const [flippedQueries, setFlippedQueries] = useState({});
  const [editingNotes, setEditingNotes] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin');
      return;
    }
    fetchData();
  }, [isAuthenticated, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [bookingsRes, queriesRes, analyticsRes] = await Promise.all([
        axios.get(`${API}/bookings`, { headers }),
        axios.get(`${API}/queries`, { headers }),
        axios.get(`${API}/analytics/summary`, { headers })
      ]);
      setBookings(bookingsRes.data);
      setQueries(queriesRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Fetch error:', error);
      if (error.response?.status === 401) {
        logout();
        navigate('/admin');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await axios.patch(`${API}/bookings/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      toast.success('Booking status updated');
    } catch (error) {
      toast.error('Failed to update booking');
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    try {
      await axios.delete(`${API}/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(prev => prev.filter(b => b.id !== id));
      toast.success('Booking deleted');
    } catch (error) {
      toast.error('Failed to delete booking');
    }
  };

  const updateQueryStatus = async (id, status) => {
    try {
      await axios.patch(`${API}/queries/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQueries(prev => prev.map(q => q.id === id ? { ...q, status } : q));
      toast.success('Query status updated');
    } catch (error) {
      toast.error('Failed to update query');
    }
  };

  const deleteQuery = async (id) => {
    if (!window.confirm('Are you sure you want to delete this query?')) return;
    try {
      await axios.delete(`${API}/queries/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQueries(prev => prev.filter(q => q.id !== id));
      toast.success('Query deleted');
    } catch (error) {
      toast.error('Failed to delete query');
    }
  };

  const toggleBookingFlip = (id) => {
    setFlippedBookings(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleQueryFlip = (id) => {
    setFlippedQueries(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const updateBookingNotes = async (id, notes) => {
    try {
      await axios.patch(`${API}/bookings/${id}/notes`, { admin_notes: notes }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, admin_notes: notes } : b));
      toast.success('Notes saved');
    } catch (error) {
      toast.error('Failed to save notes');
    }
  };

  const updateQueryNotes = async (id, notes) => {
    try {
      await axios.patch(`${API}/queries/${id}/notes`, { admin_notes: notes }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQueries(prev => prev.map(q => q.id === id ? { ...q, admin_notes: notes } : q));
      toast.success('Notes saved');
    } catch (error) {
      toast.error('Failed to save notes');
    }
  };

  const handleNotesChange = (type, id, value) => {
    setEditingNotes(prev => ({ ...prev, [`${type}-${id}`]: value }));
  };

  const getNotesValue = (type, id, originalNotes) => {
    const key = `${type}-${id}`;
    return editingNotes[key] !== undefined ? editingNotes[key] : (originalNotes || '');
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
      completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      new: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      replied: 'bg-green-500/20 text-green-400 border-green-500/30',
      closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return styles[status] || styles.pending;
  };

  return (
    <div className="min-h-screen bg-mystic-dark flex" data-testid="admin-dashboard">
      {/* Sidebar */}
      <aside className={`glass-dark border-r border-white/10 p-6 flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="flex items-center justify-between mb-10">
          <Link to="/" className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-purple-gradient flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && <span className="font-serif text-lg font-semibold">Admin</span>}
          </Link>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'bookings', icon: Calendar, label: 'Bookings' },
            { id: 'queries', icon: MessageSquare, label: 'Queries' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === item.id 
                  ? 'bg-mystic-purple/20 text-white' 
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              } ${!sidebarOpen && 'justify-center px-2'}`}
              data-testid={`nav-${item.id}`}
              title={!sidebarOpen ? item.label : ''}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && item.label}
            </button>
          ))}
        </nav>

        <div className="space-y-2">
          <Button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            variant="ghost"
            className={`w-full justify-start gap-3 text-white/60 hover:text-white hover:bg-white/5 ${!sidebarOpen && 'justify-center px-2'}`}
            data-testid="toggle-sidebar-btn"
          >
            {sidebarOpen ? <PanelLeftClose className="w-5 h-5 flex-shrink-0" /> : <PanelLeft className="w-5 h-5 flex-shrink-0" />}
            {sidebarOpen && 'Hide Sidebar'}
          </Button>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className={`w-full justify-start gap-3 text-white/60 hover:text-white hover:bg-white/5 ${!sidebarOpen && 'justify-center px-2'}`}
            data-testid="logout-btn"
            title={!sidebarOpen ? 'Logout' : ''}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && 'Logout'}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'bookings' && 'Manage Bookings'}
              {activeTab === 'queries' && 'Customer Queries'}
            </h1>
            <p className="text-white/60 mt-1">
              {activeTab === 'overview' && 'Monitor your business at a glance'}
              {activeTab === 'bookings' && 'View and manage all booking requests'}
              {activeTab === 'queries' && 'Respond to customer inquiries'}
            </p>
          </div>
          <Button onClick={fetchData} variant="outline" className="gap-2" data-testid="refresh-btn">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="glass p-6 rounded-2xl" data-testid="stat-bookings">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Total Bookings</p>
                    <p className="text-3xl font-bold mt-1">{analytics?.total_bookings || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-mystic-purple/20 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-mystic-purple" />
                  </div>
                </div>
                <p className="text-sm text-mystic-gold mt-3">
                  {analytics?.pending_bookings || 0} pending
                </p>
              </Card>

              <Card className="glass p-6 rounded-2xl" data-testid="stat-queries">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Total Queries</p>
                    <p className="text-3xl font-bold mt-1">{analytics?.total_queries || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-mystic-gold/20 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-mystic-gold" />
                  </div>
                </div>
                <p className="text-sm text-green-400 mt-3">
                  {analytics?.new_queries || 0} new
                </p>
              </Card>

              <Card className="glass p-6 rounded-2xl" data-testid="stat-confirmed">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Confirmed</p>
                    <p className="text-3xl font-bold mt-1">{analytics?.confirmed_bookings || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </Card>

              <Card className="glass p-6 rounded-2xl" data-testid="stat-chats">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/60 text-sm">AI Chats (7d)</p>
                    <p className="text-3xl font-bold mt-1">
                      {analytics?.chat_trends?.reduce((a, b) => a + (b.count || 0), 0) || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="glass p-6 rounded-2xl">
                <h3 className="font-serif text-xl font-semibold mb-4">Recent Bookings</h3>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {bookings.slice(0, 5).map(booking => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div>
                          <p className="font-medium">{booking.name}</p>
                          <p className="text-sm text-white/60">{booking.service}</p>
                        </div>
                        <Badge className={getStatusBadge(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                    ))}
                    {bookings.length === 0 && (
                      <p className="text-center text-white/50 py-8">No bookings yet</p>
                    )}
                  </div>
                </ScrollArea>
              </Card>

              <Card className="glass p-6 rounded-2xl">
                <h3 className="font-serif text-xl font-semibold mb-4">Recent Queries</h3>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {queries.slice(0, 5).map(query => (
                      <div key={query.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div>
                          <p className="font-medium">{query.name}</p>
                          <p className="text-sm text-white/60 truncate max-w-[200px]">{query.subject}</p>
                        </div>
                        <Badge className={getStatusBadge(query.status)}>
                          {query.status}
                        </Badge>
                      </div>
                    ))}
                    {queries.length === 0 && (
                      <p className="text-center text-white/50 py-8">No queries yet</p>
                    )}
                  </div>
                </ScrollArea>
              </Card>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="grid gap-4" data-testid="bookings-grid">
            {bookings.map(booking => (
              <div 
                key={booking.id} 
                className={`flip-card h-48 ${flippedBookings[booking.id] ? 'flipped' : ''}`}
              >
                <div className="flip-card-inner">
                  {/* Front of Card */}
                  <Card 
                    className="flip-card-front glass p-6 rounded-2xl cursor-pointer hover:border-mystic-purple/50 transition-colors h-full"
                    onClick={() => toggleBookingFlip(booking.id)}
                    data-testid={`booking-card-${booking.id}`}
                  >
                    <div className="flex items-start justify-between h-full">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-serif text-xl font-semibold">{booking.name}</h3>
                          <Badge className={getStatusBadge(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="text-mystic-gold font-medium">{booking.service}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-white/60">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" /> {booking.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" /> {booking.time_slot}
                          </span>
                        </div>
                        {booking.notes && (
                          <p className="text-sm text-white/50 mt-2 italic">"{booking.notes}"</p>
                        )}
                        <p className="text-xs text-white/30 mt-3">Click to view contact details</p>
                      </div>
                      <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={booking.status}
                          onValueChange={(val) => updateBookingStatus(booking.id, val)}
                        >
                          <SelectTrigger className="w-28 bg-white/5 border-white/10 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteBooking(booking.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          data-testid={`delete-booking-${booking.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Back of Card */}
                  <Card 
                    className="flip-card-back glass p-6 rounded-2xl h-full"
                    data-testid={`booking-card-back-${booking.id}`}
                  >
                    <div className="flex items-start justify-between h-full">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
                            <Users className="w-5 h-5 text-mystic-purple" />
                            Contact Details
                          </h3>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleBookingFlip(booking.id)}
                            className="text-white/60 hover:text-white"
                            data-testid={`flip-back-booking-${booking.id}`}
                          >
                            <RotateCcw className="w-4 h-4 mr-1" /> Back
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <a 
                            href={`tel:${booking.phone}`}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-full text-green-400 transition-colors"
                            data-testid={`call-booking-${booking.id}`}
                          >
                            <PhoneCall className="w-4 h-4" />
                            {booking.phone}
                          </a>
                          <a 
                            href={`mailto:${booking.email}`}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-full text-blue-400 transition-colors"
                            data-testid={`email-booking-${booking.id}`}
                          >
                            <MailPlus className="w-4 h-4" />
                            {booking.email}
                          </a>
                        </div>

                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <label className="text-xs text-white/50 flex items-center gap-1 mb-1">
                              <StickyNote className="w-3 h-3" /> Admin Notes
                            </label>
                            <Textarea
                              value={getNotesValue('booking', booking.id, booking.admin_notes)}
                              onChange={(e) => handleNotesChange('booking', booking.id, e.target.value)}
                              placeholder="Add private notes about this client..."
                              className="bg-white/5 border-white/10 text-sm h-16 resize-none"
                              onClick={(e) => e.stopPropagation()}
                              data-testid={`notes-booking-${booking.id}`}
                            />
                          </div>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateBookingNotes(booking.id, getNotesValue('booking', booking.id, booking.admin_notes));
                            }}
                            className="bg-mystic-purple hover:bg-mystic-purple/80"
                            data-testid={`save-notes-booking-${booking.id}`}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            ))}
            {bookings.length === 0 && (
              <Card className="glass p-12 rounded-2xl text-center">
                <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/50">No bookings found</p>
              </Card>
            )}
          </div>
        )}

        {/* Queries Tab */}
        {activeTab === 'queries' && (
          <div className="grid gap-4" data-testid="queries-list">
            {queries.map(query => (
              <div 
                key={query.id} 
                className={`flip-card h-52 ${flippedQueries[query.id] ? 'flipped' : ''}`}
              >
                <div className="flip-card-inner">
                  {/* Front of Card */}
                  <Card 
                    className="flip-card-front glass p-6 rounded-2xl cursor-pointer hover:border-mystic-purple/50 transition-colors h-full"
                    onClick={() => toggleQueryFlip(query.id)}
                    data-testid={`query-card-${query.id}`}
                  >
                    <div className="flex items-start justify-between h-full">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{query.subject}</h3>
                          <Badge className={getStatusBadge(query.status)}>
                            {query.status}
                          </Badge>
                        </div>
                        <p className="text-white/70 mb-3 line-clamp-2">{query.message}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-white/50">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" /> {query.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" /> {format(new Date(query.created_at), 'MMM d, yyyy HH:mm')}
                          </span>
                        </div>
                        <p className="text-xs text-white/30 mt-3">Click to view contact details</p>
                      </div>
                      <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={query.status}
                          onValueChange={(val) => updateQueryStatus(query.id, val)}
                        >
                          <SelectTrigger className="w-28 bg-white/5 border-white/10 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="replied">Replied</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteQuery(query.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          data-testid={`delete-query-${query.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Back of Card */}
                  <Card 
                    className="flip-card-back glass p-6 rounded-2xl h-full"
                    data-testid={`query-card-back-${query.id}`}
                  >
                    <div className="flex items-start justify-between h-full">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
                            <Users className="w-5 h-5 text-mystic-purple" />
                            Contact Details
                          </h3>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleQueryFlip(query.id)}
                            className="text-white/60 hover:text-white"
                            data-testid={`flip-back-query-${query.id}`}
                          >
                            <RotateCcw className="w-4 h-4 mr-1" /> Back
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {query.phone && (
                            <a 
                              href={`tel:${query.phone}`}
                              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-full text-green-400 transition-colors"
                              data-testid={`call-query-${query.id}`}
                            >
                              <PhoneCall className="w-4 h-4" />
                              {query.phone}
                            </a>
                          )}
                          <a 
                            href={`mailto:${query.email}?subject=Re: ${query.subject}`}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-full text-blue-400 transition-colors"
                            data-testid={`email-query-${query.id}`}
                          >
                            <MailPlus className="w-4 h-4" />
                            {query.email}
                          </a>
                        </div>

                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <label className="text-xs text-white/50 flex items-center gap-1 mb-1">
                              <StickyNote className="w-3 h-3" /> Admin Notes
                            </label>
                            <Textarea
                              value={getNotesValue('query', query.id, query.admin_notes)}
                              onChange={(e) => handleNotesChange('query', query.id, e.target.value)}
                              placeholder="Add private notes about this client..."
                              className="bg-white/5 border-white/10 text-sm h-16 resize-none"
                              onClick={(e) => e.stopPropagation()}
                              data-testid={`notes-query-${query.id}`}
                            />
                          </div>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQueryNotes(query.id, getNotesValue('query', query.id, query.admin_notes));
                            }}
                            className="bg-mystic-purple hover:bg-mystic-purple/80"
                            data-testid={`save-notes-query-${query.id}`}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            ))}
            {queries.length === 0 && (
              <Card className="glass p-12 rounded-2xl text-center">
                <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/50">No queries received yet</p>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
