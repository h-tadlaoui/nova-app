import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Sparkles, MapPin, Clock, Search, Package } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import AIProcessing from "@/components/AIProcessing";

const MyReports = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [matchType, setMatchType] = useState<"lost" | "found" | null>(null);

  // Mock user's reports - in production this would come from the database
  const myLostItems = [
    {
      id: "lost-1",
      type: "lost" as const,
      category: "Phone",
      description: "Black iPhone 13, cracked screen protector",
      location: "Central Park",
      date: "2024-03-15",
      status: "Active",
    },
    {
      id: "lost-2",
      type: "lost" as const,
      category: "Wallet",
      description: "Brown leather wallet with cards",
      location: "Downtown Coffee Shop",
      date: "2024-03-14",
      status: "Active",
    },
  ];

  const myFoundItems = [
    {
      id: "found-1",
      type: "found" as const,
      category: "Keys",
      description: "Set of keys with blue keychain",
      location: "City Library",
      date: "2024-03-16",
      status: "Active",
    },
  ];

  const handleSelectItem = (itemId: string, type: "lost" | "found") => {
    setSelectedItem(itemId);
    setMatchType(type);
  };

  const handleStartMatching = () => {
    if (!selectedItem || !matchType) return;
    setIsProcessing(true);
  };

  const handleProcessingComplete = () => {
    setIsProcessing(false);
    navigate(`/match-results?type=${matchType}&itemId=${selectedItem}`);
  };

  const renderItemCard = (item: typeof myLostItems[0] | typeof myFoundItems[0], type: "lost" | "found") => (
    <Card
      key={item.id}
      className={`p-4 cursor-pointer transition-all ${
        selectedItem === item.id
          ? "ring-2 ring-primary bg-primary/5"
          : "hover:shadow-md"
      }`}
      onClick={() => handleSelectItem(item.id, type)}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{item.category}</h3>
            <Badge variant={type === "lost" ? "destructive" : "default"} className="text-xs">
              {type === "lost" ? "Lost" : "Found"}
            </Badge>
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
        {selectedItem === item.id && (
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-primary-foreground" />
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pb-20">
      {isProcessing && <AIProcessing onComplete={handleProcessingComplete} />}

      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">My Reports</h1>
              <p className="text-sm text-muted-foreground">Select a report to find AI matches</p>
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
                Select one of your reports, then tap "Find Matches" to let AI search for potential matches.
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

        {/* Start Matching Button */}
        {selectedItem && (
          <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
            <Button
              onClick={handleStartMatching}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Find Matches with AI
            </Button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MyReports;