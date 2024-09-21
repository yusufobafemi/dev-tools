
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ToolContainer from '@/components/ToolContainer';
import CodeBlock from '@/components/CodeBlock';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const JsonFormatter = () => {
  const [inputJson, setInputJson] = useState<string>('');
  const [formattedJson, setFormattedJson] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [indentation, setIndentation] = useState<number>(2);

  // Check localStorage for saved input on component mount
  useEffect(() => {
    const savedInput = localStorage.getItem('jsonFormatterInput');
    if (savedInput) {
      setInputJson(savedInput);
      try {
        setFormattedJson(JSON.stringify(JSON.parse(savedInput), null, indentation));
        setError(null);
      } catch (err) {
        // Don't set error on initial load with saved input
      }
    }
  }, []);

  // Format JSON when input or indentation changes
  useEffect(() => {
    if (inputJson) {
      localStorage.setItem('jsonFormatterInput', inputJson);
      
      try {
        const parsed = JSON.parse(inputJson);
        setFormattedJson(JSON.stringify(parsed, null, indentation));
        setError(null);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Invalid JSON');
        }
        setFormattedJson('');
      }
    } else {
      setFormattedJson('');
      setError(null);
    }
  }, [inputJson, indentation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputJson(e.target.value);
  };
  
  const handlePrettify = () => {
    try {
      const parsed = JSON.parse(inputJson);
      const prettified = JSON.stringify(parsed, null, indentation);
      setFormattedJson(prettified);
      setInputJson(prettified);
      setError(null);
      toast.success('JSON prettified!');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        toast.error('Invalid JSON format');
      }
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(inputJson);
      const minified = JSON.stringify(parsed);
      setFormattedJson(minified);
      setInputJson(minified);
      setError(null);
      toast.success('JSON minified!');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        toast.error('Invalid JSON format');
      }
    }
  };

  const handleClear = () => {
    setInputJson('');
    setFormattedJson('');
    setError(null);
    localStorage.removeItem('jsonFormatterInput');
    toast.success('Input cleared');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formattedJson);
      toast.success('Formatted JSON copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  return (
    <ToolContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">JSON Formatter</h1>
        <p className="text-muted-foreground">
          Format JSON data with syntax highlighting, validate JSON structure, and prettify or minify your code.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label htmlFor="json-input">Input JSON</Label>
            <Button onClick={handleClear} size="sm" variant="outline">Clear</Button>
          </div>

          <Textarea 
            id="json-input"
            placeholder="Paste your JSON here..."
            className="font-mono h-[400px] resize-none"
            value={inputJson}
            onChange={handleInputChange}
          />

          <div className="flex flex-wrap gap-2">
            <Button onClick={handlePrettify}>Prettify</Button>
            <Button onClick={handleMinify} variant="outline">Minify</Button>
            <div className="flex items-center ml-auto">
              <Label htmlFor="indentation" className="mr-2 text-sm">Spaces:</Label>
              <select 
                id="indentation"
                className="p-2 bg-background border rounded-md"
                value={indentation}
                onChange={(e) => setIndentation(Number(e.target.value))}
              >
                <option value="2">2</option>
                <option value="4">4</option>
                <option value="8">8</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Result</Label>
            {formattedJson && (
              <Button onClick={copyToClipboard} size="sm" variant="outline">
                Copy
              </Button>
            )}
          </div>

          <Tabs defaultValue="formatted">
            <TabsList>
              <TabsTrigger value="formatted">Formatted</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="formatted">
              {error ? (
                <div className="p-4 border rounded-md bg-destructive/10 text-destructive">
                  <p className="font-medium">Error:</p> 
                  <p>{error}</p>
                </div>
              ) : formattedJson ? (
                <CodeBlock code={formattedJson} language="json" className="h-[400px]" />
              ) : (
                <div className="h-[400px] border rounded-md flex items-center justify-center text-muted-foreground">
                  Enter valid JSON to see the formatted result
                </div>
              )}
            </TabsContent>
            <TabsContent value="preview">
              {error ? (
                <div className="p-4 border rounded-md bg-destructive/10 text-destructive">
                  <p className="font-medium">Error:</p> 
                  <p>{error}</p>
                </div>
              ) : formattedJson ? (
                <div className="h-[400px] border rounded-md p-4 overflow-auto">
                  <pre className="bg-transparent p-0">{formattedJson}</pre>
                </div>
              ) : (
                <div className="h-[400px] border rounded-md flex items-center justify-center text-muted-foreground">
                  Enter valid JSON to see the preview
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ToolContainer>
  );
};

export default JsonFormatter;
