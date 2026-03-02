import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import StudentRequests from "./pages/student/StudentRequests";
import StudentDiplomas from "./pages/student/StudentDiplomas";
import InstitutionRequests from "./pages/institution/InstitutionRequests";
import InstitutionDiplomas from "./pages/institution/InstitutionDiplomas";
import InstitutionBusinessRequests from "./pages/institution/InstitutionBusinessRequests";
import BusinessRequests from "./pages/business/BusinessRequests";
import BusinessGrants from "./pages/business/BusinessGrants";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/student/requests" element={<ProtectedRoute allowedRoles={["student"]}><StudentRequests /></ProtectedRoute>} />
              <Route path="/student/diplomas" element={<ProtectedRoute allowedRoles={["student"]}><StudentDiplomas /></ProtectedRoute>} />
              <Route path="/institution/requests" element={<ProtectedRoute allowedRoles={["institution"]}><InstitutionRequests /></ProtectedRoute>} />
              <Route path="/institution/diplomas" element={<ProtectedRoute allowedRoles={["institution"]}><InstitutionDiplomas /></ProtectedRoute>} />
              <Route path="/institution/business-requests" element={<ProtectedRoute allowedRoles={["institution"]}><InstitutionBusinessRequests /></ProtectedRoute>} />
              <Route path="/business/requests" element={<ProtectedRoute allowedRoles={["business"]}><BusinessRequests /></ProtectedRoute>} />
              <Route path="/business/grants" element={<ProtectedRoute allowedRoles={["business"]}><BusinessGrants /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
