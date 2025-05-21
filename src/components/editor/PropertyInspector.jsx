import React from 'react';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Button } from '@/components/ui/button';
    import { Textarea } from '@/components/ui/textarea';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Slider } from '@/components/ui/slider';
    import { Trash2, ArrowUpCircle, ArrowDownCircle, Palette, UploadCloud, Link as LinkIcon, CaseSensitive, AlignLeft, AlignCenter, AlignRight, Bold, Italic } from 'lucide-react';

    const FONT_FAMILIES = [
      { label: 'Arial', value: 'Arial, sans-serif' },
      { label: 'Verdana', value: 'Verdana, sans-serif' },
      { label: 'Georgia', value: 'Georgia, serif' },
      { label: 'Times New Roman', value: 'Times New Roman, Times, serif' },
      { label: 'Courier New', value: 'Courier New, Courier, monospace' },
      { label: 'Brush Script MT', value: 'Brush Script MT, cursive' },
      { label: 'Roboto', value: 'Roboto, sans-serif' }, // Google Font example
      { label: 'Open Sans', value: 'Open Sans, sans-serif' }, // Google Font example
      { label: 'Lato', value: 'Lato, sans-serif' }, // Google Font example
    ];

    const PropertyInspector = ({
      title,
      setTitle,
      selectedElement,
      activePageData,
      onUpdateElement,
      onDeleteElement,
      onUpdatePageBackground,
      templates,
      selectedTemplateId,
      onTemplateSelect,
      initialDesignDataForTemplates,
      onUploadImage,
      dimensions,
      setDesignData,
      designData,
    }) => {

      const handleInputChange = (prop, value, isStyleProp = false) => {
        if (selectedElement) {
          if (isStyleProp) {
            onUpdateElement(selectedElement.id, { style: { ...selectedElement.style, [prop]: value } });
          } else {
            onUpdateElement(selectedElement.id, { [prop]: value });
          }
        }
      };
      
      const handleDimensionChange = (prop, value) => {
        const numericValue = parseInt(value, 10);
        if (!isNaN(numericValue)) {
            const newDimensions = { ...designData.dimensions, [prop]: numericValue };
            setDesignData({ ...designData, dimensions: newDimensions });
        }
      };

      const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (file && selectedElement && selectedElement.type === 'image') {
          const imageUrl = await onUploadImage(file);
          if (imageUrl) {
            handleInputChange('src', imageUrl);
          }
        }
      };
      
      const changeZIndex = (direction) => {
        if (selectedElement) {
          const currentZ = selectedElement.style?.zIndex || 1;
          const newZ = direction === 'up' ? currentZ + 1 : Math.max(1, currentZ - 1);
          handleInputChange('zIndex', newZ, true);
        }
      };

      return (
        <div className="space-y-6 text-sm">
          <div>
            <Label htmlFor="postcardTitle" className="font-semibold">Postkarten-Titel</Label>
            <Input id="postcardTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mein Urlaub" className="mt-1"/>
          </div>

          <div>
            <Label htmlFor="template" className="font-semibold">Vorlage</Label>
            <Select onValueChange={onTemplateSelect} value={selectedTemplateId || 'none'}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Wähle eine Vorlage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Keine Vorlage / Eigene</SelectItem>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="pageBgColor" className="font-semibold flex items-center"><Palette className="h-4 w-4 mr-1.5"/> Seitenhintergrund</Label>
            <div className="flex items-center mt-1">
                <Input 
                    id="pageBgColor" 
                    type="color" 
                    value={activePageData.backgroundColor || '#FFFFFF'} 
                    onChange={(e) => onUpdatePageBackground(e.target.value)}
                    className="w-10 h-8 p-0.5"
                />
                <span className="ml-2 p-1.5 rounded-md border border-input text-xs" style={{backgroundColor: activePageData.backgroundColor, minWidth: '60px', textAlign: 'center'}}>
                    {activePageData.backgroundColor}
                </span>
            </div>
          </div>

          <div>
            <Label className="font-semibold">Postkarten-Dimensionen (px)</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                    <Label htmlFor="dimWidth" className="text-xs">Breite</Label>
                    <Input id="dimWidth" type="number" value={dimensions.width} onChange={(e) => handleDimensionChange('width', e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="dimHeight" className="text-xs">Höhe</Label>
                    <Input id="dimHeight" type="number" value={dimensions.height} onChange={(e) => handleDimensionChange('height', e.target.value)} />
                </div>
            </div>
          </div>


          {selectedElement && (
            <div className="space-y-4 pt-4 border-t mt-4">
              <h3 className="text-md font-semibold text-primary border-b pb-1">Element: {selectedElement.type === 'text' ? 'Text' : 'Bild'} (ID: ...{selectedElement.id.slice(-4)})</h3>
              
              {/* Common Properties */}
              <div className="grid grid-cols-2 gap-2">
                <div><Label htmlFor="elX">X Position</Label><Input id="elX" type="number" value={selectedElement.x} onChange={(e) => handleInputChange('x', parseInt(e.target.value,10) || 0)} /></div>
                <div><Label htmlFor="elY">Y Position</Label><Input id="elY" type="number" value={selectedElement.y} onChange={(e) => handleInputChange('y', parseInt(e.target.value,10) || 0)} /></div>
                <div><Label htmlFor="elW">Breite</Label><Input id="elW" type="number" value={selectedElement.width} onChange={(e) => handleInputChange('width', parseInt(e.target.value,10) || 0)} /></div>
                <div><Label htmlFor="elH">Höhe</Label><Input id="elH" type="number" value={selectedElement.height} onChange={(e) => handleInputChange('height', parseInt(e.target.value,10) || 0)} /></div>
                <div><Label htmlFor="elR">Rotation (°)</Label><Input id="elR" type="number" value={selectedElement.rotation || 0} onChange={(e) => handleInputChange('rotation', parseInt(e.target.value,10) || 0)} /></div>
                <div><Label htmlFor="elZ">Ebene (z)</Label><Input id="elZ" type="number" value={selectedElement.style?.zIndex || 1} onChange={(e) => handleInputChange('zIndex', parseInt(e.target.value,10) || 1, true)} /></div>
              </div>
               <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => changeZIndex('down')} className="flex-1"><ArrowDownCircle className="h-4 w-4 mr-1"/> Nach hinten</Button>
                <Button variant="outline" size="sm" onClick={() => changeZIndex('up')} className="flex-1"><ArrowUpCircle className="h-4 w-4 mr-1"/> Nach vorne</Button>
              </div>


              {selectedElement.type === 'text' && (
                <div className="space-y-3">
                  <div><Label htmlFor="elContent">Textinhalt</Label><Textarea id="elContent" value={selectedElement.content} onChange={(e) => handleInputChange('content', e.target.value)} rows={3} /></div>
                  <div>
                    <Label htmlFor="elFontFamily">Schriftart</Label>
                    <Select value={selectedElement.style?.fontFamily || FONT_FAMILIES[0].value} onValueChange={(val) => handleInputChange('fontFamily', val, true)}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        {FONT_FAMILIES.map(font => <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label htmlFor="elFontSize">Größe (px)</Label><Input id="elFontSize" type="number" value={parseFloat(selectedElement.style?.fontSize || '16px')} onChange={(e) => handleInputChange('fontSize', `${e.target.value}px`, true)} /></div>
                    <div><Label htmlFor="elFontColor">Farbe</Label><Input id="elFontColor" type="color" value={selectedElement.style?.color || '#000000'} onChange={(e) => handleInputChange('color', e.target.value, true)} className="w-full h-9 p-0.5"/></div>
                  </div>
                  <div>
                    <Label>Ausrichtung & Stil</Label>
                    <div className="flex items-center space-x-1 mt-1">
                        <Button variant={selectedElement.style?.textAlign === 'left' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleInputChange('textAlign', 'left', true)} title="Linksbündig"><AlignLeft className="h-4 w-4"/></Button>
                        <Button variant={selectedElement.style?.textAlign === 'center' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleInputChange('textAlign', 'center', true)} title="Zentriert"><AlignCenter className="h-4 w-4"/></Button>
                        <Button variant={selectedElement.style?.textAlign === 'right' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleInputChange('textAlign', 'right', true)} title="Rechtsbündig"><AlignRight className="h-4 w-4"/></Button>
                        <Button variant={selectedElement.style?.fontWeight === 'bold' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleInputChange('fontWeight', selectedElement.style?.fontWeight === 'bold' ? 'normal' : 'bold', true)} title="Fett"><Bold className="h-4 w-4"/></Button>
                        <Button variant={selectedElement.style?.fontStyle === 'italic' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleInputChange('fontStyle', selectedElement.style?.fontStyle === 'italic' ? 'normal' : 'italic', true)} title="Kursiv"><Italic className="h-4 w-4"/></Button>
                    </div>
                  </div>
                </div>
              )}

              {selectedElement.type === 'image' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="elImgSrc" className="flex items-center"><LinkIcon className="h-4 w-4 mr-1.5"/> Bild-URL</Label>
                    <Input id="elImgSrc" value={selectedElement.src} onChange={(e) => handleInputChange('src', e.target.value)} placeholder="https://beispiel.com/bild.jpg"/>
                  </div>
                  <div>
                    <Label htmlFor="elImgUpload" className="flex items-center"><UploadCloud className="h-4 w-4 mr-1.5"/> Oder Bild hochladen</Label>
                    <Input id="elImgUpload" type="file" accept="image/*" onChange={handleImageUpload} className="mt-1 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                  </div>
                  <div>
                    <Label htmlFor="elOpacity">Deckkraft ({Math.round((selectedElement.style?.opacity || 1) * 100)}%)</Label>
                    <Slider
                        id="elOpacity"
                        min={0} max={1} step={0.01}
                        defaultValue={[selectedElement.style?.opacity || 1]}
                        onValueChange={(val) => handleInputChange('opacity', val[0], true)}
                        className="mt-1"
                    />
                  </div>
                </div>
              )}
              <Button variant="destructive" onClick={() => onDeleteElement(selectedElement.id)} className="w-full mt-3">
                <Trash2 className="h-4 w-4 mr-2"/> Element löschen
              </Button>
            </div>
          )}
          {!selectedElement && (
            <div className="text-center text-muted-foreground pt-4 border-t mt-4">
              <CaseSensitive className="h-8 w-8 mx-auto mb-2 opacity-50"/>
              <p>Wählen Sie ein Element in der Vorschau aus, um dessen Eigenschaften zu bearbeiten, oder fügen Sie ein neues Element über die Werkzeugleiste hinzu.</p>
            </div>
          )}
        </div>
      );
    };

    export default PropertyInspector;
