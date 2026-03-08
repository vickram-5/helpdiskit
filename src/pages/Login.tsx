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
          background: "hsla(20, 12%, 10%, 0.75)",
          border: "1px solid hsla(25, 20%, 30%, 0.35)",
          backdropFilter: "blur(40px) saturate(1.6)",
          WebkitBackdropFilter: "blur(40px) saturate(1.6)",
          boxShadow: "0 8px 40px hsla(20, 30%, 5%, 0.5), inset 0 1px 0 hsla(30, 20%, 40%, 0.1)",
        }}>
          <div className="flex flex-col items-center mb-8">
            <img src={logo} alt="Vindhya E-Infomedia" className="h-20 mb-5" />
            <p className="text-sm text-muted-foreground">IT Ticketing System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Username</label>
              <Input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-12 rounded-xl transition-all bg-secondary/40 border-border text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl transition-all bg-secondary/40 border-border text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/30"
              />
            </div>

            {error && (
              <p className="text-sm rounded-xl px-4 py-3 bg-destructive/10 text-destructive border border-destructive/20">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full h-12 font-semibold rounded-xl text-sm tracking-wide" style={{
              background: "linear-gradient(135deg, hsl(25, 85%, 50%), hsl(35, 90%, 45%))",
              color: "white",
              border: "none",
            }}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
              Sign In
            </Button>
          </form>

          <p className="text-xs text-center mt-6 text-muted-foreground">
            Contact your administrator for access
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
