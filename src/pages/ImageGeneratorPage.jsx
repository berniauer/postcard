import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { createImageVariation } from '@/lib/openaiClient';

const postcardSizes = [
  { label: 'A6 (105 x 148 mm)', value: '105x148' },
  { label: 'A7 (74 x 105 mm)', value: '74x105' },
  { label: 'B6 (125 x 176 mm)', value: '125x176' }
];

const styles = [
  { label: 'Ölgemälde', value: 'oil painting' },
  { label: 'Cartoon', value: 'cartoon' },
  { label: 'Skizze', value: 'sketch' },
  { label: 'Ghibli', value: 'ghibli style' }
];

const ImageGeneratorPage = () => {
  const [file, setFile] = useState(null);
  const [style, setStyle] = useState(styles[0].value);
  const [size, setSize] = useState(postcardSizes[0].value);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleGenerate = async () => {
    if (!file) {
      toast({ title: 'Kein Foto ausgewählt', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const url = await createImageVariation({
        file,
        prompt: `Apply ${style} style`,
        n: 1,
        size
      });
      setGeneratedUrl(url);
    } catch (err) {
      toast({ title: 'Fehler bei der Bildgenerierung', description: err.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 space-y-4">
      <div className="w-full max-w-xl space-y-4">
        <Input type="file" accept="image/*" onChange={handleFileChange} />
        <Select value={style} onValueChange={setStyle}>
          <SelectTrigger>
            <SelectValue placeholder="Stil wählen" />
          </SelectTrigger>
          <SelectContent>
            {styles.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={size} onValueChange={setSize}>
          <SelectTrigger>
            <SelectValue placeholder="Format wählen" />
          </SelectTrigger>
          <SelectContent>
            {postcardSizes.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          {loading ? 'Generiere...' : 'Bild generieren'}
        </Button>
        {generatedUrl && (
          <img src={generatedUrl} alt="Generated" className="w-full h-auto mt-4 rounded" />
        )}
      </div>
    </div>
  );
};

export default ImageGeneratorPage;
