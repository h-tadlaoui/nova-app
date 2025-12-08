import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Tag, 
  Palette, 
  MessageCircle,
  Shield,
  CheckCircle2,
  Users,
  Image as ImageIcon,
  Mail,
  Phone
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ItemStatusBadge from "@/components/ItemStatusBadge";
import type { ItemStatus } from "@/types/item";

// Mock item data - in real app this would come from database
const mockItems: Record<string, {
  id: string;
  type: "lost" | "found" | "anonymous";
  category: string;
  description: string;
  brand?: string;
  color?: string;
  location: string;
  date: string;
  time?: string;
  status: ItemStatus;
  image?: string;
  contactEmail?: string;
  contactPhone?: string;
  claimsCount: number;
}> = {
  "lost-1": {
    id: "lost-1",
    type: "lost",
    category: "Phone",
    description: "Black iPhone 13 with cracked screen protector. Has a blue silicone case with a small sticker on the back.",
    brand: "Apple",
    color: "Black",
    location: "Central Park, near the fountain",
    date: "2024-03-15",
    status: "Active",
    contactEmail: "owner@email.com",
    claimsCount: 0,
  },
  "found-1": {
    id: "found-1",
    type: "found",
    category: "Keys",
    description: "Set of 3 keys with a blue keychain shaped like a dolphin. One key looks like a car key.",
    brand: "Unknown",
    color: "Silver with blue keychain",
    location: "City Library, reading room",
    date: "2024-03-16",
    time: "14:30",
    status: "Active",
    image: "/placeholder.svg",
    contactEmail: "finder@email.com",
    contactPhone: "+1234567890",
    claimsCount: 2,
  },
  "anonymous-1": {
    id: "anonymous-1",
    type: "anonymous",
    category: "Electronic Device",
    description: "", // Hidden for anonymous
    location: "Near university library entrance",
    date: "2024-03-16",
    time: "14:30",
    status: "Active",
    contactEmail: "finder@email.com",
    claimsCount: 1,
  },
};

const ItemDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "found";
  
  const [itemStatus, setItemStatus] = useState<ItemStatus>("Active");

  // Get item based on type and id
  const itemKey = `${type}-${id}`;
  const item = mockItems[itemKey] || mockItems["found-1"];

  const isOwner = false; // In real app, check if current user is the owner
  const isFinder = true; // In real app, check if current user is the finder

  const getBackPath = () => {
    switch (item.type) {
      case "lost": return "/browse-lost";
      case "found": return "/browse-found";
      case "anonymous": return "/browse-anonymous";
      default: return "/browse";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pb-24">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(getBackPath())}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{item.category}</h1>
              <p className="text-sm text-muted-foreground capitalize">{item.type} Item</p>
            </div>
            <ItemStatusBadge status={itemStatus} />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Image Section */}
        {item.type !== "anonymous" && (
          <Card className="overflow-hidden">
            {item.image ? (
              <img 
                src={item.image} 
                alt={item.category}
                className="w-full h-64 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-muted flex items-center justify-center">
                <ImageIcon className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </Card>
        )}

        {/* Anonymous Warning */}
        {item.type === "anonymous" && (
          <Card className="p-4 bg-[hsl(var(--anonymous-color))]/10 border-[hsl(var(--anonymous-color))]/30">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[hsl(var(--anonymous-color))] mt-0.5" />
              <div>
                <p className="font-medium text-sm">Anonymous Report</p>
                <p className="text-sm text-muted-foreground">
                  Item details are hidden. Contact the finder to verify ownership through questions.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Finder Contact Info for Anonymous Items */}
        {item.type === "anonymous" && (item.contactEmail || item.contactPhone) && (
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">Contact Finder</h2>
            <div className="space-y-3">
              {item.contactEmail && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <a href={`mailto:${item.contactEmail}`} className="font-medium text-primary hover:underline">
                      {item.contactEmail}
                    </a>
                  </div>
                </div>
              )}
              {item.contactPhone && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <a href={`tel:${item.contactPhone}`} className="font-medium text-primary hover:underline">
                      {item.contactPhone}
                    </a>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Reach out to the finder and describe your item to verify ownership.
            </p>
          </Card>
        )}

        {/* Details Card */}
        <Card className="p-6 space-y-4">
          {item.type !== "anonymous" && (
            <div>
              <h2 className="font-semibold text-lg mb-2">Description</h2>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {item.brand && item.type !== "anonymous" && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Brand</p>
                  <p className="font-medium">{item.brand}</p>
                </div>
              </div>
            )}
            {item.color && item.type !== "anonymous" && (
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Color</p>
                  <p className="font-medium">{item.color}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium">{item.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-medium">
                  {new Date(item.date).toLocaleDateString()}
                  {item.time && ` at ${item.time}`}
                </p>
              </div>
            </div>
          </div>

          {item.claimsCount > 0 && isFinder && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm">
                <strong>{item.claimsCount}</strong> pending claim{item.claimsCount > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* For potential owner - Claim button (only for anonymous items) */}
          {itemStatus === "Active" && !isFinder && item.type === "anonymous" && (
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => navigate(`/claim/${id}?category=${item.category}`)}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Claim This Item
            </Button>
          )}

          {/* For finder - Review claims */}
          {isFinder && item.claimsCount > 0 && itemStatus !== "Recovered" && (
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => navigate(`/verify/${id}`)}
            >
              <Shield className="w-5 h-5 mr-2" />
              Review Claims ({item.claimsCount})
            </Button>
          )}

          {/* For owner when item is on its way */}
          {itemStatus === "Item on its way" && isOwner && (
            <Button 
              className="w-full bg-accent hover:bg-accent/90" 
              size="lg"
              onClick={() => navigate(`/confirm-recovery/${id}?category=${item.category}`)}
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Confirm Item Received
            </Button>
          )}

          {/* Status info */}
          {itemStatus === "Verification Pending" && (
            <Card className="p-4 bg-yellow-500/10 border-yellow-500/30">
              <p className="text-sm text-center text-muted-foreground">
                Waiting for finder to verify your claim
              </p>
            </Card>
          )}

          {itemStatus === "Item on its way" && isFinder && (
            <Card className="p-4 bg-primary/10 border-primary/30">
              <p className="text-sm text-center text-muted-foreground">
                Waiting for owner to confirm receipt
              </p>
            </Card>
          )}

          {itemStatus === "Recovered" && (
            <Card className="p-4 bg-accent/10 border-accent/30">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-accent" />
                <p className="text-sm font-medium text-accent">
                  Item Successfully Recovered!
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ItemDetail;
