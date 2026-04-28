import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/NotFound.tsx";
import Landing from "./pages/Landing";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import LocationUpdate from "./pages/LocationUpdate";
import MapConfirm from "./pages/MapConfirm";
import Filters from "./pages/Filters";
import Matches from "./pages/Matches";
import PartnerProfile from "./pages/PartnerProfile";
import Notifications from "./pages/Notifications";
import Chat from "./pages/Chat";
import SessionUpcoming from "./pages/SessionUpcoming";
import SessionActive from "./pages/SessionActive";
import Feedback from "./pages/Feedback";
import Thanks from "./pages/Thanks";
import Profile from "./pages/Profile";
import { AuthProvider, useAuth } from "./context/AuthContext";

const queryClient = new QueryClient();

const Protected = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route path="/home" element={<Protected><Home /></Protected>} />
            <Route path="/location" element={<Protected><LocationUpdate /></Protected>} />
            <Route path="/map-confirm" element={<Protected><MapConfirm /></Protected>} />
            <Route path="/filters" element={<Protected><Filters /></Protected>} />
            <Route path="/matches" element={<Protected><Matches /></Protected>} />
            <Route path="/partner/:id" element={<Protected><PartnerProfile /></Protected>} />
            <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
            <Route path="/chat" element={<Protected><Chat /></Protected>} />
            <Route path="/chat/:id" element={<Protected><Chat /></Protected>} />
            <Route path="/session-upcoming" element={<Protected><SessionUpcoming /></Protected>} />
            <Route path="/session-active" element={<Protected><SessionActive /></Protected>} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/thanks" element={<Thanks />} />
            <Route path="/profile" element={<Protected><Profile /></Protected>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
