import { LoginForm } from "@/app/login/componentes/login-form"

export default function Page() {
  return (
    <main className="min-h-screen relative flex items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white/95 backdrop-blur-sm p-6 shadow-lg space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Bem-vindo de volta ao Duria</h1>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}


