"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/Context/AuthContext";
import DashboardLayout from "@/app/Develop/dashboard/components/dashboard-layout"
import { MessageCircle } from "lucide-react";
// ─── Tipos ────────────────────────────────────────────────────────────────
interface Arquiteto {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  endereco: string | null;
  foto_pessoal: string | null;
  cedula_profissional: string | null;
  bio: string | null;
  nif: string | null;
  avaliacao: number;
}

interface Proposta {
  id: string | null;
  valor: number | null;
  prazo_dias: number | null;
  mensagem: string | null;
  criada_em: string | null;
}

interface Inscricao {
  inscricao_id: string;
  dataingresso: string;
  estado: string;
  arquiteto: Arquiteto;
  proposta: Proposta | null;
}

interface Evento {
  id: string;
  estado: string;
  descricao: string;
  data_inicio: string | null;
  data_fim: string | null;
  imagens: string[];
  criado_em: string;
  id_dono: string;
  nome_dono: string;

 
}

// ─── Sub-componentes ──────────────────────────────────────────────────────
function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    aberto:       { label: "Aberto",       cls: "badge-aberto"     },
    em_andamento: { label: "Em andamento", cls: "badge-andamento"  },
    finalizado:   { label: "Finalizado",   cls: "badge-finalizado" },
    pendente:     { label: "Pendente",     cls: "badge-pendente"   },
    aceite:       { label: "Aceite",       cls: "badge-aceite"     },
    rejeitado:    { label: "Rejeitado",    cls: "badge-rejeitado"  },
  };
  const { label, cls } = map[estado] || { label: estado, cls: "" };
  return <span className={`badge ${cls}`}>{label}</span>;
}

function Estrelas({ valor }: { valor: number }) {
  return (
    <span className="estrelas">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= valor ? "star-on" : "star-off"}>★</span>
      ))}
    </span>
  );
}

function CardArquiteto({
  inscricao,
  onDecisao,
  eventoEstado,
  eventoId, 
}: {
  inscricao: Inscricao;
  onDecisao: (id: string, decisao: string) => Promise<void>;
  eventoEstado: string;
  eventoId: string;
}) {
  const router = useRouter();
  console.log('CardArquiteto renderizado — eventoId recebido:', eventoId);
  const { arquiteto, proposta, estado, inscricao_id, dataingresso } = inscricao;
  const [expandido, setExpandido]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const podeDecidir = eventoEstado === "aberto" && estado === "pendente";
  const podeConversar = estado === "pendente" || estado === "aceite"; // novo

  const handleDecisao = async (decisao: string) => {
    setLoading(true);
    await onDecisao(inscricao_id, decisao);
    setLoading(false);
  };

const abrirChat = () => {
  const url = `/Develop/dashboard/chat/${arquiteto.id}?nome=${encodeURIComponent(arquiteto.nome)}&evento=${eventoId}`;
  console.log('URL DE CHAT:', url);  
  router.push(url);
};

  return (
    <div className={`card-arq${estado === "aceite" ? " card-aceite" : estado === "rejeitado" ? " card-rejeitado" : ""}`}>
      <div className="arq-header">
        <div className="arq-avatar">
          {arquiteto.foto_pessoal
            ? <img src={arquiteto.foto_pessoal} alt={arquiteto.nome} />
            : <span>{arquiteto.nome?.charAt(0).toUpperCase()}</span>}
        </div>
        <div className="arq-meta">
          <div className="arq-nome-row">
            <h3>{arquiteto.nome}</h3>
            <EstadoBadge estado={estado} />
          </div>
          <p className="arq-sub">{arquiteto.email}</p>
          {arquiteto.telefone && <p className="arq-sub">{arquiteto.telefone}</p>}
          <Estrelas valor={arquiteto.avaliacao} />
        </div>
      </div>

      {proposta && proposta.valor !== null && (
        <div className="proposta-box">
          <p className="proposta-section-label">Proposta</p>
          <div className="proposta-row">
            <div className="proposta-item">
              <span className="prop-label">Valor</span>
              <span className="prop-val">
                {Number(proposta.valor).toLocaleString("pt-AO", { style: "currency", currency: "AOA" })}
              </span>
            </div>
            {proposta.prazo_dias && (
              <div className="proposta-item">
                <span className="prop-label">Prazo</span>
                <span className="prop-val">{proposta.prazo_dias} dias</span>
              </div>
            )}
          </div>
          {proposta.mensagem && (
            <p className="proposta-msg">"{proposta.mensagem}"</p>
          )}
        </div>
      )}

      <button className="btn-expandir" onClick={() => setExpandido(!expandido)}>
        {expandido ? "Ocultar detalhes" : "Ver mais detalhes"}
      </button>

      {expandido && (
        <div className="arq-detalhes">
          {arquiteto.bio && (
            <div className="det-item">
              <span className="det-label">Bio</span>
              <p>{arquiteto.bio}</p>
            </div>
          )}
          {arquiteto.cedula_profissional && (
            <div className="det-item">
              <span className="det-label">Cédula Profissional</span>
              <p>{arquiteto.cedula_profissional}</p>
            </div>
          )}
          {arquiteto.nif && (
            <div className="det-item">
              <span className="det-label">NIF</span>
              <p>{arquiteto.nif}</p>
            </div>
          )}
          {arquiteto.endereco && (
            <div className="det-item">
              <span className="det-label">Endereço</span>
              <p>{arquiteto.endereco}</p>
            </div>
          )}
          <div className="det-item">
            <span className="det-label">Data de inscrição</span>
            <p>{new Date(dataingresso).toLocaleString("pt-AO")}</p>
          </div>
        </div>
      )}
      {podeConversar && (
        <button className="btn-chat-icon" onClick={abrirChat} title="Conversar com o arquitecto">
          <MessageCircle size={18} />
        </button>
      )}

      {podeDecidir && (
        <div className="acoes">
          <button className="btn-aceitar" onClick={() => handleDecisao("aceite")} disabled={loading}>
            Aceitar Arquitecto
          </button>
          <button className="btn-rejeitar" onClick={() => handleDecisao("rejeitado")} disabled={loading}>
            Rejeitar
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────
export default function Page() {
  const params   = useParams();
  const router   = useRouter();
  const eventoId = params?.id as string;

  // ✅ mesmo padrão do projeto — useAuth com as any
  const { loading: authLoading, CarregarEventoDetalhe, CarregarInscricoes, DecidirInscricao } = useAuth() as any;

  const [evento,     setEvento]     = useState<Evento | null>(null);
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [pageLoad,   setPageLoad]   = useState(true);
  const [feedback,   setFeedback]   = useState<{ tipo: string; msg: string } | null>(null);
  const [filtro,     setFiltro]     = useState("todos");

  const fetchTudo = async () => {
    setPageLoad(true);
    try {
      const [ev, insc] = await Promise.all([
        CarregarEventoDetalhe(eventoId),
        CarregarInscricoes(eventoId),
      ]);
      if (ev)   setEvento(ev);
      if (insc) setInscricoes(insc);
    } finally {
      setPageLoad(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (eventoId) fetchTudo();
  }, [authLoading, eventoId]);

  const handleDecisao = async (inscricaoId: string, decisao: string) => {
    try {
      await DecidirInscricao(inscricaoId, decisao);
      setFeedback({ tipo: "sucesso", msg: `Arquitecto ${decisao === "aceite" ? "aceite" : "rejeitado"} com sucesso.` });
      fetchTudo();
    } catch (e) {
      setFeedback({ tipo: "erro", msg: (e as Error).message });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const inscricoesFiltradas = inscricoes.filter((i) =>
    filtro === "todos" ? true : i.estado === filtro
  );

  return (
    <DashboardLayout>
      <div className="evento-detalhe-page">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

          .evento-detalhe-page {
            --bg: #F7F8FA;
            --white: #FFFFFF;
            --border: #E5E7EB;
            --text: #111827;
            --text-secondary: #6B7280;
            --accent: #2563EB;
            --accent-hover: #1D4ED8;
            --accent-light: #EFF6FF;
            --success: #16A34A;
            --success-bg: #DCFCE7;
            --danger: #DC2626;
            --danger-bg: #FEF2F2;
            --warning-bg: #FEF9C3;
            --warning: #A16207;
            --radius: 10px;
            --shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
            --shadow-md: 0 4px 12px rgba(0,0,0,0.08);

            font-family: 'Inter', sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            font-size: 14px;
          }

          .evento-detalhe-page *,
          .evento-detalhe-page *::before,
          .evento-detalhe-page *::after {
            box-sizing: border-box;
          }


          .evento-detalhe-page .loading-page {
            display: flex; align-items: center; justify-content: center;
            height: 60vh; color: var(--text-secondary); font-size: 14px;
            animation: fadeIn 0.15s ease;
          }

          /* ── top bar ── */
          .evento-detalhe-page .top-bar {
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

          .evento-detalhe-page .btn-voltar {
            display: flex; align-items: center; gap: 6px;
            background: none; border: 1px solid var(--border);
            color: var(--text-secondary); padding: 6px 14px;
            border-radius: var(--radius); font-family: 'Inter', sans-serif;
            font-size: 13px; font-weight: 500; cursor: pointer;
            transition: all 0.15s;
          }
          .evento-detalhe-page .btn-voltar:hover { background: var(--bg); color: var(--text); border-color: #D1D5DB; }
          .evento-detalhe-page .btn-voltar svg { width: 14px; height: 14px; }

          /* ── evento header card ── */
          .evento-detalhe-page .evento-header {
            background: var(--white);
            border-bottom: 1px solid var(--border);
            padding: 24px 32px;
          }

          .evento-detalhe-page .evento-header-inner {
            max-width: 1100px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 24px;
          }

          .evento-detalhe-page .evento-info h1 {
            font-size: 18px; font-weight: 700;
            color: var(--text); letter-spacing: -0.3px;
            margin-bottom: 10px; line-height: 1.4;
            max-width: 600px;
          }

          .evento-detalhe-page .evento-meta {
            display: flex; gap: 16px; flex-wrap: wrap;
            font-size: 12.5px; color: var(--text-secondary); align-items: center;
          }

          .evento-detalhe-page .evento-stats {
            display: flex; gap: 12px; flex-shrink: 0;
          }

          .evento-detalhe-page .stat-box {
            background: var(--bg);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 12px 18px;
            text-align: center;
            min-width: 80px;
          }
          .evento-detalhe-page .stat-num { font-size: 20px; font-weight: 700; color: var(--text); line-height: 1; }
          .evento-detalhe-page .stat-label { font-size: 11px; color: var(--text-secondary); margin-top: 3px; }

          /* ── main content ── */
          .evento-detalhe-page .main {
            max-width: 1100px;
            margin: 0 auto;
            padding: 28px 32px;
          }

          /* ── feedback ── */
          .evento-detalhe-page .feedback {
            padding: 12px 16px; border-radius: var(--radius);
            margin-bottom: 20px; font-size: 13px;
            animation: fadeIn 0.2s ease;
          }
          .evento-detalhe-page .feedback.sucesso { background: var(--success-bg); color: var(--success); border-left: 3px solid var(--success); }
          .evento-detalhe-page .feedback.erro    { background: var(--danger-bg);  color: var(--danger);  border-left: 3px solid var(--danger); }
          @keyframes fadeIn { from { opacity:0; transform: translateY(-6px) } to { opacity:1; transform: none } }

          /* ── filtros ── */
          .evento-detalhe-page .filtros { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
          .evento-detalhe-page .filtro-btn {
            padding: 6px 16px; border-radius: 20px;
            border: 1px solid var(--border);
            background: var(--white); color: var(--text-secondary);
            cursor: pointer; font-family: 'Inter', sans-serif;
            font-size: 12.5px; font-weight: 500; transition: all 0.15s;
          }
          .evento-detalhe-page .filtro-btn:hover { border-color: var(--accent); color: var(--accent); }
          .evento-detalhe-page .filtro-btn.ativo { background: var(--accent); color: white; border-color: var(--accent); }

          /* ── section title ── */
          .evento-detalhe-page .section-title {
            font-size: 15px; font-weight: 600;
            color: var(--text); margin-bottom: 16px;
          }

          /* ── grid ── */
          .evento-detalhe-page .inscricoes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
            gap: 16px;
          }

          .evento-detalhe-page .empty-box {
            grid-column: 1/-1; text-align: center;
            padding: 60px 20px; color: var(--text-secondary);
          }
          .evento-detalhe-page .empty-box p { font-size: 13.5px; }

          /* ── card arquiteto ── */
          .evento-detalhe-page .card-arq {
            background: var(--white);
            border-radius: var(--radius);
            padding: 20px;
            box-shadow: var(--shadow);
            border: 1px solid var(--border);
            transition: box-shadow 0.15s, border-color 0.15s;
          }
          .evento-detalhe-page .card-arq:hover { box-shadow: var(--shadow-md); }
          .evento-detalhe-page .card-aceite   { border-color: #86EFAC; background: #F0FDF4; }
          .evento-detalhe-page .card-rejeitado { opacity: 0.6; }

          .evento-detalhe-page .arq-header { display: flex; gap: 14px; margin-bottom: 14px; }

          .evento-detalhe-page .arq-avatar {
            width: 48px; height: 48px; border-radius: 50%;
            background: var(--accent-light); color: var(--accent);
            display: flex; align-items: center; justify-content: center;
            font-size: 18px; font-weight: 700; flex-shrink: 0; overflow: hidden;
            border: 1px solid var(--border);
          }
          .evento-detalhe-page .arq-avatar img { width: 100%; height: 100%; object-fit: cover; }

          .evento-detalhe-page .arq-meta { flex: 1; }
          .evento-detalhe-page .arq-nome-row {
            display: flex; align-items: center; gap: 8px;
            margin-bottom: 4px; flex-wrap: wrap;
          }
          .evento-detalhe-page .arq-nome-row h3 { font-size: 14px; font-weight: 600; }
          .evento-detalhe-page .arq-sub { font-size: 12px; color: var(--text-secondary); margin-bottom: 2px; }
          .evento-detalhe-page .star-on  { color: #F59E0B; }
          .evento-detalhe-page .star-off { color: #D1D5DB; }
          .evento-detalhe-page .estrelas { font-size: 13px; letter-spacing: 1px; margin-top: 4px; display: block; }

          /* ── proposta ── */
          .evento-detalhe-page .proposta-box {
            background: var(--bg); border-radius: 8px;
            padding: 14px; margin-bottom: 10px;
            border: 1px solid var(--border);
          }
          .evento-detalhe-page .proposta-section-label {
            font-size: 11px; font-weight: 600; text-transform: uppercase;
            letter-spacing: 0.5px; color: var(--text-secondary); margin-bottom: 10px;
          }
          .evento-detalhe-page .proposta-row { display: flex; gap: 24px; margin-bottom: 6px; }
          .evento-detalhe-page .proposta-item { display: flex; flex-direction: column; gap: 2px; }
          .evento-detalhe-page .prop-label { font-size: 11px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.4px; }
          .evento-detalhe-page .prop-val   { font-size: 14px; font-weight: 600; color: var(--text); }
          .evento-detalhe-page .proposta-msg {
            font-size: 12.5px; color: var(--text-secondary);
            font-style: italic; margin-top: 6px; line-height: 1.5;
          }

          /* ── expandir ── */
          .evento-detalhe-page .btn-expandir {
            background: none; border: none;
            color: var(--accent); font-size: 12px;
            cursor: pointer; padding: 6px 0;
            width: 100%; text-align: left;
            font-family: 'Inter', sans-serif; font-weight: 500;
            transition: color 0.15s;
          }
          .evento-detalhe-page .btn-expandir:hover { color: var(--accent-hover); }

          .evento-detalhe-page .arq-detalhes {
            display: flex; flex-direction: column; gap: 10px;
            padding: 12px; background: var(--bg);
            border-radius: 8px; margin: 8px 0;
            border: 1px solid var(--border);
            animation: fadeIn 0.2s ease;
          }
          .evento-detalhe-page .det-item .det-label {
            font-size: 11px; font-weight: 600; color: var(--text-secondary);
            text-transform: uppercase; letter-spacing: 0.5px;
            margin-bottom: 2px; display: block;
          }
          .evento-detalhe-page .det-item p { font-size: 13px; line-height: 1.5; }

          /* ── acoes ── */
          .evento-detalhe-page .acoes { display: flex; gap: 8px; margin-top: 12px; }
          .evento-detalhe-page .btn-aceitar {
            flex: 1; padding: 9px; border-radius: 8px;
            border: none; background: var(--accent); color: white;
            font-family: 'Inter', sans-serif; font-size: 13px;
            font-weight: 600; cursor: pointer; transition: background 0.15s;
          }
          .evento-detalhe-page .btn-aceitar:hover    { background: var(--accent-hover); }
          .evento-detalhe-page .btn-aceitar:disabled { opacity: 0.55; cursor: not-allowed; }
          .evento-detalhe-page .btn-rejeitar {
            padding: 9px 16px; border-radius: 8px;
            border: 1px solid var(--border); background: var(--white);
            color: var(--danger); font-family: 'Inter', sans-serif;
            font-size: 13px; cursor: pointer; transition: all 0.15s;
          }
          .evento-detalhe-page .btn-rejeitar:hover    { background: var(--danger-bg); border-color: var(--danger); }
          .evento-detalhe-page .btn-rejeitar:disabled { opacity: 0.55; cursor: not-allowed; }

          /* ── badges ── */
          .evento-detalhe-page .badge {
            font-size: 11px; font-weight: 600; padding: 3px 9px;
            border-radius: 20px; text-transform: uppercase; letter-spacing: 0.4px;
          }
          .evento-detalhe-page .badge-aberto     { background: var(--success-bg);  color: var(--success); }
          .evento-detalhe-page .badge-andamento  { background: var(--warning-bg);  color: var(--warning); }
          .evento-detalhe-page .badge-finalizado { background: #F3F4F6;             color: var(--text-secondary); }
          .evento-detalhe-page .badge-pendente   { background: var(--accent-light); color: var(--accent); }
          .evento-detalhe-page .badge-aceite     { background: var(--success-bg);  color: var(--success); }
          .evento-detalhe-page .badge-rejeitado  { background: var(--danger-bg);   color: var(--danger); }

          @media (max-width: 768px) {
            .evento-detalhe-page .top-bar        { padding: 0 16px; }
            .evento-detalhe-page .evento-header  { padding: 20px 16px; }
            .evento-detalhe-page .evento-header-inner { flex-direction: column; }
            .evento-detalhe-page .main           { padding: 20px 16px; }
            .evento-detalhe-page .inscricoes-grid { grid-template-columns: 1fr; }
            .evento-detalhe-page .evento-stats   { flex-wrap: wrap; }
          }
            .evento-detalhe-page .btn-chat-icon {
              flex-shrink: 0;
              width: 36px; height: 36px;
              border-radius: 50%;
              border: 1px solid var(--border);
              background: var(--accent-light);
              color: var(--accent);
              display: flex; align-items: center; justify-content: center;
              cursor: pointer;
              transition: all 0.15s;
            }
            .evento-detalhe-page .btn-chat-icon:hover {
              background: var(--accent);
              color: white;
              border-color: var(--accent);
            }
        `}</style>

        {pageLoad ? (
          <div className="loading-page">A carregar evento...</div>
        ) : !evento ? (
          <div className="loading-page">Evento não encontrado.</div>
        ) : (
          <>
            {/* ── top bar ── */}
            <div className="top-bar">
              <button className="btn-voltar" onClick={() => router.back()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Voltar
              </button>
            </div>

            {/* ── evento header ── */}
            <div className="evento-header">
              <div className="evento-header-inner">
                <div className="evento-info">
                  <h1>
                    {evento.descricao.length > 100
                      ? evento.descricao.substring(0, 100) + "..."
                      : evento.descricao}
                  </h1>
                  <div className="evento-meta">
                    <EstadoBadge estado={evento.estado} />
                    {evento.data_inicio && (
                      <span>Início: {new Date(evento.data_inicio).toLocaleDateString("pt-AO")}</span>
                    )}
                    {evento.data_fim && (
                      <span>Fim: {new Date(evento.data_fim).toLocaleDateString("pt-AO")}</span>
                    )}
                    <span>Criado em {new Date(evento.criado_em).toLocaleDateString("pt-AO")}</span>
                  </div>
                </div>
                <div className="evento-stats">
                  <div className="stat-box">
                    <div className="stat-num">{inscricoes.length}</div>
                    <div className="stat-label">Inscrições</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-num">{inscricoes.filter((i) => i.estado === "pendente").length}</div>
                    <div className="stat-label">Pendentes</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-num">{inscricoes.filter((i) => i.proposta).length}</div>
                    <div className="stat-label">Com proposta</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── main ── */}
            <div className="main">
              {feedback && (
                <div className={`feedback ${feedback.tipo}`}>{feedback.msg}</div>
              )}

              {inscricoes.length > 0 && (
                <div className="filtros">
                  {["todos", "pendente", "aceite", "rejeitado"].map((f) => (
                    <button
                      key={f}
                      className={`filtro-btn${filtro === f ? " ativo" : ""}`}
                      onClick={() => setFiltro(f)}
                    >
                      {f === "todos"
                        ? `Todos (${inscricoes.length})`
                        : `${f.charAt(0).toUpperCase() + f.slice(1)} (${inscricoes.filter((i) => i.estado === f).length})`}
                    </button>
                  ))}
                </div>
              )}

              <h2 className="section-title">
                {inscricoes.length === 0 ? "A aguardar inscrições" : "Arquitectos interessados"}
              </h2>

              <div className="inscricoes-grid">
                {inscricoesFiltradas.length === 0 ? (
                  <div className="empty-box">
                    <p>Nenhuma inscrição encontrada com este filtro.</p>
                  </div>
                ) : (
                  inscricoesFiltradas.map((insc) => (
                    <CardArquiteto
                      key={insc.inscricao_id}
                      inscricao={insc}
                      onDecisao={handleDecisao}
                      eventoEstado={evento.estado}
                      eventoId={evento.id}
                    />
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}