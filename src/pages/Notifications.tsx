import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Bell, Mail, Phone, MapPin, Clock, CheckCircle2, ChevronRight, HelpCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";

interface ContactRequest {
  id: string;
  itemId: string;
  itemCategory: string;
  itemLocation: string;
  requestDate: string;
  finderEmail?: string;
  finderPhone?: string;
  status: "approved" | "pending" | "denied";
}

// Mock contact requests - in real app this would come from database
const mockContactRequests: ContactRequest[] = [
  {
    id: "1",
    itemId: "anon-1",
    itemCategory: "Electronic Device",
    itemLocation: "Near university library entrance",
    requestDate: "2024-03-16",
    finderEmail: "finder@email.com",
    finderPhone: "+1234567890",
    status: "approved",
  },
  {
    id: "2",
    itemId: "anon-2",
    itemCategory: "Wallet",
    itemLocation: "Bus station platform 3",
    requestDate: "2024-03-15",
    status: "pending",
  },
  {
    id: "3",
    itemId: "anon-3",
    itemCategory: "Bag",
    itemLocation: "Train Station",
    requestDate: "2024-03-14",
    status: "denied",
  },
];

const Notifications = () => {
  const navigate = useNavigate();

  const approvedRequests = mockContactRequests.filter(r => r.status === "approved");
  const pendingRequests = mockContactRequests.filter(r => r.status === "pending");
  const deniedRequests = mockContactRequests.filter(r => r.status === "denied");

  const renderStatusBadge = (status: ContactRequest["status"]) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-xs">Pending</Badge>;
      case "denied":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-xs">Denied</Badge>;
    }
  };

  const renderRequestCard = (request: ContactRequest) => (
    <Card key={request.id} className="p-4 space-y-3">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => navigate(`/item/${request.itemId.split('-')[1]}?type=anonymous`)}
      >
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold">{request.itemCategory}</h3>
            {renderStatusBadge(request.status)}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="w-3 h-3" />
            {request.itemLocation}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            Requested: {new Date(request.requestDate).toLocaleDateString()}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      </div>
      
      {/* Contact Info - Only if approved */}
      {request.status === "approved" && (
        <div className="border-t border-border pt-3 space-y-2">
          <p className="text-sm font-medium flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            Finder Contact
          </p>
          <div className="flex flex-col gap-2">
            {request.finderEmail && (
              <a 
                href={`mailto:${request.finderEmail}`}
                className="flex items-center gap-2 text-sm text-primary hover:underline p-2 bg-muted/50 rounded-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <Mail className="w-4 h-4" />
                {request.finderEmail}
              </a>
            )}
            {request.finderPhone && (
              <a 
                href={`tel:${request.finderPhone}`}
                className="flex items-center gap-2 text-sm text-primary hover:underline p-2 bg-muted/50 rounded-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <Phone className="w-4 h-4" />
                {request.finderPhone}
              </a>
            )}
          </div>
        </div>
      )}

      {request.status === "pending" && (
        <p className="text-sm text-muted-foreground border-t border-border pt-3">
          Waiting for finder approval...
        </p>
      )}

      {request.status === "denied" && (
        <p className="text-sm text-muted-foreground border-t border-border pt-3">
          Your contact request was not approved.
        </p>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pb-24">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold">Notifications</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Info Card */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium">Contact Requests</h3>
              <p className="text-sm text-muted-foreground">
                View and manage your contact requests. Tap any request to see the item details.
              </p>
            </div>
          </div>
        </Card>

        {/* Tabs for Approved/Pending/Denied */}
        {mockContactRequests.length > 0 ? (
          <Tabs defaultValue="approved" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="approved" className="flex items-center gap-1 text-xs sm:text-sm">
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                Approved ({approvedRequests.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-1 text-xs sm:text-sm">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                Pending ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="denied" className="flex items-center gap-1 text-xs sm:text-sm">
                Denied ({deniedRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="approved" className="space-y-3">
              {approvedRequests.length > 0 ? (
                approvedRequests.map(renderRequestCard)
              ) : (
                <Card className="p-8 text-center">
                  <CheckCircle2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">No approved requests</h3>
                  <p className="text-sm text-muted-foreground">Approved contact requests will appear here</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-3">
              {pendingRequests.length > 0 ? (
                pendingRequests.map(renderRequestCard)
              ) : (
                <Card className="p-8 text-center">
                  <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">No pending requests</h3>
                  <p className="text-sm text-muted-foreground">Pending requests will appear here</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="denied" className="space-y-3">
              {deniedRequests.length > 0 ? (
                deniedRequests.map(renderRequestCard)
              ) : (
                <Card className="p-8 text-center">
                  <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">No denied requests</h3>
                  <p className="text-sm text-muted-foreground">Denied requests will appear here</p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="p-12 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">No notifications yet</h3>
            <p className="text-muted-foreground text-sm">
              Your contact requests will appear here
            </p>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Notifications;