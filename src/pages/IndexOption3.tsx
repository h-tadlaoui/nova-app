import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Search, Package, Shield, MapPin, Users } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const IndexOption3 = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* App Bar */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-center">FindBack</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Hero Card */}
        <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold">Lost Something?</h2>
            <p className="text-muted-foreground">AI-powered matching connects you with found items</p>
          </div>
        </Card>

        {/* Main Actions Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card 
            className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-secondary"
            onClick={() => navigate("/report-lost")}
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
                <Search className="w-7 h-7 text-secondary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Lost Item</h3>
                <p className="text-sm text-muted-foreground">Report what you're looking for</p>
              </div>
              <Button variant="secondary" className="w-full">Report</Button>
            </div>
          </Card>

          <Card 
            className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary"
            onClick={() => navigate("/report-found")}
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Package className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Found Item</h3>
                <p className="text-sm text-muted-foreground">Help return someone's belongings</p>
              </div>
              <Button className="w-full">Report</Button>
            </div>
          </Card>

          <Card 
            className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-anonymous"
            onClick={() => navigate("/report-anonymous")}
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-anonymous/10 flex items-center justify-center">
                <Shield className="w-7 h-7 text-anonymous" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Anonymous</h3>
                <p className="text-sm text-muted-foreground">Protect valuable item details</p>
              </div>
              <Button variant="outline" className="w-full border-anonymous">Report</Button>
            </div>
          </Card>
        </div>


        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Active Users</p>
          </Card>
          <Card className="p-4 text-center">
            <MapPin className="w-6 h-6 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Locations</p>
          </Card>
          <Card className="p-4 text-center">
            <Package className="w-6 h-6 mx-auto mb-2 text-secondary" />
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Reunited</p>
          </Card>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default IndexOption3;
