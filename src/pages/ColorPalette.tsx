
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ToolContainer from '@/components/ToolContainer';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy } from 'lucide-react';

interface ColorSwatch {
  hex: string;
  rgb: string;
  hsl: string;
}

type ColorPaletteType = 'shades' | 'tints' | 'tones' | 'analogous' | 'complementary' | 'triadic';

// Convert hex to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

// Convert RGB to HSL
const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

// Convert HSL to RGB
const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  h /= 360;
  s /= 100;
  l /= 100;
  
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

// Convert RGB to Hex
const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

// Format RGB string
const formatRgb = (r: number, g: number, b: number): string => {
  return `rgb(${r}, ${g}, ${b})`;
};

// Format HSL string
const formatHsl = (h: number, s: number, l: number): string => {
  return `hsl(${h}, ${s}%, ${l}%)`;
};

// Generate colors
const generateColors = (
  baseColor: string,
  paletteType: ColorPaletteType,
  count: number = 10
): ColorSwatch[] => {
  const rgb = hexToRgb(baseColor);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  const colors: ColorSwatch[] = [];
  
  switch (paletteType) {
    case 'shades':
      // Darker variations
      for (let i = 0; i < count; i++) {
        const newL = Math.max(0, hsl.l - (i * (hsl.l / count)));
        const newRgb = hslToRgb(hsl.h, hsl.s, newL);
        const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
        colors.push({
          hex: newHex,
          rgb: formatRgb(newRgb.r, newRgb.g, newRgb.b),
          hsl: formatHsl(hsl.h, hsl.s, newL),
        });
      }
      break;
      
    case 'tints':
      // Lighter variations
      for (let i = 0; i < count; i++) {
        const newL = Math.min(100, hsl.l + (i * ((100 - hsl.l) / count)));
        const newRgb = hslToRgb(hsl.h, hsl.s, newL);
        const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
        colors.push({
          hex: newHex,
          rgb: formatRgb(newRgb.r, newRgb.g, newRgb.b),
          hsl: formatHsl(hsl.h, hsl.s, newL),
        });
      }
      break;
      
    case 'tones':
      // Saturation variations
      for (let i = 0; i < count; i++) {
        const newS = Math.max(0, hsl.s - (i * (hsl.s / count)));
        const newRgb = hslToRgb(hsl.h, newS, hsl.l);
        const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
        colors.push({
          hex: newHex,
          rgb: formatRgb(newRgb.r, newRgb.g, newRgb.b),
          hsl: formatHsl(hsl.h, newS, hsl.l),
        });
      }
      break;
      
    case 'analogous':
      // Analogous colors (adjacent on the color wheel)
      const angleStep = 30;
      const startHue = (hsl.h - (angleStep * Math.floor(count / 2))) % 360;
      
      for (let i = 0; i < count; i++) {
        const newH = (startHue + (i * angleStep)) % 360;
        const newRgb = hslToRgb(newH, hsl.s, hsl.l);
        const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
        colors.push({
          hex: newHex,
          rgb: formatRgb(newRgb.r, newRgb.g, newRgb.b),
          hsl: formatHsl(newH, hsl.s, hsl.l),
        });
      }
      break;
      
    case 'complementary':
      // Base color and its complement with variations
      for (let i = 0; i < count; i++) {
        let newH, newS, newL;
        
        if (i < count / 2) {
          // Variations of base color
          newH = hsl.h;
          newS = Math.max(0, Math.min(100, hsl.s - ((i * 20) - 10)));
          newL = Math.max(0, Math.min(100, hsl.l + ((i * 20) - 10)));
        } else {
          // Variations of complementary color
          newH = (hsl.h + 180) % 360;
          newS = Math.max(0, Math.min(100, hsl.s - (((i - count / 2) * 20) - 10)));
          newL = Math.max(0, Math.min(100, hsl.l + (((i - count / 2) * 20) - 10)));
        }
        
        const newRgb = hslToRgb(newH, newS, newL);
        const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
        colors.push({
          hex: newHex,
          rgb: formatRgb(newRgb.r, newRgb.g, newRgb.b),
          hsl: formatHsl(newH, newS, newL),
        });
      }
      break;
      
    case 'triadic':
      // Triadic colors (3 colors evenly spaced)
      const triadicCount = Math.min(count, 3);
      const triadicStep = 120;
      
      for (let i = 0; i < triadicCount; i++) {
        const newH = (hsl.h + (i * triadicStep)) % 360;
        
        // For each triadic color, add variations
        const variationsPerColor = Math.floor(count / triadicCount);
        for (let j = 0; j < variationsPerColor; j++) {
          const newS = Math.max(0, Math.min(100, hsl.s - ((j * 20) - 10)));
          const newL = Math.max(0, Math.min(100, hsl.l + ((j * 20) - 10)));
          
          const newRgb = hslToRgb(newH, newS, newL);
          const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
          colors.push({
            hex: newHex,
            rgb: formatRgb(newRgb.r, newRgb.g, newRgb.b),
            hsl: formatHsl(newH, newS, newL),
          });
        }
      }
      
      // Fill any remaining slots with variations of the base color
      while (colors.length < count) {
        const index = colors.length % 3;
        const baseH = (hsl.h + (index * triadicStep)) % 360;
        const newS = Math.max(0, Math.min(100, hsl.s - 20));
        const newL = Math.max(0, Math.min(100, hsl.l + 20));
        
        const newRgb = hslToRgb(baseH, newS, newL);
        const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
        colors.push({
          hex: newHex,
          rgb: formatRgb(newRgb.r, newRgb.g, newRgb.b),
          hsl: formatHsl(baseH, newS, newL),
        });
      }
      break;
  }
  
  return colors;
};

const ColorPalette = () => {
  const [baseColor, setBaseColor] = useState<string>('#6366f1');
  const [inputColor, setInputColor] = useState<string>('#6366f1');
  const [paletteType, setPaletteType] = useState<ColorPaletteType>('shades');
  const [paletteCount, setPaletteCount] = useState<number>(5);
  const [colorPalette, setColorPalette] = useState<ColorSwatch[]>([]);
  const [colorFormat, setColorFormat] = useState<'hex' | 'rgb' | 'hsl'>('hex');
  
  // Load saved state from localStorage
  useEffect(() => {
    const savedColor = localStorage.getItem('colorPaletteBaseColor');
    const savedPaletteType = localStorage.getItem('colorPaletteType');
    const savedFormat = localStorage.getItem('colorPaletteFormat');
    
    if (savedColor) {
      setBaseColor(savedColor);
      setInputColor(savedColor);
    }
    
    if (savedPaletteType) {
      setPaletteType(savedPaletteType as ColorPaletteType);
    }
    
    if (savedFormat) {
      setColorFormat(savedFormat as 'hex' | 'rgb' | 'hsl');
    }
  }, []);
  
  // Generate colors when parameters change
  useEffect(() => {
    const colors = generateColors(baseColor, paletteType, paletteCount);
    setColorPalette(colors);
    
    // Save to localStorage
    localStorage.setItem('colorPaletteBaseColor', baseColor);
    localStorage.setItem('colorPaletteType', paletteType);
    localStorage.setItem('colorPaletteFormat', colorFormat);
  }, [baseColor, paletteType, paletteCount, colorFormat]);
  
  const updateBaseColor = () => {
    // Simple validation
    const isValidHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(inputColor);
    
    if (isValidHex) {
      // Normalize to 6 digits if 3 digits are provided
      if (inputColor.length === 4) {
        const r = inputColor[1];
        const g = inputColor[2];
        const b = inputColor[3];
        setBaseColor(`#${r}${r}${g}${g}${b}${b}`);
      } else {
        setBaseColor(inputColor);
      }
    } else {
      toast.error('Please enter a valid hex color (e.g., #FF5733)');
    }
  };
  
  const copyToClipboard = async (text: string, description: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${description} copied to clipboard`);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };
  
  const handleColorFormatChange = (value: string) => {
    setColorFormat(value as 'hex' | 'rgb' | 'hsl');
  };
  
  const getRoundedTextColor = (hexColor: string): string => {
    const { r, g, b } = hexToRgb(hexColor);
    // Calculate perceived brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };
  
  const exportPaletteAsCode = (format: 'css' | 'tailwind' | 'scss') => {
    let code = '';
    
    switch (format) {
      case 'css':
        code = ':root {\n';
        colorPalette.forEach((color, index) => {
          code += `  --color-${index}: ${color.hex};\n`;
        });
        code += '}';
        break;
        
      case 'tailwind':
        code = 'module.exports = {\n';
        code += '  theme: {\n';
        code += '    extend: {\n';
        code += '      colors: {\n';
        code += '        custom: {\n';
        colorPalette.forEach((color, index) => {
          code += `          '${index}': '${color.hex}',\n`;
        });
        code += '        },\n';
        code += '      },\n';
        code += '    },\n';
        code += '  },\n';
        code += '}';
        break;
        
      case 'scss':
        colorPalette.forEach((color, index) => {
          code += `$color-${index}: ${color.hex};\n`;
        });
        break;
    }
    
    copyToClipboard(code, `${format.toUpperCase()} code`);
  };

  return (
    <ToolContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Color Palette Generator</h1>
        <p className="text-muted-foreground">
          Generate beautiful color palettes from a base color. Create shades, tints, tones, and more.
        </p>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="base-color">Base Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="base-color"
                    type="text"
                    value={inputColor}
                    onChange={(e) => setInputColor(e.target.value.toLowerCase())}
                    className="w-full font-mono"
                  />
                  <div className="flex items-center">
                    <Input
                      type="color"
                      value={baseColor}
                      onChange={(e) => {
                        setInputColor(e.target.value);
                        setBaseColor(e.target.value);
                      }}
                      className="w-12 h-9 p-1 cursor-pointer"
                    />
                  </div>
                </div>
                <Button
                  onClick={updateBaseColor}
                  disabled={inputColor === baseColor}
                >
                  Update Color
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="palette-type">Palette Type</Label>
                <select
                  id="palette-type"
                  className="w-full p-2 rounded-md border border-input bg-transparent"
                  value={paletteType}
                  onChange={(e) => setPaletteType(e.target.value as ColorPaletteType)}
                >
                  <option value="shades">Shades (Darker)</option>
                  <option value="tints">Tints (Lighter)</option>
                  <option value="tones">Tones (Desaturated)</option>
                  <option value="analogous">Analogous</option>
                  <option value="complementary">Complementary</option>
                  <option value="triadic">Triadic</option>
                </select>
              </div>

              <div className="flex flex-col space-y-2">
                <Label htmlFor="palette-count">Number of Colors</Label>
                <Input
                  id="palette-count"
                  type="number"
                  min="3"
                  max="10"
                  value={paletteCount}
                  onChange={(e) => setPaletteCount(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label>Color Format</Label>
                <Tabs value={colorFormat} onValueChange={handleColorFormatChange}>
                  <TabsList className="w-full">
                    <TabsTrigger value="hex" className="flex-1">HEX</TabsTrigger>
                    <TabsTrigger value="rgb" className="flex-1">RGB</TabsTrigger>
                    <TabsTrigger value="hsl" className="flex-1">HSL</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex flex-col space-y-2">
                <Label>Export Palette</Label>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    onClick={() => exportPaletteAsCode('css')}
                  >
                    CSS
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    onClick={() => exportPaletteAsCode('tailwind')}
                  >
                    Tailwind
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    onClick={() => exportPaletteAsCode('scss')}
                  >
                    SCSS
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {colorPalette.map((color, index) => (
          <div 
            key={index}
            className="rounded-lg overflow-hidden border shadow-sm"
          >
            <div 
              className="h-20 flex items-center justify-center"
              style={{ 
                backgroundColor: color.hex,
                color: getRoundedTextColor(color.hex)
              }}
            >
              <span className="text-sm font-medium opacity-90">
                {index + 1}
              </span>
            </div>
            <div className="p-3 bg-card">
              <div 
                className="flex justify-between items-center cursor-pointer hover:bg-muted rounded p-1 mb-1"
                onClick={() => copyToClipboard(
                  colorFormat === 'hex' ? color.hex : colorFormat === 'rgb' ? color.rgb : color.hsl,
                  colorFormat.toUpperCase()
                )}
              >
                <span className="text-sm font-mono">
                  {colorFormat === 'hex' ? color.hex : colorFormat === 'rgb' ? color.rgb : color.hsl}
                </span>
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToolContainer>
  );
};

export default ColorPalette;
