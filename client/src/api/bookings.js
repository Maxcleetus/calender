import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

export const fetchMonthBookings = async (year, month) => {
  const { data } = await api.get(`/bookings/${year}/${month}`);
  return data;
};

export const createBooking = async (payload) => {
  const { data } = await api.post('/bookings', payload);
  return data;
};
