'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

// 1. Definição do Schema de Validação com Zod
const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'O email é obrigatório')
    .email('Introduza um endereço de email válido'),
  password: z
    .string()
    .min(1, 'A senha é obrigatória')
    .min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

// Extração do tipo inferido pelo Zod
type LoginFormData = z.infer<typeof loginSchema>

export function DuriaLoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  // 2. Inicialização do React Hook Form com o resolver do Zod
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // 3. Função de Submissão (Garante dados 100% validados aqui dentro)
  const onSubmit = async (data: LoginFormData) => {
    setApiError('')
    setIsLoading(true)

    try {
      // Simulação da chamada de API (o corno não vai reclamar agora!)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Os dados já chegam limpos e validados aqui pelo Zod
      console.log('[v0] Login attempt:', data)
      
      // router.push('/dashboard')
    } catch (err) {
      setApiError('Falha no login. Por favor, verifique as suas credenciais.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-center px-6 lg:px-12 py-12 lg:py-0 bg-white">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Bem vindo de volta</h2>
          <p className="text-slate-600 text-sm">Inicie sessão na sua conta do Duria para continuar.</p>
        </div>

        {/* Login Form usando o Provider do Shadcn/React Hook Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Campo Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium text-slate-700">
                    Endereço de email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      disabled={isLoading}
                      className="h-10 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 focus:bg-white transition-colors"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 font-medium" />
                </FormItem>
              )}
            />

            {/* Campo Senha */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium text-slate-700">
                      Senha
                    </FormLabel>
                    <a
                      href="/forgot-password"
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Esqueceu sua senha?
                    </a>
                  </div>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        disabled={isLoading}
                        className="h-10 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 focus:bg-white transition-colors pr-10"
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <FormMessage className="text-xs text-red-500 font-medium" />
                </FormItem>
              )}
            />

            {/* Mensagem de Erro Geral vindo da API */}
            {apiError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{apiError}</p>
              </div>
            )}

            {/* Botão Submeter */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Fazendo login...' : 'Entrar'}
            </Button>
          </form>
        </Form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-slate-600">Não tem uma conta?</span>
          </div>
        </div>

        {/* Sign Up Link */}
        <Link 
          href="/Cadastro" 
          className="w-full inline-flex items-center justify-center px-4 py-3 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
        >
          Cadastro
        </Link>

        {/* Footer */}
        <p className="text-xs text-slate-500 text-center mt-8">
          Ao iniciar sessão, você concorda com os nossos termos.{' '}
          <a href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
            Termos de Serviço
          </a>{' '}
          e{' '}
          <a href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
            Política de Privacidade
          </a>
        </p>
      </div>
    </div>
  )
}