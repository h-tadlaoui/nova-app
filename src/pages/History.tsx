import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Package, Search, Award, Sparkles } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const History = () => {
  const navigate = useNavigate();

  // Mock data
  const recoveredItems = [
    {
      id: 1,
      type: "lost",
      category: "Phone",
      description: "iPhone recovered!",
      date: "2024-03-10",
    },
  ];

  const contributions = [
    {
      id: 1,
      type: "found",
      category: "Wallet",
      description: "Helped someone find their wallet",
      date: "2024-03-12",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pb-20">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">My History</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* AI Match Button */}
        <Button 
          onClick={() => navigate("/ai-matching")}
          className="w-full mb-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          size="lg"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Find Matches with AI
        </Button>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="p-4 text-center">
            <CheckCircle className="w-6 h-6 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-accent">{recoveredItems.length}</p>
            <p className="text-xs text-muted-foreground">Items Recovered</p>
          </Card>
          <Card className="p-4 text-center">
            <Package className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-primary">{contributions.length}</p>
            <p className="text-xs text-muted-foreground">Items Helped Return</p>
          </Card>
          <Card className="p-4 text-center">
            <Award className="w-6 h-6 text-secondary mx-auto mb-2" />
            <p className="text-2xl font-bold text-secondary">0</p>
            <p className="text-xs text-muted-foreground">Badges Earned</p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="recovered" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recovered">My Recovered Items</TabsTrigger>
            <TabsTrigger value="contributions">My Contributions</TabsTrigger>
          </TabsList>

          <TabsContent value="recovered" className="space-y-4">
            {recoveredItems.length > 0 ? (
              recoveredItems.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <Search className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{item.category}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Recovered on {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Recovered
                    </Badge>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No recovered items yet</h3>
                <p className="text-muted-foreground mb-4">Start by reporting a lost item</p>
                <Button onClick={() => navigate("/report-lost")}>Report Lost Item</Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="contributions" className="space-y-4">
            {contributions.length > 0 ? (
              contributions.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{item.category}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Completed on {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge>
                      <Award className="w-3 h-3 mr-1" />
                      Helper
                    </Badge>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No contributions yet</h3>
                <p className="text-muted-foreground mb-4">Help others by reporting found items</p>
                <Button onClick={() => navigate("/report-found")}>Report Found Item</Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default History;
