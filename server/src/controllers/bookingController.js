import dayjs from 'dayjs';
import { Booking } from '../models/Booking.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

const toDateTime = (date, time) => dayjs(`${date}T${time}:00`);

export const createBooking = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const mobileNumber = String(
      req.body.mobileNumber ?? req.body.phone ?? req.body.mobile ?? req.body['mobile number'] ?? ''
    ).trim();
    const intention = String(req.body.intention || '').trim();
    const program = String(req.body.program || '').trim();
    const date = String(req.body.date || '').trim();
    const startTime = String(req.body.startTime || '').trim();
    const endTime = String(req.body.endTime || '').trim();

    const missingFields = ['name', 'intention', 'program', 'date', 'startTime', 'endTime'].filter((field) => {
      const value = { name, intention, program, date, startTime, endTime }[field];
      return !value;
    });

    if (missingFields.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    if (!DATE_RE.test(date) || !TIME_RE.test(startTime) || !TIME_RE.test(endTime)) {
      return res.status(400).json({ message: 'Date or time format is invalid.' });
    }

    const normalizedStartTime = startTime.slice(0, 5);
    const normalizedEndTime = endTime.slice(0, 5);

    const start = toDateTime(date, normalizedStartTime);
    const end = toDateTime(date, normalizedEndTime);
    const bookingDay = dayjs(date).startOf('day');
    const today = dayjs().startOf('day');

    if (!start.isValid() || !end.isValid() || !end.isAfter(start)) {
      return res.status(400).json({ message: 'Invalid date or time range.' });
    }

    if (bookingDay.isBefore(today)) {
      return res.status(400).json({ message: 'Booking is not allowed for previous dates.' });
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
      mobileNumber,
      intention,
      program,
      date,
      startTime: normalizedStartTime,
      endTime: normalizedEndTime,
      startDateTime: start.toDate(),
      endDateTime: end.toDate(),
      status: 'pending'
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

    if (status && ['pending', 'confirmed', 'rejected'].includes(status)) {
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

    if (!['pending', 'confirmed', 'rejected'].includes(status)) {
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
