import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Bell, Mail, Phone, MapPin, Clock } from "lucide-react";
import BottomNav from "@/components/BottomNav";

// Mock contact requests - in real app this would come from database
const mockContactRequests = [
  {
    id: "1",
    itemCategory: "Electronic Device",
    itemLocation: "Near university library entrance",
    requestDate: "2024-03-16",
    finderEmail: "finder@email.com",
    finderPhone: "+1234567890",
    status: "approved",
  },
  {
    id: "2",
    itemCategory: "Wallet",
    itemLocation: "Bus station platform 3",
    requestDate: "2024-03-15",
    finderEmail: "helper@email.com",
    status: "pending",
  },
];

const Notifications = () => {
  const navigate = useNavigate();

  const approvedRequests = mockContactRequests.filter(r => r.status === "approved");
  const pendingRequests = mockContactRequests.filter(r => r.status === "pending");

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
        {/* Approved Contacts Section */}
        {approvedRequests.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Approved Contacts</h2>
            {approvedRequests.map((request) => (
              <Card key={request.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{request.itemCategory}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3" />
                      {request.itemLocation}
                    </div>
                  </div>
                  <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full">
                    Approved
                  </span>
                </div>
                
                <div className="border-t border-border pt-3 space-y-2">
                  <p className="text-sm font-medium">Finder Contact:</p>
                  <div className="flex flex-wrap gap-3">
                    {request.finderEmail && (
                      <a 
                        href={`mailto:${request.finderEmail}`}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Mail className="w-4 h-4" />
                        {request.finderEmail}
                      </a>
                    )}
                    {request.finderPhone && (
                      <a 
                        href={`tel:${request.finderPhone}`}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Phone className="w-4 h-4" />
                        {request.finderPhone}
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pending Requests Section */}
        {pendingRequests.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Pending Requests</h2>
            {pendingRequests.map((request) => (
              <Card key={request.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{request.itemCategory}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3" />
                      {request.itemLocation}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      Requested: {new Date(request.requestDate).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="text-xs bg-yellow-500/10 text-yellow-600 px-2 py-1 rounded-full">
                    Pending
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Waiting for finder approval...
                </p>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {mockContactRequests.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">No notifications yet</h3>
            <p className="text-muted-foreground text-sm">
              Your contact requests will appear here
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Notifications;
