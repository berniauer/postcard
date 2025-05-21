import React from 'react';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Button } from '@/components/ui/button';
    import { Palette, X } from 'lucide-react';

    const PostcardForm = ({
      title,
      setTitle,
      designData,
      setDesignData,
      templates,
      selectedTemplate,
      onTemplateSelect,
      defaultDesignData
    }) => {

      const mainTextElement = designData.elements.find(el => el.type === 'text') || defaultDesignData.elements[0];

      const handleTextChange = (e) => {
        const newContent = e.target.value;
        setDesignData(prev => ({
          ...prev,
          elements: prev.elements.map(el => el.id === mainTextElement.id ? { ...el, content: newContent } : el)
        }));
      };
      
      const handleBackgroundColorChange = (e) => {
        setDesignData(prev => ({ ...prev, backgroundColor: e.target.value }));
      };

      return (
        <div className="space-y-6">
          <div>
            <Label htmlFor="title" className="text-lg font-semibold text-muted-foreground">Titel der Postkarte</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Mein toller Urlaubsgruß"
              className="mt-2 text-base p-3 bg-white/80 dark:bg-slate-800/80"
            />
          </div>

          <div>
            <Label htmlFor="template" className="text-lg font-semibold text-muted-foreground">Vorlage auswählen</Label>
            <Select onValueChange={onTemplateSelect} value={selectedTemplate || 'none'}>
              <SelectTrigger className="w-full mt-2 text-base p-3 bg-white/80 dark:bg-slate-800/80">
                <SelectValue placeholder="Wähle eine Vorlage (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Keine Vorlage / Zurücksetzen</SelectItem>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="mainText" className="text-lg font-semibold text-muted-foreground">Textinhalt</Label>
            <Textarea
              id="mainText"
              value={mainTextElement.content}
              onChange={handleTextChange}
              placeholder="Schreibe hier deine Nachricht..."
              rows={6}
              className="mt-2 text-base p-3 bg-white/80 dark:bg-slate-800/80"
            />
          </div>

          <div>
            <Label htmlFor="bgColor" className="text-lg font-semibold text-muted-foreground flex items-center">
              <Palette className="mr-2 h-5 w-5" /> Hintergrundfarbe
            </Label>
            <div className="flex items-center mt-2">
              <Input 
                id="bgColor"
                type="color" 
                value={designData.backgroundColor} 
                onChange={handleBackgroundColorChange}
                className="w-16 h-10 p-1"
              />
              <span className="ml-3 p-2 rounded-md border border-input" style={{backgroundColor: designData.backgroundColor, minWidth: '80px', textAlign: 'center'}}>
                {designData.backgroundColor}
              </span>
                <Button variant="ghost" size="sm" onClick={() => setDesignData(prev => ({...prev, backgroundColor: defaultDesignData.backgroundColor}))} className="ml-2">
                  <X className="h-4 w-4 mr-1"/> Zurücksetzen
                </Button>
            </div>
          </div>
        </div>
      );
    };

    export default PostcardForm;