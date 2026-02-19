import AdminLogin from "./pages/AdminLogin";
import AdminHome from "./pages/AdminHome";
import AdminScheduler from "./pages/AdminScheduler";
import AdminCrew from "./pages/AdminCrew";
import AdminRoutePlanner from "./pages/AdminRoutePlanner";
import AdminBuses from "./pages/AdminBuses";
import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import BusSearch from "./pages/BusSearch";
import RoutesPage from "./pages/Routes";
import Login from "./pages/Login";
// Admin panel removed per request
import UserDashboard from "./pages/UserDashboard";
import UserProfile from "./pages/UserProfile";
import TravelHistory from "./pages/TravelHistory";
import UserSettings from "./pages/UserSettings";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AdvertiseWithUs from "./pages/AdvertiseWithUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<BusSearch />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/login" element={<Login />} />

          {/* User Routes */}
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/history" element={<TravelHistory />} />
          <Route path="/settings" element={<UserSettings />} />

          {/* Admin Routes (new) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminHome />} />
          <Route path="/admin/scheduler" element={<AdminScheduler />} />
          <Route path="/admin/crew" element={<AdminCrew />} />
          <Route path="/admin/route-planner" element={<AdminRoutePlanner />} />
          <Route path="/admin/buses" element={<AdminBuses />} />

          {/* Public Pages */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/advertise-with-us" element={<AdvertiseWithUs />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/help" element={<FAQ />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          {/* Placeholder routes for future implementation */}
          <Route
            path="/advertise"
            element={
              <div className="p-8 text-center">
                Advertisement submission form coming soon!
              </div>
            }
          />
          <Route
            path="/terms"
            element={
              <div className="p-8 text-center">
                Terms of Service coming soon!
              </div>
            }
          />
          <Route
            path="/privacy"
            element={
              <div className="p-8 text-center">Privacy Policy coming soon!</div>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
