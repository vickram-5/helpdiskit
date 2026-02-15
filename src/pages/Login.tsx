import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, LogIn, Shield } from "lucide-react";

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
    <div className="min-h-screen bg-background mesh-bg dot-grid flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 glow-primary">
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 gradient-border flex items-center justify-center mb-5">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight gradient-text">CyberVibe Global Solutions</h1>
            <p className="text-sm text-muted-foreground mt-2">IT Ticketing System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Username</label>
              <Input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-12 bg-secondary/50 border-border rounded-xl focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-secondary/50 border-border rounded-xl focus:border-primary transition-all"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full h-12 font-semibold rounded-xl text-sm tracking-wide bg-primary hover:bg-primary/90 transition-all">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
              Sign In
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Contact your administrator for access
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
