// components/PlantComments.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/Context/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Trash2, ShieldCheck } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Comentario {
  id: string;
  autor_id: string;
  nome_autor: string;
  conteudo: string;
  created_at: string;
}

export default function PlantComments({ plantaId }: { plantaId: string }) {
  const { user } = useAuth() as any;

  const [comentarios, setComentarios]     = useState<Comentario[]>([]);
  const [podeComentar, setPodeComentar]   = useState(false);
  const [conteudo, setConteudo]           = useState("");
  const [loading, setLoading]             = useState(true);
  const [submitting, setSubmitting]       = useState(false);
  const [erro, setErro]                   = useState("");

  // Carrega comentários e verifica permissão
  useEffect(() => {
    if (!plantaId) return;

    async function load() {
      const token = localStorage.getItem("token");

      // Comentários são públicos — sem token
      const res = await fetch(`${API}/api/comments/${plantaId}`);
      const data = await res.json();
      setComentarios(data || []);

      // Permissão só se autenticado
      if (token) {
        const permRes = await fetch(
          `${API}/api/comments/${plantaId}/pode-comentar`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (permRes.ok) {
          const perm = await permRes.json();
          setPodeComentar(perm.pode_comentar);
        }
      }

      setLoading(false);
    }

    load();
  }, [plantaId]);

  const handleSubmit = async () => {
    if (!conteudo.trim()) return;
    setSubmitting(true);
    setErro("");

    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/comments/${plantaId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ conteudo }),
    });

    if (res.ok) {
      const novo = await res.json();
      setComentarios((prev) => [novo, ...prev]);
      setConteudo("");
    } else {
      const err = await res.json();
      setErro(err.detail || "Erro ao publicar comentário.");
    }

    setSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/comments/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setComentarios((prev) => prev.filter((c) => c.id !== commentId));
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="flex flex-col gap-5 mt-8">
      {/* Cabeçalho */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">
          Comentários ({comentarios.length})
        </h2>
      </div>

      {/* Formulário — só para compradores */}
      {podeComentar && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            Compra verificada — pode comentar publicamente
          </div>
          <Textarea
            rows={3}
            placeholder="Partilhe a sua experiência com este projecto..."
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            maxLength={1000}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {conteudo.length}/1000
            </span>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={submitting || conteudo.trim().length < 3}
            >
              {submitting ? "A publicar..." : "Publicar comentário"}
            </Button>
          </div>
          {erro && (
            <p className="text-sm text-destructive border-l-2 border-destructive bg-destructive/10 px-3 py-2 rounded">
              {erro}
            </p>
          )}
        </div>
      )}

      {/* Lista de comentários */}
      {loading ? (
        <p className="text-sm text-muted-foreground">A carregar comentários...</p>
      ) : comentarios.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          Ainda não há comentários. Seja o primeiro a partilhar a sua experiência.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {comentarios.map((c) => (
            <Card key={c.id}>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{c.nome_autor}</span>
                      <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                        Comprador verificado
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString("pt-AO", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Botão apagar — autor ou admin */}
                  {(isAdmin || user?.id === c.autor_id) && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors mt-0.5"
                      title="Apagar comentário"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                  {c.conteudo}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}