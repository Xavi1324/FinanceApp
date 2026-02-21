import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white w-full max-w-md rounded-xl shadow p-6">
        <h1 className="text-2xl font-semibold mb-4">Sign in</h1>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <div className="space-y-3">
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="w-full bg-blue-600 text-white rounded-lg py-2"
            onClick={async () => {
              try {
                setError("");
                await signIn(email, password);
              } catch (e: any) {
                setError(e.message ?? "Login error");
              }
            }}
          >
            Login
          </button>

          <button
            className="w-full border rounded-lg py-2"
            onClick={async () => {
              try {
                setError("");
                await signUp(email, password);
                alert("Cuenta creada. Revisa tu email si confirmación está activa.");
              } catch (e: any) {
                setError(e.message ?? "Register error");
              }
            }}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}