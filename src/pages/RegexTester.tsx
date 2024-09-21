
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ToolContainer from '@/components/ToolContainer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface Match {
  matchedText: string;
  startIndex: number;
  endIndex: number;
}

const RegexTester = () => {
  const [pattern, setPattern] = useState<string>('');
  const [testText, setTestText] = useState<string>('');
  const [flags, setFlags] = useState<Record<string, boolean>>({
    global: true,
    ignoreCase: false,
    multiline: false,
    dotAll: false,
    unicode: false,
    sticky: false,
  });
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedPattern = localStorage.getItem('regexPattern');
    const savedTestText = localStorage.getItem('regexTestText');
    const savedFlags = localStorage.getItem('regexFlags');
    
    if (savedPattern) setPattern(savedPattern);
    if (savedTestText) setTestText(savedTestText);
    if (savedFlags) {
      try {
        setFlags(JSON.parse(savedFlags));
      } catch (e) {
        // Use default flags if parsing fails
      }
    }
  }, []);

  // Test regex whenever pattern, text, or flags change
  useEffect(() => {
    testRegex();
    
    // Save to localStorage
    localStorage.setItem('regexPattern', pattern);
    localStorage.setItem('regexTestText', testText);
    localStorage.setItem('regexFlags', JSON.stringify(flags));
  }, [pattern, testText, flags]);

  // Convert flags object to string for RegExp constructor
  const getFlagsString = () => {
    let flagStr = '';
    if (flags.global) flagStr += 'g';
    if (flags.ignoreCase) flagStr += 'i';
    if (flags.multiline) flagStr += 'm';
    if (flags.dotAll) flagStr += 's';
    if (flags.unicode) flagStr += 'u';
    if (flags.sticky) flagStr += 'y';
    return flagStr;
  };

  const testRegex = () => {
    setMatches([]);
    setError(null);
    
    if (!pattern || !testText) return;
    
    try {
      const regex = new RegExp(pattern, getFlagsString());
      const matchResults: Match[] = [];
      
      if (flags.global) {
        let match;
        while ((match = regex.exec(testText)) !== null) {
          matchResults.push({
            matchedText: match[0],
            startIndex: match.index,
            endIndex: match.index + match[0].length
          });
          
          // Avoid infinite loops for zero-length matches
          if (match[0].length === 0) {
            regex.lastIndex++;
          }
        }
      } else {
        const match = regex.exec(testText);
        if (match) {
          matchResults.push({
            matchedText: match[0],
            startIndex: match.index,
            endIndex: match.index + match[0].length
          });
        }
      }
      
      setMatches(matchResults);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const handleFlagChange = (flag: string, checked: boolean) => {
    setFlags(prevFlags => ({
      ...prevFlags,
      [flag]: checked
    }));
  };

  const copyMatches = async () => {
    if (matches.length === 0) {
      toast.error('No matches to copy');
      return;
    }
    
    const matchesText = matches.map(m => m.matchedText).join('\n');
    try {
      await navigator.clipboard.writeText(matchesText);
      toast.success('Matches copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy matches');
    }
  };

  // Highlight matches in test text
  const highlightMatches = () => {
    if (!testText || matches.length === 0) return testText;
    
    let result = [];
    let lastIndex = 0;
    
    for (const match of matches) {
      // Add text before match
      if (match.startIndex > lastIndex) {
        result.push(
          <span key={`text-${lastIndex}`}>
            {testText.substring(lastIndex, match.startIndex)}
          </span>
        );
      }
      
      // Add highlighted match
      result.push(
        <span 
          key={`match-${match.startIndex}`} 
          className="bg-yellow-300 dark:bg-yellow-700 rounded px-0.5"
        >
          {testText.substring(match.startIndex, match.endIndex)}
        </span>
      );
      
      lastIndex = match.endIndex;
    }
    
    // Add remaining text after last match
    if (lastIndex < testText.length) {
      result.push(
        <span key={`text-${lastIndex}`}>
          {testText.substring(lastIndex)}
        </span>
      );
    }
    
    return <>{result}</>;
  };

  return (
    <ToolContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Regex Tester</h1>
        <p className="text-muted-foreground">
          Test and debug regular expressions with live highlighting. See matches in real-time as you type.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="regex-pattern">Regular Expression</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">/</span>
                <Input
                  id="regex-pattern"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  className="pl-6 font-mono"
                  placeholder="Enter regex pattern..."
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  /{getFlagsString()}
                </span>
              </div>
              {error && (
                <p className="text-destructive text-sm mt-1">{error}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="global" 
                checked={flags.global}
                onCheckedChange={(checked) => 
                  handleFlagChange('global', checked === true)
                }
              />
              <Label htmlFor="global" className="text-sm">Global (g)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="ignoreCase" 
                checked={flags.ignoreCase}
                onCheckedChange={(checked) => 
                  handleFlagChange('ignoreCase', checked === true)
                }
              />
              <Label htmlFor="ignoreCase" className="text-sm">Ignore Case (i)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="multiline" 
                checked={flags.multiline}
                onCheckedChange={(checked) => 
                  handleFlagChange('multiline', checked === true)
                }
              />
              <Label htmlFor="multiline" className="text-sm">Multiline (m)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="dotAll" 
                checked={flags.dotAll}
                onCheckedChange={(checked) => 
                  handleFlagChange('dotAll', checked === true)
                }
              />
              <Label htmlFor="dotAll" className="text-sm">Dot All (s)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="unicode" 
                checked={flags.unicode}
                onCheckedChange={(checked) => 
                  handleFlagChange('unicode', checked === true)
                }
              />
              <Label htmlFor="unicode" className="text-sm">Unicode (u)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="sticky" 
                checked={flags.sticky}
                onCheckedChange={(checked) => 
                  handleFlagChange('sticky', checked === true)
                }
              />
              <Label htmlFor="sticky" className="text-sm">Sticky (y)</Label>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="test-text">Test Text</Label>
          <Textarea
            id="test-text"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Enter text to test against your regex..."
            className="min-h-[200px]"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Highlighted Matches</Label>
              <span className="text-sm text-muted-foreground">
                {matches.length} match{matches.length !== 1 ? 'es' : ''}
              </span>
            </div>
            <div className="p-4 min-h-[150px] max-h-[250px] overflow-auto border rounded-md bg-card">
              {testText ? (
                <div className="font-mono whitespace-pre-wrap">{highlightMatches()}</div>
              ) : (
                <div className="text-muted-foreground">Enter test text to see matches</div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Match Results</Label>
              {matches.length > 0 && (
                <Button size="sm" variant="outline" onClick={copyMatches}>
                  Copy All
                </Button>
              )}
            </div>
            <div className="p-4 min-h-[150px] max-h-[250px] overflow-auto border rounded-md bg-card">
              {matches.length > 0 ? (
                <div className="space-y-2">
                  {matches.map((match, index) => (
                    <div key={index} className="p-2 border rounded bg-muted">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Match {index + 1}</span>
                        <span className="text-muted-foreground">
                          Position: {match.startIndex}-{match.endIndex}
                        </span>
                      </div>
                      <div className="font-mono bg-card p-2 rounded">
                        {match.matchedText || <em className="text-muted-foreground">Empty match</em>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground">
                  {pattern && testText 
                    ? 'No matches found' 
                    : 'Enter a regex pattern and test text to find matches'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ToolContainer>
  );
};

export default RegexTester;
