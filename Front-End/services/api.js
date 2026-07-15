import axios from 'axios';
import { supabase } from './supabase';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/api',
});



api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  fetch('http://127.0.0.1:5000/api/dashboard/stats', {
  headers: {
    Authorization: `Bearer ${session.access_token}`  
  }
})
 
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
