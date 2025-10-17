import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import RatForm from "./pages/RatForm";
import NotFound from "./pages/NotFound";
import Troubleshooter from "./pages/Troubleshooter";
import ServiceManager from "./pages/ServiceManager";
import { ServiceManagerProvider } from "@/hooks/use-service-manager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ServiceManagerProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/rat" element={<RatForm />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="/troubleshooter" element={<Troubleshooter />} />
            <Route path="/service-manager" element={<ServiceManager />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ServiceManagerProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
