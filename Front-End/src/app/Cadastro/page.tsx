"use client"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import  {supabase}  from '@/services/supabase'

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "O nome completo deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Introduza um email válido.",
  }),
  password: z.string().min(8).max(12, {
    message: "A palavra-passe deve ter no mínimo 8 caracteres e no máximo 12.",
  }),
  accountType: z.string({
    required_error: "Introduza um tipo de conta.",
  }),
})

export default function SignupForm() {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      accountType: "",
      email: "",
      password: "",
    },
  })

    async function onSubmit(values: z.infer<typeof formSchema>) {

        const payload = {
          name: values.fullName,      
          email: values.email,         
          password: values.password,   
          role: values.accountType,    
        };
      
        fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
          .then(async (res) => {
            if (!res.ok) {
              const error = await res.json();
              throw new Error(error.detail || "Erro ao criar conta");
            }
            return res.json();
          })
          .then((data) => {
            console.log("Usuário criado:", data);
            
            window.location.href = "/dashboard";
          })
          .catch((err) => {
            console.error("Erro:", err.message);
            alert(err.message);
          });
          
      }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 font-semibold">
            Duria
          </Link>
          <nav className="flex items-center space-x-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Projects
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="sm">
                Sign in
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="w-full mx-auto max-w-md py-16">
        <h1 className="mb-8 text-center text-2xl font-semibold tracking-tight">Cria a conta</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountType"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de conta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="arquiteto">Arquiteto</SelectItem>
                        <SelectItem value="cliente">Cliente</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Endereço de email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Senha" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Clique para criar a conta
            </Button>
          </form>
        </Form>


        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </main>
    </div>
  )
}

