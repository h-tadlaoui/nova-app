import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Search, Package, Shield, LogIn, LogOut, User, Moon, Sun } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";
import { getAccessToken, clearTokens } from "@/integrations/django/client";

const IndexOption3 = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    // Check for auth token
    const token = getAccessToken();
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    clearTokens();
    setIsAuthenticated(false);
    toast({ title: "Logged out", description: "You've been signed out." });
    navigate("/auth");
  };

  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle("dark", newIsDark);
    localStorage.setItem("theme", newIsDark ? "dark" : "light");
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  return <div className="min-h-screen bg-muted/30 flex flex-col pb-20">
    {/* App Bar */}
    <header className="bg-card border-b border-border flex-shrink-0">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <h1 className="text-xl font-bold text-center">FindBack</h1>
        {isAuthenticated ? (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="icon" onClick={() => navigate("/auth")}>
            <LogIn className="h-5 w-5" />
          </Button>
        )}
      </div>
    </header>

    <div className="container mx-auto px-4 flex-1 flex flex-col py-4 gap-3">
      {/* Hero Card */}
      <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 flex-shrink-0 py-[4px]">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold">Lost Something?</h2>
          <p className="text-sm text-muted-foreground">AI-powered matching connects you with found items</p>
        </div>
      </Card>

      {/* Main Actions Grid */}
      <div className="grid md:grid-cols-3 gap-3 flex-1">
        <Card onClick={() => navigate("/report-lost")} className="p-4 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-secondary flex flex-col">
          <div className="flex flex-col h-full justify-between">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-3">
              <Search className="w-6 h-6 text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">Lost Item</h3>
              <p className="text-xs text-muted-foreground">Report what you're looking for</p>
            </div>
            <Button variant="secondary" className="w-full mt-3">Report</Button>
          </div>
        </Card>

        <Card className="p-4 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary flex flex-col" onClick={() => navigate("/report-found")}>
          <div className="flex flex-col h-full justify-between">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">Found Item</h3>
              <p className="text-xs text-muted-foreground">Help return someone's belongings</p>
            </div>
            <Button className="w-full mt-3">Report</Button>
          </div>
        </Card>

        <Card className="p-4 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-anonymous flex flex-col" onClick={() => navigate("/report-anonymous")}>
          <div className="flex flex-col h-full justify-between">
            <div className="w-12 h-12 rounded-2xl bg-anonymous/10 flex items-center justify-center mb-3">
              <Shield className="w-6 h-6 text-anonymous" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">Anonymous</h3>
              <p className="text-xs text-muted-foreground">Protect valuable item details</p>
            </div>
            <Button variant="outline" className="w-full border-anonymous text-anonymous hover:bg-anonymous hover:text-white mt-3">Report</Button>
          </div>
        </Card>
      </div>
    </div>

    <BottomNav />
  </div>;
};
export default IndexOption3;