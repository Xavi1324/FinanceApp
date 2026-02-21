import { Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Login } from "../pages/Login";

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6">Loading...</div>;

  // Si no está logueado, mostramos Login
  if (!user) return <Login />;

  // Si está logueado, renderiza las rutas hijas
  return <Outlet />;
}