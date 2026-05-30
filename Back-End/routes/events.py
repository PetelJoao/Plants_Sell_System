from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

from middlewares.auth import get_current_user
from models.db import get_supabase_admin

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
    """Cliente cria um novo evento/projecto."""
    conn = get_db_connection()
    try:
        cur = conn.cursor()

        # Verificar que o utilizador é cliente
        cur.execute("SELECT id FROM cliente WHERE id = %s", (str(current_user["id"]),))
        if not cur.fetchone():
            raise HTTPException(status_code=403, detail="Apenas clientes podem criar eventos.")

        cur.execute(
            """
            INSERT INTO evento (descricao, data_inicio, data_fim, imagens, id_dono)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, estado, descricao, data_inicio, data_fim, imagens, criado_em
            """,
            (
                evento.descricao,
                evento.data_inicio,
                evento.data_fim,
                evento.imagens,
                str(current_user["id"]),
            ),
        )
        novo = cur.fetchone()
        conn.commit()
        return {
            "id": str(novo[0]),
            "estado": novo[1],
            "descricao": novo[2],
            "data_inicio": novo[3],
            "data_fim": novo[4],
            "imagens": novo[5],
            "criado_em": novo[6],
        }
    finally:
        cur.close()
        conn.close()


# ─── Cliente: Listar os seus eventos ────────────────────────────────────────

@events_router.get("/meus", summary="Eventos do cliente autenticado")
async def listar_meus_eventos(current_user=Depends(get_current_user)):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT e.id, e.estado, e.descricao, e.data_inicio, e.data_fim,
                   e.imagens, e.criado_em,
                   COUNT(i.id) AS total_inscricoes
            FROM evento e
            LEFT JOIN inscricao i ON i.idevento = e.id
            WHERE e.id_dono = %s
            GROUP BY e.id
            ORDER BY e.criado_em DESC
            """,
            (str(current_user["id"]),),
        )
        rows = cur.fetchall()
        return [
            {
                "id": str(r[0]),
                "estado": r[1],
                "descricao": r[2],
                "data_inicio": r[3],
                "data_fim": r[4],
                "imagens": r[5],
                "criado_em": r[6],
                "total_inscricoes": r[7],
            }
            for r in rows
        ]
    finally:
        cur.close()
        conn.close()


# ─── Arquiteto: Listar eventos disponíveis (abertos) ────────────────────────

@events_router.get("/disponiveis", summary="Eventos abertos para inscrição")
async def listar_eventos_disponiveis(current_user=Depends(get_current_user)):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT e.id, e.estado, e.descricao, e.data_inicio, e.data_fim,
                   e.imagens, e.criado_em,
                   u.nome AS nome_dono,
                   EXISTS(
                       SELECT 1 FROM inscricao i
                       WHERE i.idevento = e.id AND i.idarquiteto = %s
                   ) AS ja_inscrito
            FROM evento e
            JOIN cliente c ON c.id = e.id_dono
            JOIN usuario u ON u.id = c.id
            WHERE e.estado = 'aberto'
            ORDER BY e.criado_em DESC
            """,
            (str(current_user["id"]),),
        )
        rows = cur.fetchall()
        return [
            {
                "id": str(r[0]),
                "estado": r[1],
                "descricao": r[2],
                "data_inicio": r[3],
                "data_fim": r[4],
                "imagens": r[5],
                "criado_em": r[6],
                "nome_dono": r[7],
                "ja_inscrito": r[8],
            }
            for r in rows
        ]
    finally:
        cur.close()
        conn.close()


# ─── Detalhe de um evento ────────────────────────────────────────────────────

@events_router.get("/{evento_id}")
async def detalhe_evento(evento_id: UUID, current_user=Depends(get_current_user)):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT e.id, e.estado, e.descricao, e.data_inicio, e.data_fim,
                   e.imagens, e.criado_em, e.id_dono,
                   u.nome AS nome_dono
            FROM evento e
            JOIN cliente c ON c.id = e.id_dono
            JOIN usuario u ON u.id = c.id
            WHERE e.id = %s
            """,
            (str(evento_id),),
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Evento não encontrado.")

        return {
            "id": str(row[0]),
            "estado": row[1],
            "descricao": row[2],
            "data_inicio": row[3],
            "data_fim": row[4],
            "imagens": row[5],
            "criado_em": row[6],
            "id_dono": str(row[7]),
            "nome_dono": row[8],
        }
    finally:
        cur.close()
        conn.close()


# ─── Arquiteto: Inscrever-se num evento ─────────────────────────────────────

@events_router.post("/inscricao", status_code=status.HTTP_201_CREATED)
async def inscrever_em_evento(dados: InscricaoCreate, current_user=Depends(get_current_user)):
    conn = get_db_connection()
    try:
        cur = conn.cursor()

        # Verificar que é arquiteto
        cur.execute("SELECT id FROM arquiteto WHERE id = %s", (str(current_user["id"]),))
        if not cur.fetchone():
            raise HTTPException(status_code=403, detail="Apenas arquitectos podem inscrever-se.")

        # Verificar que o evento existe e está aberto
        cur.execute("SELECT estado FROM evento WHERE id = %s", (str(dados.idevento),))
        evento = cur.fetchone()
        if not evento:
            raise HTTPException(status_code=404, detail="Evento não encontrado.")
        if evento[0] != "aberto":
            raise HTTPException(status_code=400, detail="Este evento já não aceita inscrições.")

        # Verificar inscrição duplicada
        cur.execute(
            "SELECT id FROM inscricao WHERE idevento = %s AND idarquiteto = %s",
            (str(dados.idevento), str(current_user["id"])),
        )
        if cur.fetchone():
            raise HTTPException(status_code=409, detail="Já está inscrito neste evento.")

        cur.execute(
            """
            INSERT INTO inscricao (idevento, idarquiteto)
            VALUES (%s, %s)
            RETURNING id, dataingresso, estado
            """,
            (str(dados.idevento), str(current_user["id"])),
        )
        nova = cur.fetchone()
        conn.commit()
        return {"id": str(nova[0]), "dataingresso": nova[1], "estado": nova[2]}
    finally:
        cur.close()
        conn.close()


# ─── Cliente: Ver inscrições de um evento (com dados do arquiteto) ───────────

@events_router.get("/{evento_id}/inscricoes")
async def listar_inscricoes_evento(evento_id: UUID, current_user=Depends(get_current_user)):
    conn = get_db_connection()
    try:
        cur = conn.cursor()

        # Confirmar que o cliente é dono do evento
        cur.execute(
            "SELECT id_dono FROM evento WHERE id = %s", (str(evento_id),)
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Evento não encontrado.")
        if str(row[0]) != str(current_user["id"]):
            raise HTTPException(status_code=403, detail="Acesso negado.")

        cur.execute(
            """
            SELECT
                i.id            AS inscricao_id,
                i.dataingresso,
                i.estado        AS estado_inscricao,
                u.id            AS arquiteto_id,
                u.nome,
                u.email,
                u.telefone,
                a.endereco,
                a.foto_pessoal,
                a.cedula_profissional,
                a.bio,
                a.nif,
                a.avaliacao,
                p.id            AS proposta_id,
                p.valor,
                p.prazo_dias,
                p.mensagem      AS proposta_mensagem,
                p.criada_em     AS proposta_criada_em
            FROM inscricao i
            JOIN arquiteto a ON a.id = i.idarquiteto
            JOIN usuario u ON u.id = a.id
            LEFT JOIN proposta p ON p.id_inscricao = i.id
            WHERE i.idevento = %s
            ORDER BY i.dataingresso DESC
            """,
            (str(evento_id),),
        )
        rows = cur.fetchall()
        return [
            {
                "inscricao_id": str(r[0]),
                "dataingresso": r[1],
                "estado": r[2],
                "arquiteto": {
                    "id": str(r[3]),
                    "nome": r[4],
                    "email": r[5],
                    "telefone": r[6],
                    "endereco": r[7],
                    "foto_pessoal": r[8],
                    "cedula_profissional": r[9],
                    "bio": r[10],
                    "nif": r[11],
                    "avaliacao": r[12],
                },
                "proposta": {
                    "id": str(r[13]) if r[13] else None,
                    "valor": float(r[14]) if r[14] else None,
                    "prazo_dias": r[15],
                    "mensagem": r[16],
                    "criada_em": r[17],
                }
                if r[13]
                else None,
            }
            for r in rows
        ]
    finally:
        cur.close()
        conn.close()


# ─── Cliente: Aceitar/Rejeitar arquitecto ───────────────────────────────────

@events_router.put("/inscricao/{inscricao_id}/decisao")
async def decidir_inscricao(
    inscricao_id: UUID,
    decisao: DecisaoInscricao,
    current_user=Depends(get_current_user),
):
    if decisao.estado not in ("aceite", "rejeitado"):
        raise HTTPException(status_code=400, detail="Estado inválido. Use 'aceite' ou 'rejeitado'.")

    conn = get_db_connection()
    try:
        cur = conn.cursor()

        # Verificar que a inscrição existe e pertence a um evento do cliente
        cur.execute(
            """
            SELECT i.id, e.id_dono, e.id AS evento_id
            FROM inscricao i
            JOIN evento e ON e.id = i.idevento
            WHERE i.id = %s
            """,
            (str(inscricao_id),),
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Inscrição não encontrada.")
        if str(row[1]) != str(current_user["id"]):
            raise HTTPException(status_code=403, detail="Acesso negado.")

        evento_id = row[2]

        # Actualizar estado da inscrição
        cur.execute(
            "UPDATE inscricao SET estado = %s WHERE id = %s",
            (decisao.estado, str(inscricao_id)),
        )

        # Se aceite → atribuir arquiteto ao evento e mudar estado para em_andamento
        if decisao.estado == "aceite":
            cur.execute(
                """
                UPDATE evento
                SET estado = 'em_andamento',
                    id_arquiteto = (SELECT idarquiteto FROM inscricao WHERE id = %s)
                WHERE id = %s
                """,
                (str(inscricao_id), str(evento_id)),
            )
            # Rejeitar automaticamente as restantes inscrições pendentes
            cur.execute(
                """
                UPDATE inscricao
                SET estado = 'rejeitado'
                WHERE idevento = %s AND id != %s AND estado = 'pendente'
                """,
                (str(evento_id), str(inscricao_id)),
            )

        conn.commit()
        return {"message": f"Inscrição marcada como '{decisao.estado}' com sucesso."}
    finally:
        cur.close()
        conn.close()


# ─── Arquiteto: Submeter proposta ───────────────────────────────────────────

@events_router.post("/proposta", status_code=status.HTTP_201_CREATED)
async def criar_proposta(proposta: PropostaCreate, current_user=Depends(get_current_user)):
    conn = get_db_connection()
    try:
        cur = conn.cursor()

        # Verificar que a inscrição pertence ao arquiteto
        cur.execute(
            "SELECT id FROM inscricao WHERE id = %s AND idarquiteto = %s",
            (str(proposta.id_inscricao), str(current_user["id"])),
        )
        if not cur.fetchone():
            raise HTTPException(status_code=403, detail="Acesso negado.")

        cur.execute(
            """
            INSERT INTO proposta (id_inscricao, valor, prazo_dias, mensagem)
            VALUES (%s, %s, %s, %s)
            RETURNING id, valor, prazo_dias, mensagem, criada_em
            """,
            (str(proposta.id_inscricao), proposta.valor, proposta.prazo_dias, proposta.mensagem),
        )
        nova = cur.fetchone()
        conn.commit()
        return {
            "id": str(nova[0]),
            "valor": float(nova[1]),
            "prazo_dias": nova[2],
            "mensagem": nova[3],
            "criada_em": nova[4],
        }
    finally:
        cur.close()
        conn.close()


@events_router.get("/arquiteto/inscricoes", summary="Inscrições do arquitecto autenticado")
async def minhas_inscricoes_arquiteto(current_user=Depends(get_current_user)):
    conn = get_db_connection()
    try:
        cur = conn.cursor()

        cur.execute("SELECT id FROM arquiteto WHERE id = %s", (str(current_user["id"]),))
        if not cur.fetchone():
            raise HTTPException(status_code=403, detail="Apenas arquitectos podem aceder a este recurso.")

        cur.execute(
            """
            SELECT
                i.id            AS inscricao_id,
                i.dataingresso,
                i.estado,
                e.id            AS evento_id,
                e.descricao     AS evento_descricao,
                e.estado        AS evento_estado,
                p.id            AS proposta_id,
                p.valor,
                p.prazo_dias,
                p.mensagem,
                p.criada_em     AS proposta_criada_em
            FROM inscricao i
            JOIN evento e ON e.id = i.idevento
            LEFT JOIN proposta p ON p.id_inscricao = i.id
            WHERE i.idarquiteto = %s
            ORDER BY i.dataingresso DESC
            """,
            (str(current_user["id"]),),
        )
        rows = cur.fetchall()
        return [
            {
                "inscricao_id": str(r[0]),
                "dataingresso": r[1],
                "estado": r[2],
                "evento_id": str(r[3]),
                "evento_descricao": r[4],
                "evento_estado": r[5],
                "proposta": {
                    "id": str(r[6]),
                    "valor": float(r[7]),
                    "prazo_dias": r[8],
                    "mensagem": r[9],
                    "criada_em": r[10],
                }
                if r[6]
                else None,
            }
            for r in rows
        ]
    finally:
        cur.close()
        conn.close()
