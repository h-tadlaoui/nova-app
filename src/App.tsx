import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import InterfaceSelector from "./pages/InterfaceSelector";
import IndexOption1 from "./pages/IndexOption1";
import IndexOption2 from "./pages/IndexOption2";
import IndexOption3 from "./pages/IndexOption3";
import IndexOption4 from "./pages/IndexOption4";
import ReportLost from "./pages/ReportLost";
import ReportFound from "./pages/ReportFound";
import ReportAnonymous from "./pages/ReportAnonymous";
import BrowseLost from "./pages/BrowseLost";
import BrowseFound from "./pages/BrowseFound";
import BrowseAnonymous from "./pages/BrowseAnonymous";
import Browse from "./pages/Browse";
import History from "./pages/History";
import ItemDetail from "./pages/ItemDetail";
import ClaimItem from "./pages/ClaimItem";
import VerifyClaims from "./pages/VerifyClaims";
import ContactExchange from "./pages/ContactExchange";
import ConfirmRecovery from "./pages/ConfirmRecovery";
import MatchResults from "./pages/MatchResults";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IndexOption3 />} />
          <Route path="/report-lost" element={<ReportLost />} />
          <Route path="/report-found" element={<ReportFound />} />
          <Route path="/report-anonymous" element={<ReportAnonymous />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/browse-lost" element={<BrowseLost />} />
          <Route path="/browse-found" element={<BrowseFound />} />
          <Route path="/browse-anonymous" element={<BrowseAnonymous />} />
          <Route path="/history" element={<History />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/claim/:id" element={<ClaimItem />} />
          <Route path="/verify/:id" element={<VerifyClaims />} />
          <Route path="/contact-exchange/:id" element={<ContactExchange />} />
          <Route path="/confirm-recovery/:id" element={<ConfirmRecovery />} />
          <Route path="/match-results" element={<MatchResults />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
