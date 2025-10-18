import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import RatForm from "./pages/RatForm";
import NotFound from "./pages/NotFound";
import SupportCenter from "./pages/SupportCenter";
import ServiceManager from "./pages/ServiceManager";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { ServiceManagerProvider } from "@/hooks/use-service-manager";
import { RatAutofillProvider } from "@/context/RatAutofillContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ServiceManagerProvider>
          <RatAutofillProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/rat" element={<RatForm />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="/support" element={<SupportCenter />} />
              <Route path="/service-manager" element={<ServiceManager />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RatAutofillProvider>
        </ServiceManagerProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
