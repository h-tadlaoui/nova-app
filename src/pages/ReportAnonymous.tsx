import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MapPin, Shield, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BottomNav from "@/components/BottomNav";
import { createItem } from "@/hooks/useItems";

const ReportAnonymous = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    location: "",
    dateTime: "",
    additionalInfo: "",
    contactEmail: "",
    contactPhone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.location || !formData.dateTime || !formData.contactEmail) {
      toast.error("Please provide location, time, and email");
      return;
    }

    setIsSubmitting(true);

    try {
      const dateTimeParts = formData.dateTime.split("T");
      const date = dateTimeParts[0];
      const time = dateTimeParts[1] || null;

      await createItem({
        type: "anonymous",
        category: formData.category || "Unknown",
        description: formData.additionalInfo || undefined,
        location: formData.location,
        date,
        time: time || undefined,
        contact_email: formData.contactEmail,
        contact_phone: formData.contactPhone || undefined,
      });

      toast.success("Anonymous report submitted!", {
        description: "Potential owners can now contact you to verify ownership"
      });

      setTimeout(() => {
        navigate("/browse-anonymous");
      }, 1500);
    } catch (error) {
      console.error("Error creating anonymous report:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pb-20">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-anonymous" />
            <h1 className="text-xl font-bold">Anonymous Report</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Alert className="mb-6 border-anonymous/50 bg-anonymous/5">
          <AlertCircle className="h-4 w-4 text-anonymous" />
          <AlertDescription>
            <strong>For valuable or sensitive items.</strong> No visual or descriptive details will be shared publicly.
            Only location and time are visible to help legitimate owners contact you.
          </AlertDescription>
        </Alert>

        <Card className="p-6 md:p-8 border-anonymous/30">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Category - Optional */}
            <div className="space-y-2">
              <Label htmlFor="category">General Category (Optional)</Label>
              <p className="text-sm text-muted-foreground">
                e.g., "Electronic Device", "Accessory", "Document" - helps route claims
              </p>
              <Input
                id="category"
                placeholder="General category only"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>

            {/* Location - Required */}
            <div className="space-y-2">
              <Label htmlFor="location">Location Where Found *</Label>
              <p className="text-sm text-muted-foreground">
                Specify where the item was found - this helps owners recognize their item
              </p>
              <div className="flex gap-2">
                <Input
                  id="location"
                  placeholder="e.g., Near café entrance, Bus stop #5"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="flex-1"
                  required
                />
                <Button type="button" variant="outline" size="icon">
                  <MapPin className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Date & Time - Required */}
            <div className="space-y-2">
              <Label htmlFor="dateTime">Date & Time Found *</Label>
              <p className="text-sm text-muted-foreground">
                Approximate time when you found the item
              </p>
              <Input
                id="dateTime"
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                required
              />
            </div>

            {/* Additional Context */}
            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Context (Optional)</Label>
              <Textarea
                id="additionalInfo"
                placeholder="Any other context that might help legitimate owners identify this as their item (without revealing specific details)"
                value={formData.additionalInfo}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                className="min-h-[100px]"
              />
            </div>

            {/* Contact Information */}
            <div className="space-y-4 p-4 bg-anonymous/5 rounded-lg border border-anonymous/20">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Contact Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value.trim() })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    type="text"
                    inputMode="tel"
                    placeholder="+1234567890"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Visible to claimants who contact you - you'll verify ownership through questions
              </p>
            </div>

            {/* Information Box */}
            <Card className="p-4 bg-muted/50">
              <h4 className="font-semibold mb-2 text-sm">How Anonymous Reports Work:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Only location and time are visible to potential owners</li>
                <li>• Owners who recognize the details will contact you</li>
                <li>• You verify ownership by asking specific questions</li>
                <li>• Item details stay private until you confirm the rightful owner</li>
              </ul>
            </Card>

            {/* Submit Button */}
            <div className="space-y-3 pt-4">
              <Button
                type="submit"
                className="w-full bg-anonymous hover:bg-anonymous/90"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Anonymous Report"
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Report will be visible in the Anonymous Found Items section
              </p>
            </div>
          </form>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default ReportAnonymous;
