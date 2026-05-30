# Adicionar este endpoint ao ficheiro events_route.py existente
# Cole dentro do mesmo ficheiro, a seguir ao endpoint /proposta

# ─── Arquitecto: Ver as suas próprias inscrições ─────────────────────────────

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
