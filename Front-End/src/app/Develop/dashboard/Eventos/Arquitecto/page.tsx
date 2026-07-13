"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/Context/AuthContext";
import DashboardLayout from "@/app/Develop/dashboard/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, Calendar, MessageCircle, FileText, Loader2, CheckCircle2, User } from "lucide-react"

// ─── Tipos ────────────────────────────────────────────────────────────────

interface EventoDisponivel {
  id: string;
  descricao: string;
  estado: string;
  data_inicio: string | null;
  data_fim: string | null;
  criado_em: string;
  nome_dono: string;
  ja_inscrito: boolean;
}

interface EventoDaInscricao {
  id: string;
  descricao: string;
  estado: string;
  data_inicio: string | null;
  data_fim: string | null;
  id_dono: string;
  nome_dono: string;
}

interface Inscricao {
  id: string;
  idevento: string;
  estado: string;
  evento: EventoDaInscricao;
  proposta: { id: string } | null;
}

// ─── Sub-componentes ──────────────────────────────────────────────────────

function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, { label: string; className: string }> = {
    aberto:       { label: "Aberto",       className: "border-green-500/30 text-green-700 bg-green-50/80" },
    em_andamento: { label: "Em andamento", className: "border-yellow-500/30 text-yellow-700 bg-yellow-50/80" },
    finalizado:   { label: "Finalizado",   className: "border-muted-foreground/30 text-muted-foreground bg-muted" },
    pendente:     { label: "Pendente",     className: "border-yellow-500/30 text-yellow-700 bg-yellow-50/80" },
    aceite:       { label: "Aceite",       className: "border-green-500/30 text-green-700 bg-green-50/80" },
    rejeitado:    { label: "Rejeitado",    className: "border-red-500/30 text-red-700 bg-red-50/80" },
  };
  const { label, className } = map[estado] || { label: estado, className: "" };
  return (
    <Badge variant="outline" className={`px-2.5 py-0.5 font-semibold shadow-sm ${className}`}>
      {label}
    </Badge>
  );
}

function EventoDisponivelCard({
  evento,
  onInscrever,
  inscrevendo,
}: {
  evento: EventoDisponivel;
  onInscrever: (id: string) => void;
  inscrevendo: boolean;
}) {
  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border-border/60 bg-card/50">
      <CardHeader className="pb-3 gap-4 space-y-0">
        <div className="flex items-center justify-between">
          <EstadoBadge estado={evento.estado} />
          {/* Avatar e Nome do Responsável */}
          <div className="flex items-center gap-2" title="Responsável pelo evento">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary uppercase ring-1 ring-primary/20">
              {evento.nome_dono ? evento.nome_dono.charAt(0) : <User className="h-3 w-3" />}
            </div>
            <span className="text-xs font-medium text-muted-foreground truncate max-w-[120px]">
              {evento.nome_dono}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pb-5">
        {/* Usando a descrição como "Título" dado que não há campo título */}
        <p className="text-base font-semibold leading-relaxed text-foreground line-clamp-3">
          {evento.descricao}
        </p>

        {(evento.data_inicio || evento.data_fim) && (
          <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-muted/30 p-2.5 text-sm font-medium text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary/80 shrink-0" />
            <div className="flex flex-wrap items-center gap-1 leading-none">
              {evento.data_inicio && <span>{new Date(evento.data_inicio).toLocaleDateString("pt-AO")}</span>}
              {evento.data_fim && (
                <>
                  <span className="text-muted-foreground/50 mx-1">—</span>
                  <span>{new Date(evento.data_fim).toLocaleDateString("pt-AO")}</span>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="mt-auto border-t bg-muted/10 pt-4">
        {evento.ja_inscrito ? (
          <Badge variant="outline" className="w-full justify-center py-2 text-sm border-primary/30 text-primary bg-primary/5 shadow-sm">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Já inscrito
          </Badge>
        ) : (
          <Button
            size="default"
            className="w-full font-medium shadow-sm transition-all hover:shadow-md"
            onClick={() => onInscrever(evento.id)}
            disabled={inscrevendo}
          >
            {inscrevendo ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A candidatar...
              </>
            ) : (
              "Candidatar-se"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function InscricaoCard({
  inscricao,
  onAbrirChat,
  onEnviarProposta,
}: {
  inscricao: Inscricao;
  onAbrirChat: (insc: Inscricao) => void;
  onEnviarProposta: (id: string) => void;
}) {
  const { evento, estado, proposta } = inscricao;
  const podeConversar = estado === "pendente" || estado === "aceite";

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border-border/60 bg-card/50">
      <CardHeader className="pb-3 gap-4 space-y-0">
        <div className="flex items-center justify-between">
          <EstadoBadge estado={estado} />
          
          <div className="flex items-center gap-2">
            {/* Avatar do Cliente */}
            <div className="flex items-center gap-2 mr-1" title="Cliente">
              <span className="text-xs font-medium text-muted-foreground hidden sm:inline-block truncate max-w-[100px]">
                {evento.nome_dono}
              </span>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground uppercase ring-1 ring-border">
                {evento.nome_dono ? evento.nome_dono.charAt(0) : <User className="h-3 w-3" />}
              </div>
            </div>

            {podeConversar && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full shadow-sm transition-colors hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                onClick={() => onAbrirChat(inscricao)}
                title="Conversar com o cliente"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pb-5">
        <p className="text-base font-semibold leading-relaxed text-foreground line-clamp-3">
          {evento.descricao}
        </p>
        
        {(evento.data_inicio || evento.data_fim) && (
          <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-muted/30 p-2.5 text-sm font-medium text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary/80 shrink-0" />
            <div className="flex flex-wrap items-center gap-1 leading-none">
              {evento.data_inicio && <span>{new Date(evento.data_inicio).toLocaleDateString("pt-AO")}</span>}
              {evento.data_fim && (
                <>
                  <span className="text-muted-foreground/50 mx-1">—</span>
                  <span>{new Date(evento.data_fim).toLocaleDateString("pt-AO")}</span>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="mt-auto border-t bg-muted/10 pt-4 flex-col items-stretch gap-2">
        {estado === "aceite" && !proposta && (
          <Button
            variant="default"
            size="default"
            className="w-full shadow-sm transition-all hover:shadow-md"
            onClick={() => onEnviarProposta(inscricao.id)}
          >
            <FileText className="mr-2 h-4 w-4" />
            Enviar Proposta
          </Button>
        )}
        
        {proposta && (
          <Badge variant="outline" className="w-full justify-center py-2 text-sm border-yellow-500/30 text-yellow-700 bg-yellow-50/50 shadow-sm">
            <CheckCircle2 className="mr-2 h-4 w-4 text-yellow-600" /> 
            Proposta enviada
          </Badge>
        )}
        
        {estado === "rejeitado" && (
          <div className="w-full rounded-md bg-destructive/10 py-2 text-center text-xs font-medium text-destructive">
            Candidatura não seleccionada
          </div>
        )}
        
        {estado === "pendente" && !proposta && (
          <div className="w-full rounded-md border border-border/50 bg-background py-2 text-center text-xs font-medium text-muted-foreground shadow-sm">
            A aguardar decisão do cliente
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

function ModalProposta({
  open,
  onClose,
  proposta,
  setProposta,
  onSubmit,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  proposta: { valor: string; prazo_dias: string; mensagem: string };
  setProposta: (p: { valor: string; prazo_dias: string; mensagem: string }) => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Enviar Proposta</DialogTitle>
          <DialogDescription>
            Apresente a sua proposta de valor e prazo para este projecto.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor" className="font-semibold">Valor (Kz)</Label>
              <Input
                id="valor"
                type="number"
                placeholder="Ex: 150000"
                value={proposta.valor}
                onChange={(e) => setProposta({ ...proposta, valor: e.target.value })}
                className="transition-colors focus-visible:ring-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prazo" className="font-semibold">Prazo (dias)</Label>
              <Input
                id="prazo"
                type="number"
                placeholder="Ex: 30"
                value={proposta.prazo_dias}
                onChange={(e) => setProposta({ ...proposta, prazo_dias: e.target.value })}
                className="transition-colors focus-visible:ring-primary/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mensagem" className="font-semibold">Mensagem</Label>
            <Textarea
              id="mensagem"
              rows={5}
              placeholder="Descreva a sua abordagem para este projecto e justifique a sua proposta..."
              value={proposta.mensagem}
              onChange={(e) => setProposta({ ...proposta, mensagem: e.target.value })}
              className="resize-none transition-colors focus-visible:ring-primary/50"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2 sm:space-x-0">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={loading} className="w-full sm:w-auto shadow-sm">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "A enviar..." : "Enviar Proposta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────

export default function EventosArquitecto() {
  const { CarregarEventosDisponiveis, CarregarMinhasInscricoes, InscreverEvento, EnviarProposta } = useAuth() as any;
  const router = useRouter();

  const [eventos, setEventos] = useState<EventoDisponivel[]>([]);
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [tab, setTab] = useState<"disponiveis" | "inscricoes">("disponiveis");

  const [modalAberto, setModalAberto] = useState(false);
  const [inscricaoSelecionada, setInscricaoSelecionada] = useState<string | null>(null);
  const [proposta, setProposta] = useState({ valor: "", prazo_dias: "", mensagem: "" });
  const [enviandoProposta, setEnviandoProposta] = useState(false);
  const [inscrevendo, setInscrevendo] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setPageLoading(true);
    const [evs, insc] = await Promise.all([
      CarregarEventosDisponiveis(),
      CarregarMinhasInscricoes(),
    ]);
    setEventos(evs || []);
    setInscricoes(insc || []);
    setPageLoading(false);
  }

  async function handleInscrever(idevento: string) {
    setInscrevendo(idevento);
    const res = await InscreverEvento(idevento);
    if (res?.erro) {
      await carregarDados();
      setInscrevendo(null);
      return;
    }
    await carregarDados();
    setInscrevendo(null);
  }

  async function handleEnviarProposta() {
    if (!inscricaoSelecionada) return;
    setEnviandoProposta(true);
    try {
      await EnviarProposta({
        id_inscricao: inscricaoSelecionada,
        valor: Number(proposta.valor),
        prazo_dias: Number(proposta.prazo_dias),
        mensagem: proposta.mensagem,
      });
      setModalAberto(false);
      setProposta({ valor: "", prazo_dias: "", mensagem: "" });
      await carregarDados();
    } finally {
      setEnviandoProposta(false);
    }
  }

  function abrirChat(insc: Inscricao) {
    router.push(
      `/Develop/dashboard/chat/${insc.evento.id_dono}?nome=${encodeURIComponent(
        insc.evento.nome_dono
      )}&evento=${insc.evento.id}`
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 p-6 md:p-8 max-w-7xl mx-auto w-full">
        {/* Cabeçalho e Voltar */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push("/Develop/dashboard")}
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Voltar
            </Button>
          </div>

          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Eventos</h1>
            <p className="text-base text-muted-foreground">
              Encontre projectos disponíveis e acompanhe as suas candidaturas.
            </p>
          </div>
        </div>

        {/* Tabs - Estilo Pill (Segmented Control) */}
        <div className="inline-flex h-12 items-center justify-start rounded-xl bg-muted/50 p-1 text-muted-foreground w-fit border border-border/50">
          <button
            onClick={() => setTab("disponiveis")}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
              tab === "disponiveis"
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                : "hover:text-foreground hover:bg-muted/80"
            }`}
          >
            Disponíveis
            {eventos.length > 0 && (
              <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${tab === "disponiveis" ? "bg-primary/10 text-primary" : "bg-muted-foreground/10 text-muted-foreground"}`}>
                {eventos.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("inscricoes")}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
              tab === "inscricoes"
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                : "hover:text-foreground hover:bg-muted/80"
            }`}
          >
            Minhas Inscrições
            {inscricoes.length > 0 && (
              <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${tab === "inscricoes" ? "bg-primary/10 text-primary" : "bg-muted-foreground/10 text-muted-foreground"}`}>
                {inscricoes.length}
              </span>
            )}
          </button>
        </div>

        {/* Área de Conteúdo */}
        <div className="min-h-[400px]">
          {pageLoading ? (
            <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary/50 mb-4" />
              <p className="text-sm font-medium animate-pulse">A carregar informações...</p>
            </div>
          ) : tab === "disponiveis" ? (
            eventos.length === 0 ? (
              <Card className="border border-border/50 shadow-sm bg-card/40 rounded-2xl overflow-hidden mt-2">
                <CardContent className="flex flex-col items-center justify-center py-24 sm:py-32 px-4 text-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mb-6 shadow-inner ring-8 ring-primary/5">
                    <Calendar className="h-10 w-10 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-foreground mb-3">Nenhum evento disponível</h3>
                  <p className="max-w-md text-base text-muted-foreground leading-relaxed">
                    De momento não há projectos abertos para candidatura. Volte mais tarde para encontrar novas oportunidades.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {eventos.map((ev) => (
                  <EventoDisponivelCard
                    key={ev.id}
                    evento={ev}
                    onInscrever={handleInscrever}
                    inscrevendo={inscrevendo === ev.id}
                  />
                ))}
              </div>
            )
          ) : inscricoes.length === 0 ? (
            <Card className="border border-border/50 shadow-sm bg-card/40 rounded-2xl overflow-hidden mt-2">
              <CardContent className="flex flex-col items-center justify-center py-24 sm:py-32 px-4 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mb-6 shadow-inner ring-8 ring-primary/5">
                  <FileText className="h-10 w-10 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-foreground mb-3">Ainda não tem inscrições</h3>
                <p className="max-w-md text-base text-muted-foreground leading-relaxed">
                  Não se candidatou a nenhum projecto ainda. Navegue pelos eventos disponíveis e dê o primeiro passo.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {inscricoes.map((insc) => (
                <InscricaoCard
                  key={insc.id}
                  inscricao={insc}
                  onAbrirChat={abrirChat}
                  onEnviarProposta={(id) => {
                    setInscricaoSelecionada(id);
                    setModalAberto(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ModalProposta
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        proposta={proposta}
        setProposta={setProposta}
        onSubmit={handleEnviarProposta}
        loading={enviandoProposta}
      />
    </DashboardLayout>
  );
}