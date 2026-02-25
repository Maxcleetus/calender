import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { createBooking, fetchMonthBookings } from './api/bookings.js';
import CalendarGrid from './components/CalendarGrid.jsx';
import BookingModal from './components/BookingModal.jsx';

export default function App() {
  const [month, setMonth] = useState(dayjs().startOf('month'));
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadBookings = async () => {
    try {
      setError('');
      const data = await fetchMonthBookings(month.year(), month.month() + 1);
      setBookings(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings.');
    }
  };

  useEffect(() => {
    loadBookings();
  }, [month]);

  const bookingsByDate = useMemo(() => {
    return bookings.reduce((acc, booking) => {
      if (!acc[booking.date]) acc[booking.date] = [];
      acc[booking.date].push(booking);
      return acc;
    }, {});
  }, [bookings]);

  const handleCreateBooking = async (payload) => {
    if (dayjs(payload.date).isBefore(dayjs().startOf('day'), 'day')) {
      setError('Booking is not allowed for previous dates.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await createBooking(payload);
      setSelectedDate(null);
      await loadBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="hero-bg" />
      <main className="container">
        <header className="top-bar">
          <div>
            <h1>St Antony Church Booking</h1>
            <p>Reserve a prayer or counseling slot with the parish priest.</p>
          </div>
          <div className="month-controls">
            <button type="button" onClick={() => setMonth((m) => m.subtract(1, 'month'))}>
              Prev
            </button>
            <h2>{month.format('MMMM YYYY')}</h2>
            <button type="button" onClick={() => setMonth((m) => m.add(1, 'month'))}>
              Next
            </button>
          </div>
        </header>

        {error ? <div className="error-banner">{error}</div> : null}

        <section className="flow-note">
          <strong>Step 1:</strong> Select a date from calendar.
          <br />
          <strong>Step 2:</strong> Booking form opens for that date.
          <div className="selected-date">
            {selectedDate ? `Selected date: ${selectedDate}` : 'No date selected yet.'}
          </div>
        </section>

        <CalendarGrid month={month} bookingsByDate={bookingsByDate} onSelectDate={setSelectedDate} />

        <div className="legend">
          <span className="legend-dot" />
          <span>Booked slots appear directly inside each calendar day.</span>
        </div>
      </main>

      {selectedDate ? (
        <BookingModal
          selectedDate={selectedDate}
          dayBookings={bookingsByDate[selectedDate] || []}
          onClose={() => setSelectedDate(null)}
          onSubmit={handleCreateBooking}
          loading={loading}
        />
      ) : null}
    </div>
  );
}
