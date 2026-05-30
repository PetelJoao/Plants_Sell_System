"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") : ""}`,
});

function EstadoBadge({ estado }) {
  const map = {
    aberto: { label: "Aberto", cls: "badge-aberto" },
    em_andamento: { label: "Em andamento", cls: "badge-andamento" },
    finalizado: { label: "Finalizado", cls: "badge-finalizado" },
    pendente: { label: "Pendente", cls: "badge-pendente" },
    aceite: { label: "Aceite", cls: "badge-aceite" },
    rejeitado: { label: "Rejeitado", cls: "badge-rejeitado" },
  };
  const { label, cls } = map[estado] || { label: estado, cls: "" };
  return <span className={`badge ${cls}`}>{label}</span>;
}

function Estrelas({ valor }) {
  return (
    <span className="estrelas">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= valor ? "#F5A623" : "#DDD" }}>★</span>
      ))}
    </span>
  );
}

function CardArquiteto({ inscricao, onDecisao, eventoEstado }) {
  const { arquiteto, proposta, estado, inscricao_id, dataingresso } = inscricao;
  const [expandido, setExpandido] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDecisao = async (decisao) => {
    setLoading(true);
    await onDecisao(inscricao_id, decisao);
    setLoading(false);
  };

  const podeDecidir = eventoEstado === "aberto" && estado === "pendente";

  return (
    <div className={`card-arquiteto ${estado === "aceite" ? "card-aceite" : estado === "rejeitado" ? "card-rejeitado" : ""}`}>
      <div className="arq-header">
        <div className="arq-avatar">
          {arquiteto.foto_pessoal ? (
            <img src={arquiteto.foto_pessoal} alt={arquiteto.nome} />
          ) : (
            <span>{arquiteto.nome?.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="arq-info">
          <div className="arq-nome-row">
            <h3>{arquiteto.nome}</h3>
            <EstadoBadge estado={estado} />
          </div>
          <p className="arq-email">✉️ {arquiteto.email}</p>
          {arquiteto.telefone && <p className="arq-tel">📞 {arquiteto.telefone}</p>}
          <Estrelas valor={arquiteto.avaliacao} />
        </div>
      </div>

      {proposta && (
        <div className="proposta-box">
          <h4>💼 Proposta</h4>
          <div className="proposta-grid">
            <div className="proposta-item">
              <span className="proposta-label">Valor</span>
              <span className="proposta-valor">
                {Number(proposta.valor).toLocaleString("pt-AO", { style: "currency", currency: "AOA" })}
              </span>
            </div>
            {proposta.prazo_dias && (
              <div className="proposta-item">
                <span className="proposta-label">Prazo</span>
                <span className="proposta-valor">{proposta.prazo_dias} dias</span>
              </div>
            )}
          </div>
          {proposta.mensagem && (
            <p className="proposta-mensagem">"{proposta.mensagem}"</p>
          )}
        </div>
      )}

      <button className="btn-expandir" onClick={() => setExpandido(!expandido)}>
        {expandido ? "▲ Ocultar detalhes" : "▼ Ver mais detalhes"}
      </button>

      {expandido && (
        <div className="arq-detalhes">
          {arquiteto.bio && (
            <div className="detalhe-item">
              <span className="detalhe-label">Bio</span>
              <p>{arquiteto.bio}</p>
            </div>
          )}
          {arquiteto.cedula_profissional && (
            <div className="detalhe-item">
              <span className="detalhe-label">Cédula Profissional</span>
              <p>{arquiteto.cedula_profissional}</p>
            </div>
          )}
          {arquiteto.nif && (
            <div className="detalhe-item">
              <span className="detalhe-label">NIF</span>
              <p>{arquiteto.nif}</p>
            </div>
          )}
          {arquiteto.endereco && (
            <div className="detalhe-item">
              <span className="detalhe-label">Endereço</span>
              <p>{arquiteto.endereco}</p>
            </div>
          )}
          <div className="detalhe-item">
            <span className="detalhe-label">Data de inscrição</span>
            <p>{new Date(dataingresso).toLocaleString("pt-AO")}</p>
          </div>
        </div>
      )}

      {podeDecidir && (
        <div className="acoes">
          <button
            className="btn-aceitar"
            onClick={() => handleDecisao("aceite")}
            disabled={loading}
          >
            ✓ Aceitar Arquitecto
          </button>
          <button
            className="btn-rejeitar"
            onClick={() => handleDecisao("rejeitado")}
            disabled={loading}
          >
            ✕ Rejeitar
          </button>
        </div>
      )}
    </div>
  );
}

export default function DetalheEventoPage() {
  const params = useParams();
  const router = useRouter();
  const eventoId = params?.id;

  const [evento, setEvento] = useState(null);
  const [inscricoes, setInscricoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [filtro, setFiltro] = useState("todos");

  const fetchTudo = async () => {
    setLoading(true);
    try {
      const [resEvento, resInscricoes] = await Promise.all([
        fetch(`${API}/api/eventos/${eventoId}`, { headers: headers() }),
        fetch(`${API}/api/eventos/${eventoId}/inscricoes`, { headers: headers() }),
      ]);
      if (resEvento.ok) setEvento(await resEvento.json());
      if (resInscricoes.ok) setInscricoes(await resInscricoes.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (eventoId) fetchTudo(); }, [eventoId]);

  const handleDecisao = async (inscricaoId, decisao) => {
    try {
      const res = await fetch(`${API}/api/eventos/inscricao/${inscricaoId}/decisao`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ estado: decisao }),
      });
      if (!res.ok) throw new Error((await res.json()).detail);
      setFeedback({ tipo: "sucesso", msg: `Arquitecto ${decisao === "aceite" ? "aceite" : "rejeitado"} com sucesso!` });
      fetchTudo();
    } catch (e) {
      setFeedback({ tipo: "erro", msg: e.message });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const inscricoesFiltradas = inscricoes.filter((i) => {
    if (filtro === "todos") return true;
    return i.estado === filtro;
  });

  if (loading) return <div className="loading-page">A carregar evento...</div>;
  if (!evento) return <div className="loading-page">Evento não encontrado.</div>;

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
          --raio: 12px;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; background: var(--creme); color: var(--texto); }

        .loading-page { display: flex; align-items: center; justify-content: center; height: 60vh; color: var(--texto-suave); font-size: 1.1rem; }

        .page-topo {
          background: var(--verde);
          color: var(--creme);
          padding: 28px 48px;
        }

        .btn-voltar {
          background: none; border: none; color: rgba(255,255,255,0.7);
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; padding: 0; margin-bottom: 16px;
          display: flex; align-items: center; gap: 6px;
          transition: color 0.2s;
        }
        .btn-voltar:hover { color: white; }

        .topo-conteudo { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; }

        .topo-info h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem; font-weight: 700;
          line-height: 1.3; margin-bottom: 12px;
        }

        .topo-meta { display: flex; gap: 16px; flex-wrap: wrap; font-size: 0.9rem; opacity: 0.85; }
        .topo-meta span { display: flex; align-items: center; gap: 4px; }

        .topo-stats {
          display: flex; gap: 12px; flex-shrink: 0;
        }
        .stat-box {
          background: rgba(255,255,255,0.12);
          border-radius: var(--raio);
          padding: 16px 20px;
          text-align: center;
          min-width: 90px;
        }
        .stat-num { font-size: 1.8rem; font-weight: 700; line-height: 1; }
        .stat-label { font-size: 0.78rem; opacity: 0.8; margin-top: 4px; }

        .main { max-width: 1100px; margin: 0 auto; padding: 36px 48px; }

        .feedback {
          padding: 14px 18px;
          border-radius: var(--raio);
          margin-bottom: 24px;
          font-size: 0.95rem;
          animation: fadeIn 0.3s ease;
        }
        .feedback.sucesso { background: #E8F5E1; color: #2D6A1A; border-left: 4px solid var(--verde-claro); }
        .feedback.erro { background: #FDECEA; color: var(--vermelho); border-left: 4px solid var(--vermelho); }
        @keyframes fadeIn { from { opacity:0; transform: translateY(-8px) } to { opacity:1; transform: none } }

        .filtros {
          display: flex; gap: 8px; margin-bottom: 28px; flex-wrap: wrap;
        }
        .filtro-btn {
          padding: 8px 18px; border-radius: 20px;
          border: 1.5px solid var(--creme-escuro);
          background: var(--branco); color: var(--texto-suave);
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem; transition: all 0.2s;
        }
        .filtro-btn:hover { border-color: var(--verde-claro); color: var(--verde); }
        .filtro-btn.ativo { background: var(--verde); color: white; border-color: var(--verde); }

        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.4rem; color: var(--verde);
          margin-bottom: 20px;
        }

        .inscricoes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 20px;
        }

        .empty-inscricoes {
          text-align: center; padding: 60px;
          color: var(--texto-suave); grid-column: 1/-1;
        }
        .empty-inscricoes .icon { font-size: 2.5rem; margin-bottom: 12px; }

        /* Card Arquitecto */
        .card-arquiteto {
          background: var(--branco);
          border-radius: var(--raio);
          padding: 24px;
          box-shadow: 0 2px 16px rgba(45,80,22,0.08);
          border: 1.5px solid var(--creme-escuro);
          transition: box-shadow 0.2s;
        }
        .card-arquiteto:hover { box-shadow: 0 6px 24px rgba(45,80,22,0.14); }
        .card-aceite { border-color: var(--verde-claro) !important; background: #F9FFF4; }
        .card-rejeitado { opacity: 0.65; }

        .arq-header { display: flex; gap: 16px; margin-bottom: 16px; }

        .arq-avatar {
          width: 56px; height: 56px; border-radius: 50%;
          background: var(--verde); color: white;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem; font-weight: 700; flex-shrink: 0;
          overflow: hidden;
        }
        .arq-avatar img { width: 100%; height: 100%; object-fit: cover; }

        .arq-info { flex: 1; }
        .arq-nome-row { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; flex-wrap: wrap; }
        .arq-nome-row h3 { font-size: 1.05rem; font-weight: 600; }
        .arq-email, .arq-tel { font-size: 0.85rem; color: var(--texto-suave); margin-bottom: 2px; }

        .estrelas { font-size: 1rem; letter-spacing: 1px; }

        .proposta-box {
          background: var(--creme);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
        }
        .proposta-box h4 { font-size: 0.9rem; font-weight: 600; color: var(--verde); margin-bottom: 10px; }

        .proposta-grid { display: flex; gap: 20px; margin-bottom: 8px; }
        .proposta-item { display: flex; flex-direction: column; gap: 2px; }
        .proposta-label { font-size: 0.75rem; color: var(--texto-suave); text-transform: uppercase; letter-spacing: 0.5px; }
        .proposta-valor { font-size: 1rem; font-weight: 600; color: var(--verde); }
        .proposta-mensagem { font-size: 0.88rem; color: var(--texto-suave); font-style: italic; margin-top: 6px; }

        .btn-expandir {
          background: none; border: none; color: var(--verde-medio);
          font-size: 0.85rem; cursor: pointer; padding: 4px 0;
          width: 100%; text-align: left;
          font-family: 'DM Sans', sans-serif;
          margin-bottom: 8px;
        }
        .btn-expandir:hover { color: var(--verde); }

        .arq-detalhes {
          display: flex; flex-direction: column; gap: 10px;
          padding: 12px;
          background: var(--creme);
          border-radius: 8px;
          margin-bottom: 12px;
          animation: fadeIn 0.2s ease;
        }
        .detalhe-item .detalhe-label {
          font-size: 0.75rem; font-weight: 600; color: var(--texto-suave);
          text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; display: block;
        }
        .detalhe-item p { font-size: 0.9rem; }

        .acoes { display: flex; gap: 10px; margin-top: 12px; }
        .btn-aceitar {
          flex: 1; padding: 10px; border-radius: 8px;
          border: none; background: var(--verde); color: white;
          font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
          font-weight: 500; cursor: pointer; transition: background 0.2s;
        }
        .btn-aceitar:hover { background: var(--verde-medio); }
        .btn-aceitar:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-rejeitar {
          padding: 10px 18px; border-radius: 8px;
          border: 1.5px solid #DDD; background: transparent; color: var(--vermelho);
          font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-rejeitar:hover { background: #FDECEA; border-color: var(--vermelho); }
        .btn-rejeitar:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Badges */
        .badge {
          font-size: 0.75rem; font-weight: 500;
          padding: 3px 9px; border-radius: 20px;
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .badge-aberto { background: #E8F5E1; color: #2D6A1A; }
        .badge-andamento { background: #FFF4D6; color: #8B6914; }
        .badge-finalizado { background: #F0F0F0; color: #555; }
        .badge-pendente { background: #EEF4FF; color: #1A4DB8; }
        .badge-aceite { background: #E8F5E1; color: #2D6A1A; }
        .badge-rejeitado { background: #FDECEA; color: #C0392B; }

        @media (max-width: 768px) {
          .page-topo { padding: 24px; }
          .topo-conteudo { flex-direction: column; }
          .main { padding: 24px; }
          .inscricoes-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="page-topo">
        <button className="btn-voltar" onClick={() => router.back()}>
          ← Voltar aos eventos
        </button>
        <div className="topo-conteudo">
          <div className="topo-info">
            <h1>{evento.descricao.length > 80 ? evento.descricao.substring(0, 80) + "..." : evento.descricao}</h1>
            <div className="topo-meta">
              <EstadoBadge estado={evento.estado} />
              {evento.data_inicio && (
                <span>📅 Início: {new Date(evento.data_inicio).toLocaleDateString("pt-AO")}</span>
              )}
              {evento.data_fim && (
                <span>🏁 Fim: {new Date(evento.data_fim).toLocaleDateString("pt-AO")}</span>
              )}
            </div>
          </div>
          <div className="topo-stats">
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

      <div className="main">
        {feedback && (
          <div className={`feedback ${feedback.tipo}`}>{feedback.msg}</div>
        )}

        {inscricoes.length > 0 && (
          <div className="filtros">
            {["todos", "pendente", "aceite", "rejeitado"].map((f) => (
              <button
                key={f}
                className={`filtro-btn ${filtro === f ? "ativo" : ""}`}
                onClick={() => setFiltro(f)}
              >
                {f === "todos" ? `Todos (${inscricoes.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${inscricoes.filter((i) => i.estado === f).length})`}
              </button>
            ))}
          </div>
        )}

        <h2 className="section-title">
          {inscricoes.length === 0 ? "Aguardando inscrições" : "Arquitectos interessados"}
        </h2>

        <div className="inscricoes-grid">
          {inscricoesFiltradas.length === 0 ? (
            <div className="empty-inscricoes">
              <div className="icon">🔍</div>
              <p>Nenhuma inscrição encontrada com este filtro.</p>
            </div>
          ) : (
            inscricoesFiltradas.map((insc) => (
              <CardArquiteto
                key={insc.inscricao_id}
                inscricao={insc}
                onDecisao={handleDecisao}
                eventoEstado={evento.estado}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
