import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Sparkles, MapPin, Clock, Search, Package, ChevronRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";

interface ReportItem {
  id: string;
  type: "lost" | "found";
  category: string;
  description: string;
  location: string;
  date: string;
  status: "Active" | "Matched" | "Recovered";
}

const MyReports = () => {
  const navigate = useNavigate();

  // Mock user's reports
  const myLostItems: ReportItem[] = [
    {
      id: "lost-1",
      type: "lost",
      category: "Phone",
      description: "Black iPhone 13, cracked screen protector",
      location: "Central Park",
      date: "2024-03-15",
      status: "Matched",
    },
    {
      id: "lost-2",
      type: "lost",
      category: "Wallet",
      description: "Brown leather wallet with cards",
      location: "Downtown Coffee Shop",
      date: "2024-03-14",
      status: "Matched",
    },
    {
      id: "lost-3",
      type: "lost",
      category: "Headphones",
      description: "AirPods Pro in white case",
      location: "Gym on 5th Ave",
      date: "2024-03-12",
      status: "Active",
    },
  ];

  const myFoundItems: ReportItem[] = [
    {
      id: "found-1",
      type: "found",
      category: "Keys",
      description: "Set of keys with blue keychain",
      location: "City Library",
      date: "2024-03-16",
      status: "Active",
    },
  ];

  const renderStatusBadge = (status: ReportItem["status"]) => {
    switch (status) {
      case "Matched":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">Matched</Badge>;
      case "Recovered":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">Recovered</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Not Matched</Badge>;
    }
  };

  const renderItemCard = (item: ReportItem, type: "lost" | "found") => (
    <Card
      key={item.id}
      className="p-4 cursor-pointer transition-all hover:shadow-md active:scale-[0.99]"
      onClick={() => navigate(`/my-reports/${item.id}`)}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold">{item.category}</h3>
            <Badge variant={type === "lost" ? "destructive" : "default"} className="text-xs">
              {type === "lost" ? "Lost" : "Found"}
            </Badge>
            {renderStatusBadge(item.status)}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {item.description}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {item.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(item.date).toLocaleDateString()}
            </span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pb-20">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">My Reports</h1>
              <p className="text-sm text-muted-foreground">View and manage your reports</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Instructions */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium">AI Matching</h3>
              <p className="text-sm text-muted-foreground">
                Tap a report to view details, match status, and contact info.
              </p>
            </div>
          </div>
        </Card>

        {/* Tabs for Lost/Found */}
        {(myLostItems.length > 0 || myFoundItems.length > 0) ? (
          <Tabs defaultValue="lost" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="lost" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Lost ({myLostItems.length})
              </TabsTrigger>
              <TabsTrigger value="found" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Found ({myFoundItems.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lost" className="space-y-3">
              {myLostItems.length > 0 ? (
                myLostItems.map((item) => renderItemCard(item, "lost"))
              ) : (
                <Card className="p-8 text-center">
                  <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">No lost items reported</h3>
                  <p className="text-sm text-muted-foreground mb-4">Report a lost item to find matches</p>
                  <Button variant="outline" onClick={() => navigate("/report-lost")}>
                    Report Lost Item
                  </Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="found" className="space-y-3">
              {myFoundItems.length > 0 ? (
                myFoundItems.map((item) => renderItemCard(item, "found"))
              ) : (
                <Card className="p-8 text-center">
                  <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">No found items reported</h3>
                  <p className="text-sm text-muted-foreground mb-4">Report a found item to help find the owner</p>
                  <Button onClick={() => navigate("/report-found")}>
                    Report Found Item
                  </Button>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="p-12 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
            <p className="text-muted-foreground mb-4">
              Report a lost or found item first to use AI matching
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/report-lost")}>
                Report Lost
              </Button>
              <Button onClick={() => navigate("/report-found")}>
                Report Found
              </Button>
            </div>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MyReports;
