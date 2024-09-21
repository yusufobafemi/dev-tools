
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ToolContainer from '@/components/ToolContainer';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Simple diffing algorithm to compare two texts line by line
const compareTexts = (text1: string, text2: string) => {
  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');
  const result = [];
  
  const maxLines = Math.max(lines1.length, lines2.length);
  
  for (let i = 0; i < maxLines; i++) {
    const line1 = i < lines1.length ? lines1[i] : null;
    const line2 = i < lines2.length ? lines2[i] : null;
    
    if (line1 === null) {
      result.push({ type: 'added', line1: '', line2 });
    } else if (line2 === null) {
      result.push({ type: 'removed', line1, line2: '' });
    } else if (line1 !== line2) {
      result.push({ type: 'modified', line1, line2 });
    } else {
      result.push({ type: 'unchanged', line1, line2 });
    }
  }
  
  return result;
};

// Highlight character differences within a line
const highlightDifferences = (oldText: string, newText: string) => {
  if (oldText === newText) return { oldHighlighted: oldText, newHighlighted: newText };
  
  // Find common prefix
  let prefixLength = 0;
  const minLength = Math.min(oldText.length, newText.length);
  while (prefixLength < minLength && oldText[prefixLength] === newText[prefixLength]) {
    prefixLength++;
  }
  
  // Find common suffix
  let suffixLength = 0;
  while (
    suffixLength < minLength - prefixLength &&
    oldText[oldText.length - 1 - suffixLength] === newText[newText.length - 1 - suffixLength]
  ) {
    suffixLength++;
  }
  
  const oldMiddle = oldText.substring(prefixLength, oldText.length - suffixLength);
  const newMiddle = newText.substring(prefixLength, newText.length - suffixLength);
  const prefix = oldText.substring(0, prefixLength);
  const oldSuffix = oldText.substring(oldText.length - suffixLength);
  const newSuffix = newText.substring(newText.length - suffixLength);
  
  const oldHighlighted = prefixLength !== 0 || suffixLength !== 0 ? (
    <>
      {prefix && <span>{prefix}</span>}
      {oldMiddle && <span className="bg-red-200 dark:bg-red-800">{oldMiddle}</span>}
      {oldSuffix && <span>{oldSuffix}</span>}
    </>
  ) : (
    <span className="bg-red-200 dark:bg-red-800">{oldText}</span>
  );
  
  const newHighlighted = prefixLength !== 0 || suffixLength !== 0 ? (
    <>
      {prefix && <span>{prefix}</span>}
      {newMiddle && <span className="bg-green-200 dark:bg-green-800">{newMiddle}</span>}
      {newSuffix && <span>{newSuffix}</span>}
    </>
  ) : (
    <span className="bg-green-200 dark:bg-green-800">{newText}</span>
  );
  
  return { oldHighlighted, newHighlighted };
};

const TextDiff = () => {
  const [text1, setText1] = useState<string>('');
  const [text2, setText2] = useState<string>('');
  const [diffResult, setDiffResult] = useState<any[]>([]);
  const [diffMode, setDiffMode] = useState<'line' | 'character'>('line');
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
  
  // Load saved inputs from localStorage
  useEffect(() => {
    const savedText1 = localStorage.getItem('diffText1');
    const savedText2 = localStorage.getItem('diffText2');
    const savedDiffMode = localStorage.getItem('diffMode');
    const savedShowLineNumbers = localStorage.getItem('showLineNumbers');
    
    if (savedText1) setText1(savedText1);
    if (savedText2) setText2(savedText2);
    if (savedDiffMode) setDiffMode(savedDiffMode as 'line' | 'character');
    if (savedShowLineNumbers) setShowLineNumbers(savedShowLineNumbers === 'true');
  }, []);
  
  // Save inputs to localStorage when they change
  useEffect(() => {
    localStorage.setItem('diffText1', text1);
    localStorage.setItem('diffText2', text2);
    localStorage.setItem('diffMode', diffMode);
    localStorage.setItem('showLineNumbers', showLineNumbers.toString());
  }, [text1, text2, diffMode, showLineNumbers]);
  
  // Compare texts when inputs change
  useEffect(() => {
    if (text1 || text2) {
      setDiffResult(compareTexts(text1, text2));
    } else {
      setDiffResult([]);
    }
  }, [text1, text2]);
  
  const copyDiffToClipboard = async () => {
    if (diffResult.length === 0) {
      toast.error('No diff to copy');
      return;
    }
    
    let diffText = '';
    diffResult.forEach((item, index) => {
      const prefix = item.type === 'unchanged' ? '  ' : item.type === 'removed' ? '- ' : '+ ';
      diffText += `${prefix}${item.line1 || item.line2}\n`;
    });
    
    try {
      await navigator.clipboard.writeText(diffText);
      toast.success('Diff copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy diff');
    }
  };
  
  const clearTexts = () => {
    setText1('');
    setText2('');
    toast.success('Inputs cleared');
  };
  
  const swapTexts = () => {
    const temp = text1;
    setText1(text2);
    setText2(temp);
    toast.success('Texts swapped');
  };
  
  const getLineClass = (type: string) => {
    switch (type) {
      case 'added':
        return 'bg-green-100 dark:bg-green-950/40';
      case 'removed':
        return 'bg-red-100 dark:bg-red-950/40';
      case 'modified':
        return 'bg-yellow-100 dark:bg-yellow-950/40';
      default:
        return '';
    }
  };
  
  const renderDiffLines = () => {
    if (diffResult.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Enter text to compare
        </div>
      );
    }
    
    return (
      <div className="font-mono text-sm">
        {diffResult.map((item, index) => {
          const { oldHighlighted, newHighlighted } = diffMode === 'character' && item.type === 'modified'
            ? highlightDifferences(item.line1, item.line2)
            : { oldHighlighted: item.line1, newHighlighted: item.line2 };
            
          return (
            <div key={index} className={`flex ${getLineClass(item.type)}`}>
              {showLineNumbers && (
                <div className="w-10 flex-none text-right pr-2 text-muted-foreground border-r border-muted select-none">
                  {item.type !== 'added' ? index + 1 : ''}
                </div>
              )}
              <div className="flex-1 px-2 whitespace-pre-wrap">
                {item.type === 'added' ? '' : diffMode === 'character' && item.type === 'modified' ? oldHighlighted : item.line1}
              </div>
              
              {showLineNumbers && (
                <div className="w-10 flex-none text-right pr-2 text-muted-foreground border-r border-muted select-none">
                  {item.type !== 'removed' ? index + 1 : ''}
                </div>
              )}
              <div className="flex-1 px-2 whitespace-pre-wrap">
                {item.type === 'removed' ? '' : diffMode === 'character' && item.type === 'modified' ? newHighlighted : item.line2}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <ToolContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Text Diff Viewer</h1>
        <p className="text-muted-foreground">
          Compare two text blocks and highlight the differences. Perfect for reviewing code changes or document revisions.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Label htmlFor="text1">Original Text</Label>
          <Textarea
            id="text1"
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            placeholder="Paste original text here..."
            className="h-64 font-mono resize-none"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="text2">New Text</Label>
          <Textarea
            id="text2"
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            placeholder="Paste new text here..."
            className="h-64 font-mono resize-none"
          />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-6">
        <Button variant="outline" onClick={swapTexts}>Swap Texts</Button>
        <Button variant="outline" onClick={clearTexts}>Clear All</Button>
        <Button variant="outline" onClick={copyDiffToClipboard}>Copy Diff</Button>
        
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show-line-numbers"
              checked={showLineNumbers}
              onChange={(e) => setShowLineNumbers(e.target.checked)}
              className="rounded border-muted"
            />
            <Label htmlFor="show-line-numbers" className="text-sm cursor-pointer">
              Show Line Numbers
            </Label>
          </div>
          
          <div className="flex gap-1 items-center">
            <Label htmlFor="diff-mode" className="text-sm">Diff Mode:</Label>
            <select
              id="diff-mode"
              value={diffMode}
              onChange={(e) => setDiffMode(e.target.value as 'line' | 'character')}
              className="p-1 rounded text-sm bg-transparent border"
            >
              <option value="line">Line</option>
              <option value="character">Character</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="border rounded-lg">
        <div className="flex text-sm py-2 px-4 border-b bg-muted">
          <div className={`flex-1 ${showLineNumbers ? 'ml-10' : ''}`}>Original</div>
          <div className={`flex-1 ${showLineNumbers ? 'ml-10' : ''}`}>New</div>
        </div>
        
        <div className="bg-card h-[400px] overflow-auto">
          {renderDiffLines()}
        </div>
        
        <div className="flex text-xs border-t py-2 px-4 text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span> Added
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span> Removed
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span> Modified
            </div>
          </div>
          <div className="ml-auto">
            {diffResult.length} line{diffResult.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </ToolContainer>
  );
};

export default TextDiff;
