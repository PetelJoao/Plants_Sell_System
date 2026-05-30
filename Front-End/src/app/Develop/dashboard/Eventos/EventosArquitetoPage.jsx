"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") : ""}`,
});

// ─── Modal de Proposta ───────────────────────────────────────────────────────
function ModalProposta({ inscricao, onClose, onSaved }) {
  const [form, setForm] = useState({ valor: "", prazo_dias: "", mensagem: "" });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async () => {
    if (!form.valor || isNaN(Number(form.valor)) || Number(form.valor) <= 0) {
      setErro("Informe um valor válido para a proposta.");
      return;
    }
    setLoading(true);
    setErro("");
    try {
      const res = await fetch(`${API}/api/eventos/proposta`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          id_inscricao: inscricao.id,
          valor: Number(form.valor),
          prazo_dias: form.prazo_dias ? Number(form.prazo_dias) : null,
          mensagem: form.mensagem || null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Erro ao enviar proposta.");
      onSaved();
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 Enviar Proposta</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Valor estimado (AOA) *</label>
            <input
              type="number"
              min="0"
              placeholder="Ex: 500000"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Prazo de execução (dias)</label>
            <input
              type="number"
              min="1"
              placeholder="Ex: 90"
              value={form.prazo_dias}
              onChange={(e) => setForm({ ...form, prazo_dias: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Mensagem ao cliente</label>
            <textarea
              rows={4}
              placeholder="Descreva a sua abordagem, experiência relevante, diferenciais..."
              value={form.mensagem}
              onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
            />
          </div>
          {erro && <p className="erro">{erro}</p>}
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "A enviar..." : "Enviar Proposta"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Card de Evento ──────────────────────────────────────────────────────────
function EventoCard({ evento, onInscrever, onVerInscricao }) {
  const [loading, setLoading] = useState(false);

  const handleInscrever = async () => {
    setLoading(true);
    await onInscrever(evento.id);
    setLoading(false);
  };

  return (
    <div className={`evento-card ${evento.ja_inscrito ? "card-inscrito" : ""}`}>
      {evento.ja_inscrito && <div className="inscrito-ribbon">✓ Inscrito</div>}

      <div className="evento-card-top">
        <div className="evento-dono-avatar">
          {evento.nome_dono?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="evento-dono-label">Publicado por</p>
          <p className="evento-dono-nome">{evento.nome_dono}</p>
        </div>
        <span className="badge badge-aberto">Aberto</span>
      </div>

      <p className="evento-descricao">{evento.descricao}</p>

      <div className="evento-datas">
        {evento.data_inicio && (
          <div className="data-item">
            <span className="data-label">Início</span>
            <span>{new Date(evento.data_inicio).toLocaleDateString("pt-AO")}</span>
          </div>
        )}
        {evento.data_fim && (
          <div className="data-item">
            <span className="data-label">Conclusão</span>
            <span>{new Date(evento.data_fim).toLocaleDateString("pt-AO")}</span>
          </div>
        )}
        <div className="data-item">
          <span className="data-label">Publicado</span>
          <span>{new Date(evento.criado_em).toLocaleDateString("pt-AO")}</span>
        </div>
      </div>

      <div className="evento-acoes">
        {evento.ja_inscrito ? (
          <button className="btn-ver-inscricao" onClick={() => onVerInscricao(evento.id)}>
            Ver minha inscrição →
          </button>
        ) : (
          <button className="btn-inscrever" onClick={handleInscrever} disabled={loading}>
            {loading ? "A inscrever..." : "Inscrever-me neste evento"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Card das minhas inscrições ───────────────────────────────────────────────
function MinhaInscricaoCard({ inscricao, onProposta }) {
  const estadoMap = {
    pendente: { label: "Pendente", cls: "badge-pendente" },
    aceite: { label: "Aceite ✓", cls: "badge-aceite" },
    rejeitado: { label: "Rejeitado", cls: "badge-rejeitado" },
  };
  const { label, cls } = estadoMap[inscricao.estado] || {};

  return (
    <div className={`minha-inscricao-card ${inscricao.estado === "aceite" ? "card-aceite-arq" : ""}`}>
      <div className="mi-header">
        <div>
          <p className="mi-evento-desc">{inscricao.evento_descricao}</p>
          <p className="mi-data">Inscrito em {new Date(inscricao.dataingresso).toLocaleDateString("pt-AO")}</p>
        </div>
        <span className={`badge ${cls}`}>{label}</span>
      </div>

      {inscricao.proposta ? (
        <div className="mi-proposta">
          <span className="mi-prop-label">Proposta enviada</span>
          <span className="mi-prop-valor">
            {Number(inscricao.proposta.valor).toLocaleString("pt-AO", { style: "currency", currency: "AOA" })}
          </span>
          {inscricao.proposta.prazo_dias && (
            <span className="mi-prop-prazo">· {inscricao.proposta.prazo_dias} dias</span>
          )}
        </div>
      ) : inscricao.estado === "pendente" ? (
        <button className="btn-add-proposta" onClick={() => onProposta(inscricao)}>
          + Adicionar proposta
        </button>
      ) : null}

      {inscricao.estado === "aceite" && (
        <div className="mi-aceite-msg">
          🎉 Parabéns! O cliente aceitou a sua candidatura.
        </div>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function EventosArquitetoPage() {
  const router = useRouter();
  const [tab, setTab] = useState("disponiveis"); // 'disponiveis' | 'minhas'
  const [eventos, setEventos] = useState([]);
  const [minhasInscricoes, setMinhasInscricoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [modalProposta, setModalProposta] = useState(null); // inscricao selecionada
  const [busca, setBusca] = useState("");

  const showFeedback = (tipo, msg) => {
    setFeedback({ tipo, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchEventos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/eventos/disponiveis`, { headers: headers() });
      if (res.ok) setEventos(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const fetchMinhasInscricoes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/eventos/arquiteto/inscricoes`, { headers: headers() });
      if (res.ok) setMinhasInscricoes(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "disponiveis") fetchEventos();
    else fetchMinhasInscricoes();
  }, [tab]);

  const handleInscrever = async (eventoId) => {
    try {
      const res = await fetch(`${API}/api/eventos/inscricao`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ idevento: eventoId }),
      });
      if (!res.ok) throw new Error((await res.json()).detail);
      showFeedback("sucesso", "Inscrição realizada com sucesso!");
      setEventos((prev) =>
        prev.map((e) => (e.id === eventoId ? { ...e, ja_inscrito: true } : e))
      );
    } catch (e) {
      showFeedback("erro", e.message);
    }
  };

  const eventosFiltrados = eventos.filter((e) =>
    e.descricao.toLowerCase().includes(busca.toLowerCase()) ||
    e.nome_dono?.toLowerCase().includes(busca.toLowerCase())
  );

  const totalAceites = minhasInscricoes.filter((i) => i.estado === "aceite").length;
  const totalPendentes = minhasInscricoes.filter((i) => i.estado === "pendente").length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --verde: #2D5016;
          --verde-medio: #4A7C28;
          --verde-claro: #7DB847;
          --creme: #F5F0E8;
          --creme-escuro: #EDE6D6;
          --terra: #8B6914;
          --texto: #1C1C1C;
          --texto-suave: #6B6B6B;
          --branco: #FFFFFF;
          --vermelho: #C0392B;
          --azul: #1A4DB8;
          --raio: 12px;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; background: var(--creme); color: var(--texto); min-height: 100vh; }

        .page-header {
          background: linear-gradient(135deg, var(--verde) 0%, #1a3a0a 100%);
          color: var(--creme);
          padding: 36px 48px 0;
        }

        .header-top {
          display: flex; justify-content: space-between;
          align-items: flex-start; margin-bottom: 28px;
        }

        .header-top h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.2rem; font-weight: 700; margin-bottom: 4px;
        }
        .header-top p { opacity: 0.75; font-size: 0.95rem; }

        .header-stats {
          display: flex; gap: 12px;
        }
        .hstat {
          background: rgba(255,255,255,0.1);
          border-radius: 10px; padding: 12px 20px;
          text-align: center; min-width: 80px;
        }
        .hstat-num { font-size: 1.6rem; font-weight: 700; }
        .hstat-label { font-size: 0.75rem; opacity: 0.75; }

        .tabs {
          display: flex; gap: 0;
          border-bottom: 2px solid rgba(255,255,255,0.15);
        }
        .tab-btn {
          background: none; border: none;
          color: rgba(255,255,255,0.6);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; font-weight: 500;
          padding: 14px 24px; cursor: pointer;
          border-bottom: 3px solid transparent;
          margin-bottom: -2px;
          transition: all 0.2s;
        }
        .tab-btn:hover { color: white; }
        .tab-btn.ativo { color: white; border-bottom-color: var(--verde-claro); }

        .main { max-width: 1100px; margin: 0 auto; padding: 36px 48px; }

        .search-bar {
          display: flex; align-items: center;
          background: var(--branco);
          border-radius: var(--raio);
          border: 1.5px solid var(--creme-escuro);
          padding: 0 16px;
          margin-bottom: 28px;
          gap: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .search-bar span { font-size: 1.1rem; color: var(--texto-suave); }
        .search-bar input {
          flex: 1; border: none; outline: none;
          padding: 14px 0;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          background: transparent; color: var(--texto);
        }

        .feedback {
          padding: 14px 18px; border-radius: var(--raio);
          margin-bottom: 24px; font-size: 0.95rem;
          animation: fadeIn 0.3s ease;
        }
        .feedback.sucesso { background: #E8F5E1; color: #2D6A1A; border-left: 4px solid var(--verde-claro); }
        .feedback.erro { background: #FDECEA; color: var(--vermelho); border-left: 4px solid var(--vermelho); }
        @keyframes fadeIn { from { opacity:0; transform: translateY(-8px) } to { opacity:1; transform: none } }

        .eventos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        .loading-state { text-align: center; padding: 60px; color: var(--texto-suave); }

        .empty-state { text-align: center; padding: 60px; color: var(--texto-suave); }
        .empty-state .icon { font-size: 2.8rem; margin-bottom: 14px; }
        .empty-state h3 { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; color: var(--verde); margin-bottom: 8px; }

        /* Evento card */
        .evento-card {
          background: var(--branco);
          border-radius: var(--raio);
          padding: 24px;
          border: 1.5px solid var(--creme-escuro);
          box-shadow: 0 2px 12px rgba(45,80,22,0.06);
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }
        .evento-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(45,80,22,0.14);
          border-color: var(--verde-claro);
        }
        .card-inscrito { background: #F9FFF4; border-color: var(--verde-claro) !important; }

        .inscrito-ribbon {
          position: absolute; top: 14px; right: -28px;
          background: var(--verde-claro); color: white;
          font-size: 0.75rem; font-weight: 600;
          padding: 4px 36px; transform: rotate(45deg);
          letter-spacing: 0.5px;
        }

        .evento-card-top {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 14px;
        }
        .evento-dono-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: var(--verde-medio); color: white;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem; font-weight: 700; flex-shrink: 0;
        }
        .evento-dono-label { font-size: 0.75rem; color: var(--texto-suave); }
        .evento-dono-nome { font-size: 0.9rem; font-weight: 600; }
        .badge { margin-left: auto; }

        .evento-descricao {
          font-size: 0.95rem; line-height: 1.65;
          color: var(--texto); margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .evento-datas {
          display: flex; gap: 16px; flex-wrap: wrap;
          padding: 12px; background: var(--creme);
          border-radius: 8px; margin-bottom: 16px;
        }
        .data-item { display: flex; flex-direction: column; gap: 2px; }
        .data-label { font-size: 0.72rem; color: var(--texto-suave); text-transform: uppercase; letter-spacing: 0.5px; }
        .data-item span:last-child { font-size: 0.88rem; font-weight: 500; }

        .btn-inscrever {
          width: 100%; padding: 12px;
          background: var(--verde); color: white;
          border: none; border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; font-weight: 500;
          cursor: pointer; transition: background 0.2s;
        }
        .btn-inscrever:hover { background: var(--verde-medio); }
        .btn-inscrever:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-ver-inscricao {
          width: 100%; padding: 12px;
          background: transparent; color: var(--verde);
          border: 1.5px solid var(--verde-claro);
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; font-weight: 500; cursor: pointer;
          transition: all 0.2s;
        }
        .btn-ver-inscricao:hover { background: var(--verde); color: white; }

        /* Minhas inscrições */
        .inscricoes-lista { display: flex; flex-direction: column; gap: 16px; }

        .minha-inscricao-card {
          background: var(--branco);
          border-radius: var(--raio);
          padding: 20px 24px;
          border: 1.5px solid var(--creme-escuro);
          box-shadow: 0 2px 10px rgba(45,80,22,0.06);
        }
        .card-aceite-arq { border-color: var(--verde-claro) !important; background: #F9FFF4; }

        .mi-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 14px; }
        .mi-evento-desc { font-size: 0.95rem; font-weight: 500; margin-bottom: 4px; line-height: 1.5; }
        .mi-data { font-size: 0.82rem; color: var(--texto-suave); }

        .mi-proposta {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; background: var(--creme);
          border-radius: 8px; font-size: 0.9rem;
        }
        .mi-prop-label { color: var(--texto-suave); font-size: 0.82rem; }
        .mi-prop-valor { font-weight: 600; color: var(--verde); }
        .mi-prop-prazo { color: var(--texto-suave); }

        .btn-add-proposta {
          background: none; border: 1.5px dashed var(--verde-claro);
          color: var(--verde-medio); padding: 10px 16px;
          border-radius: 8px; font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem; cursor: pointer; transition: all 0.2s; width: 100%;
        }
        .btn-add-proposta:hover { background: #E8F5E1; border-style: solid; }

        .mi-aceite-msg {
          margin-top: 12px; padding: 10px 14px;
          background: #E8F5E1; border-radius: 8px;
          font-size: 0.88rem; color: #2D6A1A;
        }

        /* Badge */
        .badge { font-size: 0.75rem; font-weight: 500; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
        .badge-aberto { background: #E8F5E1; color: #2D6A1A; }
        .badge-pendente { background: #EEF4FF; color: var(--azul); }
        .badge-aceite { background: #E8F5E1; color: #2D6A1A; }
        .badge-rejeitado { background: #FDECEA; color: var(--vermelho); }

        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; backdrop-filter: blur(3px);
          animation: fadeIn 0.2s ease;
        }
        .modal {
          background: var(--branco); border-radius: 16px;
          width: 100%; max-width: 500px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.2);
          animation: slideUp 0.25s ease;
        }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }

        .modal-header {
          padding: 22px 28px 16px;
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 1px solid var(--creme-escuro);
        }
        .modal-header h2 { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; color: var(--verde); }
        .btn-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--texto-suave); padding: 4px 8px; border-radius: 8px; }
        .btn-close:hover { background: var(--creme); }

        .modal-body {
          padding: 22px 28px;
          display: flex; flex-direction: column; gap: 16px;
        }
        .form-group label { display: block; font-size: 0.84rem; font-weight: 500; color: var(--verde); margin-bottom: 6px; }
        .form-group input,
        .form-group textarea {
          width: 100%; border: 1.5px solid var(--creme-escuro);
          border-radius: 8px; padding: 11px 13px;
          font-family: 'DM Sans', sans-serif; font-size: 0.95rem;
          background: var(--creme); outline: none; transition: border-color 0.2s; resize: vertical;
        }
        .form-group input:focus,
        .form-group textarea:focus { border-color: var(--verde-claro); background: white; }

        .erro { color: var(--vermelho); font-size: 0.88rem; padding: 10px 14px; background: #FDECEA; border-radius: 8px; border-left: 3px solid var(--vermelho); }

        .modal-footer {
          padding: 14px 28px 22px;
          display: flex; justify-content: flex-end; gap: 12px;
        }
        .btn-primary { background: var(--verde-claro); color: white; border: none; padding: 12px 24px; border-radius: var(--raio); font-family: 'DM Sans', sans-serif; font-size: 0.95rem; font-weight: 500; cursor: pointer; transition: background 0.2s; }
        .btn-primary:hover { background: var(--verde-medio); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-secondary { background: transparent; color: var(--verde); border: 1.5px solid var(--verde); padding: 12px 24px; border-radius: var(--raio); font-family: 'DM Sans', sans-serif; font-size: 0.95rem; cursor: pointer; transition: background 0.2s; }
        .btn-secondary:hover { background: var(--creme-escuro); }

        @media (max-width: 768px) {
          .page-header { padding: 24px 24px 0; }
          .header-top { flex-direction: column; gap: 16px; }
          .main { padding: 24px; }
          .eventos-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="page-header">
        <div className="header-top">
          <div>
            <h1>🏛️ Eventos & Projectos</h1>
            <p>Encontre projectos que correspondam ao seu perfil e candidate-se</p>
          </div>
          {tab === "minhas" && minhasInscricoes.length > 0 && (
            <div className="header-stats">
              <div className="hstat">
                <div className="hstat-num">{minhasInscricoes.length}</div>
                <div className="hstat-label">Total</div>
              </div>
              <div className="hstat">
                <div className="hstat-num">{totalPendentes}</div>
                <div className="hstat-label">Pendentes</div>
              </div>
              <div className="hstat">
                <div className="hstat-num">{totalAceites}</div>
                <div className="hstat-label">Aceites</div>
              </div>
            </div>
          )}
        </div>
        <div className="tabs">
          <button
            className={`tab-btn ${tab === "disponiveis" ? "ativo" : ""}`}
            onClick={() => setTab("disponiveis")}
          >
            🔍 Eventos Disponíveis
          </button>
          <button
            className={`tab-btn ${tab === "minhas" ? "ativo" : ""}`}
            onClick={() => setTab("minhas")}
          >
            📋 Minhas Inscrições
            {totalPendentes > 0 && (
              <span style={{ marginLeft: 6, background: "var(--verde-claro)", borderRadius: "20px", padding: "1px 7px", fontSize: "0.75rem" }}>
                {totalPendentes}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="main">
        {feedback && (
          <div className={`feedback ${feedback.tipo}`}>{feedback.msg}</div>
        )}

        {tab === "disponiveis" && (
          <>
            <div className="search-bar">
              <span>🔍</span>
              <input
                placeholder="Pesquisar por descrição ou cliente..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="loading-state">A carregar eventos disponíveis...</div>
            ) : eventosFiltrados.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📭</div>
                <h3>Nenhum evento encontrado</h3>
                <p>{busca ? "Tente outro termo de pesquisa." : "Não há eventos abertos no momento."}</p>
              </div>
            ) : (
              <div className="eventos-grid">
                {eventosFiltrados.map((e) => (
                  <EventoCard
                    key={e.id}
                    evento={e}
                    onInscrever={handleInscrever}
                    onVerInscricao={(id) => {
                      setTab("minhas");
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "minhas" && (
          <>
            {loading ? (
              <div className="loading-state">A carregar inscrições...</div>
            ) : minhasInscricoes.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📋</div>
                <h3>Ainda não tem inscrições</h3>
                <p>Explore os eventos disponíveis e candidate-se aos que lhe interessam.</p>
                <br />
                <button className="btn-inscrever" style={{ width: "auto", padding: "12px 28px" }} onClick={() => setTab("disponiveis")}>
                  Ver eventos disponíveis
                </button>
              </div>
            ) : (
              <div className="inscricoes-lista">
                {minhasInscricoes.map((i) => (
                  <MinhaInscricaoCard
                    key={i.inscricao_id}
                    inscricao={i}
                    onProposta={(insc) => setModalProposta(insc)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {modalProposta && (
        <ModalProposta
          inscricao={modalProposta}
          onClose={() => setModalProposta(null)}
          onSaved={() => {
            setModalProposta(null);
            fetchMinhasInscricoes();
          }}
        />
      )}
    </>
  );
}
