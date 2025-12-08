import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, MapPin, Clock, Filter, Package } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const BrowseFound = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Only show active found items
  const foundItems = [
    {
      id: 1,
      category: "Keys",
      description: "Set of keys with blue keychain",
      location: "City Library",
      date: "2024-03-16",
      status: "Active",
    },
    {
      id: 2,
      category: "Phone",
      description: "Samsung Galaxy with purple case",
      location: "Bus Station",
      date: "2024-03-15",
      status: "Active",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pb-20">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/browse")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Found Items</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Search & Filters */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by category, brand, color..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Badge className="cursor-pointer whitespace-nowrap">All</Badge>
            <Badge variant="outline" className="cursor-pointer whitespace-nowrap">Electronics</Badge>
            <Badge variant="outline" className="cursor-pointer whitespace-nowrap">Accessories</Badge>
            <Badge variant="outline" className="cursor-pointer whitespace-nowrap">Documents</Badge>
            <Badge variant="outline" className="cursor-pointer whitespace-nowrap">Keys</Badge>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-4">
          {foundItems.length} active found items
        </p>

        {/* Items Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {foundItems.map((item) => (
            <Card 
              key={item.id} 
              className="p-4 hover:shadow-lg transition-shadow cursor-pointer border-primary/30"
              onClick={() => navigate(`/item/${item.id}?type=found`)}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{item.category}</h3>
                      <Badge variant="default" className="mt-1">
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>

                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                </div>

                <Button 
                  variant="outline"
                  size="sm" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/item/${item.id}?type=found`);
                  }}
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {foundItems.length === 0 && (
          <Card className="p-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No items found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </Card>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
};

export default BrowseFound;
