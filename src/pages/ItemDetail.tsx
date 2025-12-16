import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ItemStatusBadge from "@/components/ItemStatusBadge";
import { getItem } from "@/hooks/useItems";
import type { Item } from "@/types/item";

const ItemDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      try {
        const data = await getItem(id);
        setItem(data);
      } catch (err) {
        console.error("Error fetching item:", err);
        setError("Failed to load item details");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const getBackPath = () => {
    if (!item) return "/browse";
    switch (item.type) {
      case "lost": return "/browse-lost";
      case "found": return "/browse-found";
      case "anonymous": return "/browse-anonymous";
      default: return "/browse";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-destructive mb-4">{error || "Item not found"}</p>
        <Button onClick={() => navigate("/browse")}>Back to Browse</Button>
      </div>
    );
  }

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
            <ItemStatusBadge status={item.status} />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Image Section - only for lost/found items */}
        {item.type !== "anonymous" && (
          <Card className="overflow-hidden">
            {item.image_url ? (
              <img
                src={item.image_url}
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

        {/* Anonymous Info Card */}
        {item.type === "anonymous" && (
          <Card className="p-4 bg-[hsl(var(--anonymous-color))]/10 border-[hsl(var(--anonymous-color))]/30">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[hsl(var(--anonymous-color))] mt-0.5" />
              <div>
                <p className="font-medium text-sm">Anonymous Report</p>
                <p className="text-sm text-muted-foreground">
                  Item details are hidden. Contact the finder to verify ownership.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Request Contact Button - for Anonymous items */}
        {item.type === "anonymous" && (
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">Request Contact Information</h2>
            <p className="text-sm text-muted-foreground">
              If you believe this is your item, request the finder's contact information.
              They will review your request and share their contact if approved.
            </p>
            <Button
              className="w-full"
              onClick={() => navigate(`/request-contact/${id}?category=${item.category}`)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Request Contact
            </Button>
          </Card>
        )}

        {/* Details Card */}
        <Card className="p-6 space-y-4">
          {item.type !== "anonymous" && item.description && (
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
        </Card>

      </div>

      <BottomNav />
    </div>
  );
};

export default ItemDetail;