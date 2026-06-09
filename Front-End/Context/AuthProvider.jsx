'use client';
import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);

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
  const SuspenderUser = async(user_id) => {
    try{
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/suspend/${user_id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Erro ao suspender usuário:', err);
      return null;
    }
  }

  const BanUser = async(user_id) => {
    try{
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/ban/${user_id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Erro ao Banir usuário:', err);
      return null;
    }
  }

  const CarregarUsuarios = async () => 
  {
    try{
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/users',
      {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      }  
    );
    if (!response.ok) throw new Error('Erro ao carregar usuários');
    const data = await response.json();
    const mapped =data.map(u => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      tipo: u.tipo,
      estado: u.estado,
      //avatar:u.foto_pessoal,--Tem q estar a receber algo de genero Petel
    }))

    return mapped;
    } 
    catch (err) {
      console.error('Erro ao carregar usuários:', err);
      return null;
    }

  }

const GerenciarPlantas = async () =>
{
   try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/dashboard/manage', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Erro ao buscar dados das plantas');
      const data = await res.json();
      return data
    }
  catch (err) {
      console.error('Erro ao buscar dados das plantas:', err);
      return null;
    }
}
const LoadAdmingeral =async () =>
{
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/admin/', {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Erro ao carregar  dados gerais do admin');
    const data = await res.json();
    return data
  }
  catch (err) {
      console.error('Erro ao carregar  dados gerais do admin:', err);
      return null;
    }
}

const MinhasPlantas = async () =>{
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/dashboard/myplants', {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Erro ao buscar dados das plantas');
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
        dono:        p.dono,        

      }));

    return mapped;
  } catch (err) {
    console.error('Erro ao buscar dados das plantas:', err);
    return null;
  }
}

const solicitarSaque = async (valor) => { 

  try {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/payments/solicitar-saque', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ valor })
    });
    if (!res.ok) {

      const err = await res.json()
      console.log("Erro:", err.detail)  
      throw new Error('Erro ao solicitar saque');
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Erro ao solicitar saque:', err);
    return null;
  }
}
const CarregarSaques = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/admin/withdrawals', {
      headers: { 
        Authorization: `Bearer ${token}`, 
        'Content-Type': 'application/json' 
      },
    });

    if (!res.ok) throw new Error('Erro ao carregar saques');

    const data = await res.json();

    const mapped = data.map(s => ({
    id: s.id,
    Arquiteto_nome: s.architectName,
    Arquiteto_avatar: s.architectAvatar ?? "",
    iban: s.iban,
    Quantidade: s.amount,
    requestDate: s.requestDate,
    estado: s.status === "Paid" ? "Pago" : "Pendente",
    ComprovanteUrl: s.proofUrl ?? undefined,
  }));

  return mapped;

  } catch (err) {
    console.error('Erro ao carregar saques:', err);
    return null;
  }
};

const PagarSaque = async (withdrawal_id, file) => {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('comprovativo', file);

    const res = await fetch(`http://localhost:5000/api/admin/withdrawals/${withdrawal_id}/pagar`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) throw new Error('Erro ao marcar como pago');
    return await res.json();
  } catch (err) {
    console.error('Erro ao marcar como pago:', err);
    return null;
  }
};

  const register = async (formData, tipo) => {
    const endpoint = `http://localhost:5000/api/auth/register/${tipo}`;
    const res  = await fetch(endpoint, { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Erro ao criar conta');
    return data;
  };

  const carregarDenuncias = async () => {
    try{
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/denuncias',
      {
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
      });
      if (!response.ok) throw new Error('Erro ao carregar denuncias');
      const data = await response.json();
      return data;
    }
    catch (err) {
      console.error('Erro ao carregar denuncias:', err);
      return null;
    }
  }

  const carregarhistorico = async () => {

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/dashboard/historico', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Erro ao carregar histórico de compras');
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Erro ao carregar histórico de compras:', err);
      return null;
    }
  }

  const BtnDonwloadPlant = async (plantId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/dashboard/${plantId}/donwload`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Erro ao obter links de download');
      const data = await res.json();
      
      data.download_urls.forEach((file) => {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.filename;
      link.target = '_blank';
      link.click();
    });

      return data;

      
    } catch (err) {
      console.error('Erro ao obter links de download:', err);
      return null;
    }
  }
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
        dono:        p.dono,
      }));
      setPlans(mapped);
      return mapped;
    } catch (err) {
      console.error('Erro ao carregar plantas:', err);
      return null;
    }
  };

  const inserir = async ({ title, description, topology, category, squareFeet, bedrooms, bathrooms, price, files, imageFiles }) => {
    const token = localStorage.getItem('token');
    if (!user?.id) throw new Error('Utilizador não autenticado');
    const formData = new FormData();
    formData.append('title',       title);
    formData.append('description', description ?? '');
    formData.append('topology',    topology    ?? '');
    formData.append('category',    category    ?? '');
    formData.append('squareFeet',  squareFeet  ?? '');
    formData.append('bedrooms',    bedrooms    ?? 0);
    formData.append('bathrooms',   bathrooms   ?? 0);
    formData.append('price',       price       ?? 0);
    files.forEach(f      => formData.append('projectFiles', f));
    imageFiles.forEach(f => formData.append('imageFiles',   f));
    const res = await fetch(`http://localhost:5000/api/dashboard/${user.id}`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData,
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.detail || 'Erro ao inserir planta'); }
    const data = await res.json();
    const nova = data.data?.[0];
    if (nova) {
      setPlans(prev => [...prev, {
        id: nova.id, title: nova.nome, description: nova.descricao ?? '',
        squareFeet: nova.dimensao ?? 0, price: nova.orcamento ?? 0,
        image: nova.imagens?.[0] ?? nova.plantas_arquivo ?? null,
        category: nova.categoria ?? '', bedrooms: nova.quartos ?? 0,
        bathrooms: nova.banheiros ?? 0, featured: false,
      }]);
    }
    return data;
  };

  const deletar = async (plantId) => {
    const token = localStorage.getItem('token');
const res = await fetch(`http://localhost:5000/api/dashboard/DeletarPlanta/${plantId}`, {
  method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
});
    if (!res.ok) throw new Error('Erro ao deletar planta');
    setPlans(prev => prev.filter(p => p.id !== plantId));
    return res.json();
  };

  const profile = user
    ? { id: user.id, nome: user.nome || user.email, email: user.email, role: user.role }
    : null;

  return (
      <AuthContext.Provider value={{ user: profile, rawUser: user, loading, plans, login, logout, carregar, inserir, deletar, CarregarUsuarios, SuspenderUser, BanUser, GerenciarPlantas, MinhasPlantas, solicitarSaque, LoadAdmingeral, CarregarSaques, PagarSaque , carregarDenuncias , carregarhistorico , BtnDonwloadPlant}}>
      {children}
    </AuthContext.Provider>
  );
}