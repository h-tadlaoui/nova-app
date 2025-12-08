import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Sparkles, MapPin, Clock, CheckCircle2, XCircle, User, Mail, Phone, PartyPopper } from "lucide-react";
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

const ReportDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock data - in production this would come from the database
  const allReports: ReportItem[] = [
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

  const item = allReports.find(r => r.id === id);

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pb-20 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-lg font-semibold mb-2">Report not found</h2>
          <Button onClick={() => navigate("/my-reports")}>Go Back</Button>
        </Card>
        <BottomNav />
      </div>
    );
  }

  const handleStartMatching = () => {
    setIsProcessing(true);
  };

  const handleProcessingComplete = () => {
    setIsProcessing(false);
    navigate(`/match-results?type=${item.type}&itemId=${item.id}`);
  };

  const handleFoundMyItem = () => {
    navigate("/confirm-recovery");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pb-20">
      {isProcessing && <AIProcessing onComplete={handleProcessingComplete} />}

      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/my-reports")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Report Details</h1>
              <p className="text-sm text-muted-foreground">{item.category}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Item Type & Status */}
        <Card className="p-4">
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <Badge variant={item.type === "lost" ? "destructive" : "default"}>
              {item.type === "lost" ? "Lost Item" : "Found Item"}
            </Badge>
            {renderStatusBadge(item.status)}
          </div>

          <h2 className="text-xl font-semibold mb-2">{item.category}</h2>
          <p className="text-muted-foreground">{item.description}</p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {item.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {new Date(item.date).toLocaleDateString()}
            </span>
          </div>
        </Card>

        {/* Match Status Section */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Match Status</h3>
          <div className="flex items-center gap-2 mb-2">
            {renderStatusBadge(item.status)}
          </div>
          {item.status === "Active" && (
            <p className="text-sm text-muted-foreground">
              No matches found yet. Use AI matching to find potential matches.
            </p>
          )}
        </Card>

        {/* Matched User Section */}
        {item.matchInfo && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Matched With</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{item.matchInfo.userName}</p>
                <p className="text-sm text-muted-foreground">{item.matchInfo.itemDescription}</p>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Contact Request Status */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Contact Request</h4>
              {renderContactRequestBadge(item.matchInfo.contactRequestStatus)}

              {item.matchInfo.contactRequestStatus === "pending" && (
                <p className="text-sm text-muted-foreground">
                  Waiting for the other user to approve your contact request.
                </p>
              )}

              {item.matchInfo.contactRequestStatus === "denied" && (
                <p className="text-sm text-muted-foreground">
                  Unfortunately, your contact request was not approved.
                </p>
              )}
            </div>

            {/* Contact Info - Only if approved */}
            {item.matchInfo.contactRequestStatus === "approved" && (
              <>
                <Separator className="my-4" />
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
                  {item.matchInfo.contactEmail && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <a href={`mailto:${item.matchInfo.contactEmail}`} className="text-primary hover:underline font-medium">
                          {item.matchInfo.contactEmail}
                        </a>
                      </div>
                    </div>
                  )}
                  {item.matchInfo.contactPhone && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <a href={`tel:${item.matchInfo.contactPhone}`} className="text-primary hover:underline font-medium">
                          {item.matchInfo.contactPhone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          {/* Found My Item Button - Only for lost items with approved contact */}
          {item.type === "lost" && item.matchInfo?.contactRequestStatus === "approved" && item.status !== "Recovered" && (
            <Button 
              onClick={handleFoundMyItem}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              size="lg"
            >
              <PartyPopper className="w-5 h-5 mr-2" />
              I Found My Item!
            </Button>
          )}

          {/* AI Match Button for items not matched */}
          {item.status === "Active" && (
            <Button
              onClick={handleStartMatching}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Find Matches with AI
            </Button>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ReportDetail;
