import { useState } from 'react';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  intention: '',
  startTime: '09:00',
  endTime: '09:30'
};

export default function BookingModal({ selectedDate, dayBookings, onClose, onSubmit, loading }) {
  const [form, setForm] = useState(initialForm);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({ ...form, date: selectedDate });
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Book the Priest</h3>
          <button type="button" onClick={onClose} className="close-btn">
            X
          </button>
        </div>
        <p className="modal-date">Date: {selectedDate}</p>
        <div className="modal-bookings">
          <h4>Booked slots</h4>
          {dayBookings.length === 0 ? (
            <p className="no-slots">No bookings yet for this date.</p>
          ) : (
            <div className="modal-booking-list">
              {dayBookings.map((booking) => (
                <div key={booking._id} className={`modal-booking-pill ${booking.status}`}>
                  {booking.startTime} - {booking.endTime} {booking.name} ({booking.status})
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <input name="name" placeholder="Your full name" value={form.name} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required />
          <textarea
            name="intention"
            rows="3"
            placeholder="Prayer/visit intention"
            value={form.intention}
            onChange={handleChange}
          />

          <div className="time-row">
            <label>
              Start
              <input name="startTime" type="time" value={form.startTime} onChange={handleChange} required />
            </label>
            <label>
              End
              <input name="endTime" type="time" value={form.endTime} onChange={handleChange} required />
            </label>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Saving...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}
