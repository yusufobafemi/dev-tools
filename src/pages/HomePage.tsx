
import { Link } from 'react-router-dom';
import ToolContainer from '@/components/ToolContainer';
import { FileJson, FileCode, FileText, Code, Palette, FileDiff } from 'lucide-react';

const ToolCard = ({ 
  icon: Icon, 
  title, 
  description, 
  to 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  to: string;
}) => (
  <Link to={to} className="tool-card flex flex-col items-center text-center">
    <div className="mb-3 bg-primary/10 p-4 rounded-full">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </Link>
);

const HomePage = () => {
  const tools = [
    {
      icon: FileJson,
      title: 'JSON Formatter',
      description: 'Format, validate and beautify JSON with syntax highlighting',
      to: '/json'
    },
    {
      icon: FileCode,
      title: 'Regex Tester',
      description: 'Build, test, and debug regular expressions with live results',
      to: '/regex'
    },
    {
      icon: FileText,
      title: 'Markdown Converter',
      description: 'Write markdown with live preview and HTML conversion',
      to: '/markdown'
    },
    {
      icon: Code,
      title: 'Base64 Tool',
      description: 'Encode and decode strings to and from Base64 format',
      to: '/base64'
    },
    {
      icon: Palette,
      title: 'Color Palette',
      description: 'Generate harmonious color schemes from a base color',
      to: '/colors'
    },
    {
      icon: FileDiff,
      title: 'Text Diff',
      description: 'Compare two text blocks and highlight the differences',
      to: '/diff'
    },
  ];

  return (
    <ToolContainer>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Dev Toolbox</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          All-in-one collection of developer utilities to make your workflow smoother and more efficient. 
          Choose a tool to get started.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <ToolCard key={tool.title} {...tool} />
        ))}
      </div>
    </ToolContainer>
  );
};

export default HomePage;
