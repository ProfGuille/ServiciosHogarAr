import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { getApiUrl } from "../lib/api";

export default function ResetPassword() {
  const [location] = useLocation();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) setToken(t);
    else setError("Token invalido o expirado.");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Las contrasenas no coinciden");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(getApiUrl("/api/auth/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al restablecer");
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Nueva contrasena</h1>
        <p className="text-gray-500 text-sm mb-6">Ingresa tu nueva contrasena.</p>

        {done ? (
          <div className="text-center">
            <div className="text-green-600 font-medium mb-4">
              Contrasena actualizada correctamente.
            </div>
            <Link href="/login" className="text-blue-600 hover:underline text-sm">
              Ir al inicio de sesion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contrasena</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Minimo 6 caracteres"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contrasena</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Repeti la contrasena"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition"
            >
              {loading ? "Guardando..." : "Guardar nueva contrasena"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
