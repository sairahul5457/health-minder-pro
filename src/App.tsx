import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RemindersProvider } from "@/context/RemindersContext";
import { ProfileProvider, useProfile } from "@/context/ProfileContext";
import ReminderAlertManager from "./components/ReminderAlertManager";
import Index from "./pages/Index";
import Medications from "./pages/Medications";
import AddMedication from "./pages/AddMedication";
import Profile from "./pages/Profile";
import SetupProfile from "./pages/SetupProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-xl gradient-hero animate-pulse" />
      </div>
    );
  }

  if (!profile) {
    return <SetupProfile />;
  }

  return (
    <RemindersProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ReminderAlertManager />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/medications" element={<Medications />} />
          <Route path="/add-medication" element={<AddMedication />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </RemindersProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ProfileProvider>
        <AppContent />
      </ProfileProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
