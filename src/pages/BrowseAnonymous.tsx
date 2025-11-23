import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, MapPin, Clock, Filter, Shield } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const BrowseAnonymous = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data
  const anonymousItems = [
    {
      id: 1,
      category: "Electronic Device",
      location: "Near university library entrance",
      date: "2024-03-16",
      time: "14:30",
      status: "Active",
    },
    {
      id: 2,
      category: "Accessory",
      location: "Coffee shop on Main Street",
      date: "2024-03-15",
      time: "10:15",
      status: "Multiple Claims",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pb-20">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-anonymous" />
              <h1 className="text-xl font-bold">Anonymous Reports</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Info Banner */}
        <Card className="p-4 mb-6 bg-anonymous/5 border-anonymous/30">
          <p className="text-sm text-muted-foreground">
            <strong>Anonymous reports</strong> show only location and time. If you recognize where you lost something, 
            contact the finder to verify ownership.
          </p>
        </Card>

        {/* Search & Filters */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by location or date..."
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
            <Badge variant="outline" className="cursor-pointer whitespace-nowrap bg-anonymous/10 border-anonymous/30">All</Badge>
            <Badge variant="outline" className="cursor-pointer whitespace-nowrap">Electronic Device</Badge>
            <Badge variant="outline" className="cursor-pointer whitespace-nowrap">Accessory</Badge>
            <Badge variant="outline" className="cursor-pointer whitespace-nowrap">Document</Badge>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-4">
          {anonymousItems.length} anonymous found item reports
        </p>

        {/* Items Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {anonymousItems.map((item) => (
            <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer border-anonymous/30">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-anonymous/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-anonymous" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{item.category}</h3>
                      <Badge 
                        variant={item.status === "Active" ? "outline" : "secondary"} 
                        className="mt-1 border-anonymous/30"
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-anonymous mt-0.5" />
                    <span className="text-muted-foreground">{item.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-anonymous" />
                    <span>
                      {new Date(item.date).toLocaleDateString()} at {item.time}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-3">
                    <Shield className="w-3 h-3 inline mr-1" />
                    Details hidden for security
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-anonymous/30 hover:bg-anonymous hover:text-anonymous-foreground"
                  >
                    Contact Finder
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {anonymousItems.length === 0 && (
          <Card className="p-12 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No anonymous reports</h3>
            <p className="text-muted-foreground">Check back later for new reports</p>
          </Card>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
};

export default BrowseAnonymous;
