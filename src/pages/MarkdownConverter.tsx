import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ToolContainer from '@/components/ToolContainer';
import CodeBlock from '@/components/CodeBlock';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText } from 'lucide-react';

// Simple markdown parser (just for basic demonstration)
const parseMarkdown = (markdown: string): string => {
  if (!markdown) return '';
  
  let html = markdown
    // Headers
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
    .replace(/^##### (.*$)/gm, '<h5>$1</h5>')
    .replace(/^###### (.*$)/gm, '<h6>$1</h6>')
    
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    
    // Images
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2">')
    
    // Lists
    .replace(/^\* (.*$)/gm, '<li>$1</li>')
    .replace(/<\/li>\n<li>/g, '</li><li>')
    .replace(/<\/li>\n/g, '</li></ul>\n')
    .replace(/^\<li\>/gm, '<ul><li>')
    
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    
    // Inline code
    .replace(/`(.*?)`/g, '<code>$1</code>')
    
    // Blockquotes
    .replace(/^\> (.*$)/gm, '<blockquote>$1</blockquote>')
    
    // Horizontal rule
    .replace(/^-{3,}$/gm, '<hr>')
    
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    .replace(/^([^<].*)/gm, (m) => {
      if (m.trim() === '' || m.startsWith('<')) return m;
      return `<p>${m}</p>`;
    });
  
  return html;
};

const MarkdownConverter = () => {
  const [markdown, setMarkdown] = useState<string>('');
  const [htmlOutput, setHtmlOutput] = useState<string>('');
  
  // Load saved markdown from localStorage on mount
  useEffect(() => {
    const savedMarkdown = localStorage.getItem('markdownConverterInput');
    if (savedMarkdown) {
      setMarkdown(savedMarkdown);
    } else {
      // Default example text
      const defaultText = `# Markdown Example

## Formatting

**Bold text** and *italic text*

## Lists

* Item 1
* Item 2
* Item 3

## Links and Images

[Visit GitHub](https://github.com)

## Code

\`\`\`javascript
function hello() {
  console.log("Hello, world!");
}
\`\`\`

Inline code: \`const x = 10;\`

## Blockquotes

> This is a blockquote

---

That's all for this example!
`;
      setMarkdown(defaultText);
    }
  }, []);

  // Convert markdown to HTML when input changes
  useEffect(() => {
    if (markdown) {
      setHtmlOutput(parseMarkdown(markdown));
      localStorage.setItem('markdownConverterInput', markdown);
    } else {
      setHtmlOutput('');
    }
  }, [markdown]);

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(htmlOutput);
      toast.success('HTML copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy HTML');
    }
  };

  const downloadHtml = () => {
    const htmlDoc = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown to HTML</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    code {
      background-color: #f0f0f0;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: monospace;
    }
    pre {
      background-color: #f0f0f0;
      padding: 16px;
      overflow: auto;
      border-radius: 3px;
    }
    blockquote {
      border-left: 4px solid #ddd;
      padding-left: 16px;
      margin-left: 0;
      color: #666;
    }
    img {
      max-width: 100%;
    }
  </style>
</head>
<body>
${htmlOutput}
</body>
</html>
    `;
    
    const blob = new Blob([htmlDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'markdown-converted.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('HTML file downloaded');
  };

  const clearMarkdown = () => {
    setMarkdown('');
    localStorage.removeItem('markdownConverterInput');
    toast.success('Markdown cleared');
  };

  return (
    <ToolContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Markdown Converter</h1>
        <p className="text-muted-foreground">
          Write markdown with real-time preview and convert it to HTML. Download the HTML or copy it to your clipboard.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label htmlFor="markdown-input">Markdown Input</Label>
            <Button onClick={clearMarkdown} size="sm" variant="outline">Clear</Button>
          </div>
          <Textarea
            id="markdown-input"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Enter markdown here..."
            className="h-[500px] font-mono resize-none"
          />
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Preview / HTML</Label>
            <div className="flex gap-2">
              <Button onClick={copyHtml} size="sm" variant="outline">
                Copy HTML
              </Button>
              <Button onClick={downloadHtml} size="sm" variant="outline">
                Download HTML
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="preview">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
            </TabsList>
            <TabsContent value="preview">
              <div 
                className="border rounded-md p-4 h-[500px] overflow-auto bg-card"
                dangerouslySetInnerHTML={{ __html: htmlOutput }}
              />
            </TabsContent>
            <TabsContent value="html">
              <div className="h-[500px]">
                <CodeBlock code={htmlOutput} language="html" className="h-full" />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ToolContainer>
  );
};

export default MarkdownConverter;
