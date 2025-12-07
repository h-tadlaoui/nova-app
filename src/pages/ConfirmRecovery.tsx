import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Award, PartyPopper, Star } from "lucide-react";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

const ConfirmRecovery = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || "Item";

  const handleConfirm = () => {
    toast.success("Item marked as recovered!", {
      description: "This case is now closed. Thank you for using FindBack!"
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
            <h1 className="text-lg font-semibold">Confirm Recovery</h1>
            <p className="text-xs text-muted-foreground">{category}</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <Card className="p-6 text-center bg-accent/10 border-accent/30">
          <PartyPopper className="w-16 h-16 text-accent mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Have You Received Your Item?
          </h2>
          <p className="text-sm text-muted-foreground">
            Confirming recovery will close this case and update your history
          </p>
        </Card>

        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Helper Badge</h3>
              <p className="text-sm text-muted-foreground">
                The finder will receive a badge for helping reunite you with your item!
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-muted/30">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-sm">Consider thanking the finder for their help!</span>
          </div>
        </Card>

        <div className="space-y-3 pt-4">
          <Button onClick={handleConfirm} className="w-full bg-accent hover:bg-accent/90" size="lg">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Yes, I've Received My Item
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)} className="w-full" size="lg">
            Not Yet
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default ConfirmRecovery;
