import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Sparkles, MapPin, Clock, CheckCircle2, XCircle, User, Mail, Phone, PartyPopper } from "lucide-react";
import { toast } from "sonner";
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

interface ClaimInfo {
  claimerId: string;
  claimerName: string;
  claimStatus: "pending" | "approved" | "denied";
}

interface ReportItem {
  id: string;
  type: "lost" | "found" | "anonymous";
  category: string;
  description: string;
  location: string;
  date: string;
  status: "Active" | "Matched" | "Recovered" | "Claimed";
  image?: string;
  matchInfo?: MatchInfo;
  claimInfo?: ClaimInfo;
}

const ReportDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { id } = useParams();
  const [item, setItem] = useState<ReportItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      try {
        // Import getItem dynamically or assume it's imported at top
        // But cleaner to add import at top. 
        // For this block, I will assume I added the import in a separate edit or rely on the user to compile? 
        // No, I should do a full file replacement or multiple chunks.
        // Let's us replace_file_content to replace the whole logic block.
        const { getItem } = await import("@/hooks/useItems");
        const data = await getItem(id);
        // Transform API data to ReportItem interface if needed, or update interface
        // For now, cast it or map it.
        // The API returns 'Item' type. ReportDetail expects 'ReportItem'.
        // Let's cast for now to get it working, mapping fields as best as possible.
        const mappedItem: ReportItem = {
          id: data.id.toString(),
          type: data.type,
          category: data.category,
          description: data.description || "",
          location: data.location,
          date: data.date,
          status: data.status as any, // Cast status
          image: data.image_url || undefined,
          // matchInfo and claimInfo are likely missing from basic item API
          // We will handle them later or leave undefined
        };
        setItem(mappedItem);
      } catch (error) {
        console.error("Failed to fetch report:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pb-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
    toast.success("Congratulations!", {
      description: "Your item has been marked as recovered"
    });
    navigate("/history");
  };

  const renderStatusBadge = (status: ReportItem["status"]) => {
    switch (status) {
      case "Matched":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Matched</Badge>;
      case "Recovered":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Recovered</Badge>;
      case "Claimed":
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">Claimed</Badge>;
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
        {/* Item Image */}
        {item.image && (
          <Card className="overflow-hidden">
            <img
              src={item.image}
              alt={item.category}
              className="w-full h-48 object-cover"
            />
          </Card>
        )}

        {/* Item Type & Status */}
        <Card className="p-4">
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <Badge variant={item.type === "lost" ? "destructive" : item.type === "anonymous" ? "outline" : "default"}>
              {item.type === "lost" ? "Lost Item" : item.type === "anonymous" ? "Anonymous Item" : "Found Item"}
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

        {/* Match/Claim Status Section */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">{item.type === "anonymous" ? "Claim Status" : "Match Status"}</h3>
          <div className="flex items-center gap-2 mb-2">
            {renderStatusBadge(item.status)}
          </div>
          {item.status === "Active" && item.type !== "anonymous" && (
            <p className="text-sm text-muted-foreground">
              No matches found yet. Use AI matching to find potential matches.
            </p>
          )}
          {item.status === "Active" && item.type === "anonymous" && (
            <p className="text-sm text-muted-foreground">
              Waiting for someone to claim this item.
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

        {/* Claim Info Section - For anonymous items */}
        {item.type === "anonymous" && item.claimInfo && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Claim Information</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{item.claimInfo.claimerName}</p>
                <p className="text-sm text-muted-foreground">Claimed this item</p>
              </div>
            </div>
            <Badge className={
              item.claimInfo.claimStatus === "approved"
                ? "bg-green-500/10 text-green-600 border-green-500/20"
                : item.claimInfo.claimStatus === "pending"
                  ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                  : "bg-red-500/10 text-red-600 border-red-500/20"
            }>
              {item.claimInfo.claimStatus === "approved" ? "Claim Approved" :
                item.claimInfo.claimStatus === "pending" ? "Claim Pending" : "Claim Denied"}
            </Badge>
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

          {/* AI Match Button for lost/found items not matched */}
          {item.status === "Active" && item.type !== "anonymous" && (
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
