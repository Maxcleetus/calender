import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

export const adminLogin = async (username, password) => {
  const { data } = await api.post('/admin/login', { username, password });
  return data;
};

export const fetchAdminBookings = async ({ token, year, month, status = '' }) => {
  const { data } = await api.get('/admin/bookings', {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params: {
      year,
      month,
      status
    }
  });
  return data;
};

export const updateBookingStatus = async ({ token, id, status }) => {
  const { data } = await api.patch(
    `/admin/bookings/${id}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return data;
};
