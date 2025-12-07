import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, HelpCircle, CheckCircle2, XCircle, User, Clock } from "lucide-react";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

interface Claim {
  id: string;
  claimantEmail: string;
  message: string;
  createdAt: string;
}

// Mock claims data
const mockClaims: Claim[] = [
  {
    id: "claim-1",
    claimantEmail: "john@example.com",
    message: "This is my black iPhone 14 Pro. It has a small scratch on the back near the camera and a blue silicone case. The lock screen wallpaper is a picture of my dog.",
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "claim-2",
    claimantEmail: "jane@example.com",
    message: "I lost my phone at Central Park. It's a black iPhone.",
    createdAt: "2024-01-14T15:45:00Z"
  }
];

const VerifyClaims = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [claims] = useState<Claim[]>(mockClaims);

  const handleAskQuestion = () => {
    if (!selectedClaim || !question.trim()) {
      toast.error("Please enter a verification question");
      return;
    }
    toast.success("Question sent to claimant");
    setQuestion("");
  };

  const handleVerify = (claimId: string) => {
    toast.success("Ownership verified!", {
      description: "Contact information will be exchanged"
    });
    navigate(`/contact-exchange/${id}?role=finder`);
  };

  const handleReject = (claimId: string) => {
    toast.info("Claim rejected");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Verify Claims</h1>
            <p className="text-xs text-muted-foreground">{claims.length} pending claims</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-sm">Review Claims</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Ask verification questions to confirm ownership before sharing contact info.
              </p>
            </div>
          </div>
        </Card>

        {claims.length > 0 ? (
          <div className="space-y-4">
            {claims.map((claim) => (
              <Card 
                key={claim.id} 
                className={`p-4 transition-all ${
                  selectedClaim === claim.id 
                    ? "border-primary ring-2 ring-primary/20" 
                    : ""
                }`}
                onClick={() => setSelectedClaim(claim.id)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{claim.claimantEmail}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(claim.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">
                      "{claim.message}"
                    </p>
                  </div>

                  {selectedClaim === claim.id && (
                    <div className="space-y-4 pt-3 border-t">
                      <div className="space-y-2">
                        <Label className="text-sm">Ask a verification question</Label>
                        <Textarea
                          placeholder="e.g., What color is the phone case? Is there a scratch on the back?"
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          className="min-h-[80px]"
                        />
                        <Button 
                          variant="outline" 
                          onClick={handleAskQuestion}
                          className="w-full"
                        >
                          <HelpCircle className="w-4 h-4 mr-2" />
                          Send Question
                        </Button>
                      </div>

                      <div className="flex gap-3">
                        <Button 
                          className="flex-1"
                          onClick={() => handleVerify(claim.id)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Verify Owner
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => handleReject(claim.id)}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-semibold mb-2">No Claims Yet</h4>
            <p className="text-sm text-muted-foreground">
              You'll be notified when someone claims this item
            </p>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default VerifyClaims;
