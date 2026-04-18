import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import ImageToVideo from "./pages/ImageToVideo";
import Enhancer from "./pages/Enhancer";
import BgRemover from "./pages/BgRemover";
import ImageExpander from "./pages/ImageExpander";
import MagicErase from "./pages/MagicErase";
import StyleTransfer from "./pages/StyleTransfer";
import PresentationBuilder from "./pages/PresentationBuilder";
import CaptionGenerator from "./pages/CaptionGenerator";
import History from "./pages/History";
import Pricing from "./pages/Pricing";
import Templates from "./pages/Templates";
import AITools from "./pages/AITools";
import BrandKit from "./pages/BrandKit";
import Projects from "./pages/Projects";
import Settings from "./pages/Settings";
import Favorites from "./pages/Favorites";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
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
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/editor" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
                <Route path="/image-to-video" element={<ProtectedRoute><ImageToVideo /></ProtectedRoute>} />
                <Route path="/enhancer" element={<ProtectedRoute><Enhancer /></ProtectedRoute>} />
                <Route path="/bg-remover" element={<ProtectedRoute><BgRemover /></ProtectedRoute>} />
                <Route path="/expander" element={<ProtectedRoute><ImageExpander /></ProtectedRoute>} />
                <Route path="/magic-erase" element={<ProtectedRoute><MagicErase /></ProtectedRoute>} />
                <Route path="/style-transfer" element={<ProtectedRoute><StyleTransfer /></ProtectedRoute>} />
                <Route path="/presentations" element={<ProtectedRoute><PresentationBuilder /></ProtectedRoute>} />
                <Route path="/captions" element={<ProtectedRoute><CaptionGenerator /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
                <Route path="/ai-tools" element={<ProtectedRoute><AITools /></ProtectedRoute>} />
                <Route path="/ai-tools/:toolId" element={<ProtectedRoute><AITools /></ProtectedRoute>} />
                <Route path="/brand-kit" element={<ProtectedRoute><BrandKit /></ProtectedRoute>} />
                <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/coming-soon/:feature" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
