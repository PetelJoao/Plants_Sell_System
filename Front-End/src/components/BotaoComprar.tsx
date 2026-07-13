// components/BotaoComprar.tsx
// Botão de compra — adicionar nos cards de planta

"use client";

import { useCheckout } from "@/hooks/usePayments";
import { useAuth } from "@/Context/AuthContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2 } from "lucide-react";

interface BotaoComprarProps {
  plantaId: string;
  arquitetoId: string;
  nomePlanta: string;
  preco: number;
  imagemUrl?: string;
}

export function BotaoComprar({
  plantaId,
  arquitetoId,
  nomePlanta,
  preco,
  imagemUrl,
}: BotaoComprarProps) {
  const { user } = useAuth() as any;
  const { iniciarCompra, loading, error } = useCheckout();

  // Ocultar o botão se o utilizador for o próprio arquiteto ou admin
  if (user?.role === "admin" ) return null;

  const handleComprar = () => {
    iniciarCompra({
      planta_id: plantaId,
      arquiteto_id: arquitetoId,
      nome_planta: nomePlanta,
      preco,
      imagem_url: imagemUrl,
    });
  };

  return (
<div className="space-y-1">
  <Button
    className="w-Full bg-blue-500 hover:bg-blue-600 text-white h-10"
    onClick={handleComprar}
    disabled={loading}
  >
    {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
    {loading ? "A redirecionar..." : `$${preco.toFixed(2)}`}
  </Button>
  {error && (
    <p className="text-xs text-red-500 text-center">{error}</p>
  )}
</div>
  );
}
