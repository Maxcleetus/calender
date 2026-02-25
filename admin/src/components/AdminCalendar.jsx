import dayjs from 'dayjs';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AdminCalendar({ month, bookingsByDate }) {
  const start = month.startOf('month').startOf('week');
  const days = Array.from({ length: 42 }, (_, idx) => start.add(idx, 'day'));

  return (
    <section className="calendar-card">
      <div className="weekday-row">
        {WEEK_DAYS.map((item) => (
          <div key={item}>{item}</div>
        ))}
      </div>
      <div className="calendar-grid">
        {days.map((day) => {
          const key = day.format('YYYY-MM-DD');
          const items = bookingsByDate[key] || [];

          return (
            <div className={`day-cell ${day.month() !== month.month() ? 'out' : ''}`} key={key}>
              <div className="day-head">
                <strong>{day.date()}</strong>
                {items.length ? <span>{items.length}</span> : null}
              </div>
              <div className="status-list">
                {items.slice(0, 3).map((b) => (
                  <div key={b._id} className={`status-item ${b.status}`}>
                    {b.startTime} {b.name}
                  </div>
                ))}
                {items.length > 3 ? <small>+{items.length - 3} more</small> : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
