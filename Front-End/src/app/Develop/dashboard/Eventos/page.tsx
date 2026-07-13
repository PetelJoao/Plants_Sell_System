"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/Context/AuthContext";
import DashboardLayout from "@/app/Develop/dashboard/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { ArrowLeft, Calendar, Plus } from "lucide-react"

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
  const map: Record<string, { label: string; className: string }> = {
    aberto:       { label: "Aberto",       className: "border-green-500 text-green-600 bg-green-50" },
    em_andamento: { label: "Em andamento", className: "border-yellow-500 text-yellow-700 bg-yellow-50" },
    finalizado:   { label: "Finalizado",   className: "border-muted-foreground/30 text-muted-foreground bg-muted" },
  };
  const { label, className } = map[estado] || { label: estado, className: "" };
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

function EventoCard({ evento, onClick }: { evento: Evento; onClick: (id: string) => void }) {
  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => onClick(evento.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <EstadoBadge estado={evento.estado} />
          <span className="text-xs text-muted-foreground">
            {evento.total_inscricoes} inscrição(ões)
          </span>
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
        <span className="text-xs text-muted-foreground">
          Criado em {new Date(evento.criado_em).toLocaleDateString("pt-AO")}
        </span>
      </CardFooter>
    </Card>
  );
}

function ModalCriarEvento({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (novo: Evento) => void;
}) {
  const { CriarEvento } = useAuth() as any;

  const [form, setForm]       = useState({ descricao: "", data_inicio: "", data_fim: "" });
  const [loading, setLoading] = useState(false);
  const [erro, setErro]       = useState("");

  const handleSubmit = async () => {
    if (!form.descricao.trim()) {
      setErro("A descrição é obrigatória.");
      return;
    }
    setLoading(true);
    setErro("");
    try {
      const novo = await CriarEvento({
        descricao:   form.descricao,
        data_inicio: form.data_inicio,
        data_fim:    form.data_fim,
      });
      onCreated(novo);
      setForm({ descricao: "", data_inicio: "", data_fim: "" });
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Evento</DialogTitle>
          <DialogDescription>
            Descreva o seu projecto para que os arquitectos possam enviar propostas.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição do Projecto *</Label>
            <Textarea
              id="descricao"
              rows={4}
              placeholder="Descreva o seu projecto com o máximo de detalhes possível..."
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_inicio">Data de Início</Label>
              <Input
                id="data_inicio"
                type="datetime-local"
                value={form.data_inicio}
                onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_fim">Data de Conclusão</Label>
              <Input
                id="data_fim"
                type="datetime-local"
                value={form.data_fim}
                onChange={(e) => setForm({ ...form, data_fim: e.target.value })}
              />
            </div>
          </div>

          {erro && (
            <p className="rounded-md border-l-2 border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {erro}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "A criar..." : "Criar Evento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Page() {
  const router = useRouter();
  const { CarregarEventos } = useAuth() as any;

  const [eventos, setEventos]         = useState<Evento[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [showModal, setShowModal]     = useState(false);

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
    <DashboardLayout>
      <div className="mx-auto w-full max-w-7xl flex flex-col gap-6 p-6 md:p-8">
        
        {/* Header e Ações Globais */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push("/Develop/dashboard")}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Voltar
          </Button>
          {eventos.length > 0 && (
            <Button 
              size="sm" 
              onClick={() => setShowModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Novo Evento
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Meus Eventos</h1>
          <p className="text-muted-foreground">Gerencie os seus projectos e escolha o arquitecto ideal.</p>
        </div>

        {pageLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
            A carregar eventos...
          </div>
        ) : eventos.length === 0 ? (
          
          /* Empty State Redesenhado */
          <div className="mt-4 mx-auto flex w-full max-w-3xl flex-col items-center justify-center rounded-2xl border border-muted bg-card/50 px-6 py-24 shadow-sm transition-all hover:shadow-md">
            
            {/* Ilustração Circular */}
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 ring-8 ring-primary/5">
              <Calendar className="h-10 w-10 text-primary" />
            </div>
            
            {/* Tipografia e Textos de Apoio */}
            <div className="mb-8 space-y-3 text-center">
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                Ainda não tem eventos
              </h3>
              <p className="mx-auto max-w-md text-base text-muted-foreground leading-relaxed">
                Crie o seu primeiro evento detalhando o seu projecto. Comece a receber e avaliar propostas de arquitectos qualificados directamente na plataforma.
              </p>
            </div>
            
            {/* CTA Integrado */}
            <Button 
              size="lg" 
              onClick={() => setShowModal(true)}
              className="h-12 rounded-full px-8 text-base font-medium shadow-sm transition-all hover:scale-105 hover:shadow-md"
            >
              <Plus className="mr-2 h-5 w-5" />
              Criar o meu primeiro evento
            </Button>

          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <ModalCriarEvento
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={handleCreated}
      />
    </DashboardLayout>
  );
}