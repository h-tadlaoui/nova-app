import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Search, Package, Shield, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";

const Browse = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Browse Reports</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-4">
        {/* AI Matching Card */}
        <Card 
          className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-primary/50 bg-gradient-to-r from-primary/5 to-accent/5 hover:border-primary"
          onClick={() => navigate("/ai-matching")}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">AI Matching</h3>
              <p className="text-sm text-muted-foreground">Find matches for your reports using AI</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-secondary"
          onClick={() => navigate("/browse-lost")}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
              <Search className="w-7 h-7 text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">Lost Items</h3>
              <p className="text-sm text-muted-foreground">Browse all reported lost items</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary"
          onClick={() => navigate("/browse-found")}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Package className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">Found Items</h3>
              <p className="text-sm text-muted-foreground">Browse all reported found items</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-anonymous"
          onClick={() => navigate("/browse-anonymous")}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-anonymous/10 flex items-center justify-center">
              <Shield className="w-7 h-7 text-anonymous" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">Anonymous Reports</h3>
              <p className="text-sm text-muted-foreground">Browse all anonymous reports</p>
            </div>
          </div>
        </Card>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Browse;
