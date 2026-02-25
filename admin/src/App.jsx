import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import AdminCalendar from './components/AdminCalendar.jsx';
import { adminLogin, fetchAdminBookings, updateBookingStatus } from './api/adminApi.js';

const TOKEN_KEY = 'priest_admin_token';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || '');
  const [month, setMonth] = useState(dayjs().startOf('month'));
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');

  const loadBookings = async (activeToken) => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchAdminBookings({
        token: activeToken,
        year: month.year(),
        month: month.month() + 1,
        status: statusFilter
      });
      setBookings(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings.');
      if (err.response?.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        setToken('');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadBookings(token);
    }
  }, [token, month, statusFilter]);

  const bookingsByDate = useMemo(() => {
    return bookings.reduce((acc, b) => {
      if (!acc[b.date]) acc[b.date] = [];
      acc[b.date].push(b);
      return acc;
    }, {});
  }, [bookings]);

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      setError('');
      const data = await adminLogin(username, password);
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateBookingStatus({ token, id, status });
      await loadBookings(token);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update booking.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken('');
    setBookings([]);
  };

  if (!token) {
    return (
      <div className="auth-page">
        <form className="auth-card" onSubmit={handleLogin}>
          <h1>Church Admin</h1>
          <p>Sign in to manage priest appointments.</p>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            required
          />
          {error ? <div className="error">{error}</div> : null}
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-head">
        <div>
          <h1>Priest Booking Admin</h1>
          <p>Review and manage all church appointment bookings.</p>
        </div>
        <div className="head-actions">
          <button type="button" onClick={() => setMonth((m) => m.subtract(1, 'month'))}>
            Prev
          </button>
          <strong>{month.format('MMMM YYYY')}</strong>
          <button type="button" onClick={() => setMonth((m) => m.add(1, 'month'))}>
            Next
          </button>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button type="button" className="logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {error ? <div className="error">{error}</div> : null}
      {loading ? <p className="loading">Loading bookings...</p> : null}

      <AdminCalendar month={month} bookingsByDate={bookingsByDate} />

      <section className="table-card">
        <h2>Bookings</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{booking.date}</td>
                  <td>
                    {booking.startTime} - {booking.endTime}
                  </td>
                  <td>{booking.name}</td>
                  <td>
                    {booking.email}
                    <br />
                    {booking.phone}
                  </td>
                  <td className="description-cell">{booking.intention?.trim() ? booking.intention : '-'}</td>
                  <td>
                    <span className={`badge ${booking.status}`}>{booking.status}</span>
                  </td>
                  <td className="actions-cell">
                    <button type="button" onClick={() => handleStatusUpdate(booking._id, 'confirmed')}>
                      Confirm
                    </button>
                    <button type="button" onClick={() => handleStatusUpdate(booking._id, 'cancelled')}>
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
