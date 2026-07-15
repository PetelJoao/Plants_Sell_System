"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/Context/AuthContext";
import DashboardLayout from "@/app/Develop/dashboard/components/dashboard-layout"
import { 
  MessageCircle, 
  ArrowLeft, 
  Calendar, 
  User, 
  Star, 
  Clock, 
  DollarSign, 
  ChevronDown, 
  ChevronUp,
  Check,
  X,
  Sparkles,
  Inbox
} from "lucide-react";

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
  const map: Record<string, { label: string; className: string }> = {
    aberto:       { label: "Aberto",       className: "bg-emerald-50 text-emerald-700 border-emerald-200/60" },
    em_andamento: { label: "Em andamento", className: "bg-amber-50 text-amber-700 border-amber-200/60" },
    finalizado:   { label: "Finalizado",   className: "bg-slate-100 text-slate-600 border-slate-200" },
    pendente:     { label: "Pendente",     className: "bg-blue-50 text-blue-700 border-blue-200/60" },
    aceite:       { label: "Aceite",       className: "bg-emerald-50 text-emerald-700 border-emerald-200/60" },
    rejeitado:    { label: "Rejeitado",    className: "bg-rose-50 text-rose-700 border-rose-200/60" },
  };
  const { label, className } = map[estado] || { label: estado, className: "bg-slate-50 text-slate-600 border-slate-200" };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold tracking-wide uppercase rounded-full border shadow-sm ${className}`}>
      {label}
    </span>
  );
}

function Estrelas({ valor }: { valor: number }) {
  return (
    <div className="flex items-center gap-0.5 mt-1.5" aria-label={`Avaliação: ${valor} estrelas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star 
          key={i} 
          className={`h-4 w-4 ${i <= valor ? "text-amber-500 fill-amber-500" : "text-slate-200"}`} 
        />
      ))}
    </div>
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
  const podeConversar = estado === "pendente" || estado === "aceite";

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

  // Variação de bordas/fundos semânticos com base no status da inscrição
  const cardStatusClasses = 
    estado === "aceite" 
      ? "border-emerald-300 bg-emerald-50/20 shadow-emerald-100/40" 
      : estado === "rejeitado" 
        ? "border-slate-200 bg-slate-50/50 opacity-65" 
        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md";

  return (
    <div className={`flex flex-col rounded-xl border p-5 shadow-sm transition-all duration-300 relative group ${cardStatusClasses}`}>
      
      
      {podeConversar && (
        <button 
          className="absolute top-4 right-4 h-9 w-9 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-all shadow-sm focus:outline-none" 
          onClick={abrirChat} 
          title="Conversar com o arquitecto"
        >
          <MessageCircle className="h-4 w-4" />
        </button>
      )}

      {/* Header do Perfil */}
      <div className="flex items-start gap-4 pr-10 mb-4">
        <div className="h-12 w-12 rounded-full border border-slate-200/80 bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-lg overflow-hidden flex-shrink-0 shadow-inner">
          {arquiteto.foto_pessoal ? (
            <img src={arquiteto.foto_pessoal} alt={arquiteto.nome} className="h-full w-full object-cover" />
          ) : (
            <span>{arquiteto.nome?.charAt(0).toUpperCase()}</span>
          )}
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-900 text-base tracking-tight truncate max-w-[180px]">
              {arquiteto.nome}
            </h3>
            <EstadoBadge estado={estado} />
          </div>
          <p className="text-xs text-slate-500 truncate">{arquiteto.email}</p>
          {arquiteto.telefone && <p className="text-xs text-slate-400 mt-0.5">{arquiteto.telefone}</p>}
          <Estrelas valor={arquiteto.avaliacao} />
        </div>
      </div>

      {/* Bloco de Proposta Comercial */}
      {proposta && proposta.valor !== null && (
        <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50/80 p-4 shadow-inner">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold tracking-wider uppercase mb-3">
            <Sparkles className="h-3 w-3 text-blue-500" />
            Proposta Financeira
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-medium tracking-wide flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-slate-400" /> Valor
              </span>
              <span className="text-base font-bold text-slate-900 mt-0.5">
                {Number(proposta.valor).toLocaleString("pt-AO", { style: "currency", currency: "AOA" })}
              </span>
            </div>
            
            {proposta.prazo_dias && (
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-medium tracking-wide flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-400" /> Prazo
                </span>
                <span className="text-sm font-semibold text-slate-800 mt-1">
                  {proposta.prazo_dias} dias
                </span>
              </div>
            )}
          </div>
          
          {proposta.mensagem && (
            <p className="text-xs text-slate-600 italic bg-white rounded border border-slate-100 p-2.5 mt-3 leading-relaxed before:content-['“'] after:content-['”']">
              {proposta.mensagem}
            </p>
          )}
        </div>
      )}

      {/* Detalhes Expansíveis */}
      <button 
        className="mt-4 flex items-center justify-between text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors py-2 border-t border-dashed border-slate-100 w-full text-left" 
        onClick={() => setExpandido(!expandido)}
      >
        <span>{expandido ? "Ocultar especificações" : "Ver especificações completas"}</span>
        {expandido ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {expandido && (
        <div className="mt-2 flex flex-col gap-3 rounded-lg bg-slate-50 border border-slate-100 p-3.5 animate-fadeIn">
          {arquiteto.bio && (
            <div className="text-xs">
              <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block mb-1">Biografia</span>
              <p className="text-slate-700 leading-relaxed bg-white/60 p-2 rounded border border-slate-200/40">{arquiteto.bio}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            {arquiteto.cedula_profissional && (
              <div>
                <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block mb-0.5">Cédula Prof.</span>
                <p className="font-medium text-slate-800 bg-white/60 p-1.5 rounded border border-slate-200/40 truncate">{arquiteto.cedula_profissional}</p>
              </div>
            )}
            {arquiteto.nif && (
              <div>
                <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block mb-0.5">NIF</span>
                <p className="font-medium text-slate-800 bg-white/60 p-1.5 rounded border border-slate-200/40 truncate">{arquiteto.nif}</p>
              </div>
            )}
          </div>

          {arquiteto.endereco && (
            <div className="text-xs">
              <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block mb-0.5">Endereço</span>
              <p className="text-slate-700 bg-white/60 p-1.5 rounded border border-slate-200/40 truncate">{arquiteto.endereco}</p>
            </div>
          )}
          
          <div className="text-xs border-t border-slate-200/60 pt-2 mt-1">
            <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block mb-0.5">Data de Inscrição</span>
            <p className="text-slate-500 flex items-center gap-1">
              <Calendar className="h-3 w-3 text-slate-400" />
              {new Date(dataingresso).toLocaleString("pt-AO")}
            </p>
          </div>
        </div>
      )}

      {/* Ações de Decisão (Aceitar/Rejeitar) */}
      {podeDecidir && (
        <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100">
          <button 
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:pointer-events-none" 
            onClick={() => handleDecisao("aceite")} 
            disabled={loading}
          >
            <Check className="h-3.5 w-3.5" />
            Aceitar
          </button>
          <button 
            className="inline-flex items-center justify-center h-9 w-24 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors disabled:opacity-50 disabled:pointer-events-none" 
            onClick={() => handleDecisao("rejeitado")} 
            disabled={loading}
          >
            <X className="h-3.5 w-3.5 mr-1" />
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
      <div className="bg-slate-50/50 min-h-screen text-slate-900 antialiased selection:bg-blue-100">
        
        {pageLoad ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 gap-3">
            <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium animate-pulse">A carregar evento...</p>
          </div>
        ) : !evento ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-2">
            <Inbox className="h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium">Evento não encontrado.</p>
          </div>
        ) : (
          <>
            {/* ── Top Bar / Ações de Retorno ── */}
            <div className="bg-white border-b border-slate-200/80 px-4 md:px-8 h-14 flex items-center justify-between sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/90">
              <button 
                className="inline-flex items-center gap-1.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm focus:outline-none" 
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar
              </button>
            </div>

            {/* ── Painel Header do Evento ── */}
            <div className="bg-white border-b border-slate-200/60 px-4 md:px-8 py-6 shadow-sm">
              <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                    {evento.descricao.length > 100
                      ? evento.descricao.substring(0, 100) + "..."
                      : evento.descricao}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-3 text-xs font-medium text-slate-500">
                    <EstadoBadge estado={evento.estado} />
                    
                    {evento.data_inicio && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        Início: <strong className="text-slate-700">{new Date(evento.data_inicio).toLocaleDateString("pt-AO")}</strong>
                      </span>
                    )}
                    {evento.data_fim && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        Fim: <strong className="text-slate-700">{new Date(evento.data_fim).toLocaleDateString("pt-AO")}</strong>
                      </span>
                    )}
                    <span className="text-slate-400 hidden sm:inline">•</span>
                    <span className="text-slate-400">Criado em {new Date(evento.criado_em).toLocaleDateString("pt-AO")}</span>
                  </div>
                </div>

                {/* Bloco de Indicadores Numéricos (Métricas do Evento) */}
                <div className="grid grid-cols-3 gap-3 flex-shrink-0 lg:w-auto w-full">
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-center min-w-[90px] shadow-sm">
                    <div className="text-xl md:text-2xl font-bold text-slate-900 leading-none">{inscricoes.length}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">Inscrições</div>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-center min-w-[90px] shadow-sm">
                    <div className="text-xl md:text-2xl font-bold text-amber-600 leading-none">
                      {inscricoes.filter((i) => i.estado === "pendente").length}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">Pendentes</div>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-center min-w-[90px] shadow-sm">
                    <div className="text-xl md:text-2xl font-bold text-blue-600 leading-none">
                      {inscricoes.filter((i) => i.proposta).length}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">Propostas</div>
                  </div>
                </div>

              </div>
            </div>

            {/* ── Conteúdo Principal / Grid de Candidatos ── */}
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
              
              {/* Notificações de Feedback */}
              {feedback && (
                <div className={`p-4 rounded-xl mb-6 text-sm font-medium border shadow-sm transition-all animate-fadeIn ${
                  feedback.tipo === "sucesso" 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}>
                  {feedback.msg}
                </div>
              )}

              {/* Controle de Filtros em Design Pill Segmentado */}
              {inscricoes.length > 0 && (
                <div className="inline-flex p-1 bg-slate-200/70 border border-slate-200 rounded-xl mb-6 shadow-inner max-w-full overflow-x-auto gap-0.5">
                  {["todos", "pendente", "aceite", "rejeitado"].map((f) => {
                    const isActive = filtro === f;
                    const count = f === "todos" 
                      ? inscricoes.length 
                      : inscricoes.filter((i) => i.estado === f).length;
                    
                    return (
                      <button
                        key={f}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap focus:outline-none ${
                          isActive 
                            ? "bg-white text-slate-900 shadow-sm border border-slate-200/40" 
                            : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                        }`}
                        onClick={() => setFiltro(f)}
                      >
                        {f === "todos" ? "Todos" : f.charAt(0).toUpperCase() + f.slice(1)}
                        <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive ? "bg-blue-50 text-blue-600" : "bg-slate-300/60 text-slate-600"
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Título de Seção Contextual */}
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                {inscricoes.length === 0 ? "A aguardar candidaturas" : "Arquitectos interessados"}
              </h2>

              {/* Grid Responsivo de Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {inscricoesFiltradas.length === 0 ? (
                  <div className="col-span-full border-2 border-dashed border-slate-200 rounded-2xl p-16 text-center bg-white/40 shadow-sm flex flex-col items-center justify-center">
                    <Inbox className="h-10 w-10 text-slate-300 mb-3" strokeWidth={1.5} />
                    <p className="text-sm font-medium text-slate-500">Nenhuma inscrição encontrada para este filtro.</p>
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

            </main>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}