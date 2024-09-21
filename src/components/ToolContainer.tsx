
import React from 'react';
import { cn } from '@/lib/utils';

interface ToolContainerProps {
  children: React.ReactNode;
  className?: string;
}

const ToolContainer: React.FC<ToolContainerProps> = ({ children, className }) => {
  return (
    <div className={cn('max-w-5xl mx-auto animate-fade-in', className)}>
      {children}
    </div>
  );
};

export default ToolContainer;
