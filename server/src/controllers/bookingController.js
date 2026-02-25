import dayjs from 'dayjs';
import { Booking } from '../models/Booking.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

const toDateTime = (date, time) => dayjs(`${date}T${time}:00`);

export const createBooking = async (req, res) => {
  try {
    const { name, email, phone, intention = '', date, startTime, endTime } = req.body;

    if (!name || !email || !phone || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }

    if (!DATE_RE.test(date) || !TIME_RE.test(startTime) || !TIME_RE.test(endTime)) {
      return res.status(400).json({ message: 'Date or time format is invalid.' });
    }

    const start = toDateTime(date, startTime);
    const end = toDateTime(date, endTime);

    if (!start.isValid() || !end.isValid() || !end.isAfter(start)) {
      return res.status(400).json({ message: 'Invalid date or time range.' });
    }

    const conflict = await Booking.findOne({
      date,
      status: 'confirmed',
      startDateTime: { $lt: end.toDate() },
      endDateTime: { $gt: start.toDate() }
    });

    if (conflict) {
      return res.status(409).json({ message: 'This time slot is already booked.' });
    }

    const booking = await Booking.create({
      name,
      email,
      phone,
      intention,
      date,
      startTime,
      endTime,
      startDateTime: start.toDate(),
      endDateTime: end.toDate(),
      status: 'confirmed'
    });

    return res.status(201).json(booking);
  } catch (error) {
    return res.status(500).json({ message: 'Server error creating booking.' });
  }
};

export const getMonthBookings = async (req, res) => {
  try {
    const { year, month } = req.params;
    const parsedYear = Number(year);
    const parsedMonth = Number(month);

    if (!parsedYear || parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).json({ message: 'Invalid year or month.' });
    }

    const start = dayjs(`${parsedYear}-${String(parsedMonth).padStart(2, '0')}-01`).startOf('month');
    const end = start.endOf('month');

    const bookings = await Booking.find({
      startDateTime: { $gte: start.toDate(), $lte: end.toDate() }
    }).sort({ startDateTime: 1 });

    return res.json(bookings);
  } catch (error) {
    return res.status(500).json({ message: 'Server error loading bookings.' });
  }
};

export const getAdminBookings = async (req, res) => {
  try {
    const { year, month, status } = req.query;

    const query = {};

    if (year && month) {
      const start = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).startOf('month');
      const end = start.endOf('month');
      query.startDateTime = { $gte: start.toDate(), $lte: end.toDate() };
    }

    if (status && ['confirmed', 'cancelled'].includes(status)) {
      query.status = status;
    }

    const bookings = await Booking.find(query).sort({ startDateTime: 1 });
    return res.json(bookings);
  } catch (error) {
    return res.status(500).json({ message: 'Server error loading admin bookings.' });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (status === 'confirmed') {
      const conflict = await Booking.findOne({
        _id: { $ne: id },
        date: booking.date,
        status: 'confirmed',
        startDateTime: { $lt: booking.endDateTime },
        endDateTime: { $gt: booking.startDateTime }
      });

      if (conflict) {
        return res.status(409).json({ message: 'Cannot confirm due to overlapping booking.' });
      }
    }

    booking.status = status;
    await booking.save();

    return res.json(booking);
  } catch (error) {
    return res.status(500).json({ message: 'Server error updating booking.' });
  }
};
