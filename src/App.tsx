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
import ContactExchange from "./pages/ContactExchange";
import ConfirmRecovery from "./pages/ConfirmRecovery";
import MatchResults from "./pages/MatchResults";
import MyReports from "./pages/MyReports";
import ReportDetail from "./pages/ReportDetail";
import Notifications from "./pages/Notifications";
import RequestContact from "./pages/RequestContact";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><IndexOption3 /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/report-lost" element={<ProtectedRoute><ReportLost /></ProtectedRoute>} />
          <Route path="/report-found" element={<ProtectedRoute><ReportFound /></ProtectedRoute>} />
          <Route path="/report-anonymous" element={<ProtectedRoute><ReportAnonymous /></ProtectedRoute>} />
          <Route path="/browse" element={<ProtectedRoute><Browse /></ProtectedRoute>} />
          <Route path="/browse-lost" element={<ProtectedRoute><BrowseLost /></ProtectedRoute>} />
          <Route path="/browse-found" element={<ProtectedRoute><BrowseFound /></ProtectedRoute>} />
          <Route path="/browse-anonymous" element={<ProtectedRoute><BrowseAnonymous /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/item/:id" element={<ProtectedRoute><ItemDetail /></ProtectedRoute>} />
          <Route path="/claim/:id" element={<ProtectedRoute><ClaimItem /></ProtectedRoute>} />
          <Route path="/contact-exchange/:id" element={<ProtectedRoute><ContactExchange /></ProtectedRoute>} />
          <Route path="/confirm-recovery/:id" element={<ProtectedRoute><ConfirmRecovery /></ProtectedRoute>} />
          <Route path="/match-results" element={<ProtectedRoute><MatchResults /></ProtectedRoute>} />
          <Route path="/my-reports" element={<ProtectedRoute><MyReports /></ProtectedRoute>} />
          <Route path="/my-reports/:id" element={<ProtectedRoute><ReportDetail /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/request-contact/:id" element={<ProtectedRoute><RequestContact /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
