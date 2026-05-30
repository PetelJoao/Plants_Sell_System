"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ─── Estado badge ─────────────────────────────────────────────────────────
function EstadoBadge({ estado }) {
  const map = {
    aberto: { label: "Aberto", cls: "badge-aberto" },
    em_andamento: { label: "Em andamento", cls: "badge-andamento" },
    finalizado: { label: "Finalizado", cls: "badge-finalizado" },
  };
  const { label, cls } = map[estado] || { label: estado, cls: "" };
  return <span className={`badge ${cls}`}>{label}</span>;
}

// ─── Card de evento ────────────────────────────────────────────────────────
function EventoCard({ evento, onClick }) {
  return (
    <div className="evento-card" onClick={() => onClick(evento.id)}>
      <div className="evento-card-header">
        <EstadoBadge estado={evento.estado} />
        <span className="evento-inscricoes">
          👥 {evento.total_inscricoes} inscrição(ões)
        </span>
      </div>
      <p className="evento-descricao">{evento.descricao}</p>
      <div className="evento-datas">
        {evento.data_inicio && (
          <span>📅 {new Date(evento.data_inicio).toLocaleDateString("pt-AO")}</span>
        )}
        {evento.data_fim && (
          <span> → {new Date(evento.data_fim).toLocaleDateString("pt-AO")}</span>
        )}
      </div>
      <p className="evento-criado">
        Criado em {new Date(evento.criado_em).toLocaleDateString("pt-AO")}
      </p>
    </div>
  );
}

// ─── Modal criar evento ────────────────────────────────────────────────────
function ModalCriarEvento({ onClose, onCreated }) {
  const [form, setForm] = useState({
    descricao: "",
    data_inicio: "",
    data_fim: "",
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async () => {
    if (!form.descricao.trim()) {
      setErro("A descrição é obrigatória.");
      return;
    }
    setLoading(true);
    setErro("");
    try {
      const res = await fetch(`${API}/api/eventos/`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          descricao: form.descricao,
          data_inicio: form.data_inicio || null,
          data_fim: form.data_fim || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Erro ao criar evento.");
      }
      const novo = await res.json();
      onCreated(novo);
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
          <h2>Criar Novo Evento</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <label>Descrição do Projecto *</label>
          <textarea
            rows={4}
            placeholder="Descreva o seu projecto com o máximo de detalhes possível..."
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />

          <div className="form-row">
            <div className="form-group">
              <label>Data de Início</label>
              <input
                type="datetime-local"
                value={form.data_inicio}
                onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Data de Conclusão</label>
              <input
                type="datetime-local"
                value={form.data_fim}
                onChange={(e) => setForm({ ...form, data_fim: e.target.value })}
              />
            </div>
          </div>

          {erro && <p className="erro">{erro}</p>}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "A criar..." : "Criar Evento"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────
export default function EventosClientePage() {
  const router = useRouter();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchEventos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/eventos/meus`, { headers: headers() });
      if (res.ok) setEventos(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEventos(); }, []);

  const handleCreated = (novo) => {
    setShowModal(false);
    setEventos((prev) => [{ ...novo, total_inscricoes: 0 }, ...prev]);
  };

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
          --sombra: 0 2px 16px rgba(45,80,22,0.10);
          --raio: 12px;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: var(--creme);
          color: var(--texto);
          min-height: 100vh;
        }

        .page-header {
          background: var(--verde);
          color: var(--creme);
          padding: 32px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .page-header h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.2rem;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .page-header p {
          font-size: 0.95rem;
          opacity: 0.8;
          margin-top: 4px;
        }

        .btn-primary {
          background: var(--verde-claro);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: var(--raio);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .btn-primary:hover { background: var(--verde-medio); transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .btn-secondary {
          background: transparent;
          color: var(--verde);
          border: 1.5px solid var(--verde);
          padding: 12px 24px;
          border-radius: var(--raio);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-secondary:hover { background: var(--creme-escuro); }

        .main-content { padding: 40px 48px; max-width: 1200px; margin: 0 auto; }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          color: var(--texto-suave);
        }
        .empty-state .icon { font-size: 3rem; margin-bottom: 16px; }
        .empty-state h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          color: var(--verde);
          margin-bottom: 8px;
        }

        .loading {
          text-align: center;
          padding: 60px;
          color: var(--texto-suave);
          font-size: 1rem;
        }

        .eventos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .evento-card {
          background: var(--branco);
          border-radius: var(--raio);
          padding: 24px;
          box-shadow: var(--sombra);
          cursor: pointer;
          transition: all 0.2s;
          border: 1.5px solid transparent;
        }
        .evento-card:hover {
          border-color: var(--verde-claro);
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(45,80,22,0.15);
        }

        .evento-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .badge {
          font-size: 0.78rem;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .badge-aberto { background: #E8F5E1; color: #2D6A1A; }
        .badge-andamento { background: #FFF4D6; color: #8B6914; }
        .badge-finalizado { background: #F0F0F0; color: #555; }

        .evento-inscricoes { font-size: 0.85rem; color: var(--texto-suave); }

        .evento-descricao {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--texto);
          margin-bottom: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .evento-datas { font-size: 0.85rem; color: var(--terra); margin-bottom: 8px; }
        .evento-criado { font-size: 0.8rem; color: var(--texto-suave); }

        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(3px);
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

        .modal {
          background: var(--branco);
          border-radius: 16px;
          width: 100%;
          max-width: 520px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.2);
          animation: slideUp 0.25s ease;
        }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }

        .modal-header {
          padding: 24px 28px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--creme-escuro);
        }
        .modal-header h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          color: var(--verde);
        }
        .btn-close {
          background: none; border: none; font-size: 1.2rem;
          cursor: pointer; color: var(--texto-suave);
          padding: 4px 8px; border-radius: 8px;
        }
        .btn-close:hover { background: var(--creme); }

        .modal-body {
          padding: 24px 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .modal-body label {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--verde);
          margin-bottom: 6px;
        }
        .modal-body textarea,
        .modal-body input {
          width: 100%;
          border: 1.5px solid var(--creme-escuro);
          border-radius: 8px;
          padding: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          color: var(--texto);
          background: var(--creme);
          outline: none;
          transition: border-color 0.2s;
          resize: vertical;
        }
        .modal-body textarea:focus,
        .modal-body input:focus { border-color: var(--verde-claro); background: white; }

        .form-row { display: flex; gap: 16px; }
        .form-group { flex: 1; }

        .erro {
          color: #C0392B;
          font-size: 0.88rem;
          padding: 10px 14px;
          background: #FDECEA;
          border-radius: 8px;
          border-left: 3px solid #C0392B;
        }

        .modal-footer {
          padding: 16px 28px 24px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        @media (max-width: 768px) {
          .page-header { padding: 24px; flex-direction: column; gap: 16px; align-items: flex-start; }
          .main-content { padding: 24px; }
          .form-row { flex-direction: column; }
        }
      `}</style>

      <div className="page-header">
        <div>
          <h1>🌿 Meus Eventos</h1>
          <p>Gerencie os seus projectos e escolha o arquitecto ideal</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Criar Evento
        </button>
      </div>

      <div className="main-content">
        {loading ? (
          <div className="loading">A carregar eventos...</div>
        ) : eventos.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🏗️</div>
            <h3>Ainda não tem eventos</h3>
            <p>Crie o seu primeiro evento e comece a receber propostas de arquitectos.</p>
          </div>
        ) : (
          <div className="eventos-grid">
            {eventos.map((e) => (
              <EventoCard
                key={e.id}
                evento={e}
                onClick={(id) => router.push(`/dashboard/eventos/${id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <ModalCriarEvento
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  );
}
