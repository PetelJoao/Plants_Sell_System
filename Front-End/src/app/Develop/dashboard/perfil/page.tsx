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
import { useEffect, useRef, useState } from "react"

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

interface PerfilCompleto {
  telefone:     string | null
  foto_pessoal: string | null   // universal — vem da tabela certa conforme o role
}

// ── Constants ─────────────────────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

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

async function fetchPerfilCompleto(token: string): Promise<PerfilCompleto> {
  try {
    const res = await fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return { telefone: null, foto_pessoal: null }
    return await res.json()
  } catch {
    return { telefone: null, foto_pessoal: null }
  }
}

async function updatePerfilGeral(
  token: string,
  payload: { nome?: string; telefone?: string },
): Promise<{ ok: boolean; detail?: string }> {
  try {
    const res = await fetch(`${API}/api/auth/me`, {
      method:  "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    })
    const data = await res.json()
    return res.ok ? { ok: true } : { ok: false, detail: data.detail }
  } catch {
    return { ok: false, detail: "Erro de ligação" }
  }
}

async function uploadFoto(token: string, file: File): Promise<{ ok: boolean; url?: string; detail?: string }> {
  try {
    const form = new FormData()
    form.append("foto", file)
    const res = await fetch(`${API}/api/auth/me/foto`, {
      method:  "POST",
      headers: { Authorization: `Bearer ${token}` },
      body:    form,
    })
    const data = await res.json()
    if (!res.ok) return { ok: false, detail: data.detail ?? "Erro ao enviar foto." }
    return { ok: true, url: data.foto_url }
  } catch {
    return { ok: false, detail: "Erro de ligação" }
  }
}

async function fetchArquitetoPerfil(token: string): Promise<ArquitetoPerfil | null> {
  try {
    const res = await fetch(`${API}/api/auth/me/arquiteto`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function updateArquitetoPerfil(
  token: string,
  payload: Record<string, unknown>,
): Promise<{ ok: boolean; detail?: string }> {
  try {
    const res = await fetch(`${API}/api/auth/me/arquiteto`, {
      method:  "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    })
    const data = await res.json()
    return res.ok ? { ok: true } : { ok: false, detail: data.detail }
  } catch {
    return { ok: false, detail: "Erro de ligação" }
  }
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

    const token = localStorage.getItem("token")
    if (!token) { setUploading(false); return }

    const result = await uploadFoto(token, file)
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

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar className="w-24 h-24">
          <AvatarImage src={preview ?? undefined} alt="Foto de perfil" />
          <AvatarFallback className="text-2xl font-semibold">
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
            <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
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
          >
            {uploading ? "A enviar…" : "Alterar foto"}
          </Button>
          {preview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              disabled={uploading}
              onClick={async () => {
                const token = localStorage.getItem("token")
                if (!token) return
                setUploading(true)
                // envia null para remover a foto
                await fetch(`${API}/api/auth/me/foto`, {
                  method:  "DELETE",
                  headers: { Authorization: `Bearer ${token}` },
                })
                setPreview(null)
                onFotoAtualizada("")
                setUploading(false)
                setFeedback({ type: "success", msg: "Foto removida." })
              }}
            >
              Remover
            </Button>
          )}
        </div>
        {feedback && (
          <p className={`text-xs ${feedback.type === "success" ? "text-green-600" : "text-destructive"}`}>
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
  )
}

// ── Componente estrelas (read-only) ────────────────────────────────────────────

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= value ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground fill-none"}`}
          viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
      ))}
      <span className="text-sm text-muted-foreground ml-1">({value}/5)</span>
    </div>
  )
}

// ── Aba Geral ─────────────────────────────────────────────────────────────────

function TabGeral({ user, loadingUser }: { user: any; loadingUser: boolean }) {
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
    const token = localStorage.getItem("token")
    if (!token) return
    fetchPerfilCompleto(token).then((d) => {
      if (d.telefone)    setTelefone(d.telefone)
      if (d.foto_pessoal) setFotoUrl(d.foto_pessoal)
    })
  }, [loadingUser, user])

  const handleSave = async () => {
    const token = localStorage.getItem("token")
    if (!token) return
    setSaving(true)
    setFeedback(null)

    const nomeCompleto = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ")
    const result = await updatePerfilGeral(token, {
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
    <Card>
      <CardHeader>
        <CardTitle>Informação Pessoal</CardTitle>
        <CardDescription>Atualize as suas informações pessoais e detalhes de contacto.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* ── Foto de perfil ── */}
        <FotoPerfilEditor
          fotoUrl={fotoUrl}
          nome={user?.nome ?? ""}
          onFotoAtualizada={(url) => setFotoUrl(url || null)}
        />

        <Separator />

        {/* ── Nome ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first-name">Primeiro Nome</Label>
            <Input id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Último Nome</Label>
            <Input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>

        {/* ── Email (read-only) ── */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email" type="email" value={user?.email ?? ""} readOnly
            className="bg-muted cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground">O email não pode ser alterado aqui.</p>
        </div>

        {/* ── Telefone ── */}
        <div className="space-y-2">
          <Label htmlFor="phone">
            Número de Telefone
            {!telefone && <span className="ml-2 text-xs text-muted-foreground">(não adicionado)</span>}
          </Label>
          <Input
            id="phone" type="tel" value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder={!telefone ? "Adicione um número de telefone…" : ""}
          />
        </div>

      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3">
        {feedback && (
          <p className={`text-sm ${feedback.type === "success" ? "text-green-600" : "text-destructive"}`}>
            {feedback.msg}
          </p>
        )}
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "A salvar…" : "Salvar Mudanças"}
        </Button>
      </CardFooter>
    </Card>
  )
}

// ── Aba Profissional (só arquitetos) ──────────────────────────────────────────

function TabProfissional() {
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
    const token = localStorage.getItem("token")
    if (!token) { setLoading(false); return }
    fetchArquitetoPerfil(token).then((data) => {
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
    const token = localStorage.getItem("token")
    if (!token) return
    setSaving(true)
    setFeedback(null)

    const result = await updateArquitetoPerfil(token, {
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
    <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
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
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral</CardTitle>
          <CardDescription>Resumo do seu perfil profissional visível aos clientes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Avaliação</p>
              <StarRating value={perfil.avaliacao} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Saldo Disponível</p>
              <p className="text-2xl font-bold">
                {(perfil.saldo_disponivel ?? 0).toLocaleString("pt-AO", {
                  style: "currency", currency: "AOA",
                })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Estado</p>
              <Badge variant="outline" className="text-green-600 border-green-600">Activo</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Informações editáveis ── */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Profissionais</CardTitle>
          <CardDescription>Dados profissionais visíveis no seu perfil público e usados em transações.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nif">NIF</Label>
              <Input id="nif" value={nif} onChange={(e) => setNif(e.target.value)}
                placeholder="Ex: 5000123456LA041" maxLength={15} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cedula">Cédula Profissional</Label>
              <Input id="cedula" value={cedula} onChange={(e) => setCedula(e.target.value)}
                placeholder="Número de cédula" maxLength={45} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="compania">Compania (Opcional)</Label>
            <Input id="compania" value={compania} onChange={(e) => setCompania(e.target.value)}
              placeholder="Nome da empresa ou atelier" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="iban">IBAN</Label>
            <Input id="iban" value={iban} onChange={(e) => setIban(e.target.value)}
              placeholder="Ex: AO06 0040 0000 1234 5678 1014 5" />
            <p className="text-xs text-muted-foreground">Usado para receber saques da plataforma.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco-prof">Endereço Profissional</Label>
            <Input id="endereco-prof" value={endereco} onChange={(e) => setEndereco(e.target.value)}
              placeholder="Rua, número, cidade" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio-prof">Biografia Profissional</Label>
            <Textarea id="bio-prof" value={bio} onChange={(e) => setBio(e.target.value)}
              placeholder="Descreva a sua experiência, especialidades e projectos relevantes…"
              className="min-h-[120px]" />
            <p className="text-xs text-muted-foreground">
              Esta biografia é exibida publicamente no seu perfil de arquitecto.
            </p>
          </div>

        </CardContent>
        <CardFooter className="flex flex-col items-start gap-3">
          {feedback && (
            <p className={`text-sm ${feedback.type === "success" ? "text-green-600" : "text-destructive"}`}>
              {feedback.msg}
            </p>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "A salvar…" : "Salvar Informações Profissionais"}
          </Button>
        </CardFooter>
      </Card>

      {/* ── Dados financeiros read-only ── */}
      <Card>
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
                className="bg-muted cursor-not-allowed" />
            </div>
            <div className="space-y-2">
              <Label>Avaliação Média</Label>
              <Input readOnly value={`${perfil.avaliacao} / 5`} className="bg-muted cursor-not-allowed" />
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
          <TabsList className={`w-full md:w-auto grid md:inline-flex ${isArquiteto ? "grid-cols-4" : "grid-cols-3"}`}>
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="preferences">Preferências</TabsTrigger>
            {isArquiteto && <TabsTrigger value="professional">Profissional</TabsTrigger>}
          </TabsList>

          {/* ── Geral ── */}
          <TabsContent value="general" className="space-y-6 mt-6">
            <TabGeral user={user} loadingUser={loading} />
          </TabsContent>

          {/* ── Segurança ── */}
          <TabsContent value="security" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Palavra-Passe</CardTitle>
                <CardDescription>Altere a sua palavra-passe ou ative a autenticação de dois fatores.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Palavra-Passe Atual</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Palavra-Passe</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Palavra-Passe</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Atualizar Palavra-Passe</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* ── Preferências ── */}
          <TabsContent value="preferences" className="space-y-6 mt-6">
            <Card>
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
              <CardFooter>
                <Button>Salvar Preferências</Button>
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