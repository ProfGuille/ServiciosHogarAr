import { useState } from "react";
import { Link } from "wouter";
import { getApiUrl } from "../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(getApiUrl("/api/auth/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar");
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Recuperar contrasena</h1>
        <p className="text-gray-500 text-sm mb-6">
          Ingresa tu email y te enviaremos un link para restablecer tu contrasena.
        </p>

        {sent ? (
          <div className="text-center">
            <div className="text-green-600 font-medium mb-4">
              Si el email esta registrado, recibiras un link en breve.
            </div>
            <Link href="/login" className="text-blue-600 hover:underline text-sm">
              Volver al inicio de sesion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="tu@email.com"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition"
            >
              {loading ? "Enviando..." : "Enviar link de recuperacion"}
            </button>
            <div className="text-center">
              <Link href="/login" className="text-sm text-gray-500 hover:underline">
                Volver al inicio de sesion
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
