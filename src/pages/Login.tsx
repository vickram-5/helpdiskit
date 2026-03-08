import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, LogIn } from "lucide-react";
import LiquidBackground from "@/components/LiquidBackground";
import logo from "@/assets/logo.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signInWithUsername } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signInWithUsername(username, password);
    if (error) setError(error);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <LiquidBackground variant="light" />

      <div className="w-full max-w-md relative z-[1]">
        <div className="rounded-3xl p-8 shadow-2xl" style={{
          background: "hsla(0, 0%, 100%, 0.55)",
          border: "1px solid hsla(200, 80%, 70%, 0.25)",
          backdropFilter: "blur(30px) saturate(1.5)",
          WebkitBackdropFilter: "blur(30px) saturate(1.5)",
          boxShadow: "0 8px 40px hsla(200, 80%, 60%, 0.12), inset 0 1px 0 hsla(0, 0%, 100%, 0.5)",
        }}>
          <div className="flex flex-col items-center mb-8">
            <img src={logo} alt="Vindhya E-Infomedia" className="h-16 mb-5" />
            <p className="text-sm" style={{ color: "hsl(210, 15%, 40%)" }}>IT Ticketing System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider" style={{ color: "hsl(210, 15%, 45%)" }}>Username</label>
              <Input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-12 rounded-xl transition-all"
                style={{
                  background: "hsla(200, 60%, 95%, 0.5)",
                  border: "1px solid hsla(200, 60%, 75%, 0.3)",
                  color: "hsl(210, 20%, 20%)",
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider" style={{ color: "hsl(210, 15%, 45%)" }}>Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl transition-all"
                style={{
                  background: "hsla(200, 60%, 95%, 0.5)",
                  border: "1px solid hsla(200, 60%, 75%, 0.3)",
                  color: "hsl(210, 20%, 20%)",
                }}
              />
            </div>

            {error && (
              <p className="text-sm rounded-xl px-4 py-3" style={{
                color: "hsl(0, 70%, 45%)",
                background: "hsla(0, 70%, 50%, 0.08)",
                border: "1px solid hsla(0, 70%, 50%, 0.15)",
              }}>
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full h-12 font-semibold rounded-xl text-sm tracking-wide" style={{
              background: "linear-gradient(135deg, hsl(195, 90%, 50%), hsl(210, 85%, 55%))",
              color: "white",
              border: "none",
            }}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
              Sign In
            </Button>
          </form>

          <p className="text-xs text-center mt-6" style={{ color: "hsl(210, 15%, 55%)" }}>
            Contact your administrator for access
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
