import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Mail, Phone, Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

const ClaimItem = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || "Item";

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.message) {
      toast.error("Please provide email and a message");
      return;
    }

    toast.success("Claim submitted!", {
      description: "The finder will review your claim and contact you"
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
            <h1 className="text-lg font-semibold">Claim Item</h1>
            <p className="text-xs text-muted-foreground">{category}</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-sm">Submit Your Claim</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Provide details that prove this item belongs to you. The finder will verify your claim.
              </p>
            </div>
          </div>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="claim-email">Your Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="claim-email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="claim-phone">Phone (Optional)</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="claim-phone"
                type="tel"
                placeholder="+1234567890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="claim-message">
              Describe why this is your item *
            </Label>
            <Textarea
              id="claim-message"
              placeholder="Include specific details like brand, color, distinctive marks, or any unique identifiers that prove this is your item..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="min-h-[150px]"
              required
            />
            <p className="text-xs text-muted-foreground">
              The more specific details you provide, the easier it is to verify ownership
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              <Send className="w-4 h-4 mr-2" />
              Submit Claim
            </Button>
          </div>
        </form>
      </main>

      <BottomNav />
    </div>
  );
};

export default ClaimItem;
