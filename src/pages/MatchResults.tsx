import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Percent, MessageCircle, CheckCircle2, Search } from "lucide-react";
import BottomNav from "@/components/BottomNav";

interface MatchItem {
  id: string;
  category: string;
  description: string;
  location: string;
  date: string;
  matchScore: number;
  type: "lost" | "found";
}

// Mock match data
const mockMatches: MatchItem[] = [
  {
    id: "1",
    category: "Phone",
    description: "Black iPhone 14 Pro with blue case",
    location: "Central Park, NYC",
    date: "2024-01-15",
    matchScore: 92,
    type: "found"
  },
  {
    id: "2",
    category: "Phone",
    description: "Dark smartphone, possibly iPhone",
    location: "Manhattan, NY",
    date: "2024-01-14",
    matchScore: 78,
    type: "found"
  },
  {
    id: "3",
    category: "Phone",
    description: "iPhone found near subway",
    location: "Times Square Station",
    date: "2024-01-13",
    matchScore: 65,
    type: "found"
  }
];

const MatchResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchType = searchParams.get("type") || "lost";

  const getMatchColor = (score: number) => {
    if (score >= 80) return "text-accent bg-accent/10 border-accent/30";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-muted-foreground bg-muted/50 border-muted";
  };

  const getMatchLabel = (score: number) => {
    if (score >= 80) return "High Match";
    if (score >= 60) return "Possible Match";
    return "Low Match";
  };

  const handleContact = (item: MatchItem) => {
    if (searchType === "lost") {
      navigate(`/claim/${item.id}?category=${item.category}`);
    } else {
      navigate(`/contact-exchange/${item.id}?role=finder`);
    }
  };

  const handleConfirmMatch = (item: MatchItem) => {
    navigate(`/contact-exchange/${item.id}?role=${searchType === "lost" ? "owner" : "finder"}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">AI Match Results</h1>
            <p className="text-xs text-muted-foreground">
              {mockMatches.length} potential matches found
            </p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <Search className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-sm">
                {searchType === "lost" 
                  ? "Found Items That Match Your Lost Item" 
                  : "Lost Items That Match Your Found Item"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Review matches below and contact potential {searchType === "lost" ? "finders" : "owners"}
              </p>
            </div>
          </div>
        </Card>

        {mockMatches.length > 0 ? (
          <div className="space-y-4">
            {mockMatches.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{item.category}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    <Badge className={getMatchColor(item.matchScore)}>
                      <Percent className="w-3 h-3 mr-1" />
                      {item.matchScore}%
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {item.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-xs">
                    <span className={`px-2 py-1 rounded-full ${getMatchColor(item.matchScore)}`}>
                      {getMatchLabel(item.matchScore)}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleContact(item)}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Contact
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleConfirmMatch(item)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      This is it
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-semibold mb-2">No Matches Found</h4>
            <p className="text-sm text-muted-foreground">
              We couldn't find any matching items. Try browsing all items manually.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate("/browse")}
            >
              Browse All Items
            </Button>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default MatchResults;
