import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  LayoutDashboard, Calendar, MessageSquare, BarChart3, LogOut, 
  CheckCircle, Clock, XCircle, Trash2, Eye, Star, RefreshCw,
  TrendingUp, Users, MessageCircle, Mail, Phone
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
      <aside className="admin-sidebar glass-dark border-r border-white/10 p-6 flex flex-col">
        <Link to="/" className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-full bg-purple-gradient flex items-center justify-center">
            <Star className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif text-lg font-semibold">Admin</span>
        </Link>

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
              }`}
              data-testid={`nav-${item.id}`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <Button
          onClick={handleLogout}
          variant="ghost"
          className="justify-start gap-3 text-white/60 hover:text-white hover:bg-white/5"
          data-testid="logout-btn"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
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
          <Card className="glass rounded-2xl overflow-hidden">
            <ScrollArea className="h-[calc(100vh-250px)]">
              <table className="w-full" data-testid="bookings-table">
                <thead className="bg-white/5 sticky top-0">
                  <tr>
                    <th className="text-left p-4 text-white/60 font-medium">Customer</th>
                    <th className="text-left p-4 text-white/60 font-medium">Service</th>
                    <th className="text-left p-4 text-white/60 font-medium">Date & Time</th>
                    <th className="text-left p-4 text-white/60 font-medium">Status</th>
                    <th className="text-left p-4 text-white/60 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id} className="border-t border-white/5 hover:bg-white/5">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{booking.name}</p>
                          <p className="text-sm text-white/60 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {booking.email}
                          </p>
                          <p className="text-sm text-white/60 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {booking.phone}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">{booking.service}</td>
                      <td className="p-4">
                        <p>{booking.date}</p>
                        <p className="text-sm text-white/60">{booking.time_slot}</p>
                      </td>
                      <td className="p-4">
                        <Select
                          value={booking.status}
                          onValueChange={(val) => updateBookingStatus(booking.id, val)}
                        >
                          <SelectTrigger className="w-32 bg-white/5 border-white/10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteBooking(booking.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          data-testid={`delete-booking-${booking.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-white/50">
                        No bookings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </ScrollArea>
          </Card>
        )}

        {/* Queries Tab */}
        {activeTab === 'queries' && (
          <div className="space-y-4" data-testid="queries-list">
            {queries.map(query => (
              <Card key={query.id} className="glass p-6 rounded-2xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{query.subject}</h3>
                      <Badge className={getStatusBadge(query.status)}>
                        {query.status}
                      </Badge>
                    </div>
                    <p className="text-white/70 mb-4">{query.message}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-white/50">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" /> {query.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" /> {query.email}
                      </span>
                      {query.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" /> {query.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {format(new Date(query.created_at), 'MMM d, yyyy HH:mm')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Select
                      value={query.status}
                      onValueChange={(val) => updateQueryStatus(query.id, val)}
                    >
                      <SelectTrigger className="w-28 bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="replied">Replied</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="icon"
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
