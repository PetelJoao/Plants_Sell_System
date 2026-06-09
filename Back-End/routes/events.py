from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

from middlewares.auth import get_current_user
from models.db import get_supabase_admin  # ← único import de DB necessário

events_router = APIRouter()

# ─── Schemas ────────────────────────────────────────────────────────────────

class EventoCreate(BaseModel):
    descricao: str
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    imagens: Optional[List[str]] = []

class InscricaoCreate(BaseModel):
    idevento: UUID

class PropostaCreate(BaseModel):
    id_inscricao: UUID
    valor: float
    prazo_dias: Optional[int] = None
    mensagem: Optional[str] = None

class DecisaoInscricao(BaseModel):
    estado: str  # 'aceite' ou 'rejeitado'


# ─── Cliente: Criar evento ───────────────────────────────────────────────────

@events_router.post("/", status_code=status.HTTP_201_CREATED)
async def criar_evento(evento: EventoCreate, current_user=Depends(get_current_user)):
    supabase = get_supabase_admin()

    # Verificar que é cliente
    cliente = supabase.table("cliente").select("id").eq("id", str(current_user["id"])).execute()
    if not cliente.data:
        raise HTTPException(status_code=403, detail="Apenas clientes podem criar eventos.")

    res = supabase.table("evento").insert({
        "descricao":   evento.descricao,
        "data_inicio": evento.data_inicio.isoformat() if evento.data_inicio else None,
        "data_fim":    evento.data_fim.isoformat()    if evento.data_fim    else None,
        "imagens":     evento.imagens,
        "id_dono":     str(current_user["id"]),
    }).execute()

    if not res.data:
        raise HTTPException(status_code=500, detail="Erro ao criar evento.")

    return res.data[0]


# ─── Cliente: Listar os seus eventos ────────────────────────────────────────

@events_router.get("/meus", summary="Eventos do cliente autenticado")
async def listar_meus_eventos(current_user=Depends(get_current_user)):
    supabase = get_supabase_admin()

    res = supabase.table("evento") \
        .select("*, inscricao(id)") \
        .eq("id_dono", str(current_user["id"])) \
        .order("criado_em", desc=True) \
        .execute()

    if res.data is None:
        raise HTTPException(status_code=500, detail="Erro ao carregar eventos.")

    # mapeia total_inscricoes a partir do join
    eventos = []
    for e in res.data:
        inscricoes = e.pop("inscricao", []) or []
        e["total_inscricoes"] = len(inscricoes)
        eventos.append(e)

    return eventos


# ─── Arquiteto: Listar eventos disponíveis (abertos) ────────────────────────

@events_router.get("/disponiveis", summary="Eventos abertos para inscrição")
async def listar_eventos_disponiveis(current_user=Depends(get_current_user)):
    supabase = get_supabase_admin()

    res = supabase.table("evento") \
        .select("*, cliente(usuario(nome)), inscricao(idarquiteto)") \
        .eq("estado", "aberto") \
        .order("criado_em", desc=True) \
        .execute()

    if res.data is None:
        raise HTTPException(status_code=500, detail="Erro ao carregar eventos.")

    eventos = []
    for e in res.data:
        inscricoes   = e.pop("inscricao", []) or []
        cliente_data = e.pop("cliente",   {}) or {}
        e["nome_dono"]   = cliente_data.get("usuario", {}).get("nome")
        e["ja_inscrito"] = any(
            str(i["idarquiteto"]) == str(current_user["id"]) for i in inscricoes
        )
        eventos.append(e)

    return eventos


# ─── Arquiteto: Ver as suas inscrições ──────────────────────────────────────

@events_router.get("/arquiteto/inscricoes", summary="Inscrições do arquitecto autenticado")
async def minhas_inscricoes_arquiteto(current_user=Depends(get_current_user)):
    print("USER RECEBIDO:", current_user)   # ← variável, não função

    supabase = get_supabase_admin()

    arq = supabase.table("arquiteto").select("id").eq("id", str(current_user["id"])).execute()
    if not arq.data:
        raise HTTPException(status_code=403, detail="Apenas arquitectos podem aceder a este recurso.")

    res = supabase.table("inscricao") \
        .select("*, evento(*), proposta(*)") \
        .eq("idarquiteto", str(current_user["id"])) \
        .order("dataingresso", desc=True) \
        .execute()

    return res.data or []

# ─── Detalhe de um evento ────────────────────────────────────────────────────

@events_router.get("/{evento_id}")
async def detalhe_evento(evento_id: UUID, current_user=Depends(get_current_user)):
    supabase = get_supabase_admin()

    res = supabase.table("evento") \
        .select("*, cliente(usuario(nome))") \
        .eq("id", str(evento_id)) \
        .single() \
        .execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Evento não encontrado.")

    e            = res.data
    cliente_data = e.pop("cliente", {}) or {}
    e["nome_dono"] = cliente_data.get("usuario", {}).get("nome")
    return e


# ─── Arquiteto: Inscrever-se num evento ─────────────────────────────────────

@events_router.post("/inscricao", status_code=status.HTTP_201_CREATED)
async def inscrever_em_evento(dados: InscricaoCreate, current_user=Depends(get_current_user)):
    supabase = get_supabase_admin()

    # Verificar que é arquiteto
    arq = supabase.table("arquiteto").select("id").eq("id", str(current_user["id"])).execute()
    if not arq.data:
        raise HTTPException(status_code=403, detail="Apenas arquitectos podem inscrever-se.")

    # Verificar evento aberto
    ev = supabase.table("evento").select("estado").eq("id", str(dados.idevento)).single().execute()
    if not ev.data:
        raise HTTPException(status_code=404, detail="Evento não encontrado.")
    if ev.data["estado"] != "aberto":
        raise HTTPException(status_code=400, detail="Este evento já não aceita inscrições.")

    # Verificar duplicado
    dup = supabase.table("inscricao") \
        .select("id") \
        .eq("idevento",    str(dados.idevento)) \
        .eq("idarquiteto", str(current_user["id"])) \
        .execute()
    if dup.data:
        raise HTTPException(status_code=409, detail="Já está inscrito neste evento.")

    res = supabase.table("inscricao").insert({
        "idevento":    str(dados.idevento),
        "idarquiteto": str(current_user["id"]),
    }).execute()

    if not res.data:
        raise HTTPException(status_code=500, detail="Erro ao inscrever.")

    return res.data[0]


# ─── Cliente: Ver inscrições de um evento ───────────────────────────────────

@events_router.get("/{evento_id}/inscricoes")
async def listar_inscricoes_evento(evento_id: UUID, current_user=Depends(get_current_user)):
    supabase = get_supabase_admin()

    # Confirmar que é dono
    ev = supabase.table("evento").select("id_dono").eq("id", str(evento_id)).single().execute()
    if not ev.data:
        raise HTTPException(status_code=404, detail="Evento não encontrado.")
    if str(ev.data["id_dono"]) != str(current_user["id"]):
        raise HTTPException(status_code=403, detail="Acesso negado.")

    res = supabase.table("inscricao") \
        .select("*, arquiteto(*, usuario(*)), proposta(*)") \
        .eq("idevento", str(evento_id)) \
        .order("dataingresso", desc=True) \
        .execute()

    return res.data or []


# ─── Cliente: Aceitar/Rejeitar arquitecto ───────────────────────────────────

@events_router.put("/inscricao/{inscricao_id}/decisao")
async def decidir_inscricao(
    inscricao_id: UUID,
    decisao: DecisaoInscricao,
    current_user=Depends(get_current_user),
):
    if decisao.estado not in ("aceite", "rejeitado"):
        raise HTTPException(status_code=400, detail="Use 'aceite' ou 'rejeitado'.")

    supabase = get_supabase_admin()

    # Verificar inscrição e dono do evento
    ins = supabase.table("inscricao") \
        .select("id, idarquiteto, evento(id, id_dono)") \
        .eq("id", str(inscricao_id)) \
        .single() \
        .execute()

    if not ins.data:
        raise HTTPException(status_code=404, detail="Inscrição não encontrada.")
    if str(ins.data["evento"]["id_dono"]) != str(current_user["id"]):
        raise HTTPException(status_code=403, detail="Acesso negado.")

    evento_id    = ins.data["evento"]["id"]
    idarquiteto  = ins.data["idarquiteto"]

    # Actualizar estado da inscrição
    supabase.table("inscricao").update({"estado": decisao.estado}).eq("id", str(inscricao_id)).execute()

    if decisao.estado == "aceite":
        # Evento passa a em_andamento com arquiteto atribuído
        supabase.table("evento").update({
            "estado":       "em_andamento",
            "id_arquiteto": str(idarquiteto),
        }).eq("id", str(evento_id)).execute()

        # Rejeitar restantes inscrições pendentes
        supabase.table("inscricao") \
            .update({"estado": "rejeitado"}) \
            .eq("idevento", str(evento_id)) \
            .neq("id", str(inscricao_id)) \
            .eq("estado", "pendente") \
            .execute()

    return {"message": f"Inscrição marcada como '{decisao.estado}' com sucesso."}


# ─── Arquiteto: Submeter proposta ───────────────────────────────────────────

@events_router.post("/proposta", status_code=status.HTTP_201_CREATED)
async def criar_proposta(proposta: PropostaCreate, current_user=Depends(get_current_user)):
    supabase = get_supabase_admin()

    # Verificar que a inscrição pertence ao arquiteto
    ins = supabase.table("inscricao") \
        .select("id") \
        .eq("id",          str(proposta.id_inscricao)) \
        .eq("idarquiteto", str(current_user["id"])) \
        .execute()
    if not ins.data:
        raise HTTPException(status_code=403, detail="Acesso negado.")

    res = supabase.table("proposta").insert({
        "id_inscricao": str(proposta.id_inscricao),
        "valor":        proposta.valor,
        "prazo_dias":   proposta.prazo_dias,
        "mensagem":     proposta.mensagem,
    }).execute()

    if not res.data:
        raise HTTPException(status_code=500, detail="Erro ao criar proposta.")

    return res.data[0]


