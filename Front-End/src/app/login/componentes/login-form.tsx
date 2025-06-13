"use client"
import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "@/lib/actions"

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      await login(email, password)
      router.push("/dashboard2") 
    } catch (err) {
      setError("Email invalido ou palavra-passe")
    } finally {
      setLoading(false)
    }

    /*
    Código para uma requisição na nossa API
    try {
  const response = await fetch('https://sua-api.com/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Credenciais inválidas');
  }

  const data = await response.json();
  console.log('Login bem-sucedido:', data);

  router.push('/home');
} catch (err) {
  setError('Invalid email or password');
} finally {
  setLoading(false);
}
 */
  }
    
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="Introduza o email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" placeholder="Introduza a palavra-passe" required />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Logging in..." : "Log in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground"> Não tem uma conta ainda?{" "}
        <Link href="/Cadastro" className="text-primary hover:underline">
         Cadastrar
        </Link>
      </p>
    </form>
  )
}

