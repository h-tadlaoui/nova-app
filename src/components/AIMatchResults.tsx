import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MapPin, Clock, CheckCircle2, XCircle, Sparkles, MessageCircle } from "lucide-react";

interface MatchItem {
  id: number;
  category: string;
  description: string;
  location: string;
  date: string;
  matchScore: number;
  type: "lost" | "found";
}

interface AIMatchResultsProps {
  open: boolean;
  onClose: () => void;
  matches: MatchItem[];
  searchType: "lost" | "found";
}

const AIMatchResults = ({ open, onClose, matches, searchType }: AIMatchResultsProps) => {
  const getMatchColor = (score: number) => {
    if (score >= 80) return "text-green-500 bg-green-500/10";
    if (score >= 60) return "text-yellow-500 bg-yellow-500/10";
    return "text-orange-500 bg-orange-500/10";
  };

  const getMatchLabel = (score: number) => {
    if (score >= 80) return "High Match";
    if (score >= 60) return "Possible Match";
    return "Low Match";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Match Results
          </DialogTitle>
          <DialogDescription>
            {matches.length > 0
              ? `Found ${matches.length} potential ${searchType === "lost" ? "found items" : "lost reports"} that match`
              : "No matches found yet"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {matches.length > 0 ? (
            matches.map((item) => (
              <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{item.category}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    <Badge className={getMatchColor(item.matchScore)}>
                      {item.matchScore}% - {getMatchLabel(item.matchScore)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {item.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Contact
                    </Button>
                    <Button size="sm" variant="outline">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      This is it
                    </Button>
                    <Button size="sm" variant="ghost">
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-semibold mb-2">No Matches Found</h4>
              <p className="text-sm text-muted-foreground">
                We'll notify you when a potential match is reported
              </p>
            </Card>
          )}
        </div>

        <div className="pt-4 border-t">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIMatchResults;
