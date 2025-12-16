import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient, setTokens, getAccessToken, clearTokens } from "@/integrations/django/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, ArrowRight, Loader2, User, Phone } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Username must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string; phone?: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const token = getAccessToken();
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const validateForm = () => {
    const schema = isLogin ? loginSchema : signupSchema;
    const data = isLogin
      ? { email, password }
      : { email, password, fullName, phone };

    const result = schema.safeParse(data);
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string; fullName?: string; phone?: string } = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof typeof fieldErrors;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isLogin) {
        // Login with Django
        const response = await apiClient('/auth/login/', {
          method: 'POST',
          body: JSON.stringify({
            email,
            password,
          }),
        });

        if (response.ok) {
          const { access, refresh } = await response.json();
          setTokens(access, refresh);
          toast({ title: "Welcome back!", description: "You've successfully logged in." });
          navigate("/");
        } else {
          const error = await response.json();
          throw new Error(error.detail || "Login failed");
        }
      } else {
        // Register with Django
        const response = await apiClient('/auth/register/', {
          method: 'POST',
          body: JSON.stringify({
            email,
            password,
            password_confirm: password,
            username: fullName,
            phone: phone,
          }),
        });

        if (response.ok) {
          toast({
            title: "Account created!",
            description: "Please log in with your credentials."
          });
          setIsLogin(true);
          setPassword("");
        } else {
          const error = await response.json();
          throw new Error(error.detail || error.email?.[0] || "Registration failed");
        }
      }
    } catch (error: any) {
      let message = error.message;
      if (message.includes("already exists") || message.includes("already registered")) {
        message = "This email is already registered. Try logging in instead.";
      } else if (message.includes("Invalid") || message.includes("credentials")) {
        message = "Invalid email or password. Please try again.";
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* App Bar */}
      <header className="bg-card border-b border-border flex-shrink-0">
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-center">FindBack</h1>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-foreground">FB</span>
            </div>
            <h2 className="text-2xl font-bold">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isLogin
                ? "Sign in to access your reports and matches"
                : "Join FindBack to report and find lost items"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="johndoe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-destructive text-xs">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-destructive text-xs">{errors.phone}</p>
                  )}
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
              {errors.email && (
                <p className="text-destructive text-xs">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
              {errors.password && (
                <p className="text-destructive text-xs">{errors.password}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
