"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { AuthContext } from "./AuthContext";
import { DataContext } from "./DataContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ────────────────────────────────────────────────────────────
// Helper único para todos os fetches autenticados.
// Antes cada função tinha "http://localhost:5000" hardcoded —
// isso quebra em produção. Agora tudo passa por aqui e usa a
// variável de ambiente API.
// ────────────────────────────────────────────────────────────
function authFetch(path, options = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const isFormData = options.body instanceof FormData;

  return fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
}
function mapPlanta(p) {
  return {
    id: p.id,
    title: p.nome,
    description: p.descricao ?? "",
    squareFeet: p.dimensao ?? 0,
    price: p.orcamento ?? 0,
    image: p.imagens?.[0] ?? p.plantas_arquivo ?? null,
    category: p.categoria ?? "",
    featured: p.destaque ?? false,
    dono: p.dono,
    
    bedrooms: p.especificacoes?.bedrooms ?? 0,
    bathrooms: p.especificacoes?.bathrooms ?? 0,
    topology: p.especificacoes?.topology ?? "",
  };
}

export function AuthProvider({ children }) {
  // ── Estado de autenticação ──
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // ── Estado de dados (plantas) ──
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    authFetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          localStorage.removeItem("token");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        setUser(data ?? null);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
        setLoading(false);
      });
  }, []);

  // ════════════════════════════════════════════════════════
  // AUTH — login, logout, registo, recuperação de senha
  // ════════════════════════════════════════════════════════

  const login = useCallback(async (email, password) => {
    const res = await authFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro ao logar");
    localStorage.setItem("token", data.token);

    const meRes = await authFetch("/api/auth/me");
    const meData = await meRes.json();
    setUser(meData);
    return meData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setPlans([]);
  }, []);

  const register = useCallback(async (formData, tipo) => {
    const res = await fetch(`${API}/api/auth/register/${tipo}`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Erro ao criar conta");
    return data;
  }, []);

  const forgotPassword = useCallback(async (email) => {
    const res = await fetch(`${API}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Erro ao enviar e-mail");
    return data.message;
  }, []);

  const resetPassword = useCallback(async (newPassword) => {
    const res = await authFetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ new_password: newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Erro ao redefinir senha");
    return data.message;
  }, []);

  // ════════════════════════════════════════════════════════
  // DASHBOARD — plantas do utilizador
  // ════════════════════════════════════════════════════════

  const carregar = useCallback(async () => {
    try {
      const res = await authFetch("/api/dashboard/");
      if (!res.ok) throw new Error("Erro ao carregar plantas");
      const data = await res.json();
      const mapped = data.map(mapPlanta);
      setPlans(mapped);
      return mapped;
    } catch (err) {
      console.error("Erro ao carregar plantas:", err);
      return null;
    }
  }, []);

  const MinhasPlantas = useCallback(async () => {
    try {
      const res = await authFetch("/api/dashboard/myplants");
      if (!res.ok) throw new Error("Erro ao buscar dados das plantas");
      const data = await res.json();
      return data.map(mapPlanta);
    } catch (err) {
      console.error("Erro ao buscar dados das plantas:", err);
      return null;
    }
  }, []);

const inserir = useCallback(
    async ({
      title,
      description,
      topology,
      category,
      squareFeet,
      bedrooms,
      bathrooms,
      price,
      files,
      imageFiles,
    }) => {
      if (!user?.id) throw new Error("Utilizador não autenticado");
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description ?? "");
      formData.append("category", category ?? "");
      formData.append("squareFeet", squareFeet ?? "");
      formData.append("price", price ?? 0);

      const specifications = {
        topology: topology ?? "",
        bedrooms: Number(bedrooms ?? 0),
        bathrooms: Number(bathrooms ?? 0),
      };
      formData.append("specifications", JSON.stringify(specifications));

      files.forEach((f) => formData.append("projectFiles", f));
      imageFiles.forEach((f) => formData.append("imageFiles", f));

      const res = await authFetch(`/api/dashboard/${user.id}`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Erro ao inserir planta");
      }
      const data = await res.json();
      const nova = data.data?.[0];
      if (nova) {
        setPlans((prev) => [...prev, mapPlanta(nova)]);
      }
      return data;
    },
    [user?.id, mapPlanta] 
  );

  const EditPlant = useCallback(
    async (
      id,
      {
        title,
        description,
        topology,
        category,
        squareFeet,
        bedrooms,
        bathrooms,
        price,
        files = [],
        imageFiles = [],
      }
    ) => {
      if (!user?.id) throw new Error("Utilizador não autenticado");
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description ?? "");
      formData.append("category", category ?? "");
      formData.append("squareFeet", squareFeet ?? "");
      formData.append("price", price ?? 0);

      const specifications = {
        topology: topology ?? "",
        bedrooms: Number(bedrooms ?? 0),
        bathrooms: Number(bathrooms ?? 0),
      };
      formData.append("specifications", JSON.stringify(specifications));

      files.forEach((f) => formData.append("projectFiles", f));
      imageFiles.forEach((f) => formData.append("imageFiles", f));

      const res = await authFetch(`/api/dashboard/EditPlant/${id}`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Erro ao Alterar planta");
      }
      const data = await res.json();
      const nova = data.data?.[0];

      if (nova) {
        setPlans((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, ...mapPlanta(nova), id: Number(nova.id) } : p
          )
        );
      } else {
        console.warn("[EditPlant] API respondeu 200 mas data.data está vazio:", data);
      }
      return data;
    },
    [user?.id, mapPlanta]
  );


  const deletar = useCallback(async (plantId) => {
    const res = await authFetch(`/api/dashboard/${plantId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Erro ao deletar planta");
    setPlans((prev) => prev.filter((p) => p.id !== plantId));
    return res.json();
  }, []);

  const BtnDonwloadPlant = useCallback(async (plantId) => {
    try {
      const res = await authFetch(`/api/dashboard/${plantId}/donwload`);
      if (!res.ok) throw new Error("Erro ao obter links de download");
      const data = await res.json();

      for (const file of data.download_urls) {
        const fileRes = await fetch(file.url);
        const blob = await fileRes.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = file.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(blobUrl);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      return data;
    } catch (err) {
      console.error("Erro ao obter links de download:", err);
      return null;
    }
  }, []);

  const carregarhistorico = useCallback(async () => {
    try {
      const res = await authFetch("/api/dashboard/historico");
      if (!res.ok) throw new Error("Erro ao carregar histórico de compras");
      return await res.json();
    } catch (err) {
      console.error("Erro ao carregar histórico de compras:", err);
      return null;
    }
  }, []);

  const SendReport = useCallback(async (report) => {
    try {
      const res = await authFetch("/api/dashboard/sendreport", {
        method: "POST",
        body: JSON.stringify(report),
      });
      const data = await res.json();
      if (!res.ok) return { erro: data.message || "Erro ao enviar denúncia" };
      return data;
    } catch (err) {
      return { erro: "Erro de ligação" };
    }
  }, []);

  // ════════════════════════════════════════════════════════
  // ADMIN
  // ════════════════════════════════════════════════════════

  const SuspenderUser = useCallback(async (user_id) => {
    try {
      const res = await authFetch(`/api/admin/users/suspend/${user_id}`, {
        method: "PUT",
      });
      return await res.json();
    } catch (err) {
      console.error("Erro ao suspender usuário:", err);
      return null;
    }
  }, []);

  const BanUser = useCallback(async (user_id) => {
    try {
      const res = await authFetch(`/api/admin/users/ban/${user_id}`, {
        method: "PUT",
      });
      return await res.json();
    } catch (err) {
      console.error("Erro ao Banir usuário:", err);
      return null;
    }
  }, []);

  const CarregarUsuarios = useCallback(async () => {
    try {
      const res = await authFetch("/api/admin/users");
      if (!res.ok) throw new Error("Erro ao carregar usuários");
      const data = await res.json();
      return data.map((u) => ({
        id: u.id,
        nome: u.nome,
        email: u.email,
        tipo: u.tipo,
        estado: u.estado,
      }));
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
      return null;
    }
  }, []);

  const GerenciarPlantas = useCallback(async () => {
    try {
      const res = await authFetch("/api/dashboard/manage");
      if (!res.ok) throw new Error("Erro ao buscar dados das plantas");
      return await res.json();
    } catch (err) {
      console.error("Erro ao buscar dados das plantas:", err);
      return null;
    }
  }, []);

  const LoadAdmingeral = useCallback(async () => {
    try {
      const res = await authFetch("/api/admin/");
      if (!res.ok) throw new Error("Erro ao carregar dados gerais do admin");
      return await res.json();
    } catch (err) {
      console.error("Erro ao carregar dados gerais do admin:", err);
      return null;
    }
  }, []);

  const carregarDenuncias = useCallback(async () => {
    try {
      const res = await authFetch("/api/admin/denuncias");
      if (!res.ok) throw new Error("Erro ao carregar denuncias");
      return await res.json();
    } catch (err) {
      console.error("Erro ao carregar denuncias:", err);
      return null;
    }
  }, []);

  // ════════════════════════════════════════════════════════
  // PAGAMENTOS / SAQUES
  // ════════════════════════════════════════════════════════

  const solicitarSaque = useCallback(async (valor) => {
    try {
      const res = await authFetch("/api/payments/solicitar-saque", {
        method: "PUT",
        body: JSON.stringify({ valor }),
      });
      if (!res.ok) {
        const err = await res.json();
        console.log("Erro:", err.detail);
        throw new Error("Erro ao solicitar saque");
      }
      return await res.json();
    } catch (err) {
      console.error("Erro ao solicitar saque:", err);
      return null;
    }
  }, []);

  const CarregarSaques = useCallback(async () => {
    try {
      const res = await authFetch("/api/admin/withdrawals");
      if (!res.ok) throw new Error("Erro ao carregar saques");
      const data = await res.json();
      return data.map((s) => ({
        id: s.id,
        Arquiteto_nome: s.architectName,
        Arquiteto_avatar: s.architectAvatar ?? "",
        iban: s.iban,
        Quantidade: s.amount,
        requestDate: s.requestDate,
        estado: s.status === "Paid" ? "Pago" : "Pendente",
        ComprovanteUrl: s.proofUrl ?? undefined,
      }));
    } catch (err) {
      console.error("Erro ao carregar saques:", err);
      return null;
    }
  }, []);

  const PagarSaque = useCallback(async (withdrawal_id, file) => {
    try {
      const formData = new FormData();
      formData.append("comprovativo", file);
      const res = await authFetch(`/api/admin/withdrawals/${withdrawal_id}/pagar`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) throw new Error("Erro ao marcar como pago");
      return await res.json();
    } catch (err) {
      console.error("Erro ao marcar como pago:", err);
      return null;
    }
  }, []);

  // ════════════════════════════════════════════════════════
  // EVENTOS
  // ════════════════════════════════════════════════════════

  const CarregarEventos = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("CarregarEventos: sem token, abortando.");
        return null;
      }
      const res = await authFetch("/api/eventos/meus");
      if (!res.ok) throw new Error("Erro ao carregar eventos");
      return await res.json();
    } catch (err) {
      console.error("Erro ao carregar eventos:", err);
      return null;
    }
  }, []);

  const CriarEvento = useCallback(async ({ descricao, data_inicio, data_fim }) => {
    try {
      const res = await authFetch("/api/eventos/", {
        method: "POST",
        body: JSON.stringify({
          descricao,
          data_inicio: data_inicio || null,
          data_fim: data_fim || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Erro ao criar evento.");
      return data;
    } catch (err) {
      console.error("Erro ao criar evento:", err);
      throw err;
    }
  }, []);

  const CarregarEventoDetalhe = useCallback(async (eventoId) => {
    try {
      const res = await authFetch(`/api/eventos/${eventoId}`);
      if (!res.ok) throw new Error("Erro ao carregar evento");
      return await res.json();
    } catch (err) {
      console.error("Erro ao carregar evento:", err);
      return null;
    }
  }, []);

  const CarregarInscricoes = useCallback(async (eventoId) => {
    try {
      const res = await authFetch(`/api/eventos/${eventoId}/inscricoes`);
      if (!res.ok) throw new Error("Erro ao carregar inscrições");
      return await res.json();
    } catch (err) {
      console.error("Erro ao carregar inscrições:", err);
      return null;
    }
  }, []);

  const DecidirInscricao = useCallback(async (inscricaoId, decisao) => {
    try {
      const res = await authFetch(`/api/eventos/inscricao/${inscricaoId}/decisao`, {
        method: "PUT",
        body: JSON.stringify({ estado: decisao }),
      });
      if (!res.ok) throw new Error("Erro ao decidir inscrição");
      return await res.json();
    } catch (err) {
      console.error("Erro ao decidir inscrição:", err);
      throw err;
    }
  }, []);

  const CarregarEventosDisponiveis = useCallback(async () => {
    try {
      const res = await authFetch("/api/eventos/disponiveis");
      if (!res.ok) throw new Error("Erro ao carregar eventos");
      return await res.json();
    } catch (err) {
      console.error("Erro ao carregar eventos disponíveis:", err);
      return null;
    }
  }, []);

  const CarregarMinhasInscricoes = useCallback(async () => {
    try {
      const res = await authFetch("/api/eventos/arquiteto/inscricoes");
      if (!res.ok) throw new Error("Erro ao carregar inscrições");
      return await res.json();
    } catch (err) {
      console.error("Erro ao carregar inscrições:", err);
      return null;
    }
  }, []);

  const InscreverEvento = useCallback(async (idevento) => {
    try {
      const res = await authFetch("/api/eventos/inscricao", {
        method: "POST",
        body: JSON.stringify({ idevento }),
      });
      const data = await res.json();
      if (!res.ok) return { erro: data.message || "Erro ao inscrever" };
      return data;
    } catch (e) {
      return { erro: "Erro de ligação" };
    }
  }, []);

  const EnviarProposta = useCallback(async ({ id_inscricao, valor, prazo_dias, mensagem }) => {
    try {
      const res = await authFetch("/api/eventos/proposta", {
        method: "POST",
        body: JSON.stringify({ id_inscricao, valor, prazo_dias, mensagem }),
      });
      const data = await res.json();
      if (!res.ok) return { erro: data.detail || "Erro ao enviar proposta" };
      return data;
    } catch (err) {
      return { erro: "Erro de ligação" };
    }
  }, []);

  // ════════════════════════════════════════════════════════
  // CARRINHO
  // ════════════════════════════════════════════════════════

  const AdicionarAoCarrinho = useCallback(async (planta_id) => {
    try {
      const res = await authFetch("/api/carrinho/adicionar", {
        method: "POST",
        body: JSON.stringify({ planta_id }),
      });
      const data = await res.json();
      if (!res.ok) return { erro: data.detail || "Erro ao adicionar ao carrinho" };
      return data;
    } catch (err) {
      return { erro: "Erro de ligação" };
    }
  }, []);

  const RemoverDoCarrinho = useCallback(async (planta_id) => {
    try {
      const res = await authFetch(`/api/carrinho/remover/${planta_id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) return { erro: data.detail || "Erro ao remover do carrinho" };
      return data;
    } catch (err) {
      return { erro: "Erro de ligação" };
    }
  }, []);

  const ListarCarrinho = useCallback(async () => {
    try {
      const res = await authFetch("/api/carrinho/");
      if (!res.ok) throw new Error("Erro ao listar carrinho");
      return await res.json();
    } catch (err) {
      console.error("Erro ao listar carrinho:", err);
      return null;
    }
  }, []);

  const LimparCarrinho = useCallback(async () => {
    try {
      const res = await authFetch("/api/carrinho/limpar", {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) return { erro: data.detail || "Erro ao limpar carrinho" };
      return data;
    } catch (err) {
      return { erro: "Erro de ligação" };
    }
  }, []);

  const ComprarItem = useCallback(async (planta_id, success_url = "", cancel_url = "") => {
    try {
      const res = await authFetch("/api/carrinho/comprar-item", {
        method: "POST",
        body: JSON.stringify({ planta_id, success_url, cancel_url }),
      });
      const data = await res.json();
      if (!res.ok) return { erro: data.detail || "Erro ao iniciar compra" };
      return data;
    } catch (err) {
      return { erro: "Erro de ligação" };
    }
  }, []);

  const ComprarTudo = useCallback(async (success_url = "", cancel_url = "") => {
    try {
      const res = await authFetch("/api/carrinho/comprar-tudo", {
        method: "POST",
        body: JSON.stringify({ success_url, cancel_url }),
      });
      const data = await res.json();
      if (!res.ok) return { erro: data.detail || "Erro ao iniciar compras" };
      return data;
    } catch (err) {
      return { erro: "Erro de ligação" };
    }
  }, []);

  // ════════════════════════════════════════════════════════
  // VALORES DE CONTEXTO (memoizados)
  // ════════════════════════════════════════════════════════

  const profile = useMemo(
    () =>
      user
        ? { id: user.id, nome: user.nome || user.email, email: user.email, role: user.role }
        : null,
    [user]
  );

  // Só contém o essencial de autenticação — muda apenas quando
  // user/loading realmente mudam.
  const authValue = useMemo(
    () => ({
      user: profile,
      rawUser: user,
      loading,
      login,
      logout,
      register,
      forgotPassword,
      resetPassword,
    }),
    [profile, user, loading, login, logout, register, forgotPassword, resetPassword]
  );

  // Só contém dados/CRUD — todas as funções são estáveis (useCallback),
  // então este objeto só muda quando "plans" muda.
  const dataValue = useMemo(
    () => ({
      plans,
      carregar,
      inserir,
      deletar,
      EditPlant,
      MinhasPlantas,
      BtnDonwloadPlant,
      carregarhistorico,
      SendReport,
      CarregarUsuarios,
      SuspenderUser,
      BanUser,
      GerenciarPlantas,
      LoadAdmingeral,
      carregarDenuncias,
      solicitarSaque,
      CarregarSaques,
      PagarSaque,
      CarregarEventos,
      CriarEvento,
      CarregarEventoDetalhe,
      CarregarInscricoes,
      DecidirInscricao,
      CarregarEventosDisponiveis,
      CarregarMinhasInscricoes,
      InscreverEvento,
      EnviarProposta,
      AdicionarAoCarrinho,
      RemoverDoCarrinho,
      ListarCarrinho,
      LimparCarrinho,
      ComprarItem,
      ComprarTudo,
    }),
    [
      plans,
      carregar,
      inserir,
      deletar,
      EditPlant,
      MinhasPlantas,
      BtnDonwloadPlant,
      carregarhistorico,
      SendReport,
      CarregarUsuarios,
      SuspenderUser,
      BanUser,
      GerenciarPlantas,
      LoadAdmingeral,
      carregarDenuncias,
      solicitarSaque,
      CarregarSaques,
      PagarSaque,
      CarregarEventos,
      CriarEvento,
      CarregarEventoDetalhe,
      CarregarInscricoes,
      DecidirInscricao,
      CarregarEventosDisponiveis,
      CarregarMinhasInscricoes,
      InscreverEvento,
      EnviarProposta,
      AdicionarAoCarrinho,
      RemoverDoCarrinho,
      ListarCarrinho,
      LimparCarrinho,
      ComprarItem,
      ComprarTudo,
    ]
  );

  // Valor combinado, fornecido ao AuthContext original para que
  // NENHUM componente existente que use useAuth() precise mudar.
  // Como está memoizado, só recalcula quando authValue OU dataValue
  // mudam de facto — não a cada render de um componente qualquer.
  const combinedValue = useMemo(
    () => ({ ...authValue, ...dataValue }),
    [authValue, dataValue]
  );

  return (
    <AuthContext.Provider value={combinedValue}>
      <DataContext.Provider value={dataValue}>{children}</DataContext.Provider>
    </AuthContext.Provider>
  );
}