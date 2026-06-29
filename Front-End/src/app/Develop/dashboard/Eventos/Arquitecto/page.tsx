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
import { ArrowLeft, Calendar, MessageCircle, FileText, Loader2 } from "lucide-react"

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
    aberto:       { label: "Aberto",       className: "border-green-500 text-green-600 bg-green-50" },
    em_andamento: { label: "Em andamento", className: "border-yellow-500 text-yellow-700 bg-yellow-50" },
    finalizado:   { label: "Finalizado",   className: "border-muted-foreground/30 text-muted-foreground bg-muted" },
    pendente:     { label: "Pendente",     className: "border-yellow-500 text-yellow-700 bg-yellow-50" },
    aceite:       { label: "Aceite",       className: "border-green-500 text-green-600 bg-green-50" },
    rejeitado:    { label: "Rejeitado",    className: "border-red-500 text-red-600 bg-red-50" },
  };
  const { label, className } = map[estado] || { label: estado, className: "" };
  return (
    <Badge variant="outline" className={className}>
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
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <EstadoBadge estado={evento.estado} />
          <span className="text-xs text-muted-foreground">{evento.nome_dono}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        <p className="text-sm leading-relaxed line-clamp-3">{evento.descricao}</p>
        {(evento.data_inicio || evento.data_fim) && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
            <Calendar className="h-3.5 w-3.5" />
            {evento.data_inicio && new Date(evento.data_inicio).toLocaleDateString("pt-AO")}
            {evento.data_fim && <> — {new Date(evento.data_fim).toLocaleDateString("pt-AO")}</>}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-3">
        {evento.ja_inscrito ? (
          <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
            Já inscrito
          </Badge>
        ) : (
          <Button
            size="sm"
            className="w-full"
            onClick={() => onInscrever(evento.id)}
            disabled={inscrevendo}
          >
            {inscrevendo ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
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
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <EstadoBadge estado={estado} />
          {podeConversar && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => onAbrirChat(inscricao)}
              title="Conversar com o cliente"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        <p className="text-sm leading-relaxed line-clamp-3">{evento.descricao}</p>
        <p className="text-xs text-muted-foreground">Cliente: {evento.nome_dono}</p>
        {(evento.data_inicio || evento.data_fim) && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
            <Calendar className="h-3.5 w-3.5" />
            {evento.data_inicio && new Date(evento.data_inicio).toLocaleDateString("pt-AO")}
            {evento.data_fim && <> — {new Date(evento.data_fim).toLocaleDateString("pt-AO")}</>}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-3">
        {estado === "aceite" && !proposta && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onEnviarProposta(inscricao.id)}
          >
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            Enviar Proposta
          </Button>
        )}
        {proposta && (
          <Badge variant="outline" className="border-yellow-500 text-yellow-700 bg-yellow-50">
            Proposta enviada
          </Badge>
        )}
        {estado === "rejeitado" && (
          <span className="text-xs text-muted-foreground">Candidatura não seleccionada</span>
        )}
        {estado === "pendente" && !proposta && (
          <span className="text-xs text-muted-foreground">A aguardar decisão do cliente</span>
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
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Enviar Proposta</DialogTitle>
          <DialogDescription>
            Apresente a sua proposta de valor e prazo para este projecto.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (Kz)</Label>
              <Input
                id="valor"
                type="number"
                placeholder="Ex: 150000"
                value={proposta.valor}
                onChange={(e) => setProposta({ ...proposta, valor: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prazo">Prazo (dias)</Label>
              <Input
                id="prazo"
                type="number"
                placeholder="Ex: 30"
                value={proposta.prazo_dias}
                onChange={(e) => setProposta({ ...proposta, prazo_dias: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mensagem">Mensagem</Label>
            <Textarea
              id="mensagem"
              rows={4}
              placeholder="Descreva a sua abordagem para este projecto..."
              value={proposta.mensagem}
              onChange={(e) => setProposta({ ...proposta, mensagem: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={loading}>
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
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => router.push("/Develop/dashboard")}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Voltar
          </Button>
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
          <p className="text-muted-foreground">
            Encontre projectos disponíveis e acompanhe as suas candidaturas.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setTab("disponiveis")}
            className={`px-1 pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === "disponiveis"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Disponíveis
          </button>
          <button
            onClick={() => setTab("inscricoes")}
            className={`px-1 pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ml-4 ${
              tab === "inscricoes"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Minhas Inscrições
          </button>
        </div>

        {pageLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
            A carregar...
          </div>
        ) : tab === "disponiveis" ? (
          eventos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">Nenhum evento disponível</h3>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    De momento não há projectos abertos para candidatura. Volte mais tarde.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">Ainda não tem inscrições</h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Candidate-se a um projecto disponível para começar.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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