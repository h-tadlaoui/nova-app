import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Mail, Phone, Copy, CheckCircle2, Shield, MapPin, Calendar } from "lucide-react";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

// Mock contact data - in real app, fetch from database
const mockContactInfo = {
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567"
};

const ContactExchange = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "owner"; // 'owner' or 'finder'

  const otherParty = role === "owner" ? "Finder" : "Owner";

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleMarkOnWay = () => {
    toast.success("Item marked as on its way!", {
      description: "The owner will confirm once they receive it"
    });
    navigate("/history");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Contact {otherParty}</h1>
            <p className="text-xs text-muted-foreground">Match verified</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <Card className="p-4 bg-accent/10 border-accent/30">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-accent" />
            <div>
              <h3 className="font-semibold text-accent">Match Verified</h3>
              <p className="text-sm text-muted-foreground">
                Contact information is now available
              </p>
            </div>
          </div>
        </Card>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {otherParty}'s Contact Info
          </h2>

          <Card className="divide-y">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{mockContactInfo.email}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => copyToClipboard(mockContactInfo.email, "Email")}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{mockContactInfo.phone}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => copyToClipboard(mockContactInfo.phone, "Phone")}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </section>

        <Card className="p-4 bg-muted/30">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">Safety Tips</h4>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                <li>• Meet in a public, well-lit location</li>
                <li>• Consider meeting at a police station</li>
                <li>• Bring a friend if possible</li>
                <li>• Verify item details before handover</li>
              </ul>
            </div>
          </div>
        </Card>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Next Steps
          </h2>

          {role === "finder" ? (
            <Button onClick={handleMarkOnWay} className="w-full" size="lg">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Mark Item as On Its Way
            </Button>
          ) : (
            <Button onClick={() => navigate(`/confirm-recovery/${id}`)} className="w-full" size="lg">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              I've Received My Item
            </Button>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default ContactExchange;
