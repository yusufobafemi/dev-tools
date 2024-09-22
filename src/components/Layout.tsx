
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const currentPath = location.pathname;

  // Map routes to their display names
  const pageNames: Record<string, string> = {
    '/': 'Home',
    '/json': 'JSON Formatter',
    '/regex': 'Regex Tester',
    '/markdown': 'Markdown Converter',
    '/base64': 'Base64 Encoder/Decoder',
    '/colors': 'Color Palette Generator',
    '/diff': 'Text Diff Viewer',
  };

  const currentPageName = pageNames[currentPath] || 'Page Not Found';

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className={cn(
        'flex flex-col flex-1 transition-all duration-300',
        sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0 md:ml-16'
      )}>
        <header className="flex items-center justify-between px-4 h-16 border-b border-border">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="md:hidden mr-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">{currentPageName}</h1>
          </div>
          <ThemeToggle />
        </header>
        
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
        
        <footer className="p-4 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            Dev Toolbox &copy; {new Date().getFullYear()} |{' '}
            <a 
              href="https://github.com/yusufobafemi/dev-toolbox" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              GitHub
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
