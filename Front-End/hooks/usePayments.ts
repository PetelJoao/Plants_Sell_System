// hooks/usePayments.ts
// Hook centralizado para todo o sistema de pagamento

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type StatusCompra = "pendente" | "pago" | "solicitado" | "transferido" | "cancelado";

export interface Compra {
  id: string;
  planta_id: string;
  cliente_id: string;
  arquiteto_id: string;
  valor: number;
  status: StatusCompra;
  stripe_session_id: string;
  stripe_payment_intent_id?: string;
  notas?: string;
  created_at: string;
  planta?: { nome: string; orcamento: number; imagens: string[] };
  cliente?: { nome: string; email: string };
  arquiteto?: { nome: string; email: string };
}

// ── Helper para buscar token JWT ──
function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || "";
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Erro desconhecido");
  }
  return res.json();
}

// ════════════════════════════════════════════════════════
// useCheckout — cliente inicia compra
// ════════════════════════════════════════════════════════
export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const iniciarCompra = async (params: {
    planta_id: string;
    arquiteto_id: string;
    nome_planta: string;
    preco: number;
    imagem_url?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/api/payments/create-checkout-session", {
        method: "POST",
        body: JSON.stringify(params),
      });
      // Redirecionar para o Stripe Checkout
      window.location.href = data.checkout_url;
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return { iniciarCompra, loading, error };
}

// ════════════════════════════════════════════════════════
// useVerificarSessao — página de sucesso
// ════════════════════════════════════════════════════════
export function useVerificarSessao() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ stripe_status: string; compra: Compra } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verificar = async (session_id: string) => {
    setLoading(true);
    try {
      const result = await apiFetch(`/api/payments/verificar-sessao/${session_id}`);
      setData(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return { verificar, data, loading, error };
}

// ════════════════════════════════════════════════════════
// useArquitetoPayments — arquiteto gere as suas compras
// ════════════════════════════════════════════════════════
export function useArquitetoPayments() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregar = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/payments/minhas-compras");
      setCompras(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const solicitarTransferencia = async (compra_id: string) => {
    try {
      await apiFetch("/api/payments/solicitar-transferencia", {
        method: "POST",
        body: JSON.stringify({ compra_id }),
      });
      // Atualizar lista local
      setCompras((prev) =>
        prev.map((c) => (c.id === compra_id ? { ...c, status: "solicitado" } : c))
      );
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  return { compras, loading, error, carregar, solicitarTransferencia };
}

// ════════════════════════════════════════════════════════
// useAdminPayments — admin gere todas as compras
// ════════════════════════════════════════════════════════
export function useAdminPayments() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregar = async (status?: StatusCompra) => {
    setLoading(true);
    try {
      const query = status ? `?status=${status}` : "";
      const data = await apiFetch(`/api/payments/compras${query}`);
      setCompras(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const aprovarTransferencia = async (compra_id: string) => {
    try {
      await apiFetch("/api/payments/aprovar-transferencia", {
        method: "POST",
        body: JSON.stringify({ compra_id }),
      });
      setCompras((prev) =>
        prev.map((c) => (c.id === compra_id ? { ...c, status: "transferido" } : c))
      );
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  return { compras, loading, error, carregar, aprovarTransferencia };
}
