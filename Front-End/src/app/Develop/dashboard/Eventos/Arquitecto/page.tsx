'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/Context/AuthContext';

type Evento = {
  id: number;
  titulo: string;
  descricao: string;
  status: string;
  data_evento: string;
};

type Inscricao = {
  id: number;
  idevento: number;
  status: string;
  evento_titulo: string;
  proposta_enviada: boolean;
};

export default function EventosArquitecto() {
  const { CarregarEventosDisponiveis, CarregarMinhasInscricoes, InscreverEvento, EnviarProposta } = useAuth() as any;
  const router = useRouter();

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'disponiveis' | 'inscricoes'>('disponiveis');

  // Modal de proposta
  const [modalAberto, setModalAberto] = useState(false);
  const [inscricaoSelecionada, setInscricaoSelecionada] = useState<number | null>(null);
  const [proposta, setProposta] = useState({ valor: '', prazo_dias: '', mensagem: '' });const [inscrevendo, setInscrevendo] = useState<number | null>(null);



  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setLoading(true);
    const [evs, insc] = await Promise.all([
      CarregarEventosDisponiveis(),
      CarregarMinhasInscricoes(),
    ]);
    setEventos(evs || []);
    setInscricoes(insc || []);
    setLoading(false);
  }



  async function handleEnviarProposta() {
    if (!inscricaoSelecionada) return;
    await EnviarProposta({
      id_inscricao: inscricaoSelecionada,
      valor: Number(proposta.valor),
      prazo_dias: Number(proposta.prazo_dias),
      mensagem: proposta.mensagem,
    });
    setModalAberto(false);
    setProposta({ valor: '', prazo_dias: '', mensagem: '' });
    await carregarDados();
  }


async function handleInscrever(idevento: number) {
  setInscrevendo(idevento);
  const res = await InscreverEvento(idevento);

  if (res?.erro) {
    // 409 = já inscrito — recarrega para mostrar estado actualizado
    await carregarDados();
    setInscrevendo(null);
    return;
  }

  await carregarDados();
  setInscrevendo(null);
}

  const jaInscrito = (idevento: number) =>
    inscricoes.some((i) => i.idevento === idevento);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); font-family: 'Inter', sans-serif; }
        :root {
          --bg: #F7F8FA; --white: #FFFFFF; --border: #E5E7EB;
          --text: #111827; --text-secondary: #6B7280;
          --accent: #2563EB; --accent-hover: #1D4ED8; --accent-light: #EFF6FF;
          --success: #16A34A; --success-bg: #DCFCE7;
          --danger: #DC2626; --danger-bg: #FEF2F2;
          --radius: 10px;
        }
        .topbar {
          position: sticky; top: 0; height: 56px; background: var(--white);
          border-bottom: 1px solid var(--border); display: flex;
          align-items: center; padding: 0 24px; gap: 16px; z-index: 10;
        }
        .btn-voltar {
          display: flex; align-items: center; gap: 6px; background: none;
          border: none; cursor: pointer; color: var(--text-secondary);
          font-size: 14px;
        }
        .btn-voltar:hover { color: var(--accent); }
        .page-title { font-size: 18px; font-weight: 600; color: var(--text); }
        .content { padding: 24px; max-width: 1100px; margin: 0 auto; }
        .tabs { display: flex; gap: 8px; margin-bottom: 24px; }
        .tab-btn {
          padding: 8px 20px; border-radius: var(--radius); border: 1px solid var(--border);
          background: var(--white); cursor: pointer; font-size: 14px;
          color: var(--text-secondary); transition: all .2s;
        }
        .tab-btn.active {
          background: var(--accent); color: #fff; border-color: var(--accent);
        }
        .grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }
        .card {
          background: var(--white); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 20px;
        }
        .card-title { font-size: 16px; font-weight: 600; color: var(--text); margin-bottom: 8px; }
        .card-desc { font-size: 14px; color: var(--text-secondary); margin-bottom: 12px; }
        .card-footer { display: flex; justify-content: space-between; align-items: center; }
        .badge {
          display: inline-block; padding: 2px 10px; border-radius: 99px;
          font-size: 12px; font-weight: 500;
        }
        .badge-aberto    { background: var(--accent-light); color: var(--accent); }
        .badge-andamento { background: #FEF9C3; color: #854D0E; }
        .badge-finalizado{ background: #F3F4F6; color: var(--text-secondary); }
        .badge-pendente  { background: #FEF9C3; color: #854D0E; }
        .badge-aceite    { background: var(--success-bg); color: var(--success); }
        .badge-rejeitado { background: var(--danger-bg); color: var(--danger); }
        .btn-primary {
          background: var(--accent); color: #fff; border: none;
          padding: 8px 16px; border-radius: var(--radius);
          cursor: pointer; font-size: 13px; transition: background .2s;
        }
        .btn-primary:hover { background: var(--accent-hover); }
        .btn-primary:disabled { opacity: .5; cursor: not-allowed; }
        .btn-outline {
          background: transparent; color: var(--accent);
          border: 1px solid var(--accent); padding: 8px 16px;
          border-radius: var(--radius); cursor: pointer;
          font-size: 13px; transition: all .2s;
        }
        .btn-outline:hover { background: var(--accent-light); }
        /* Modal */
        .overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,.4);
          backdrop-filter: blur(4px); display: flex;
          align-items: center; justify-content: center; z-index: 100;
        }
        .modal {
          background: var(--white); border-radius: var(--radius);
          padding: 28px; width: 100%; max-width: 460px;
          animation: slideUp .25s ease;
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .modal-title { font-size: 18px; font-weight: 600; margin-bottom: 20px; }
        .field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
        .field label { font-size: 13px; color: var(--text-secondary); }
        .field input, .field textarea {
          padding: 9px 12px; border: 1px solid var(--border);
          border-radius: var(--radius); font-size: 14px; outline: none;
        }
        .field input:focus, .field textarea:focus { border-color: var(--accent); }
        .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
        .empty { text-align: center; color: var(--text-secondary); padding: 48px 0; }
      `}</style>

      {/* Top Bar */}
      <div className="topbar">
        <button className="btn-voltar" onClick={() => router.push('/Develop/dashboard')}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </button>
        <span className="page-title">Eventos</span>
      </div>

      <div className="content">
        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab-btn ${tab === 'disponiveis' ? 'active' : ''}`}
            onClick={() => setTab('disponiveis')}
          >
            Disponíveis
          </button>
          <button
            className={`tab-btn ${tab === 'inscricoes' ? 'active' : ''}`}
            onClick={() => setTab('inscricoes')}
          >
            Minhas Inscrições
          </button>
        </div>

        {loading ? (
          <p className="empty">A carregar...</p>
        ) : tab === 'disponiveis' ? (
          /* ── EVENTOS DISPONÍVEIS ── */
          eventos.length === 0 ? (
            <p className="empty">Nenhum evento disponível de momento.</p>
          ) : (
            <div className="grid">
              {eventos.map((ev) => (
                <div className="card" key={ev.id}>
                  <div className="card-title">{ev.titulo}</div>
                  <div className="card-desc">{ev.descricao}</div>
                  <div className="card-footer">
                    <span className={`badge badge-${ev.status}`}>{ev.status}</span>
                    {jaInscrito(ev.id) ? (
                      <span className="badge badge-aceite">Inscrito</span>
                    ) : (
                      <button
                        className="btn-primary"
                        onClick={() => handleInscrever(ev.id)}
                        disabled={inscrevendo === ev.id}
                        >
                        {inscrevendo === ev.id ? 'A candidatar...' : 'Candidatar'}
                    </button>

                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* ── MINHAS INSCRIÇÕES ── */
          inscricoes.length === 0 ? (
            <p className="empty">Ainda não tens inscrições.</p>
          ) : (
            <div className="grid">
              {inscricoes.map((insc) => (
                <div className="card" key={insc.id}>
                  <div className="card-title">{insc.evento_titulo}</div>
                  <div className="card-footer">
                    <span className={`badge badge-${insc.status}`}>{insc.status}</span>
                    {insc.status === 'aceite' && !insc.proposta_enviada && (
                      <button
                        className="btn-outline"
                        onClick={() => {
                          setInscricaoSelecionada(insc.id);
                          setModalAberto(true);
                        }}
                      >
                        Enviar Proposta
                      </button>
                    )}
                    {insc.proposta_enviada && (
                      <span className="badge badge-andamento">Proposta enviada</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Modal Proposta */}
      {modalAberto && (
        <div className="overlay" onClick={() => setModalAberto(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Enviar Proposta</div>

            <div className="field">
              <label>Valor (€)</label>
              <input
                type="number"
                placeholder="Ex: 1500"
                value={proposta.valor}
                onChange={(e) => setProposta({ ...proposta, valor: e.target.value })}
              />
            </div>

            <div className="field">
              <label>Prazo (dias)</label>
              <input
                type="number"
                placeholder="Ex: 30"
                value={proposta.prazo_dias}
                onChange={(e) => setProposta({ ...proposta, prazo_dias: e.target.value })}
              />
            </div>

            <div className="field">
              <label>Mensagem</label>
              <textarea
                rows={3}
                placeholder="Descreve a tua abordagem..."
                value={proposta.mensagem}
                onChange={(e) => setProposta({ ...proposta, mensagem: e.target.value })}
              />
            </div>

            <div className="modal-actions">
              <button className="btn-outline" onClick={() => setModalAberto(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleEnviarProposta}>Enviar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}