import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Camera, MapPin, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import AIProcessing from "@/components/AIProcessing";
import { createItem } from "@/hooks/useItems";
import { triggerAIMatching } from "@/hooks/useMatches";

const ReportFound = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdItemId, setCreatedItemId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    image: null as File | null,
    description: "",
    category: "",
    brand: "",
    color: "",
    location: "",
    contactEmail: "",
    contactPhone: "",
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image) {
      toast.error("Photo is required for found item reports");
      return;
    }

    if (!formData.description || !formData.category || !formData.location) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const item = await createItem({
        type: "found",
        category: formData.category,
        description: formData.description,
        brand: formData.brand || undefined,
        color: formData.color || undefined,
        location: formData.location,
        date: new Date().toISOString().split("T")[0],
        contact_email: formData.contactEmail || undefined,
        contact_phone: formData.contactPhone || undefined,
        image: formData.image,
      });

      toast.success("Found item reported!");
      setCreatedItemId(item.id);
      setIsProcessing(true);
    } catch (error) {
      console.error("Error creating item:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit report");
      setIsSubmitting(false);
    }
  };

  const handleProcessingComplete = async () => {
    if (createdItemId) {
      try {
        await triggerAIMatching(createdItemId, "found");
        toast.success("AI matching complete!");
      } catch (error) {
        console.error("AI matching error:", error);
        toast.info("Report saved. AI matching will run in background.");
      }
    }
    setIsProcessing(false);
    navigate("/match-results?type=found");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pb-20">
      {isProcessing && <AIProcessing onComplete={handleProcessingComplete} />}

      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Report Found Item</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload - Required */}
            <div className="space-y-2">
              <Label>Item Photo *</Label>
              <p className="text-sm text-muted-foreground">
                A photo is required to help match with the owner
              </p>
              <div className="flex gap-3">
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    required
                  />
                  <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-primary rounded-lg hover:border-primary/70 cursor-pointer transition-colors">
                    <Upload className="w-5 h-5 text-primary" />
                    <span className="text-sm">Upload Photo</span>
                  </div>
                </label>
                <label>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-primary rounded-lg hover:border-primary/70 cursor-pointer transition-colors">
                    <Camera className="w-5 h-5 text-primary" />
                  </div>
                </label>
              </div>
              {formData.image && (
                <p className="text-sm text-accent">✓ Image uploaded: {formData.image.name}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                placeholder="e.g., Phone, Wallet, Keys, Bag"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the item: brand, color, condition, distinctive features..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[120px]"
                required
              />
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  placeholder="e.g., Samsung, Apple"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  placeholder="e.g., Black, Blue"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location Where Found *</Label>
              <div className="flex gap-2">
                <Input
                  id="location"
                  placeholder="Enter or select on map"
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

            {/* Contact Information */}
            <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h3 className="font-semibold">Contact Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Your contact info stays private until both parties confirm the match
              </p>
            </div>

            {/* Submit Button */}
            <div className="space-y-3 pt-4">
              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Found Item Report"
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Our AI will automatically search for the owner and notify you
              </p>
            </div>
          </form>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default ReportFound;
