"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import DashboardLayout from "@/app/Develop/dashboard/components/dashboard-layout"
import { useAuth } from "@/Context/AuthContext"
import { SetStateAction, useEffect, useRef, useState } from "react"
import {
  Camera,
  Trash2,
  Loader2,
  Lock,
  CheckCircle2,
  XCircle,
  Building2,
  Wallet,
  Star,
} from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────────────────

interface ArquitetoPerfil {
  endereco:            string | null
  foto_pessoal:        string | null
  cedula_profissional: string | null
  bio:                 string | null
  nif:                 string | null
  avaliacao:           number
  saldo_disponivel:    number | null
  IBAN:                string | null
  compania:            string | null
}

// ── Constants ─────────────────────────────────────────────────────────────────

// Shared input styling so every field in the page reads as one design system
const inputClass =
  "rounded-lg border-border transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/60"

// ── Helpers ────────────────────────────────────────────────────────────────────

function splitNome(nome: string): { primeiro: string; ultimo: string } {
  const idx = nome.indexOf(" ")
  if (idx === -1) return { primeiro: nome, ultimo: "" }
  return { primeiro: nome.slice(0, idx), ultimo: nome.slice(idx + 1) }
}

function getInitials(nome: string): string {
  const parts = nome.trim().split(" ").filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// ── Componente: Alterador de foto ─────────────────────────────────────────────

function FotoPerfilEditor({
  fotoUrl,
  nome,
  onFotoAtualizada,
}: {
  fotoUrl:          string | null
  nome:             string
  onFotoAtualizada: (url: string) => void
}) {
  const { UploadFotoPerfil, RemoverFotoPerfil } = useAuth() as any

  const inputRef               = useRef<HTMLInputElement>(null)
  const [preview, setPreview]  = useState<string | null>(fotoUrl)
  const [uploading, setUploading] = useState(false)
  const [feedback, setFeedback]   = useState<{ type: "success" | "error"; msg: string } | null>(null)

  // actualiza preview se a URL externa mudar
  useEffect(() => { setPreview(fotoUrl) }, [fotoUrl])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // preview imediato
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    setFeedback(null)
    setUploading(true)

    const result = await UploadFotoPerfil(file)
    setUploading(false)

    if (result.ok && result.url) {
      onFotoAtualizada(result.url)
      setFeedback({ type: "success", msg: "Foto de perfil atualizada com sucesso." })
    } else {
      // reverte preview em caso de erro
      setPreview(fotoUrl)
      setFeedback({ type: "error", msg: result.detail ?? "Erro ao atualizar foto." })
    }

    // limpa o input para permitir re-selecionar o mesmo ficheiro
    e.target.value = ""
  }

  const handleRemove = async () => {
    setUploading(true)
    const result = await RemoverFotoPerfil()
    setUploading(false)

    if (result.ok) {
      setPreview(null)
      onFotoAtualizada("")
      setFeedback({ type: "success", msg: "Foto removida." })
    } else {
      setFeedback({ type: "error", msg: result.detail ?? "Erro ao remover foto." })
    }
  }

  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <div className="relative shrink-0">
          <Avatar className="w-24 h-24 ring-4 ring-primary/15 ring-offset-2 ring-offset-background">
            <AvatarImage src={preview ?? undefined} alt="Foto de perfil" />
            <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
              {getInitials(nome)}
            </AvatarFallback>
          </Avatar>

          {/* Overlay de upload no hover */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
            title="Alterar foto"
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <Camera className="w-6 h-6 text-white" />
            )}
          </button>
        </div>

        {/* Texto + botão explícito */}
        <div className="flex flex-col justify-center gap-3 text-center sm:text-left">
          <div>
            <p className="font-medium text-sm">Foto de Perfil</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              JPG, PNG ou WEBP · máx. 5 MB
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="gap-2"
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
              {uploading ? "A enviar…" : "Alterar foto"}
            </Button>
            {preview && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={uploading}
                onClick={handleRemove}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remover
              </Button>
            )}
          </div>
          {feedback && (
            <p className={`flex items-center gap-1.5 text-xs ${feedback.type === "success" ? "text-emerald-600" : "text-destructive"}`}>
              {feedback.type === "success" ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}
              {feedback.msg}
            </p>
          )}
        </div>

        {/* Input oculto */}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}

// ── Componente estrelas (read-only) ────────────────────────────────────────────

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 ${star <= value ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground fill-none"}`}
          strokeWidth={1.5}
        />
      ))}
      <span className="text-sm text-muted-foreground ml-1">({value}/5)</span>
    </div>
  )
}

// ── Aba Geral ─────────────────────────────────────────────────────────────────

function TabGeral({ user, loadingUser }: { user: any; loadingUser: boolean }) {
  const { CarregarPerfilCompleto, AtualizarPerfilGeral } = useAuth() as any

  const [firstName,  setFirstName]  = useState("")
  const [lastName,   setLastName]   = useState("")
  const [telefone,   setTelefone]   = useState("")
  const [fotoUrl,    setFotoUrl]    = useState<string | null>(null)
  const [saving,     setSaving]     = useState(false)
  const [feedback,   setFeedback]   = useState<{ type: "success" | "error"; msg: string } | null>(null)

  useEffect(() => {
    if (loadingUser || !user) return
    const n = splitNome(user.nome ?? "")
    setFirstName(n.primeiro)
    setLastName(n.ultimo)

    // busca telefone e foto do endpoint /me
    CarregarPerfilCompleto().then((d: any /*depois definir uma interface propria  */) => {
      if (d.telefone)    setTelefone(d.telefone)
      if (d.foto_pessoal) setFotoUrl(d.foto_pessoal)
    })
  }, [loadingUser, user])

  const handleSave = async () => {
    setSaving(true)
    setFeedback(null)

    const nomeCompleto = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ")
    const result = await AtualizarPerfilGeral({
      nome:     nomeCompleto || undefined,
      telefone: telefone     || undefined,
    })

    setSaving(false)
    setFeedback(
      result.ok
        ? { type: "success", msg: "Informações pessoais atualizadas com sucesso." }
        : { type: "error",   msg: result.detail ?? "Erro ao salvar." }
    )
  }

  if (loadingUser) return null

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle>Informação Pessoal</CardTitle>
        <CardDescription>Atualize as suas informações pessoais e detalhes de contacto.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">

        {/* ── Foto de perfil ── */}
        <FotoPerfilEditor
          fotoUrl={fotoUrl}
          nome={user?.nome ?? ""}
          onFotoAtualizada={(url) => setFotoUrl(url || null)}
        />

        <Separator />

        <div className="space-y-6">
          <p className="text-sm font-medium text-foreground/80">Dados de contacto</p>

          {/* ── Nome ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">Primeiro Nome</Label>
              <Input id="first-name" className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Último Nome</Label>
              <Input id="last-name" className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          {/* ── Email (read-only) ── */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email" type="email" value={user?.email ?? ""} readOnly
                className={`${inputClass} bg-muted/60 text-muted-foreground cursor-not-allowed pr-9`}
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">O email não pode ser alterado aqui.</p>
          </div>

          {/* ── Telefone ── */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Número de Telefone
              {!telefone && <span className="ml-2 text-xs text-muted-foreground">(não adicionado)</span>}
            </Label>
            <Input
              id="phone" type="tel" value={telefone} className={inputClass}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder={!telefone ? "Adicione um número de telefone…" : ""}
            />
          </div>
        </div>

      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 border-t border-border/60 pt-6">
        {feedback && (
          <p className={`flex items-center gap-1.5 text-sm ${feedback.type === "success" ? "text-emerald-600" : "text-destructive"}`}>
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {feedback.msg}
          </p>
        )}
        <Button onClick={handleSave} disabled={saving} className="gap-2 shadow-sm min-w-[160px]">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "A salvar…" : "Salvar Mudanças"}
        </Button>
      </CardFooter>
    </Card>
  )
}

// ── Aba Profissional (só arquitetos) ──────────────────────────────────────────

function TabProfissional() {
  const { CarregarPerfilArquiteto, AtualizarPerfilArquiteto } = useAuth() as any

  const [perfil,   setPerfil]   = useState<ArquitetoPerfil | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null)

  const [endereco, setEndereco] = useState("")
  const [bio,      setBio]      = useState("")
  const [nif,      setNif]      = useState("")
  const [cedula,   setCedula]   = useState("")
  const [iban,     setIban]     = useState("")
  const [compania, setCompania] = useState("")

  useEffect(() => {
    CarregarPerfilArquiteto().then((data: any/*depois definir uma interface propria  */) => {
      if (data) {
        setPerfil(data)
        setEndereco(data.endereco            ?? "")
        setBio(data.bio                      ?? "")
        setNif(data.nif                      ?? "")
        setCedula(data.cedula_profissional    ?? "")
        setIban(data.IBAN                    ?? "")
        setCompania(data.compania            ?? "")
      }
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setFeedback(null)

    const result = await AtualizarPerfilArquiteto({
      endereco, bio, nif,
      cedula_profissional: cedula,
      IBAN: iban, compania,
    })

    setSaving(false)
    if (result.ok) {
      setPerfil((prev) =>
        prev ? { ...prev, endereco, bio, nif, cedula_profissional: cedula, IBAN: iban, compania } : prev
      )
      setFeedback({ type: "success", msg: "Perfil profissional atualizado com sucesso." })
    } else {
      setFeedback({ type: "error", msg: result.detail ?? "Erro ao salvar." })
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground text-sm">
      <Loader2 className="h-4 w-4 animate-spin" />
      A carregar informações profissionais…
    </div>
  )

  if (!perfil) return (
    <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
      Não foi possível carregar o perfil profissional.
    </div>
  )

  return (
    <div className="space-y-6">

      {/* ── Visão Geral ── */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle>Visão Geral</CardTitle>
          <CardDescription>Resumo do seu perfil profissional visível aos clientes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 rounded-lg border border-border/60 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-50 dark:bg-yellow-950 shrink-0">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-muted-foreground">Avaliação</p>
                <StarRating value={perfil.avaliacao} />
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border/60 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950 shrink-0">
                <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-muted-foreground">Saldo Disponível</p>
                <p className="text-xl font-bold leading-tight">
                  {(perfil.saldo_disponivel ?? 0).toLocaleString("pt-AO", {
                    style: "currency", currency: "AOA",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border/60 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-muted-foreground">Estado</p>
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
                  Activo
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Informações editáveis ── */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle>Informações Profissionais</CardTitle>
          <CardDescription>Dados profissionais visíveis no seu perfil público e usados em transações.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nif">NIF</Label>
              <Input id="nif" className={inputClass} value={nif} onChange={(e) => setNif(e.target.value)}
                placeholder="Ex: 5000123456LA041" maxLength={15} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cedula">Cédula Profissional</Label>
              <Input id="cedula" className={inputClass} value={cedula} onChange={(e) => setCedula(e.target.value)}
                placeholder="Número de cédula" maxLength={45} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="compania">Compania (Opcional)</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="compania" className={`${inputClass} pl-9`} value={compania} onChange={(e) => setCompania(e.target.value)}
                placeholder="Nome da empresa ou atelier" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="iban">IBAN</Label>
            <Input id="iban" className={inputClass} value={iban} onChange={(e) => setIban(e.target.value)}
              placeholder="Ex: AO06 0040 0000 1234 5678 1014 5" />
            <p className="text-xs text-muted-foreground">Usado para receber saques da plataforma.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco-prof">Endereço Profissional</Label>
            <Input id="endereco-prof" className={inputClass} value={endereco} onChange={(e) => setEndereco(e.target.value)}
              placeholder="Rua, número, cidade" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio-prof">Biografia Profissional</Label>
            <Textarea id="bio-prof" className={`${inputClass} min-h-[120px]`} value={bio} onChange={(e) => setBio(e.target.value)}
              placeholder="Descreva a sua experiência, especialidades e projectos relevantes…" />
            <p className="text-xs text-muted-foreground">
              Esta biografia é exibida publicamente no seu perfil de arquitecto.
            </p>
          </div>

        </CardContent>
        <CardFooter className="flex flex-col items-start gap-3 border-t border-border/60 pt-6">
          {feedback && (
            <p className={`flex items-center gap-1.5 text-sm ${feedback.type === "success" ? "text-emerald-600" : "text-destructive"}`}>
              {feedback.type === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              {feedback.msg}
            </p>
          )}
          <Button onClick={handleSave} disabled={saving} className="gap-2 shadow-sm min-w-[220px]">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "A salvar…" : "Salvar Informações Profissionais"}
          </Button>
        </CardFooter>
      </Card>

      {/* ── Dados financeiros read-only ── */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle>Dados Financeiros</CardTitle>
          <CardDescription>Informações geridas pela plataforma. Para ajustes, contacte o suporte.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Saldo Disponível</Label>
              <Input readOnly
                value={(perfil.saldo_disponivel ?? 0).toLocaleString("pt-AO", {
                  style: "currency", currency: "AOA",
                })}
                className={`${inputClass} bg-muted/60 text-muted-foreground cursor-not-allowed`} />
            </div>
            <div className="space-y-2">
              <Label>Avaliação Média</Label>
              <Input readOnly value={`${perfil.avaliacao} / 5`} className={`${inputClass} bg-muted/60 text-muted-foreground cursor-not-allowed`} />
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}

// ── Página principal ───────────────────────────────────────────────────────────

export default function Perfil() {
  const { user, loading } = useAuth() as any
  const isArquiteto = user?.role === "arquiteto"

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
          <p className="text-muted-foreground">Gerencia a sua Conta, definições e Preferências.</p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList
            className={`w-full md:w-auto grid md:inline-flex gap-1 rounded-lg bg-muted p-1 ${isArquiteto ? "grid-cols-4" : "grid-cols-3"}`}
          >
            <TabsTrigger
              value="general"
              className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Geral
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Segurança
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Preferências
            </TabsTrigger>
            {isArquiteto && (
              <TabsTrigger
                value="professional"
                className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Profissional
              </TabsTrigger>
            )}
          </TabsList>

          {/* ── Geral ── */}
          <TabsContent value="general" className="space-y-6 mt-6">
            <TabGeral user={user} loadingUser={loading} />
          </TabsContent>

          {/* ── Segurança ── */}
          <TabsContent value="security" className="space-y-6 mt-6">
            <Card className="rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle>Palavra-Passe</CardTitle>
                <CardDescription>Altere a sua palavra-passe ou ative a autenticação de dois fatores.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Palavra-Passe Atual</Label>
                  <Input id="current-password" type="password" className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Palavra-Passe</Label>
                  <Input id="new-password" type="password" className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Palavra-Passe</Label>
                  <Input id="confirm-password" type="password" className={inputClass} />
                </div>
              </CardContent>
              <CardFooter className="border-t border-border/60 pt-6">
                <Button className="shadow-sm">Atualizar Palavra-Passe</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* ── Preferências ── */}
          <TabsContent value="preferences" className="space-y-6 mt-6">
            <Card className="rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>Configure como recebe atualizações e notificações.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Notificações por Email</div>
                    <div className="text-sm text-muted-foreground">Receba notificações sobre compras e conta.</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Emails de Marketing</div>
                    <div className="text-sm text-muted-foreground">Receba emails sobre produtos, funcionalidades e novidades.</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Notificações por SMS</div>
                    <div className="text-sm text-muted-foreground">Receba mensagens de texto sobre as suas compras.</div>
                  </div>
                  <Switch />
                </div>
              </CardContent>
              <CardFooter className="border-t border-border/60 pt-6">
                <Button className="shadow-sm">Salvar Preferências</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* ── Profissional ── */}
          {isArquiteto && (
            <TabsContent value="professional" className="space-y-6 mt-6">
              <TabProfissional />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  )
}