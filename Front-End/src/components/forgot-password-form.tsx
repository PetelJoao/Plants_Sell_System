'use client';
import { useState, useContext } from 'react';
import { AuthContext } from '@/Context/AuthContext';

export default function ForgotPasswordForm() {
  const { forgotPassword } = useContext(AuthContext)as any;
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const msg = await forgotPassword(email);
      setMessage(msg);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Esqueceu a senha?</h2>
      <p className="text-gray-500 mb-6 text-sm">
        Informe o seu e-mail e enviaremos um link para redefinir a senha.
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

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-600 text-sm">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-60"
        >
          {loading ? 'Enviando...' : 'Enviar link de recuperação'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Lembrou a senha?{' '}
        <a href="/auth/login" className="text-green-600 hover:underline font-medium">
          Entrar
        </a>
      </p>
    </div>
  );
}