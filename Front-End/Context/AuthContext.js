'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // começa true até verificar

  useEffect(() => {
  if (typeof window === 'undefined') return;

  const token = localStorage.getItem('token');
  console.log('Token encontrado:', token ? 'sim' : 'não'); 

  if (!token) {
    setLoading(false);
    return;
  }

  fetch('http://localhost:5000/api/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => {
      console.log('Status /me:', res.status); 
      if (!res.ok) {
        localStorage.removeItem('token');
        return null;
      }
      return res.json();
    })
    .then(data => {
      console.log('Dados do /me:', data); 
      setUser(data ?? null);
    })
    .catch((err) => {
      console.log('Erro /me:', err); 
      localStorage.removeItem('token');
      setUser(null);
    })
    .finally(() => setLoading(false));
}, []);


//LOGIN SECÇÃO
  const login = async (email, password) => {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao logar');

    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };


//LOGOUT SECÇÃO
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };


// DADOS DO USUARIO
  const profile = user ? {
    id:    user.id,
    nome:  user.nome  || user.email,
    email: user.email,
    role:  user.role  ,
  } : null;

  return (
    <AuthContext.Provider value={{ user: profile, rawUser: user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);