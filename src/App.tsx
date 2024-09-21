
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import JsonFormatter from "./pages/JsonFormatter";
import RegexTester from "./pages/RegexTester";
import MarkdownConverter from "./pages/MarkdownConverter";
import Base64Tool from "./pages/Base64Tool";
import ColorPalette from "./pages/ColorPalette";
import TextDiff from "./pages/TextDiff";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/json" element={<Layout><JsonFormatter /></Layout>} />
          <Route path="/regex" element={<Layout><RegexTester /></Layout>} />
          <Route path="/markdown" element={<Layout><MarkdownConverter /></Layout>} />
          <Route path="/base64" element={<Layout><Base64Tool /></Layout>} />
          <Route path="/colors" element={<Layout><ColorPalette /></Layout>} />
          <Route path="/diff" element={<Layout><TextDiff /></Layout>} />
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
