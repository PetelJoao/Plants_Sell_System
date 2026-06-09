"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/Context/AuthContext"; // mesmo caminho do projeto

interface Evento {
  id: string;
  estado: string;
  descricao: string;
  data_inicio: string | null;
  data_fim: string | null;
  imagens: string[];
  criado_em: string;
  total_inscricoes: number;
}

function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    aberto:       { label: "Aberto",       cls: "badge-aberto"     },
    em_andamento: { label: "Em andamento", cls: "badge-andamento"  },
    finalizado:   { label: "Finalizado",   cls: "badge-finalizado" },
  };
  const { label, cls } = map[estado] || { label: estado, cls: "" };
  return <span className={`badge ${cls}`}>{label}</span>;
}

function EventoCard({ evento, onClick }: { evento: Evento; onClick: (id: string) => void }) {
  return (
    <div className="evento-card" onClick={() => onClick(evento.id)}>
      <div className="evento-card-header">
        <EstadoBadge estado={evento.estado} />
        <span className="evento-inscricoes">{evento.total_inscricoes} inscrição(ões)</span>
      </div>
      <p className="evento-descricao">{evento.descricao}</p>
      <div className="evento-datas">
        {evento.data_inicio && <span>{new Date(evento.data_inicio).toLocaleDateString("pt-AO")}</span>}
        {evento.data_fim    && <span> — {new Date(evento.data_fim).toLocaleDateString("pt-AO")}</span>}
      </div>
      <p className="evento-criado">Criado em {new Date(evento.criado_em).toLocaleDateString("pt-AO")}</p>
    </div>
  );
}

function ModalCriarEvento({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (novo: Evento) => void;
}) {
  // ✅ mesmo padrão: useAuth com as any dentro do componente
  const { CriarEvento } = useAuth() as any;

  const [form, setForm]       = useState({ descricao: "", data_inicio: "", data_fim: "" });
  const [loading, setLoading] = useState(false);
  const [erro, setErro]       = useState("");

  const handleSubmit = async () => {
    if (!form.descricao.trim()) { setErro("A descrição é obrigatória."); return; }
    setLoading(true);
    setErro("");
    try {
      const novo = await CriarEvento({
        descricao:   form.descricao,
        data_inicio: form.data_inicio,
        data_fim:    form.data_fim,
      });
      onCreated(novo);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Criar Novo Evento</h2>
          <button className="btn-close" onClick={onClose}>&#x2715;</button>
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

export default function Page() {
  const router = useRouter();

  // ✅ mesmo padrão exato do ArchitecturalPlans
  const { CarregarEventos, loading } = useAuth() as any;

  const [eventos, setEventos]     = useState<Evento[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // ✅ mesmo padrão do useEffect do ArchitecturalPlans:
  // função async interna, sem depender de authLoading explícito,
  // porque carregar() no ArchitecturalPlans também não espera —
  // o token já existe no localStorage quando a página monta
  useEffect(() => {
    async function load() {
      const data = await CarregarEventos();
      if (data) setEventos(data);
      setPageLoading(false);
    }
    load();
  }, []);

  const handleCreated = (novo: Evento) => {
    setShowModal(false);
    setEventos((prev) => [{ ...novo, total_inscricoes: 0 }, ...prev]);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        :root {
          --bg: #F7F8FA;
          --white: #FFFFFF;
          --border: #E5E7EB;
          --text: #111827;
          --text-secondary: #6B7280;
          --accent: #2563EB;
          --accent-hover: #1D4ED8;
          --accent-light: #EFF6FF;
          --danger: #DC2626;
          --danger-bg: #FEF2F2;
          --radius: 10px;
          --shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
          --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'Inter', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          font-size: 14px;
        }

        .page-wrapper { min-height: 100vh; background: var(--bg); }

        .top-bar {
          background: var(--white);
          border-bottom: 1px solid var(--border);
          padding: 0 32px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .top-bar-left { display: flex; align-items: center; gap: 12px; }

        .btn-voltar {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          padding: 6px 14px;
          border-radius: var(--radius);
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-voltar:hover { background: var(--bg); color: var(--text); border-color: #D1D5DB; }
        .btn-voltar svg { width: 14px; height: 14px; }

        .top-bar-right { display: flex; align-items: center; gap: 10px; }

        .btn-primary {
          background: var(--accent);
          color: white;
          border: none;
          padding: 8px 18px;
          border-radius: var(--radius);
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }
        .btn-primary:hover    { background: var(--accent-hover); }
        .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

        .btn-secondary {
          background: var(--white);
          color: var(--text);
          border: 1px solid var(--border);
          padding: 8px 18px;
          border-radius: var(--radius);
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-secondary:hover { background: var(--bg); }

        .main-content { padding: 32px; max-width: 1200px; margin: 0 auto; }

        .page-heading { margin-bottom: 28px; }
        .page-heading h1 {
          font-size: 22px; font-weight: 700;
          color: var(--text); letter-spacing: -0.3px;
        }
        .page-heading p { font-size: 13.5px; color: var(--text-secondary); margin-top: 4px; }

        .empty-state { text-align: center; padding: 80px 20px; color: var(--text-secondary); }
        .empty-icon {
          width: 48px; height: 48px;
          background: var(--accent-light);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .empty-icon svg { width: 22px; height: 22px; color: var(--accent); }
        .empty-state h3 { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
        .empty-state p {
          font-size: 13.5px; color: var(--text-secondary);
          max-width: 340px; margin: 0 auto; line-height: 1.6;
        }

        .loading { text-align: center; padding: 60px; color: var(--text-secondary); font-size: 13.5px; }

        .eventos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .evento-card {
          background: var(--white);
          border-radius: var(--radius);
          padding: 20px;
          box-shadow: var(--shadow);
          cursor: pointer;
          transition: box-shadow 0.15s, border-color 0.15s;
          border: 1px solid var(--border);
        }
        .evento-card:hover { box-shadow: var(--shadow-md); border-color: #BFDBFE; }

        .evento-card-header {
          display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 10px;
        }

        .badge {
          font-size: 11px; font-weight: 600;
          padding: 3px 9px; border-radius: 20px;
          text-transform: uppercase; letter-spacing: 0.4px;
        }
        .badge-aberto     { background: #DCFCE7; color: #15803D; }
        .badge-andamento  { background: #FEF9C3; color: #A16207; }
        .badge-finalizado { background: #F3F4F6; color: #6B7280; }

        .evento-inscricoes { font-size: 12px; color: var(--text-secondary); }

        .evento-descricao {
          font-size: 13.5px; line-height: 1.6;
          color: var(--text); margin-bottom: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .evento-datas { font-size: 12px; color: var(--accent); margin-bottom: 6px; font-weight: 500; }
        .evento-criado { font-size: 11.5px; color: var(--text-secondary); }

        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.35);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(2px);
          animation: fadeIn 0.15s ease;
        }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

        .modal {
          background: var(--white);
          border-radius: 12px;
          width: 100%; max-width: 500px;
          box-shadow: 0 20px 48px rgba(0,0,0,0.16);
          animation: slideUp 0.2s ease;
        }
        @keyframes slideUp {
          from { transform: translateY(16px); opacity: 0 }
          to   { transform: translateY(0);    opacity: 1 }
        }

        .modal-header {
          padding: 20px 24px 16px;
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 1px solid var(--border);
        }
        .modal-header h2 { font-size: 15px; font-weight: 700; color: var(--text); }

        .btn-close {
          background: none; border: none;
          font-size: 14px; cursor: pointer;
          color: var(--text-secondary);
          padding: 4px 8px; border-radius: 6px; line-height: 1;
        }
        .btn-close:hover { background: var(--bg); color: var(--text); }

        .modal-body {
          padding: 20px 24px;
          display: flex; flex-direction: column; gap: 14px;
        }
        .modal-body label {
          display: block; font-size: 12.5px;
          font-weight: 600; color: var(--text); margin-bottom: 5px;
        }
        .modal-body textarea,
        .modal-body input {
          width: 100%; border: 1px solid var(--border);
          border-radius: 8px; padding: 10px 12px;
          font-family: 'Inter', sans-serif; font-size: 13.5px;
          color: var(--text); background: var(--white);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          resize: vertical;
        }
        .modal-body textarea:focus,
        .modal-body input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
        }

        .form-row   { display: flex; gap: 14px; }
        .form-group { flex: 1; }

        .erro {
          color: var(--danger); font-size: 12.5px;
          padding: 9px 12px; background: var(--danger-bg);
          border-radius: 8px; border-left: 3px solid var(--danger);
        }

        .modal-footer {
          padding: 14px 24px 20px;
          display: flex; justify-content: flex-end; gap: 10px;
          border-top: 1px solid var(--border);
        }

        @media (max-width: 768px) {
          .top-bar      { padding: 0 16px; }
          .main-content { padding: 20px 16px; }
          .form-row     { flex-direction: column; }
          .eventos-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="page-wrapper">
        <div className="top-bar">
          <div className="top-bar-left">
            <button className="btn-voltar" onClick={() => router.push("/Develop/dashboard")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Voltar
            </button>
          </div>
          <div className="top-bar-right">
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + Criar Evento
            </button>
          </div>
        </div>

        <div className="main-content">
          <div className="page-heading">
            <h1>Meus Eventos</h1>
            <p>Gerencie os seus projectos e escolha o arquitecto ideal</p>
          </div>

          {pageLoading ? (
            <div className="loading">A carregar eventos...</div>
          ) : eventos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8"  y1="2" x2="8"  y2="6" />
                  <line x1="3"  y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3>Ainda não tem eventos</h3>
              <p>Crie o seu primeiro evento e comece a receber propostas de arquitectos.</p>
            </div>
          ) : (
            <div className="eventos-grid">
              {eventos.map((e) => (
                <EventoCard
                  key={e.id}
                  evento={e}
                  onClick={(id) => router.push(`/Develop/dashboard/Eventos/${id}`)}
                />
              ))}
            </div>
          )}
        </div>
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