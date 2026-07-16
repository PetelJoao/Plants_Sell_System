'use client';
import { useState, useContext, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthContext } from '@/Context/AuthContext';

export default function VerifyEmailForm() {
  const { verifyEmail, resendVerificationCode } = useContext(AuthContext) as any;
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [codigo, setCodigo] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await verifyEmail(email, codigo);
      setMessage('Conta verificada com sucesso! A redireccionar...');
      setTimeout(() => router.push('/Develop/login'), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    setResendLoading(true);
    setError('');
    setMessage('');
    try {
      const msg = await resendVerificationCode(email);
      setMessage(msg);
      setCooldown(60);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Confirme a sua conta</h2>
      <p className="text-gray-500 mb-6 text-sm">
        Enviámos um código de 6 dígitos para o seu e-mail. Introduza-o abaixo para activar a conta.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seuemail@exemplo.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Código de verificação</label>
          <input
            type="text"
            required
            inputMode="numeric"
            maxLength={6}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-center text-2xl tracking-[0.5em] font-bold focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-600 text-sm">{message}</p>}

        <button
          type="submit"
          disabled={loading || codigo.length !== 6}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-60"
        >
          {loading ? 'Verificando...' : 'Confirmar conta'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Não recebeu o código?{' '}
        <button
          type="button"
          onClick={handleResend}
          disabled={resendLoading || cooldown > 0}
          className="text-green-600 hover:underline font-medium disabled:opacity-60 disabled:no-underline"
        >
          {cooldown > 0 ? `Reenviar em ${cooldown}s` : resendLoading ? 'Enviando...' : 'Reenviar código'}
        </button>
      </p>
    </div>
  );
}