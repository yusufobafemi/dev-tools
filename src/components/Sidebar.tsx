
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FileJson, 
  FileCode, 
  FileText, 
  Code, 
  Palette, 
  FileDiff,
  Home,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'JSON Formatter', href: '/json', icon: FileJson },
    { name: 'Regex Tester', href: '/regex', icon: FileCode },
    { name: 'Markdown Converter', href: '/markdown', icon: FileText },
    { name: 'Base64 Tool', href: '/base64', icon: Code },
    { name: 'Color Palette', href: '/colors', icon: Palette },
    { name: 'Text Diff', href: '/diff', icon: FileDiff },
  ];

  return (
    <div className={cn(
      'fixed top-0 left-0 z-40 h-screen transition-all duration-300',
      isOpen ? 'w-64' : 'w-0 md:w-16',
    )}>
      <div className={cn(
        'h-full bg-sidebar px-3 py-4 overflow-y-auto flex flex-col',
        isOpen ? 'min-w-64' : 'hidden md:flex md:min-w-16 md:items-center'
      )}>
        <div className="flex items-center mb-5 justify-between">
          {isOpen && <h1 className="text-sidebar-foreground font-bold text-xl">Dev Toolbox</h1>}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="text-sidebar-foreground"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <ul className="space-y-2 flex-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink 
                to={item.href} 
                className={({ isActive }) => cn(
                  'tool-navigation-item',
                  isActive ? 'active' : '',
                  !isOpen && 'justify-center'
                )}
                aria-current={currentPath === item.href ? 'page' : undefined}
              >
                <item.icon className={cn('w-5 h-5', isOpen ? 'mr-3' : '')} />
                {isOpen && <span>{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="pt-3 mt-3 border-t border-sidebar-border">
          <a 
            href="https://github.com/yourusername/dev-toolbox" 
            target="_blank" 
            rel="noopener noreferrer"
            className={cn(
              'tool-navigation-item opacity-75 hover:opacity-100',
              !isOpen && 'justify-center'
            )}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={cn('w-5 h-5', isOpen ? 'mr-3' : '')} 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            {isOpen && <span>GitHub</span>}
          </a>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
