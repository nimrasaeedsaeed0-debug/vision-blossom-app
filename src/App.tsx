import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { WorkspaceProvider } from "@/hooks/useWorkspace";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Editor from "./pages/Editor";
import CreateWorkspace from "./pages/CreateWorkspace";
import Enhancer from "./pages/Enhancer";
import BgRemover from "./pages/BgRemover";
import ImageExpander from "./pages/ImageExpander";
import MagicErase from "./pages/MagicErase";
import StyleTransfer from "./pages/StyleTransfer";
import History from "./pages/History";
import Pricing from "./pages/Pricing";
import Templates from "./pages/Templates";
import AITools from "./pages/AITools";
import Settings from "./pages/Settings";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <WorkspaceProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Layout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/workspace/create" element={<ProtectedRoute requireWorkspace={false}><CreateWorkspace /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                  <Route path="/projects" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/editor" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
                  <Route path="/enhancer" element={<ProtectedRoute><Enhancer /></ProtectedRoute>} />
                  <Route path="/bg-remover" element={<ProtectedRoute><BgRemover /></ProtectedRoute>} />
                  <Route path="/expander" element={<ProtectedRoute><ImageExpander /></ProtectedRoute>} />
                  <Route path="/magic-erase" element={<ProtectedRoute><MagicErase /></ProtectedRoute>} />
                  <Route path="/style-transfer" element={<ProtectedRoute><StyleTransfer /></ProtectedRoute>} />
                  <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                  <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
                  <Route path="/ai-tools" element={<ProtectedRoute><AITools /></ProtectedRoute>} />
                  <Route path="/ai-tools/:toolId" element={<ProtectedRoute><AITools /></ProtectedRoute>} />
                  <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </BrowserRouter>
          </TooltipProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
