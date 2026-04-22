'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans]     = useState([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    fetch('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) { localStorage.removeItem('token'); return null; }
        return res.json();
      })
      .then(data => { setUser(data ?? null); setLoading(false); })
      .catch(() => { localStorage.removeItem('token'); setUser(null); setLoading(false); });
  }, []);

  const login = async (email, password) => {
    const res  = await fetch('http://localhost:5000/api/auth/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao logar');
    localStorage.setItem('token', data.token);
    const meRes  = await fetch('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${data.token}` },
    });
    const meData = await meRes.json();
    setUser(meData);
    return meData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setPlans([]);
  };

  const carregar = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/dashboard/', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Erro ao carregar plantas');
      const data = await res.json();
      const mapped = data.map(p => ({
        id:          p.id,
        title:       p.nome,
        description: p.descricao    ?? '',
        squareFeet:  p.dimensao     ?? 0,
        price:       p.orcamento    ?? 0,
        image:       p.imagens?.[0] ?? p.plantas_arquivo ?? null,
        category:    p.categoria    ?? '',
        bedrooms:    p.quartos      ?? 0,
        bathrooms:   p.banheiros    ?? 0,
        featured:    p.destaque     ?? false,
      }));
      setPlans(mapped);
      return mapped;
    } catch (err) {
      console.error('Erro ao carregar plantas:', err);
      return null;
    }
  };

  // ✅ Envia APENAS os 5 campos que o backend aceita
  const inserir = async ({ title, description, squareFeet, price, file }) => {
    const token = localStorage.getItem('token');
    if (!user?.id) throw new Error('Utilizador não autenticado');

    const formData = new FormData();
    formData.append('title',       title);
    formData.append('description', description ?? '');
    formData.append('squareFeet',  squareFeet  ?? '');
    formData.append('price',       price       ?? 0);
    formData.append('file',        file);
    // ❌ topology, bedrooms, bathrooms NÃO são enviados ao backend

    const res = await fetch(`http://localhost:5000/api/dashboard/${user.id}`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}` },
      body:    formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Erro ao inserir planta');
    }

    const data = await res.json();
    const nova  = data.data?.[0];
    if (nova) {
      setPlans(prev => [...prev, {
        id:          nova.id,
        title:       nova.nome,
        description: nova.descricao    ?? '',
        squareFeet:  nova.dimensao     ?? 0,
        price:       nova.orcamento    ?? 0,
        image:       nova.imagens?.[0] ?? nova.plantas_arquivo ?? null,
        category:    nova.categoria    ?? '',
        bedrooms:    nova.quartos      ?? 0,
        bathrooms:   nova.banheiros    ?? 0,
        featured:    false,
      }]);
    }
    return data;
  };

  const deletar = async (plantId) => {
    const token = localStorage.getItem('token');
    const res = await fetch(
      `http://localhost:5000/api/dashboard/DeletarPlanta/${plantId}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error('Erro ao deletar planta');
    setPlans(prev => prev.filter(p => p.id !== plantId));
    return res.json();
  };

  const profile = user
    ? { id: user.id, nome: user.nome || user.email, email: user.email, role: user.role }
    : null;

  return (
    <AuthContext.Provider value={{ user: profile, rawUser: user, loading, plans, login, logout, carregar, inserir, deletar }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);