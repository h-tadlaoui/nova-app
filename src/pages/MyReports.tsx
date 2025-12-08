import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Sparkles, MapPin, Clock, Search, Package, CheckCircle2, XCircle, User, Mail, Phone, PartyPopper } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import AIProcessing from "@/components/AIProcessing";

interface MatchInfo {
  userId: string;
  userName: string;
  itemDescription: string;
  contactRequestStatus: "pending" | "approved" | "denied";
  contactEmail?: string;
  contactPhone?: string;
}

interface ReportItem {
  id: string;
  type: "lost" | "found";
  category: string;
  description: string;
  location: string;
  date: string;
  status: "Active" | "Matched" | "Recovered";
  matchInfo?: MatchInfo;
}

const MyReports = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [matchType, setMatchType] = useState<"lost" | "found" | null>(null);

  // Mock user's reports with match info
  const myLostItems: ReportItem[] = [
    {
      id: "lost-1",
      type: "lost",
      category: "Phone",
      description: "Black iPhone 13, cracked screen protector",
      location: "Central Park",
      date: "2024-03-15",
      status: "Matched",
      matchInfo: {
        userId: "user-123",
        userName: "John D.",
        itemDescription: "Found black iPhone near Central Park bench",
        contactRequestStatus: "approved",
        contactEmail: "john.d@email.com",
        contactPhone: "+1 555-123-4567",
      },
    },
    {
      id: "lost-2",
      type: "lost",
      category: "Wallet",
      description: "Brown leather wallet with cards",
      location: "Downtown Coffee Shop",
      date: "2024-03-14",
      status: "Matched",
      matchInfo: {
        userId: "user-456",
        userName: "Sarah M.",
        itemDescription: "Brown wallet found at coffee shop",
        contactRequestStatus: "pending",
      },
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

  const handleSelectItem = (itemId: string, type: "lost" | "found") => {
    setSelectedItem(selectedItem === itemId ? null : itemId);
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

  const handleFoundMyItem = (itemId: string) => {
    // In production, this would update the database
    console.log("Marking item as recovered:", itemId);
    navigate("/confirm-recovery");
  };

  const getSelectedItemData = (): ReportItem | undefined => {
    return [...myLostItems, ...myFoundItems].find(item => item.id === selectedItem);
  };

  const renderStatusBadge = (status: ReportItem["status"]) => {
    switch (status) {
      case "Matched":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Matched</Badge>;
      case "Recovered":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Recovered</Badge>;
      default:
        return <Badge variant="secondary">Not Matched Yet</Badge>;
    }
  };

  const renderContactRequestBadge = (status: MatchInfo["contactRequestStatus"]) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Contact Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Contact Pending
          </Badge>
        );
      case "denied":
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Contact Denied
          </Badge>
        );
    }
  };

  const renderItemDetails = (item: ReportItem) => (
    <Card className="p-4 mt-3 bg-muted/30 border-primary/20 animate-in slide-in-from-top-2 duration-200">
      <div className="space-y-4">
        {/* Item Details */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Item Details</h4>
          <p className="text-sm">{item.description}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
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

        <Separator />

        {/* Match Status */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Match Status</h4>
          <div className="flex items-center gap-2">
            {renderStatusBadge(item.status)}
          </div>
        </div>

        {/* Match Info - Only if matched */}
        {item.matchInfo && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Matched With</h4>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.matchInfo.userName}</p>
                  <p className="text-xs text-muted-foreground">{item.matchInfo.itemDescription}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {renderContactRequestBadge(item.matchInfo.contactRequestStatus)}
              </div>
            </div>

            {/* Contact Info - Only if approved */}
            {item.matchInfo.contactRequestStatus === "approved" && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Contact Information</h4>
                  <div className="space-y-2">
                    {item.matchInfo.contactEmail && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <a href={`mailto:${item.matchInfo.contactEmail}`} className="text-primary hover:underline">
                          {item.matchInfo.contactEmail}
                        </a>
                      </div>
                    )}
                    {item.matchInfo.contactPhone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <a href={`tel:${item.matchInfo.contactPhone}`} className="text-primary hover:underline">
                          {item.matchInfo.contactPhone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Found My Item Button - Only for lost items with approved contact */}
            {item.type === "lost" && item.matchInfo.contactRequestStatus === "approved" && item.status !== "Recovered" && (
              <>
                <Separator />
                <Button 
                  onClick={() => handleFoundMyItem(item.id)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  <PartyPopper className="w-4 h-4 mr-2" />
                  I Found My Item!
                </Button>
              </>
            )}
          </>
        )}

        {/* AI Match Button for items not matched */}
        {item.status === "Active" && (
          <>
            <Separator />
            <Button
              onClick={handleStartMatching}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Find Matches with AI
            </Button>
          </>
        )}
      </div>
    </Card>
  );

  const renderItemCard = (item: ReportItem, type: "lost" | "found") => (
    <div key={item.id}>
      <Card
        className={`p-4 cursor-pointer transition-all ${
          selectedItem === item.id
            ? "ring-2 ring-primary bg-primary/5"
            : "hover:shadow-md"
        }`}
        onClick={() => handleSelectItem(item.id, type)}
      >
        <div className="flex items-start justify-between">
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
          {selectedItem === item.id && (
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-primary-foreground" />
            </div>
          )}
        </div>
      </Card>
      {selectedItem === item.id && renderItemDetails(item)}
    </div>
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
              <p className="text-sm text-muted-foreground">View details and find AI matches</p>
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
