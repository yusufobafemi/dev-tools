
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ToolContainer from '@/components/ToolContainer';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Base64Tool = () => {
  const [text, setText] = useState<string>('');
  const [encodedText, setEncodedText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('encode');
  const [encoding, setEncoding] = useState<string>('utf-8');

  // Load saved data from localStorage
  useEffect(() => {
    const savedText = localStorage.getItem('base64Text');
    const savedEncodedText = localStorage.getItem('base64EncodedText');
    const savedActiveTab = localStorage.getItem('base64ActiveTab');
    
    if (savedText) setText(savedText);
    if (savedEncodedText) setEncodedText(savedEncodedText);
    if (savedActiveTab === 'encode' || savedActiveTab === 'decode') {
      setActiveTab(savedActiveTab);
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('base64Text', text);
    localStorage.setItem('base64EncodedText', encodedText);
    localStorage.setItem('base64ActiveTab', activeTab);
  }, [text, encodedText, activeTab]);
  
  // Encode text to base64
  const encode = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(text)));
      setEncodedText(encoded);
      toast.success('Text encoded to Base64');
    } catch (error) {
      toast.error('Error encoding text');
      console.error('Encoding error:', error);
    }
  };
  
  // Decode base64 to text
  const decode = () => {
    try {
      const decoded = decodeURIComponent(escape(atob(encodedText)));
      setText(decoded);
      toast.success('Base64 decoded to text');
    } catch (error) {
      toast.error('Error decoding Base64. Make sure the input is valid Base64');
      console.error('Decoding error:', error);
    }
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  // Copy text to clipboard
  const copyToClipboard = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success(`${type} copied to clipboard`);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };
  
  // Clear both text fields
  const clearAll = () => {
    setText('');
    setEncodedText('');
    toast.success('All fields cleared');
  };

  // Swap the contents of text and encodedText
  const swapContents = () => {
    const tempText = text;
    setText(encodedText);
    setEncodedText(tempText);
    setActiveTab(activeTab === 'encode' ? 'decode' : 'encode');
    toast.success('Input and output swapped');
  };

  return (
    <ToolContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Base64 Encoder/Decoder</h1>
        <p className="text-muted-foreground">
          Convert text to Base64 encoding or decode Base64 back to plain text. Useful for data URLs, basic authentication, and more.
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="encode">Encode</TabsTrigger>
          <TabsTrigger value="decode">Decode</TabsTrigger>
        </TabsList>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TabsContent value="encode" className="space-y-4 m-0">
            <div className="flex justify-between items-center">
              <Label htmlFor="plain-text">Plain Text</Label>
              <div className="flex gap-2">
                <Button onClick={() => copyToClipboard(text, 'Text')} size="sm" variant="outline">
                  Copy
                </Button>
                <Button onClick={() => setText('')} size="sm" variant="outline">
                  Clear
                </Button>
              </div>
            </div>
            <Textarea
              id="plain-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to encode..."
              className="h-[300px] font-mono resize-none"
            />
            <Button onClick={encode} className="w-full">
              Encode to Base64
            </Button>
          </TabsContent>
          
          <TabsContent value="decode" className="space-y-4 m-0">
            <div className="flex justify-between items-center">
              <Label htmlFor="base64-text">Base64 Text</Label>
              <div className="flex gap-2">
                <Button onClick={() => copyToClipboard(encodedText, 'Base64')} size="sm" variant="outline">
                  Copy
                </Button>
                <Button onClick={() => setEncodedText('')} size="sm" variant="outline">
                  Clear
                </Button>
              </div>
            </div>
            <Textarea
              id="base64-text"
              value={encodedText}
              onChange={(e) => setEncodedText(e.target.value)}
              placeholder="Enter Base64 to decode..."
              className="h-[300px] font-mono resize-none"
            />
            <Button onClick={decode} className="w-full">
              Decode from Base64
            </Button>
          </TabsContent>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="result">Result</Label>
              <Button 
                onClick={() => copyToClipboard(activeTab === 'encode' ? encodedText : text, 'Result')} 
                size="sm" 
                variant="outline"
              >
                Copy Result
              </Button>
            </div>
            <Textarea
              id="result"
              value={activeTab === 'encode' ? encodedText : text}
              readOnly
              className="h-[300px] font-mono resize-none"
              placeholder={
                activeTab === 'encode' 
                  ? 'Encoded Base64 will appear here...' 
                  : 'Decoded text will appear here...'
              }
            />
            <div className="flex gap-2">
              <Button onClick={swapContents} variant="outline" className="flex-1">
                Swap Input & Output
              </Button>
              <Button onClick={clearAll} variant="outline" className="flex-1">
                Clear All
              </Button>
            </div>
          </div>
        </div>
      </Tabs>
    </ToolContainer>
  );
};

export default Base64Tool;
