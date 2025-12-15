import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Package, Search, Award, Loader2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useMyItems } from "@/hooks/useItems";

const History = () => {
  const navigate = useNavigate();
  const { items, loading } = useMyItems();

  // Filter items by status
  const recoveredItems = items.filter(
    (item) => item.type === "lost" && item.status === "recovered"
  );
  const contributions = items.filter(
    (item) => (item.type === "found" || item.type === "anonymous") && item.status === "recovered"
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pb-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
            <p className="text-2xl font-bold text-secondary">{contributions.length > 0 ? contributions.length : 0}</p>
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
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.category}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <Search className="w-5 h-5 text-secondary" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">{item.category}</h3>
                        <p className="text-sm text-muted-foreground">{item.description || "No description"}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Recovered on {new Date(item.updated_at).toLocaleDateString()}
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
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.category}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">{item.category}</h3>
                        <p className="text-sm text-muted-foreground">{item.description || "Helped someone find their item"}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Completed on {new Date(item.updated_at).toLocaleDateString()}
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
