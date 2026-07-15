"use client";

import { createContext, useContext } from "react";

// Contexto separado do AuthContext: guarda plantas, eventos, carrinho,
// pagamentos e funções de admin. Separar isto do Auth evita que um
// componente que só precisa de "plans" re-renderize toda vez que
// "user" ou "loading" mudam (e vice-versa).
export const DataContext = createContext(null);

export const useAuthData = () => {
  const ctx = useContext(DataContext);
  if (ctx === null) {
    throw new Error("useAuthData deve ser usado dentro de um <AuthProvider>");
  }
  return ctx;
};