
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ 
  code, 
  language = 'plaintext', 
  className 
}) => {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy');
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className={cn('rounded-md overflow-hidden', className)}>
      <div className="flex items-center justify-between bg-code px-4 py-2">
        <span className="text-xs text-code-foreground/70">{language}</span>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={copyToClipboard} 
          className="h-8 text-code-foreground hover:text-code-foreground/70"
        >
          Copy
        </Button>
      </div>
      <pre className="m-0 p-4 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
