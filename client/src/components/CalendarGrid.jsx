import dayjs from 'dayjs';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const toDateKey = (dateObj) => dayjs(dateObj).format('YYYY-MM-DD');

export default function CalendarGrid({ month, bookingsByDate, onSelectDate }) {
  const firstDay = month.startOf('month');
  const start = firstDay.startOf('week');
  const today = dayjs().startOf('day');
  const days = Array.from({ length: 42 }, (_, index) => start.add(index, 'day'));

  return (
    <div className="calendar-wrap">
      <div className="weekday-row">
        {WEEK_DAYS.map((day) => (
          <div className="weekday-cell" key={day}>
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((day) => {
          const dayKey = toDateKey(day);
          const dayBookings = bookingsByDate[dayKey] || [];
          const isOutsideMonth = day.month() !== month.month();
          const isPastDay = day.isBefore(today, 'day');
          const isDisabled = isOutsideMonth || isPastDay;

          return (
            <button
              key={dayKey}
              type="button"
              className={`day-card ${isOutsideMonth ? 'outside' : ''}`}
              onClick={() => !isDisabled && onSelectDate(dayKey)}
              disabled={isDisabled}
            >
              <div className="day-top">
                <span className="day-number">{day.date()}</span>
                {dayBookings.length > 0 ? (
                  <span className="booking-count">
                    <span className="count-value">{dayBookings.length}</span>
                    <span className="count-label"> entries</span>
                  </span>
                ) : null}
              </div>

              <div className="booking-list">
                {dayBookings.slice(0, 3).map((booking) => (
                  <div key={booking._id} className={`booking-pill ${booking.status}`}>
                    <span className="pill-time">
                      {booking.startTime}-{booking.endTime}
                    </span>
                    <span className="pill-name">{booking.name}</span>
                    <strong>{booking.status}</strong>
                  </div>
                ))}
                {dayBookings.length > 3 ? <div className="more-bookings">+{dayBookings.length - 3} more</div> : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
